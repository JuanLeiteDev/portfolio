/**
 * Command menu — the only React island on the site.
 *
 * Desktop: centred palette (Ctrl/⌘+K or "/"), type-to-filter, arrow keys.
 * Mobile (< 64rem): the same component becomes a bottom sheet, opened from
 * the dock, with drag-to-dismiss on the handle. The search field is not
 * auto-focused on touch so the keyboard does not cover the list.
 *
 * Accessibility: native <dialog> (focus containment, Escape, inert page),
 * combobox + listbox pattern with aria-activedescendant, focus restored to
 * the trigger on close. Triggers are plain links/buttons ([data-cmd-open])
 * that already work before hydration (they fall back to #menu).
 */
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { toggleTheme } from '@/scripts/theme';

export type CmdGroup = 'sections' | 'projects' | 'contact' | 'settings';

export interface CmdItem {
  id: string;
  group: CmdGroup;
  label: string;
  hint?: string;
  href?: string;
  external?: boolean;
  download?: string;
  action?: 'theme';
  keywords?: string;
}

interface Strings {
  label: string;
  placeholder: string;
  empty: string;
  close: string;
  navigate: string;
  select: string;
  dismiss: string;
  groups: Record<CmdGroup, string>;
}

interface Props {
  items: CmdItem[];
  strings: Strings;
}

const GROUP_ORDER: CmdGroup[] = ['sections', 'projects', 'contact', 'settings'];

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSheet = () => window.matchMedia('(max-width: 63.999rem)').matches;

export default function CommandMenu({ items, strings }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const uid = useId();

  const results = useMemo(() => {
    const q = normalise(query.trim());
    const filtered = q
      ? items.filter((i) => normalise(`${i.label} ${i.hint ?? ''} ${i.keywords ?? ''}`).includes(q))
      : items;
    return GROUP_ORDER.flatMap((g) => filtered.filter((i) => i.group === g));
  }, [items, query]);

  /* ---------------------------------------------------------- open/close */

  const show = useCallback((trigger?: HTMLElement | null) => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
    setQuery('');
    setActive(0);
    dialog.showModal();
    dialog.removeAttribute('data-closing');
    setOpen(true); // focus is moved in the effect below, once the panel exists
  }, []);

  // The panel only mounts when open, so focus must wait for that render.
  useEffect(() => {
    if (!open) return;
    if (isSheet() && window.matchMedia('(pointer: coarse)').matches) panelRef.current?.focus();
    else inputRef.current?.focus();
  }, [open]);

  const hide = useCallback((then?: () => void) => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open) return;
    const finish = () => {
      dialog.close();
      dialog.removeAttribute('data-closing');
      if (panelRef.current) panelRef.current.style.translate = '';
      setOpen(false);
      if (then) then();
      else triggerRef.current?.focus({ preventScroll: true });
    };
    if (reducedMotion()) return finish();
    dialog.setAttribute('data-closing', '');
    window.setTimeout(finish, 180);
  }, []);

  /* ------------------------------------------------------ global triggers */

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as Element | null)?.closest<HTMLElement>('[data-cmd-open]');
      if (!trigger) return;
      e.preventDefault();
      show(trigger);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (dialogRef.current?.open) hide();
        else show();
      } else if (e.key === '/' && !isTypingTarget(e.target) && !dialogRef.current?.open) {
        e.preventDefault();
        show();
      }
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('cmd-ready');
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [show, hide]);

  /* ------------------------------------------------- sliding highlight */

  useLayoutEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const hl = highlightRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!list || !hl) return;
    if (!el) {
      hl.style.opacity = '0';
      return;
    }
    hl.style.opacity = '1';
    hl.style.transform = `translateY(${el.offsetTop}px)`;
    hl.style.height = `${el.offsetHeight}px`;
    el.scrollIntoView({ block: 'nearest' });
  }, [active, open, results]);

  /* ------------------------------------------------------------ actions */

  const run = useCallback(
    (item: CmdItem | undefined) => {
      if (!item) return;
      if (item.action === 'theme') {
        toggleTheme();
        return; // keep the menu open so the change is visible
      }
      const href = item.href;
      if (!href) return;
      if (item.external) {
        window.open(href, '_blank', 'noopener,noreferrer');
        hide();
        return;
      }
      if (item.download) {
        const a = document.createElement('a');
        a.href = href;
        a.download = item.download;
        document.body.append(a);
        a.click();
        a.remove();
        hide();
        return;
      }
      const url = new URL(href, window.location.href);
      const samePage = url.pathname === window.location.pathname && url.hash;
      hide(() => {
        if (samePage) {
          const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
          if (target) {
            history.pushState(null, '', url.hash);
            target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
            const focusable = target.querySelector<HTMLElement>('h1, h2') ?? target;
            if (!focusable.hasAttribute('tabindex')) focusable.setAttribute('tabindex', '-1');
            focusable.focus({ preventScroll: true });
            return;
          }
        }
        window.location.href = url.href;
      });
    },
    [hide],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (results.length ? (a + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Home' && e.target !== inputRef.current) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End' && e.target !== inputRef.current) {
      e.preventDefault();
      setActive(Math.max(0, results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[active]);
    }
  };

  /* ---------------------------------------------- sheet: drag to dismiss */

  const drag = useRef<{ y: number; dy: number; id: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!isSheet()) return;
    drag.current = { y: e.clientY, dy: 0, id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    panelRef.current?.setAttribute('data-dragging', '');
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || !panelRef.current) return;
    d.dy = Math.max(0, e.clientY - d.y);
    panelRef.current.style.translate = `0 ${d.dy}px`;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    panelRef.current?.removeAttribute('data-dragging');
    const panelH = panelRef.current?.offsetHeight ?? 400;
    if (d.dy > Math.min(140, panelH * 0.3)) hide();
    else if (panelRef.current) panelRef.current.style.translate = '';
  };

  /* ------------------------------------------------------------- render */

  const listboxId = `${uid}-list`;
  const optionId = (i: number) => `${uid}-opt-${i}`;
  let index = -1;

  return (
    // Backdrop click is a pointer-only convenience; Escape (onCancel) covers keyboard users.
    // Arrow/Enter handling for the combobox is delegated to the dialog so it works wherever
    // focus sits inside it (input, panel on touch sheets).
    // eslint-disable-next-line jsx-a11y-x/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      className="cmdk"
      aria-label={strings.label}
      onKeyDown={onKeyDown}
      onCancel={(e) => {
        e.preventDefault();
        hide();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) hide();
      }}
    >
      {open && (
        <div ref={panelRef} className="cmdk-panel" tabIndex={-1}>
          <div
            className="cmdk-handle"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-hidden="true"
          >
            <span />
          </div>
          <div className="cmdk-head">
            <span className="cmdk-prompt" aria-hidden="true">
              &gt;
            </span>
            <input
              ref={inputRef}
              className="cmdk-input"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={results[active] ? optionId(active) : undefined}
              aria-label={strings.placeholder}
              placeholder={strings.placeholder}
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
            />
            <button type="button" className="cmdk-close" onClick={() => hide()}>
              <span aria-hidden="true">esc</span>
              <span className="sr-only">{strings.close}</span>
            </button>
          </div>

          <div ref={listRef} id={listboxId} role="listbox" aria-label={strings.label} className="cmdk-list">
            <div ref={highlightRef} className="cmdk-hl" aria-hidden="true" />
            {results.length === 0 && (
              <p className="cmdk-empty" role="status">
                {strings.empty}
              </p>
            )}
            {GROUP_ORDER.map((g) => {
              const groupItems = results.filter((r) => r.group === g);
              if (!groupItems.length) return null;
              const gid = `${uid}-g-${g}`;
              return (
                <div key={g} role="group" aria-labelledby={gid} className="cmdk-group">
                  <p id={gid} className="cmdk-group-label" role="presentation">
                    {strings.groups[g]}
                  </p>
                  {groupItems.map((item) => {
                    index += 1;
                    const i = index;
                    return (
                      // Options are operated from the combobox (aria-activedescendant + Enter);
                      // the click handler serves pointer and screen-reader activation.
                      // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events
                      <div
                        key={item.id}
                        id={optionId(i)}
                        role="option"
                        aria-selected={i === active}
                        data-index={i}
                        className="cmdk-item"
                        tabIndex={-1}
                        onPointerMove={() => i !== active && setActive(i)}
                        onClick={() => run(item)}
                      >
                        <span className="cmdk-label">{item.label}</span>
                        {item.hint && <span className="cmdk-hint">{item.hint}</span>}
                        <span className="cmdk-go" aria-hidden="true">
                          {item.external ? '↗' : item.download ? '↓' : item.action ? '◐' : '→'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="cmdk-foot" aria-hidden="true">
            <span>
              <kbd className="kbd">↑</kbd>
              <kbd className="kbd">↓</kbd> {strings.navigate}
            </span>
            <span>
              <kbd className="kbd">↵</kbd> {strings.select}
            </span>
            <span>
              <kbd className="kbd">esc</kbd> {strings.dismiss}
            </span>
          </div>
        </div>
      )}
    </dialog>
  );
}
