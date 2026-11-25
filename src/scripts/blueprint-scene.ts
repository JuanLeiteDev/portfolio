/**
 * The evolving blueprint of "How I work" (Approach.astro).
 *
 * One small 3D scene on a floor grid that grows with the four steps, driven
 * by a single continuous stage value `t`:
 *   -1  empty grid
 *    0  need: loose context items, and a dashed "?" where something is missing
 *    1  plan: the items line up, three modules are drawn as footprints on the
 *             floor, with connectors and a dimension line
 *    2  solution: the modules are built (extruded), data flows through them
 *    3  delivery: each module is checked, the result lights up, the system
 *                is framed as delivered
 * Any value in between is a blend, so a card can morph from the previous
 * step's blueprint into its own.
 *
 * Pure (no DOM): it returns SVG markup. Used at build time (each card at its
 * own stage, so it works without JS) and by blueprint.ts in the browser.
 * Orthographic projection, painter's algorithm, colours from CSS classes
 * (so the theme switch needs no re-render).
 */
export interface BpLabels {
  context: string;
  problem: string;
  plan: string;
  solution: string;
}
export interface BpView {
  /** rotation around the vertical axis (radians) */
  yaw: number;
  /** elevation of the camera (radians): ~0.56 isometric, π/2 plan */
  pitch: number;
  /** seconds, for the data flow */
  time: number;
  /** svg units per CSS pixel, so strokes and text keep their screen size */
  u: number;
}

export const ISO = { yaw: -0.49, pitch: 0.56 };
export const PLAN = { yaw: 0, pitch: Math.PI / 2 };
export const VB = { x: -128, y: -74, w: 256, h: 140 };

const S = 20; // world unit → svg units
const W = 10; // floor size (world units)
const D = 6;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);
/** 0 → 1 while t goes from a to b (eased) */
const seg = (t: number, a: number, b: number) => smooth(clamp01((t - a) / (b - a)));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const f = (n: number) => (Math.round(n * 10) / 10).toString();

type P3 = readonly [number, number, number];
interface Pt {
  x: number;
  y: number;
  d: number;
}

/* --------------------------------------------------------------- scene */
interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}
// a staircase, each module a step nearer the viewer: the data enters each
// one by its left face and leaves by its front face, the two faces the
// camera sees, so its whole way stays in view (no jump through a module)
const MODS: (Box & { h: number; key: keyof BpLabels })[] = [
  { x0: 2.4, x1: 4.0, y0: 0.9, y1: 2.5, h: 1.0, key: 'problem' },
  { x0: 4.8, x1: 6.6, y0: 2.2, y1: 4.0, h: 1.8, key: 'plan' },
  { x0: 7.4, x1: 9.2, y0: 3.6, y1: 5.4, h: 1.3, key: 'solution' },
];
const cxOf = (b: Box) => (b.x0 + b.x1) / 2;
const cyOf = (b: Box) => (b.y0 + b.y1) / 2;
const NEED_H = 1.6; // the dashed "?" box, where the result will be
const ITEM = 0.5;
const LOOSE: [number, number][] = [
  [0.7, 0.8],
  [2.1, 0.4],
  [1.3, 2.5],
  [0.5, 4.3],
  [2.4, 5.0],
  [1.8, 3.6],
];
const LINED: [number, number][] = [
  [0.55, 0.8],
  [1.2, 0.8],
  [0.55, 1.45],
  [1.2, 1.45],
  [0.55, 2.1],
  [1.2, 2.1],
];
const PIPE_Z = 0.35;
const START = 1.8; // just after the lined-up context items
// the connectors on the floor: context → problem, then an L from each
// module's front face to the next one's left face
const LINKS: [number, number][][] = MODS.map((m, k) => {
  const prev = MODS[k - 1];
  if (!prev) {
    return [
      [START, cyOf(m)],
      [m.x0, cyOf(m)],
    ];
  }
  return [
    [cxOf(prev), prev.y1],
    [cxOf(prev), cyOf(m)],
    [m.x0, cyOf(m)],
  ];
});
/** The data's way, given the modules' current heights: along the floor, up
 *  each left face, over the top, down the front face; it ends on top of the
 *  solution. */
const route = (hs: number[]): P3[] => {
  const z = PIPE_Z;
  const r: P3[] = [[START, cyOf(MODS[0]!), z]];
  MODS.forEach((m, k) => {
    const h = Math.max(hs[k]!, z);
    const cx = cxOf(m);
    const cy = cyOf(m);
    r.push([m.x0, cy, z], [m.x0, cy, h], [cx, cy, h]);
    const next = MODS[k + 1];
    if (next) r.push([cx, m.y1, h], [cx, m.y1, z], [cx, cyOf(next), z]);
  });
  return r;
};
const SPEED = 2.2; // world units per second, the same on every segment
const DOTS = 3;

export function drawBlueprint(t: number, view: BpView, labels: BpLabels): string {
  const { u } = view;
  const cy = Math.cos(view.yaw);
  const sy = Math.sin(view.yaw);
  const cp = Math.cos(view.pitch);
  const sp = Math.sin(view.pitch);
  const P = (p: P3): Pt => {
    const x = p[0] - W / 2;
    const y = p[1] - D / 2;
    const xr = x * cy - y * sy;
    const yr = x * sy + y * cy;
    return { x: xr * S, y: (yr * sp - p[2] * cp) * S, d: yr * cp + p[2] * sp };
  };
  const pts = (ps: P3[]) =>
    ps
      .map((p) => {
        const q = P(p);
        return `${f(q.x)},${f(q.y)}`;
      })
      .join(' ');
  const line = (a: P3, b: P3, cls: string, o: number) => {
    const p = P(a);
    const q = P(b);
    return `<line class="${cls}" x1="${f(p.x)}" y1="${f(p.y)}" x2="${f(q.x)}" y2="${f(q.y)}" opacity="${o.toFixed(2)}"/>`;
  };
  const sw = (k: number) => `stroke-width="${(k * u).toFixed(2)}"`;
  const dash = (on: number, off: number) => `stroke-dasharray="${(on * u).toFixed(1)} ${(off * u).toFixed(1)}"`;
  // labels: 10.5px, a little smaller on narrow drawings (phones), with a
  // halo in the background colour (CSS) so lines never cross the letters
  const px = (10.5 * Math.min(1, Math.max(0.84, VB.w / u / 480))).toFixed(2);
  const txt = `font-size="${f(Number(px) * u)}" stroke-width="${f(3 * u)}"`;

  const floor: string[] = [];
  const items: { d: number; s: string }[] = [];
  const top: string[] = [];

  /* floor grid */
  const g = seg(t, -1, -0.55);
  if (g > 0) {
    const lines: string[] = [];
    for (let x = 0; x <= W; x += 1) lines.push(line([x, 0, 0], [x, D, 0], 'bp-grid', 1));
    for (let y = 0; y <= D; y += 1) lines.push(line([0, y, 0], [W, y, 0], 'bp-grid', 1));
    floor.push(`<g opacity="${g.toFixed(2)}" ${sw(0.75)}>${lines.join('')}</g>`);
    floor.push(`<polygon class="bp-edge" points="${pts([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]])}" fill="none" opacity="${(g * 0.9).toFixed(2)}" ${sw(1)}/>`);
  }

  /* a box: the faces turned towards the camera (convex, so no inner sort) */
  const box = (b: Box, h: number, cls: string, o: number, track = 0, last = false) => {
    if (h < 0.02 || o <= 0) return;
    const c: P3[] = [
      [b.x0, b.y0, 0],
      [b.x1, b.y0, 0],
      [b.x1, b.y1, 0],
      [b.x0, b.y1, 0],
    ];
    const T = c.map((p) => [p[0], p[1], h] as P3);
    let s = '';
    // sides: [normal x, normal y, corner a, corner b]
    const sides: [number, number, number, number][] = [
      [0, -1, 0, 1],
      [1, 0, 1, 2],
      [0, 1, 2, 3],
      [-1, 0, 3, 0],
    ];
    for (const [nx, ny, a, bb] of sides) {
      const nyr = nx * sy + ny * cy; // towards the viewer?
      if (nyr * cp <= 0.001) continue;
      const nxr = nx * cy - ny * sy; // light from the left
      s += `<polygon class="bp-face ${nxr < 0 ? 'l' : 'r'}" points="${pts([c[a]!, c[bb]!, T[bb]!, T[a]!])}"/>`;
    }
    s += `<polygon class="bp-face top" points="${pts(T)}"/>`;
    if (track > 0 && h > PIPE_Z) {
      // the data's way over this module (left face, top, front face)
      const cx = cxOf(b);
      const cyb = cyOf(b);
      const way: P3[] = [
        [b.x0, cyb, h],
        [cx, cyb, h],
      ];
      if (-sy * cp > 0.001) way.unshift([b.x0, cyb, PIPE_Z]);
      if (!last) {
        way.push([cx, b.y1, h]);
        if (cy * cp > 0.001) way.push([cx, b.y1, PIPE_Z]);
      }
      s += `<polyline class="bp-track" points="${pts(way)}" opacity="${track.toFixed(2)}" ${dash(2, 2.5)}/>`;
    }
    const mid = P([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, h / 2]);
    items.push({ d: mid.d, s: `<g class="${cls}" opacity="${o.toFixed(2)}" ${sw(1)}>${s}</g>` });
  };

  /* 0 → 1: context items, loose, then lined up */
  LOOSE.forEach((l, k) => {
    const a = seg(t, -0.85 + k * 0.07, -0.35 + k * 0.07);
    if (a <= 0) return;
    const m = seg(t, k * 0.05, 0.6 + k * 0.05);
    const x = lerp(l[0], LINED[k]![0], m);
    const y = lerp(l[1], LINED[k]![1], m);
    box({ x0: x, x1: x + ITEM, y0: y, y1: y + ITEM }, ITEM * a, 'bp-item', a);
  });

  /* the "?" — what is missing, drawn where the result will be */
  const C = MODS[2]!;
  const need = seg(t, -0.45, 0) * (1 - seg(t, 0.15, 0.55));
  if (need > 0) {
    const c: P3[] = [
      [C.x0, C.y0, 0],
      [C.x1, C.y0, 0],
      [C.x1, C.y1, 0],
      [C.x0, C.y1, 0],
    ];
    const T = c.map((p) => [p[0], p[1], NEED_H] as P3);
    let s = '';
    for (let k = 0; k < 4; k += 1) {
      s += line(c[k]!, c[(k + 1) % 4]!, '', 1) + line(T[k]!, T[(k + 1) % 4]!, '', 1) + line(c[k]!, T[k]!, '', 1);
    }
    const mid = P([(C.x0 + C.x1) / 2, (C.y0 + C.y1) / 2, NEED_H / 2]);
    items.push({ d: mid.d, s: `<g class="bp-need" opacity="${need.toFixed(2)}" ${sw(1)} ${dash(3, 3)}>${s}</g>` });
    const q = P([(C.x0 + C.x1) / 2, (C.y0 + C.y1) / 2, NEED_H]);
    top.push(`<text class="bp-q" x="${f(q.x)}" y="${f(q.y - 9 * u)}" font-size="${f(17 * u)}" stroke-width="${f(3 * u)}" opacity="${need.toFixed(2)}">?</text>`);
  }
  const ctx = seg(t, -0.35, 0) * (1 - seg(t, 0, 0.4));
  if (ctx > 0) {
    const q = P([1.6, 2.7, ITEM]);
    top.push(`<text class="bp-lb" x="${f(q.x)}" y="${f(q.y - 12 * u)}" ${txt} opacity="${ctx.toFixed(2)}">${labels.context}</text>`);
  }

  /* 1: footprints, connectors, dimension line */
  const heights = MODS.map((_, k) => MODS[k]!.h * seg(t, 1.05 + k * 0.17, 1.6 + k * 0.17));
  MODS.forEach((m, k) => {
    const a = seg(t, 0.2 + k * 0.12, 0.6 + k * 0.12);
    if (a <= 0) return;
    // the dashed plan fades as the module is built over it
    const o = a * (1 - seg(t, 1.6 + k * 0.17, 1.9 + k * 0.17) * 0.75);
    floor.push(
      `<polygon class="bp-plan" points="${pts([[m.x0, m.y0, 0], [m.x1, m.y0, 0], [m.x1, m.y1, 0], [m.x0, m.y1, 0]])}" opacity="${o.toFixed(2)}" ${sw(1)} ${dash(3, 2.5)}/>`,
    );
  });
  const dim = seg(t, 0.55, 1) * (1 - seg(t, 1.1, 1.5));
  if (dim > 0) {
    const yy = 0.4;
    let s = line([MODS[0]!.x0, yy, 0], [C.x1, yy, 0], 'bp-dim', 1);
    for (const m of MODS) for (const x of [m.x0, m.x1]) s += line([x, yy - 0.22, 0], [x, yy + 0.22, 0], 'bp-dim', 1);
    floor.push(`<g opacity="${dim.toFixed(2)}" ${sw(1)}>${s}</g>`);
  }
  const plan = seg(t, 0.5, 0.9);
  const built = seg(t, 1.45, 1.9);
  LINKS.forEach((ln) => {
    if (plan <= 0) return;
    const z = lerp(0, PIPE_Z, built);
    const ps = pts(ln.map(([x, y]) => [x, y, z] as P3));
    const mid = ln[Math.floor(ln.length / 2)]!;
    const d = P([mid[0], mid[1], PIPE_Z]).d;
    const s =
      (built < 1 ? `<polyline class="bp-link" points="${ps}" opacity="${(plan * (1 - built)).toFixed(2)}" ${dash(2.5, 2.5)}/>` : '') +
      (built > 0 ? `<polyline class="bp-link" points="${ps}" opacity="${built.toFixed(2)}"/>` : '');
    items.push({ d, s: `<g ${sw(1.25)}>${s}</g>` });
  });

  /* 2: the modules, built */
  const lit = seg(t, 2.45, 3);
  const flow = seg(t, 1.75, 2.1);
  MODS.forEach((m, k) => box(m, heights[k]!, k === 2 && lit > 0.5 ? 'bp-mod is-lit' : 'bp-mod', 1, flow, k === MODS.length - 1));

  /* the data, once built: a few dots, evenly spaced, all at one constant
     speed along the whole route (its length measured), so they never jump */
  const dots: string[] = [];
  if (flow > 0) {
    const way = route(heights);
    const lens = way.slice(1).map((p, i) => Math.hypot(p[0] - way[i]![0], p[1] - way[i]![1], p[2] - way[i]![2]));
    const total = lens.reduce((x, y) => x + y, 0);
    for (let k = 0; k < DOTS; k += 1) {
      let at = (view.time * SPEED + (k * total) / DOTS) % total;
      // appears at the start, settles on the solution at the end
      const fade = Math.max(0, Math.min(1, at / 0.3, (total - at) / 0.6));
      let i = 0;
      while (i < lens.length - 1 && at > lens[i]!) at -= lens[i++]!;
      const p0 = way[i]!;
      const p1 = way[i + 1]!;
      const k2 = lens[i]! > 0 ? Math.min(1, at / lens[i]!) : 0;
      const q = P([lerp(p0[0], p1[0], k2), lerp(p0[1], p1[1], k2), lerp(p0[2], p1[2], k2)]);
      dots.push(`<circle class="bp-dot" cx="${f(q.x)}" cy="${f(q.y)}" r="${f(3 * u)}" opacity="${(flow * fade).toFixed(2)}"/>`);
    }
  }

  /* 3: delivered — the frame around the system */
  const frame = seg(t, 2.25, 2.85);
  if (frame > 0) {
    const [x0, x1, y0, y1, L] = [0.25, 9.75, 0.3, 5.7, 0.7];
    const corners: [number, number, number, number][] = [
      [x0, y0, 1, 1],
      [x1, y0, -1, 1],
      [x1, y1, -1, -1],
      [x0, y1, 1, -1],
    ];
    let s = '';
    for (const [x, y, dx, dy] of corners) s += line([x + dx * L, y, 0], [x, y, 0], '', 1) + line([x, y, 0], [x, y + dy * L, 0], '', 1);
    floor.push(`<g class="bp-frame" opacity="${frame.toFixed(2)}" ${sw(1.5)}>${s}</g>`);
  }

  /* labels: module names (from the plan on), a check on each once delivered */
  const lab = seg(t, 0.5, 1);
  if (lab > 0) {
    MODS.forEach((m, k) => {
      const q = P([(m.x0 + m.x1) / 2, (m.y0 + m.y1) / 2, heights[k]!]);
      const ok = seg(t, 2.05 + k * 0.17, 2.4 + k * 0.17);
      top.push(`<text class="bp-lb" x="${f(q.x)}" y="${f(q.y - 9 * u)}" ${txt} opacity="${lab.toFixed(2)}">${labels[m.key]}</text>`);
      if (ok > 0) {
        const r = 6.5 * u;
        const cx = q.x;
        const cy2 = q.y - 30 * u + (1 - ok) * 6 * u;
        top.push(
          `<g class="bp-ok" opacity="${ok.toFixed(2)}" ${sw(1.4)}><circle cx="${f(cx)}" cy="${f(cy2)}" r="${f(r)}"/>` +
            `<path d="M${f(cx - r * 0.42)} ${f(cy2)}l${f(r * 0.3)} ${f(r * 0.32)}l${f(r * 0.56)} ${f(-r * 0.62)}"/></g>`,
        );
      }
    });
  }

  items.sort((a, b) => a.d - b.d);
  // the dots' way is all on faces the camera sees: drawn over the modules
  return floor.join('') + items.map((i) => i.s).join('') + dots.join('') + top.join('');
}
