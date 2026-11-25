/**
 * Progressive enhancement entry point (one small module for every page).
 * Every feature is optional: the HTML is complete and usable without it.
 */
import { decode, scrambleMono } from './decode';
import { primeOdometer, rollOdometer } from './odometer';
import { applyTheme, currentTheme, toggleTheme } from './theme';

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
root.classList.add('enhanced');

/* --------------------------------------------------------------- theme */

document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
  btn.setAttribute('aria-pressed', String(currentTheme() === 'light'));
  btn.addEventListener('click', () => {
    const b = btn.getBoundingClientRect();
    toggleTheme({ x: b.left + b.width / 2, y: b.top + b.height / 2 });
  });
});
if (root.hasAttribute('data-theme')) applyTheme(currentTheme());

/* ------------------------------------------------------ platform labels */

if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
  document.querySelectorAll('[data-mod-key]').forEach((k) => (k.textContent = '⌘'));
}

/* ------------------------------------- section tracking + rail progress */

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

/**
 * The active section and the rail's progress line come from one measure, so
 * they never disagree: a section is active once its top passes a reading
 * line at 42% of the viewport, and the line runs from that section's tick
 * to the next one in proportion to how much of the section has passed. The
 * ticks are evenly spaced while sections are not, so a plain page-scroll
 * progress would run ahead of (or behind) the highlighted square.
 */
const railIndex = document.querySelector<HTMLElement>('.rail .index');
const railFill = railIndex?.querySelector<HTMLElement>('.fill');
const railTrack = railFill?.parentElement;
if (sections.length) {
  let current: HTMLElement | null = null;
  let frame = 0;
  railIndex?.classList.add('is-synced');
  const sync = () => {
    frame = 0;
    const line = window.innerHeight * 0.42;
    const rects = sections.map((s) => s.getBoundingClientRect());
    const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    let idx = 0;
    rects.forEach((r, i) => {
      if (r.top <= line) idx = i;
    });
    if (atEnd) idx = sections.length - 1;
    const sec = sections[idx];
    if (sec && sec !== current) {
      current = sec;
      setActive(sec);
    }
    // the rail is hidden below 64rem: nothing to draw there
    if (!railFill || !railTrack || !railTrack.offsetHeight) return;
    const t = railTrack.getBoundingClientRect();
    const tick = (i: number) => {
      const a = railLinks.get(sections[i]?.dataset.section ?? '');
      if (!a) return t.height;
      const r = a.getBoundingClientRect();
      return r.top + r.height / 2 - t.top;
    };
    const r = rects[idx]!;
    const f = atEnd ? 1 : Math.min(1, Math.max(0, (line - r.top) / Math.max(1, r.height)));
    const from = tick(idx);
    const to = idx + 1 < sections.length ? tick(idx + 1) : from;
    railFill.style.transform = `scaleY(${((from + (to - from) * f) / t.height).toFixed(4)})`;
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(sync);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  sync();
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
  const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-odometer]'));
  counters.forEach(primeOdometer);
  onceVisible(counters, (el) => rollOdometer(el));
}

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

/* --------------------------------------------- smooth wheel scrolling */

if (!reduce.matches && finePointer.matches) {
  void import('./smooth-scroll').then(({ initSmoothScroll }) => initSmoothScroll());
}

/* ------------------------------------------------ journey timelines */

// With reduced motion the trace stays complete (CSS default): nothing to run.
const timelines = Array.from(document.querySelectorAll<HTMLElement>('[data-timeline]'));
if (timelines.length && !reduce.matches) {
  void import('./timeline').then(({ initTimelines }) => initTimelines(timelines));
}

/* ------------------------------------- contact "Stack" (lazy, physics) */

// The module is tiny; Matter.js is fetched inside it, only with motion
// allowed, and only when the frame gets near the viewport.
const stackWorld = document.querySelector<HTMLElement>('[data-physics]');
if (stackWorld) {
  const boot = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      boot.disconnect();
      void import('./stack-physics').then(({ initStack }) => initStack(stackWorld, reduce.matches));
    },
    { rootMargin: '0px 0px 50% 0px' },
  );
  boot.observe(stackWorld);
}

/* ----------------------------------------------- "How I work" stack */

const stack = document.querySelector<HTMLElement>('[data-stack]');
if (stack) {
  void import('./scroll-stack').then(({ initScrollStack }) => initScrollStack(stack, reduce.matches));
}

/* ------------------------------------------------ skills bento: light */

const bento = document.querySelector<HTMLElement>('[data-bento]');
if (bento) {
  const tiles = Array.from(bento.querySelectorAll<HTMLElement>('.tile'));
  const place = (tile: HTMLElement, x: number, y: number) => {
    const r = tile.getBoundingClientRect();
    tile.style.setProperty('--mx', `${x - r.left}px`);
    tile.style.setProperty('--my', `${y - r.top}px`);
  };
  if (finePointer.matches) {
    // every tile near the pointer lights its border, not only the hovered one
    let frame = 0;
    let px = 0;
    let py = 0;
    bento.addEventListener(
      'pointermove',
      (e) => {
        px = e.clientX;
        py = e.clientY;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          tiles.forEach((tile) => place(tile, px, py));
          bento.classList.add('is-near');
        });
      },
      { passive: true },
    );
    bento.addEventListener('pointerleave', () => bento.classList.remove('is-near'));
  } else if (!reduce.matches) {
    // touch: a light blooms from the point of contact
    bento.addEventListener(
      'pointerdown',
      (e) => {
        const tile = (e.target as Element | null)?.closest<HTMLElement>('.tile');
        if (!tile) return;
        place(tile, e.clientX, e.clientY);
        tile.classList.remove('is-lit');
        void tile.offsetWidth; // restart the transition on repeated taps
        tile.classList.add('is-lit');
        window.setTimeout(() => tile.classList.remove('is-lit'), 520);
      },
      { passive: true },
    );
  }
}

/* ------------------------------------------- portrait: flip card toggle */

// The whole card is a button (aria-pressed); its back holds "about me".
// Works with reduced motion too (CSS turns the flip into a cross-fade).
const flip = document.querySelector<HTMLElement>('[data-flip]');
const flipBtn = flip?.querySelector<HTMLButtonElement>('.flip-btn');
if (flip && flipBtn) {
  flipBtn.addEventListener('click', () => {
    const on = !flip.classList.contains('is-flipped');
    flip.classList.toggle('is-flipped', on);
    flipBtn.setAttribute('aria-pressed', String(on));
  });
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
