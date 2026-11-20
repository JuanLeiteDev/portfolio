/**
 * Progressive enhancement entry point (one small module for every page).
 * Every feature is optional: the HTML is complete and usable without it.
 */
import { decode, scrambleMono } from './decode';
import { countUp, primeCount } from './counters';
import { applyTheme, currentTheme, toggleTheme } from './theme';

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
root.classList.add('enhanced');

/* --------------------------------------------------------------- theme */

document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
  btn.setAttribute('aria-pressed', String(currentTheme() === 'light'));
  btn.addEventListener('click', () => toggleTheme());
});
if (root.hasAttribute('data-theme')) applyTheme(currentTheme());

/* ------------------------------------------------------ platform labels */

if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
  document.querySelectorAll('[data-mod-key]').forEach((k) => (k.textContent = '⌘'));
}

/* ------------------------------------------------ section tracking (IO) */

const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
const railLinks = new Map<string, HTMLAnchorElement>();
document.querySelectorAll<HTMLAnchorElement>('[data-rail-link]').forEach((a) => {
  railLinks.set(a.dataset.railLink ?? '', a);
});
const dockN = document.querySelector<HTMLElement>('[data-dock-n]');
const dockT = document.querySelector<HTMLElement>('[data-dock-t]');
const langLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]'));
const langBase = new Map(langLinks.map((a) => [a, a.getAttribute('href')?.split('#')[0] ?? '/']));

const setActive = (el: HTMLElement) => {
  const key = el.dataset.section ?? '';
  railLinks.forEach((a, k) => {
    if (k === key) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
  if (dockN && dockT) {
    dockN.textContent = el.dataset.index ?? '';
    dockT.textContent = el.dataset.label ?? '';
  }
  // keep the language switch pointing at the equivalent section
  const alt = el.dataset.altId;
  langLinks.forEach((a) => {
    const base = langBase.get(a) ?? '/';
    a.setAttribute('href', alt && key !== 'about' ? `${base}#${alt}` : base);
  });
};

if (sections.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target as HTMLElement);
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}

/* ----------------------------------------------- reveal + one-shot fx */

const onceVisible = (els: Element[], fn: (el: HTMLElement) => void, margin = '0px 0px -12% 0px') => {
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        obs.unobserve(e.target);
        fn(e.target as HTMLElement);
      }
    },
    { rootMargin: margin },
  );
  els.forEach((el) => io.observe(el));
};

onceVisible(Array.from(document.querySelectorAll('[data-reveal]')), (el) => el.classList.add('is-in'));

if (!reduce.matches) {
  document.querySelectorAll<HTMLElement>('[data-decode]').forEach((el) => void decode(el));
  onceVisible(Array.from(document.querySelectorAll('[data-scramble]')), (el) => scrambleMono(el));
  // same trigger as the reveal of the card, so the count starts as it appears
  const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
  counters.forEach(primeCount);
  onceVisible(counters, (el) => countUp(el));
}

/* ------------------------------------------------- portrait effect (lazy) */

const portrait = document.querySelector<HTMLElement>('[data-portrait-fx]');
if (portrait && !reduce.matches) {
  const load = () =>
    import('./portrait-fx').then(({ initPortraitFx }) => {
      initPortraitFx(portrait);
    });
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => void load(), { timeout: 1500 });
  else window.setTimeout(() => void load(), 300);
}

/* ----------------------------------------------- spotlight (fine pointer) */

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let frame = 0;
  let last: PointerEvent | null = null;
  document.addEventListener(
    'pointermove',
    (e) => {
      last = e;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const card = (last?.target as Element | null)?.closest<HTMLElement>('.spot, [data-follow]');
        if (!card || !last) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${last.clientX - r.left}px`);
        card.style.setProperty('--my', `${last.clientY - r.top}px`);
      });
    },
    { passive: true },
  );
}

/* ------------------------------------------- hero name: decode on hover */

const nameVis = document.querySelector<HTMLElement>('.name-vis');
if (nameVis && !reduce.matches) {
  let busy = false;
  nameVis.addEventListener('pointerenter', () => {
    // never re-enter while a line is still decoding (its text is split into cells)
    if (busy || nameVis.querySelector('.is-decoding')) return;
    busy = true;
    const lines = Array.from(nameVis.querySelectorAll<HTMLElement>('[data-decode]'));
    void Promise.all(lines.map((l) => decode(l, { stagger: 30, scramble: 220 }))).then(() => {
      window.setTimeout(() => (busy = false), 400);
    });
  });
}

/* ------------------------------------------- intent reveal (tap / click) */

/**
 * Cards marked [data-intent] reveal their one-line summary on hover/focus
 * (CSS) and toggle it on click/tap anywhere on the card. The heading button
 * ([data-intent-btn]) carries aria-expanded for assistive tech.
 */
const setOpen = (card: HTMLElement, open: boolean) => {
  card.classList.toggle('is-open', open);
  card.querySelector('[data-intent-btn]')?.setAttribute('aria-expanded', String(open));
};
document.querySelectorAll<HTMLElement>('[data-intent]').forEach((card) => setOpen(card, false));
document.addEventListener('click', (e) => {
  const target = e.target as Element | null;
  const card = target?.closest<HTMLElement>('[data-intent]');
  if (!card || target?.closest('a')) return;
  setOpen(card, !card.classList.contains('is-open'));
});

/* ------------------------------------------------------ copy to clipboard */

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  const status = btn.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
  btn.addEventListener('click', async () => {
    const value = btn.dataset.copy ?? '';
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      ok = false;
    }
    btn.dataset.state = ok ? 'done' : 'error';
    if (status) status.textContent = ok ? (btn.dataset.ok ?? '') : (btn.dataset.fail ?? '');
    window.setTimeout(() => {
      delete btn.dataset.state;
      if (status) status.textContent = '';
    }, 2200);
  });
});

/* ---------------------------------------------------- live local time */

const clock = document.querySelector<HTMLTimeElement>('[data-clock]');
const clockRow = document.querySelector<HTMLElement>('[data-clock-row]');
if (clock && clockRow) {
  const fmt = new Intl.DateTimeFormat(clock.dataset.locale ?? 'pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: clock.dataset.tz ?? 'Europe/Lisbon',
    timeZoneName: 'shortOffset',
  });
  const tick = () => {
    const now = new Date();
    clock.textContent = fmt.format(now);
    clock.dateTime = now.toISOString();
  };
  tick();
  clockRow.hidden = false;
  window.setInterval(tick, 30_000);
}

/* ------------------------------------- case study: "on this page" spy */

const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
if (tocLinks.length) {
  const byId = new Map(tocLinks.map((a) => [a.dataset.tocLink ?? '', a]));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const id = (e.target as HTMLElement).querySelector('h2')?.id ?? '';
        tocLinks.forEach((a) => a.removeAttribute('aria-current'));
        byId.get(id)?.setAttribute('aria-current', 'true');
      }
    },
    { rootMargin: '-30% 0px -60% 0px' },
  );
  document.querySelectorAll('.block').forEach((b) => io.observe(b));
}
