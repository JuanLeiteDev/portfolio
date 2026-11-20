/**
 * Count-up for real, documented figures only (10 000+ files, 5 000 000 lines).
 *
 * Markup contract (see Impact.astro):
 *   <span class="count" data-count="5000000" data-suffix="+" data-locale="pt-PT">
 *     <span class="count-ghost" aria-hidden="true">5 000 000</span>  ← holds width
 *     <span class="count-live" aria-hidden="true">5 000 000</span>   ← animated
 *     <span class="sr-only">5 000 000</span>                         ← stable text
 *   </span>
 * The server renders the final value, so without JS or with reduced motion
 * the correct figure is shown immediately.
 */
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

export function countUp(el: HTMLElement, duration = 1400): void {
  const live = el.querySelector<HTMLElement>('.count-live');
  const target = Number(el.dataset.count);
  if (!live || !Number.isFinite(target)) return;
  const suffix = el.dataset.suffix ?? '';
  const fmt = new Intl.NumberFormat(el.dataset.locale ?? 'pt-PT');
  let start = 0;
  const step = (now: number) => {
    if (!start) start = now;
    const p = Math.min(1, (now - start) / duration);
    live.textContent = fmt.format(Math.round(target * easeOutExpo(p))) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  live.textContent = fmt.format(0) + suffix;
  requestAnimationFrame(step);
}
