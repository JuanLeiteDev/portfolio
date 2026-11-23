/**
 * "Stack" (Contact.astro): technology objects in a frame, with physics.
 *
 * Matter.js does the physics (gravity, collisions, rotation, restitution,
 * friction, sleeping); the bodies are drawn as real DOM elements moved with
 * transforms (crisp original SVG logos, no canvas).
 *
 * The world is `.sb-world`, a box whose size CSS fixes (nothing here ever
 * resizes it, so there is no layout shift). Walls, floor and ceiling are
 * its edges, so the objects always stay inside the frame.
 *
 * Interaction: press and drag (mouse, pen or touch) moves an object through a
 * constraint to the pointer, so it can be thrown into the others. Hovering
 * does nothing.
 *
 * Cost: the loop runs only while something moves and the frame is on
 * screen; bodies sleep once settled. With reduced motion there is no
 * simulation at all (CSS lays the objects in rows).
 */
import type Matter from 'matter-js';

interface Obj {
  el: HTMLElement;
  w: number;
  h: number;
  body: Matter.Body | null;
}

const WALL = 400;
const STEP = 1000 / 60;
const MAX_SPEED = 32;

const bodyOpts: Matter.IChamferableBodyDefinition = {
  restitution: 0.3,
  friction: 0.35,
  frictionStatic: 0.8,
  frictionAir: 0.012,
  density: 0.0016,
  sleepThreshold: 50,
};

export async function initStack(world: HTMLElement, reduced: boolean): Promise<() => void> {
  const els = Array.from(world.querySelectorAll<HTMLElement>('.obj'));

  if (reduced) {
    world.classList.add('is-static');
    return () => world.classList.remove('is-static');
  }

  // Matter.js (~27 kB gzip) is only fetched when the simulation runs
  const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = (await import('matter-js')).default;
  const engine = Engine.create({ enableSleeping: true, positionIterations: 8, velocityIterations: 6 });
  engine.gravity.y = 1;
  engine.gravity.scale = 0.0011;

  const objs: Obj[] = els.map((el) => ({ el, w: 0, h: 0, body: null }));
  let W = 0;
  let H = 0;
  let walls: Matter.Body[] = [];
  let raf = 0;
  let last = 0;
  let acc = 0;
  let inView = false;
  let queue: Obj[] = [];
  let nextSpawn = 0;
  let drag: { c: Matter.Constraint; obj: Obj; id: number } | null = null;
  let dead = false;

  /* ------------------------------------------------------------ geometry */

  const buildWalls = () => {
    if (walls.length) Composite.remove(engine.world, walls);
    const o = { isStatic: true, friction: 0.6, restitution: 0.2 };
    walls = [
      Bodies.rectangle(W / 2, H + WALL / 2, W + WALL * 2, WALL, o), // floor
      Bodies.rectangle(W / 2, -WALL / 2, W + WALL * 2, WALL, o), // ceiling
      Bodies.rectangle(-WALL / 2, H / 2, WALL, H + WALL * 2, o),
      Bodies.rectangle(W + WALL / 2, H / 2, WALL, H + WALL * 2, o),
    ];
    Composite.add(engine.world, walls);
  };

  const sizeOf = (o: Obj) => {
    o.w = o.el.offsetWidth;
    o.h = o.el.offsetHeight;
  };

  const spawn = (o: Obj) => {
    sizeOf(o);
    const mx = o.w / 2 + 4;
    const x = mx + Math.random() * Math.max(1, W - mx * 2);
    const y = o.h / 2 + 4 + Math.random() * Math.min(40, H * 0.15);
    // pills: rounded rectangles, same corner radius as the CSS
    const b = Bodies.rectangle(x, y, o.w, o.h, { ...bodyOpts, chamfer: { radius: Math.min(o.h / 2 - 1, o.h * 0.3) } });
    Body.setAngle(b, (Math.random() - 0.5) * 1.2);
    Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.12);
    Body.setVelocity(b, { x: (Math.random() - 0.5) * 2, y: 0 });
    o.body = b;
    Composite.add(engine.world, b);
    render();
    o.el.classList.add('is-on');
  };

  /* ---------------------------------------------------------------- loop */

  function render() {
    for (const o of objs) {
      const b = o.body;
      if (!b) continue;
      // safety net: anything that escapes the frame comes back from the top
      if (b.position.y > H + 100 || b.position.y < -100 || b.position.x < -100 || b.position.x > W + 100) {
        Body.setPosition(b, { x: W / 2, y: o.h });
        Body.setVelocity(b, { x: 0, y: 0 });
      }
      o.el.style.transform = `translate3d(${b.position.x - o.w / 2}px, ${b.position.y - o.h / 2}px, 0) rotate(${b.angle}rad)`;
    }
  }

  // Matter's own sleeping can miss a body balanced on a stack that keeps
  // micro-jittering; after a quiet spell near-still bodies are put to sleep,
  // so the loop always ends.
  let lastActivity = 0;
  const markActive = () => {
    lastActivity = performance.now();
  };
  const settleQuiet = (now: number) => {
    if (drag || queue.length || now - lastActivity < 4000) return;
    for (const o of objs) {
      const b = o.body;
      if (b && !b.isSleeping && b.speed < 0.6 && Math.abs(b.angularVelocity) < 0.01) Sleeping.set(b, true);
    }
  };

  const busy = () => queue.length > 0 || drag !== null || objs.some((o) => o.body && !o.body.isSleeping);

  const frame = (now: number) => {
    raf = 0;
    if (dead) return;
    const dt = last ? Math.min(now - last, 48) : STEP;
    last = now;
    if (queue.length && now >= nextSpawn) {
      spawn(queue.shift()!);
      nextSpawn = now + 110 + Math.random() * 80;
      markActive();
    }
    acc += dt;
    while (acc >= STEP) {
      Engine.update(engine, STEP);
      acc -= STEP;
    }
    settleQuiet(now);
    render();
    if (inView && busy()) raf = requestAnimationFrame(frame);
    else last = 0;
  };

  const run = () => {
    markActive();
    if (!raf && inView && !dead) raf = requestAnimationFrame(frame);
  };

  /* --------------------------------------------------------- interaction */

  const toWorld = (e: PointerEvent) => {
    const r = world.getBoundingClientRect();
    return { x: Math.min(W, Math.max(0, e.clientX - r.left)), y: Math.min(H, Math.max(0, e.clientY - r.top)) };
  };

  const clampSpeed = (b: Matter.Body) => {
    const { x, y } = b.velocity;
    const s = Math.hypot(x, y);
    if (s > MAX_SPEED) Body.setVelocity(b, { x: (x / s) * MAX_SPEED, y: (y / s) * MAX_SPEED });
  };

  const listeners: [EventTarget, string, EventListener][] = [];
  const on = <K extends keyof HTMLElementEventMap>(t: HTMLElement, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
    t.addEventListener(type, fn as EventListener);
    listeners.push([t, type, fn as EventListener]);
  };

  for (const o of objs) {
    on(o.el, 'pointerdown', (e) => {
      if (e.button !== 0 || !o.body || drag) return;
      e.preventDefault(); // no text selection or native drag while holding
      const p = toWorld(e);
      const b = o.body;
      const c = Constraint.create({
        pointA: p,
        bodyB: b,
        pointB: { x: p.x - b.position.x, y: p.y - b.position.y },
        stiffness: 0.16,
        damping: 0.08,
        length: 0,
      });
      Composite.add(engine.world, c);
      Sleeping.set(b, false);
      drag = { c, obj: o, id: e.pointerId };
      o.el.setPointerCapture(e.pointerId);
      o.el.classList.add('is-grab');
      run();
    });
    on(o.el, 'pointermove', (e) => {
      // only a held object moves: hovering never pushes anything
      if (!drag || drag.id !== e.pointerId) return;
      drag.c.pointA = toWorld(e);
      run();
    });
    const release = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      Composite.remove(engine.world, drag.c);
      if (drag.obj.body) clampSpeed(drag.obj.body);
      drag.obj.el.classList.remove('is-grab');
      drag = null;
      run();
    };
    on(o.el, 'pointerup', release);
    on(o.el, 'pointercancel', release);
    on(o.el, 'lostpointercapture', release);
  }

  /* -------------------------------------------------- viewport & resize */

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    queue = [...objs].sort(() => Math.random() - 0.5);
    nextSpawn = 0;
    run();
  };

  const resize = () => {
    const w = world.clientWidth;
    const h = world.clientHeight;
    if (!w || !h || (w === W && h === H)) return;
    const sx = W ? w / W : 1;
    const sy = H ? h / H : 1;
    W = w;
    H = h;
    buildWalls();
    for (const o of objs) {
      if (!o.body) continue;
      const ow = o.w;
      const oh = o.h;
      sizeOf(o);
      if (ow && (Math.abs(o.w - ow) > 0.5 || Math.abs(o.h - oh) > 0.5)) Body.scale(o.body, o.w / ow, o.h / oh);
      Body.setPosition(o.body, {
        x: Math.min(W - o.w / 2, Math.max(o.w / 2, o.body.position.x * sx)),
        y: Math.min(H - o.h / 2, Math.max(o.h / 2, o.body.position.y * sy)),
      });
      Sleeping.set(o.body, false);
    }
    run();
  };

  const ro = new ResizeObserver(() => resize());
  ro.observe(world);

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        inView = e.isIntersecting;
        // drop once a good part of the frame is on screen, so the fall is seen
        if (e.intersectionRatio >= 0.35) start();
        if (inView) run();
      }
    },
    { threshold: [0, 0.35] },
  );

  resize();
  io.observe(world);

  return () => {
    dead = true;
    queue = [];
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    for (const [t, type, fn] of listeners) t.removeEventListener(type, fn);
    Composite.clear(engine.world, false);
    Engine.clear(engine);
  };
}
