/** Theme helpers shared by the toggle button and the command menu. */
export type Theme = 'light' | 'dark';

export const currentTheme = (): Theme => {
  const set = document.documentElement.getAttribute('data-theme');
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* storage unavailable (private mode) — theme still applies for this page */
  }
  const meta = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  meta.forEach((m) => (m.content = theme === 'light' ? '#f1eee6' : '#0d0e0c'));
  document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(theme === 'light')));
  document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
};

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

/**
 * Flips the theme. Where the View Transitions API exists (and motion is
 * allowed) the new theme spreads over the page as a circle growing from
 * `origin` (the toggle button; the centre of the screen otherwise).
 */
export const toggleTheme = (origin?: { x: number; y: number }): Theme => {
  const next: Theme = currentTheme() === 'light' ? 'dark' : 'light';
  const doc = document as ViewTransitionDoc;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!doc.startViewTransition || reduce) {
    applyTheme(next);
    return next;
  }
  const w = window.innerWidth;
  const h = window.innerHeight;
  const x = origin?.x ?? w / 2;
  const y = origin?.y ?? h / 2;
  const r = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
  // .theme-vt keeps the new snapshot clipped to nothing (global.css) from the
  // very first frame, so it never flashes before the animation starts
  const root = document.documentElement;
  root.classList.add('theme-vt');
  const vt = doc.startViewTransition(() => applyTheme(next));
  let anim: Animation | undefined;
  vt.ready
    .then(() => {
      anim = root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        {
          duration: 700,
          easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
          fill: 'forwards',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    .catch(() => {
      /* transition skipped: the theme is applied anyway */
    });
  const done = () => {
    root.classList.remove('theme-vt');
    anim?.cancel(); // the pseudo-element is gone; don't leave the animation on <html>
  };
  vt.finished.then(done, done);
  return next;
};
