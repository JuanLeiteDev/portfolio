/**
 * Drives the evolving blueprint on each "How I work" card (the scene itself
 * is drawn by blueprint-scene.ts).
 *
 *  - the first time a card comes into view (scroll-stack.ts fires
 *    `stack:seen`), its blueprint morphs from the previous step's version
 *    into its own (the first card draws itself in from an empty grid);
 *  - mouse over it: the model tilts gently towards the pointer;
 *  - click / tap (or Enter / Space): switches between the 3D view and the
 *    plan (top) view;
 *  - once a step has built the modules, small packets of data flow through
 *    them, only while that card is on top and on screen.
 *
 * Reduced motion: every change is instant and the data stands still.
 * One shared rAF loop, idle when nothing moves.
 */
import { drawBlueprint, ISO, PLAN, VB, type BpLabels } from './blueprint-scene';

const MORPH = 1.7; // seconds per step
const REVS = 'ABCD';

interface Bp {
  card: HTMLElement;
  inner: HTMLElement;
  el: HTMLElement;
  svg: SVGSVGElement;
  rev: HTMLElement | null;
  hint: HTMLElement | null;
  stage: number;
  labels: BpLabels;
  t: number;
  from: number;
  start: number; // morph start (ms), -1 when not morphing
  yaw: number;
  pitch: number;
  plan: boolean;
  tiltX: number; // pointer offsets, -0.5 … 0.5
  tiltY: number;
  u: number;
  visible: boolean;
  dirty: boolean;
}

const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export function initBlueprints(list: HTMLElement, reduced: boolean): () => void {
  const items: Bp[] = [];
  let raf = 0;
  let last = 0;
  const t0 = performance.now();

  const render = (b: Bp, now: number) => {
    const time = reduced ? 0.3 : (now - t0) / 1000;
    b.svg.innerHTML = drawBlueprint(b.t, { yaw: b.yaw, pitch: b.pitch, time, u: b.u }, b.labels);
    if (b.rev) b.rev.textContent = REVS[Math.max(0, Math.min(3, Math.round(b.t)))] ?? 'A';
  };

  const target = (b: Bp) => {
    const base = b.plan ? PLAN : ISO;
    const k = b.plan ? 0.35 : 1;
    return { yaw: base.yaw + b.tiltX * 0.32 * k, pitch: base.pitch - b.tiltY * 0.14 * k };
  };

  // data flows only on a built blueprint that is on screen and not covered
  const flowing = (b: Bp) =>
    !reduced && b.visible && b.t >= 1.75 && b.start < 0 && (parseFloat(b.inner.style.getPropertyValue('--depth')) || 0) < 0.6;

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    let again = false;
    for (const b of items) {
      let changed = b.dirty;
      b.dirty = false;
      if (b.start >= 0) {
        const k = Math.min(1, Math.max(0, (now - b.start) / 1000 / (MORPH * Math.max(0.6, b.stage - b.from))));
        b.t = b.from + (b.stage - b.from) * ease(k);
        if (k >= 1) {
          b.t = b.stage;
          b.start = -1;
        } else again = true;
        changed = true;
      }
      const tg = target(b);
      const dy = tg.yaw - b.yaw;
      const dp = tg.pitch - b.pitch;
      if (Math.abs(dy) > 0.0005 || Math.abs(dp) > 0.0005) {
        const s = reduced ? 1 : 1 - Math.exp(-dt / 0.16);
        b.yaw += dy * s;
        b.pitch += dp * s;
        changed = true;
        again = true;
      }
      if (flowing(b)) {
        changed = true;
        again = true;
      }
      if (changed && b.visible) render(b, now);
    }
    if (again) raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const b = items.find((i) => i.el === e.target);
      if (!b) continue;
      b.visible = e.isIntersecting;
      if (b.visible) b.dirty = true;
    }
    kick();
  });
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const b = items.find((i) => i.svg === e.target);
      const w = (e.target as SVGSVGElement).clientWidth;
      if (b && w > 0) {
        b.u = VB.w / w;
        b.dirty = true;
      }
    }
    kick();
  });

  const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-stack-card]'));
  for (const card of cards) {
    const el = card.querySelector<HTMLElement>('[data-bp]');
    const svg = el?.querySelector<SVGSVGElement>('svg');
    if (!el || !svg) continue;
    const stage = Number(el.dataset.stage);
    const seen = card.classList.contains('is-seen') || reduced;
    const b: Bp = {
      card,
      inner: card.firstElementChild as HTMLElement,
      el,
      svg,
      rev: el.querySelector('[data-bp-rev]'),
      hint: el.querySelector('[data-bp-hint]'),
      stage,
      labels: JSON.parse(el.dataset.labels ?? '{}') as BpLabels,
      t: seen ? stage : stage - 1,
      from: stage - 1,
      start: -1,
      yaw: ISO.yaw,
      pitch: ISO.pitch,
      plan: false,
      tiltX: 0,
      tiltY: 0,
      u: VB.w / (svg.clientWidth || 400),
      visible: false,
      dirty: true,
    };
    items.push(b);

    const toPlan = el.dataset.toPlan ?? '';
    const to3d = el.dataset.to3d ?? '';
    // interactive only with JS: the "⇄ plan" button in the footer (keyboard,
    // screen readers); a click anywhere on the drawing does the same, as the
    // button's own click bubbles up to the same listener
    const btn = el.querySelector<HTMLButtonElement>('[data-bp-btn]');
    if (btn) btn.hidden = false;
    el.classList.add('is-live');
    const toggle = () => {
      b.plan = !b.plan;
      el.classList.toggle('is-plan', b.plan);
      if (b.hint) b.hint.textContent = b.plan ? to3d : toPlan;
      kick();
    };
    el.addEventListener('click', toggle);
    if (!reduced) {
      el.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = el.getBoundingClientRect();
        b.tiltX = (e.clientX - r.left) / r.width - 0.5;
        b.tiltY = (e.clientY - r.top) / r.height - 0.5;
        kick();
      });
      el.addEventListener('pointerleave', () => {
        b.tiltX = 0;
        b.tiltY = 0;
        kick();
      });
    }
    // first time in view: morph from the previous step into this one
    card.addEventListener(
      'stack:seen',
      () => {
        if (b.t >= b.stage) return;
        b.from = b.t;
        b.start = performance.now() + 150;
        kick();
      },
      { once: true },
    );
    io.observe(el);
    ro.observe(svg);
  }
  // the stack's depth changes as the page scrolls: wake the flow when a
  // covered card comes back on top
  const onScroll = () => {
    if (items.some(flowing)) kick();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  kick();

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    window.removeEventListener('scroll', onScroll);
  };
}
