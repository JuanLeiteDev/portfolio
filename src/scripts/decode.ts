/**
 * Text decode ("decrypted text") effect.
 *
 * Principles (doc 02 §4, doc 03 §4):
 *  - The element is purely visual (aria-hidden); the readable text lives in
 *    a sibling .sr-only node and never changes.
 *  - Each character sits in a cell whose width is held by an invisible copy
 *    of the final glyph ("ghost"), so the layout never shifts.
 *  - Runs once, ~700 ms, driven by a single rAF loop. Skipped entirely with
 *    prefers-reduced-motion. The final DOM is plain text again.
 */
const GLYPHS = '0123456789ABCDEF<>/[]{}#*+=_$%';

const rand = (s: string) => s.charAt(Math.floor(Math.random() * s.length));

export interface DecodeOptions {
  /** ms per character step in the left-to-right reveal */
  stagger?: number;
  /** ms each character keeps scrambling before resolving */
  scramble?: number;
  /** ms between glyph swaps */
  tick?: number;
}

export function decode(el: HTMLElement, opts: DecodeOptions = {}): Promise<void> {
  const { stagger = 38, scramble = 320, tick = 45 } = opts;
  const text = el.textContent ?? '';
  if (!text.trim()) return Promise.resolve();

  const frag = document.createDocumentFragment();
  const cells: { live: HTMLSpanElement; ch: string; at: number }[] = [];
  let order = 0;
  for (const ch of Array.from(text)) {
    if (/\s/.test(ch)) {
      frag.append(document.createTextNode(ch));
      continue;
    }
    const cell = document.createElement('span');
    cell.className = 'dc-cell';
    const ghost = document.createElement('span');
    ghost.className = 'dc-ghost';
    ghost.textContent = ch;
    const live = document.createElement('span');
    live.className = 'dc-live';
    live.textContent = rand(GLYPHS);
    cell.append(ghost, live);
    frag.append(cell);
    cells.push({ live, ch, at: order * stagger + scramble });
    order += 1;
  }
  el.textContent = '';
  el.append(frag);
  el.classList.add('is-decoding');

  return new Promise((resolve) => {
    let start = 0;
    let last = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const t = now - start;
      const swap = now - last >= tick;
      if (swap) last = now;
      let pending = 0;
      for (const c of cells) {
        if (t >= c.at) {
          if (c.live.textContent !== c.ch) {
            c.live.textContent = c.ch;
            c.live.classList.add('is-set');
          }
        } else {
          pending += 1;
          if (swap) c.live.textContent = rand(GLYPHS);
        }
      }
      if (pending > 0) {
        requestAnimationFrame(step);
      } else {
        el.textContent = text;
        el.classList.remove('is-decoding');
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

/**
 * Lightweight scramble for monospace labels (fixed width by nature).
 * Characters resolve left to right; used once per label when it enters view.
 */
export function scrambleMono(el: HTMLElement, duration = 520): void {
  const text = el.textContent ?? '';
  const chars = Array.from(text);
  const n = chars.length;
  let start = 0;
  const step = (now: number) => {
    if (!start) start = now;
    const p = Math.min(1, (now - start) / duration);
    const resolved = Math.floor(p * n);
    el.textContent = chars
      .map((c, i) => (i < resolved || /[\s·§/]/.test(c) ? c : rand(GLYPHS)))
      .join('');
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = text;
  };
  requestAnimationFrame(step);
}
