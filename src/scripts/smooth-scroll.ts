/**
 * Heavier, smoother wheel scrolling (the feel of Lenis, without the library).
 *
 * Only the mouse wheel is eased: each notch moves a target and the page
 * glides towards it with exponential damping, so scrolling has weight and
 * inertia. Everything else stays native: touch (its own momentum), the
 * keyboard, the scrollbar, anchor links, pinch/ctrl-zoom, horizontal wheel,
 * and any element that can scroll itself (lists, the command dialog).
 * The page still scrolls through `window`, so `position: sticky`, scroll
 * observers and the rail keep working unchanged. Not loaded with reduced
 * motion or on touch-only devices.
 */
const DAMP_MS = 180; // higher = heavier
const LINE = 16;

/** True if `el` (or an ancestor up to the page) can still scroll in that direction. */
function scrollsInside(el: Element | null, dy: number): boolean {
  for (let n = el; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    if (n instanceof HTMLDialogElement && n.open) return true;
    const s = getComputedStyle(n);
    if (!/(auto|scroll|overlay)/.test(s.overflowY) || n.scrollHeight <= n.clientHeight + 1) continue;
    if (dy < 0 ? n.scrollTop > 0 : n.scrollTop + n.clientHeight < n.scrollHeight - 1) return true;
  }
  return false;
}

export function initSmoothScroll(): () => void {
  let target = window.scrollY;
  let current = window.scrollY;
  let raf = 0;
  let last = 0;
  let expected = -1;

  const max = () => document.documentElement.scrollHeight - window.innerHeight;

  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    expected = -1;
  };

  const frame = (now: number) => {
    raf = 0;
    // someone else moved the page (scrollbar drag, anchor, keyboard): yield
    if (expected >= 0 && Math.abs(window.scrollY - expected) > 2) {
      stop();
      return;
    }
    const dt = last ? Math.min(now - last, 64) : 16;
    last = now;
    current += (target - current) * (1 - Math.exp(-dt / DAMP_MS));
    if (Math.abs(target - current) < 0.5) current = target;
    window.scrollTo({ top: current, behavior: 'instant' });
    expected = window.scrollY;
    if (current !== target) raf = requestAnimationFrame(frame);
    else stop();
  };

  const onWheel = (e: WheelEvent) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    // trackpads send pixel deltas in small steps with their own inertia; the
    // wheel sends lines or large pixel notches: only those are eased
    const notch = e.deltaMode !== 0 || Math.abs(e.deltaY) >= 50;
    if (!notch) {
      if (raf) stop();
      return;
    }
    const targetEl = e.target instanceof Element ? e.target : null;
    if (scrollsInside(targetEl, e.deltaY)) return;
    e.preventDefault();
    const dy = e.deltaMode === 1 ? e.deltaY * LINE : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
    if (!raf) {
      current = window.scrollY;
      target = current;
    }
    target = Math.max(0, Math.min(max(), target + dy));
    if (!raf) raf = requestAnimationFrame(frame);
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  return () => {
    stop();
    window.removeEventListener('wheel', onWheel);
  };
}
