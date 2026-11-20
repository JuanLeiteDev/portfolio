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

export const toggleTheme = (): Theme => {
  const next: Theme = currentTheme() === 'light' ? 'dark' : 'light';
  applyTheme(next);
  return next;
};
