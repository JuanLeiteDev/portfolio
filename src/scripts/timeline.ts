/**
 * Journey timelines (Journey.astro): the trace draws itself as the page
 * scrolls and each node lights up when the trace reaches it.
 *
 * Progress `--p` (0–1) follows the page's own scroll: the trace's tip sits at
 * 60% of the viewport height. Only a transform (scaleY) changes. The passive
 * scroll listener is rAF-throttled and attached only while a timeline is
 * near the viewport. Without JS or with reduced motion the trace is complete
 * (CSS default `--p: 1`) and every node is lit.
 */
export function initTimelines(roots: HTMLElement[]): () => void {
  if (!roots.length) return () => {};
  const parts = roots.map((root) => ({
    root,
    track: root.querySelector<HTMLElement>('.tl-track'),
    items: Array.from(root.querySelectorAll<HTMLElement>('[data-tl-item]')),
  }));
  let raf = 0;

  const update = () => {
    raf = 0;
    const tip = window.innerHeight * 0.6;
    for (const { root, track, items } of parts) {
      if (!track) continue;
      const r = track.getBoundingClientRect();
      // the trace is complete once its tip passes the last node (the track
      // below it is hidden by CSS), not at the bottom of the last entry
      const last = items[items.length - 1]?.querySelector('.node')?.getBoundingClientRect();
      const end = Math.max(1, last ? last.bottom - r.top : r.height);
      const reach = Math.min(end, Math.max(0, tip - r.top));
      const p = reach >= end ? 1 : reach / Math.max(1, r.height);
      root.style.setProperty('--p', p.toFixed(4));
      for (const it of items) {
        const node = it.querySelector('.node');
        if (node) it.classList.toggle('is-reached', node.getBoundingClientRect().top < tip);
      }
    }
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  const near = new Set<Element>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) near.add(e.target);
        else near.delete(e.target);
      }
      if (near.size) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    },
    { rootMargin: '20% 0px 20% 0px' },
  );

  update();
  parts.forEach(({ root }) => {
    root.classList.add('is-ready');
    io.observe(root);
  });
  window.addEventListener('resize', onScroll, { passive: true });

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}
