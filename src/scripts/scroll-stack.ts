/**
 * Scroll stack for "How I work" (Approach.astro).
 *
 * The stacking itself is CSS (`position: sticky`); this adds:
 *  - depth: each card gets `--depth` = how many later cards already cover
 *    it (continuous), and CSS scales/dims it from that, transform only;
 *  - the step in view (`is-seen`, once): its diagram plays a single time;
 *  - a fit check: if any card is taller than the space it has under its
 *    sticky offset (short phones, landscape, large text), the cards fall
 *    back to a normal list so nothing is ever cut off.
 *
 * The scroll listener is passive, rAF-throttled and attached only while
 * the stack is near the viewport.
 */
export function initScrollStack(list: HTMLElement, reduced: boolean): () => void {
  const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-stack-card]'));
  if (!cards.length) return () => {};
  const inner = cards.map((c) => c.firstElementChild as HTMLElement);
  let tops: number[] = [];
  let raf = 0;
  let stuck = true;

  const dock = document.querySelector<HTMLElement>('.dock');

  const measure = () => {
    tops = cards.map((c) => parseFloat(getComputedStyle(c).top) || 0);
    // the mobile dock is fixed at the bottom and covers that much of the viewport
    const bottomUi = dock && dock.getClientRects().length ? dock.offsetHeight + 24 : 16;
    const fits = cards.every((c, i) => c.offsetHeight <= window.innerHeight - (tops[i] ?? 0) - bottomUi);
    stuck = fits;
    list.classList.toggle('no-stick', !fits);
  };

  const update = () => {
    raf = 0;
    const rects = cards.map((c) => c.getBoundingClientRect());
    // p[j]: 0 while card j is still travelling, 1 once it has reached its sticky top
    const p = rects.map((r, j) => {
      const dist = Math.max(1, r.height * 0.85);
      return Math.min(1, Math.max(0, 1 - (r.top - (tops[j] ?? 0)) / dist));
    });
    const vh = window.innerHeight;
    rects.forEach((r, i) => {
      let depth = 0;
      if (stuck && !reduced) for (let j = i + 1; j < p.length; j += 1) depth += p[j] ?? 0;
      inner[i]?.style.setProperty('--depth', depth.toFixed(3));
      // a step counts as seen once it is well into the viewport
      if (r.top < vh * 0.6) cards[i]?.classList.add('is-seen');
    });
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  let listening = false;
  const io = new IntersectionObserver(
    ([e]) => {
      if (e?.isIntersecting && !listening) {
        window.addEventListener('scroll', onScroll, { passive: true });
        listening = true;
        onScroll();
      } else if (!e?.isIntersecting && listening) {
        window.removeEventListener('scroll', onScroll);
        listening = false;
      }
    },
    { rootMargin: '25% 0px 25% 0px' },
  );

  const ro = new ResizeObserver(() => {
    measure();
    onScroll();
  });

  measure();
  list.classList.add('is-ready');
  ro.observe(list);
  io.observe(list);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    io.disconnect();
    ro.disconnect();
  };
}
