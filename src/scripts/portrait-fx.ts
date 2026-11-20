/**
 * Portrait effect of the hero (replaces the former glyph/ASCII canvas).
 *
 * The photo itself is plain HTML + CSS: it "develops" once on load and a
 * scan line crosses it (pure CSS, see Hero.astro). This module only adds the
 * pointer layer:
 *   - fine pointers: a light 3D tilt and a glare that follow the cursor
 *     (CSS custom properties, one write per animation frame);
 *   - touch: a tap toggles between black-and-white and colour.
 * Not loaded with prefers-reduced-motion.
 */
export function initPortraitFx(root: HTMLElement): () => void {
  let raf = 0;
  let px = 0.5;
  let py = 0.5;

  const apply = () => {
    raf = 0;
    root.style.setProperty('--rx', `${((0.5 - py) * 7).toFixed(2)}deg`);
    root.style.setProperty('--ry', `${((px - 0.5) * 9).toFixed(2)}deg`);
    root.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
    root.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = root.getBoundingClientRect();
    px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    schedule();
  };
  const onLeave = () => {
    px = 0.5;
    py = 0.5;
    schedule();
  };
  const onTap = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    root.classList.toggle('is-color');
  };

  root.classList.add('has-fx');
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerleave', onLeave);
  root.addEventListener('pointerup', onTap);

  return () => {
    cancelAnimationFrame(raf);
    root.classList.remove('has-fx', 'is-color');
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerleave', onLeave);
    root.removeEventListener('pointerup', onTap);
  };
}
