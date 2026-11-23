/**
 * Rolls the <Odometer> columns (see components/ui/Odometer.astro).
 *
 * A single eased value v goes 0 → target. Like a mechanical counter, the
 * units turn continuously and each higher place only turns while the place
 * to its right goes 9 → 0, so every column always ends exactly on its digit.
 * Only `--d` (a transform) changes, so there is no layout work and no shift:
 * every column exists from the first frame.
 *
 * `primeOdometer` sets the columns to 0 while the card is still hidden by
 * its reveal; `rollOdometer` starts on the same trigger as the reveal.
 */
const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4);

const columns = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLElement>('.odo-col'));

export function primeOdometer(el: HTMLElement): void {
  columns(el).forEach((c) => c.style.setProperty('--d', '0'));
  el.dataset.odo = 'primed';
}

export function rollOdometer(el: HTMLElement, duration = 1700): void {
  const target = Number(el.dataset.value);
  const cols = columns(el);
  if (!Number.isFinite(target) || !cols.length) return;
  const digits = String(Math.round(target)).padStart(cols.length, '0').split('').map(Number);
  const n = cols.length;
  el.dataset.odo = 'rolling';
  let start = 0;
  // mechanical odometer: the units turn continuously; every higher place
  // stays on its digit and only turns while the place to its right goes
  // 9 → 0, so it is never left halfway between two digits
  const position = (v: number, place: number) => {
    if (place === 1) return v % 10;
    const q = v / place;
    const base = Math.floor(q);
    const carry = Math.min(1, Math.max(0, ((q - base) * place - (place - 1)) / 1));
    return (base % 10) + carry;
  };
  const step = (now: number) => {
    if (!start) start = now;
    const p = Math.min(1, (now - start) / duration);
    const v = target * easeOutQuart(p);
    cols.forEach((c, i) => {
      const place = 10 ** (n - 1 - i);
      const pos = p < 1 ? position(v, place) : (digits[i] ?? 0);
      c.style.setProperty('--d', pos.toFixed(3));
    });
    if (p < 1) requestAnimationFrame(step);
    else el.dataset.odo = 'done';
  };
  requestAnimationFrame(step);
}
