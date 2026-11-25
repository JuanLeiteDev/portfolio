import { test, expect, type Page } from '@playwright/test';
import { trackErrors } from './helpers';

/**
 * Signature effects: the contact "Stack" (physics), odometers
 * (interactions.spec), journey timeline, scroll stack, skills option wheel and
 * smooth wheel scrolling. These check behaviour and containment, not pixels.
 */

const OBJ = '[data-stackbox] .obj';

/** Scrolls the Stack frame into view and waits until every object rests in it. */
async function settledPile(page: Page) {
  await page.evaluate(() => document.querySelector('[data-stackbox]')?.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(page.locator(`${OBJ}.is-on`)).toHaveCount(12, { timeout: 10_000 });
  const snapshot = () =>
    page.evaluate((sel) => {
      // plain object: a DOMRect does not serialise out of evaluate()
      const { left, right, top, bottom } = document.querySelector('[data-stackbox] .sb-world')!.getBoundingClientRect();
      const w = { left, right, top, bottom };
      return Array.from(document.querySelectorAll<HTMLElement>(sel)).map((o) => {
        const r = o.getBoundingClientRect();
        return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, h: o.offsetHeight, w, t: o.style.transform };
      });
    }, OBJ);
  // settled = the same transforms twice in a row, half a second apart
  let prev = '';
  await expect
    .poll(
      async () => {
        const now = JSON.stringify((await snapshot()).map((o) => o.t));
        const same = now === prev;
        prev = now;
        return same;
      },
      // the pile rests in ~6 s; WebKit under a full parallel suite can take longer
      { timeout: 30_000, intervals: [500] },
    )
    .toBe(true);
  return snapshot();
}

/** Indexes of the objects whose centre is not covered by another one (safe to click/tap). */
const hittable = (page: Page) =>
  page.evaluate(
    (sel) =>
      Array.from(document.querySelectorAll<HTMLElement>(sel))
        .map((o, i) => {
          const r = o.getBoundingClientRect();
          return o.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)) ? i : -1;
        })
        .filter((i) => i >= 0),
    OBJ,
  );

test.describe('stack (contact)', () => {
  test.describe.configure({ timeout: 90_000 });

  test('the objects fall and rest on the floor of the frame, inside it', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/');
    const objs = await settledPile(page);
    for (const o of objs) {
      expect(o.cx).toBeGreaterThan(o.w.left);
      expect(o.cx).toBeLessThan(o.w.right);
      // inside the frame, below the top (they fell); long pills on phones can pile high
      expect(o.cy).toBeLessThan(o.w.bottom);
      expect(o.cy).toBeGreaterThan(o.w.top);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test('mouse: hovering does not move anything; press and drag does', async ({ page }) => {
    test.skip(test.info().project.name.startsWith('mobile'), 'mouse only');
    await page.goto('/');
    await settledPile(page);
    const transforms = () => page.locator(OBJ).evaluateAll((els) => els.map((e) => (e as HTMLElement).style.transform));
    const before = await transforms();
    // sweep quickly across the whole pile without pressing
    const w = (await page.locator('.sb-world').boundingBox())!;
    await page.mouse.move(w.x + 5, w.y + w.height - 20);
    await page.mouse.move(w.x + w.width - 5, w.y + w.height - 20, { steps: 6 });
    await page.waitForTimeout(400);
    expect(await transforms()).toEqual(before);

    const obj = page.locator(OBJ).nth((await hittable(page))[0]!);
    const box = (await obj.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 40, box.y - 100, { steps: 8 });
    const lifted = (await obj.boundingBox())!;
    expect(lifted.y).toBeLessThan(box.y - 50);
    await page.mouse.up();
    expect(await page.evaluate(() => String(window.getSelection()))).toBe('');
    await settledPile(page);
  });

  test('a centred minimalist frame of brand pills; nothing selectable; names for assistive tech', async ({ page }) => {
    await page.goto('/');
    const box = page.locator('[data-stackbox]');
    await expect(box.locator('.sb-label')).toHaveText('Stack');
    await expect(box.locator('.sb-world')).toHaveAttribute('aria-hidden', 'true');
    await expect(box.locator('.sr-only')).toContainText('Python, FastAPI, PostgreSQL');
    await expect(box.locator('button, [tabindex]')).toHaveCount(0);
    // pills: brand background, name, original logo (11) or the SQL glyph (1)
    const pills = box.locator('.obj');
    await expect(pills).toHaveCount(12);
    await expect(pills.first()).toHaveCSS('background-color', 'rgb(55, 118, 171)');
    await expect(pills.first().locator('.sb-name')).toHaveText('Python');
    await expect(box.locator('.sb-ico svg')).toHaveCount(11);
    // centred in the content column
    const centred = await box.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const p = el.parentElement!;
      const cs = getComputedStyle(p);
      const pr = p.getBoundingClientRect();
      const left = pr.left + parseFloat(cs.paddingLeft);
      const right = pr.right - parseFloat(cs.paddingRight);
      return Math.abs(r.left - left - (right - r.right));
    });
    expect(centred).toBeLessThan(2);
  });

  test('touch: press and drag moves an object', async ({ page }) => {
    test.skip(!test.info().project.name.startsWith('mobile'), 'touch only');
    await page.goto('/');
    await settledPile(page);
    const obj = page.locator(OBJ).nth((await hittable(page))[0]!);
    const box = (await obj.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const cdp = await page.context().newCDPSession(page).catch(() => null);
    test.skip(!cdp, 'touch drag needs CDP (Chromium)');
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', ty: number) =>
      cdp!.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y: ty }] });
    await touch('touchStart', y);
    for (let k = 1; k <= 8; k += 1) await touch('touchMove', y - k * 12);
    const lifted = (await obj.boundingBox())!;
    await touch('touchEnd', y - 96);
    expect(lifted.y).toBeLessThan(box.y - 40);
  });
});

test.describe('journey', () => {
  test('experience and education in one timeline that draws with the scroll', async ({ page }, info) => {
    await page.goto('/');
    const tls = page.locator('[data-timeline]');
    await expect(tls).toHaveCount(1);
    const entries = page.locator('#percurso [data-tl-item]');
    await expect(entries).toHaveCount(6);
    // oldest first, the newest last; the job sits among the courses
    await expect(entries.first()).toContainText('Eletrotecnia');
    await expect(entries.last()).toContainText('AI Engineer Intermediate');
    await expect(entries.last()).toContainText('Bélgica');
    await expect(page.locator('#percurso .entry.upcoming')).toContainText('AI Engineer Intermediate');
    await expect(entries.filter({ hasText: 'Eleven Systems' })).toHaveCount(1);
    await expect(page.locator('#percurso .entry.current')).toHaveCount(2);
    // alternate sides of the spine (desktop)
    await expect(entries.nth(1)).toHaveClass(/flip/);
    // each entry is year, title and place only
    await expect(page.locator('#percurso')).not.toContainText(/Erasmus|pós-laboral|Suporte técnico/i);
    // the trace follows the page's own scroll: nothing scrolls inside
    const inner = await page.locator('#percurso').evaluate((s) =>
      Array.from(s.querySelectorAll('*')).filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY)).length,
    );
    expect(inner).toBe(0);
    if (!info.project.name.startsWith('mobile')) {
      const p = () => tls.first().evaluate((e) => Number(getComputedStyle(e).getPropertyValue('--p') || 1));
      await page.evaluate(() => document.getElementById('percurso')?.scrollIntoView({ behavior: 'instant' }));
      await expect.poll(p).toBeLessThan(1);
      // the end of the timeline above the trace's tip (60% of the viewport)
      await page.evaluate(() => {
        const b = document.querySelector('#percurso .tl')!.getBoundingClientRect().bottom;
        window.scrollTo({ top: scrollY + b - innerHeight * 0.3, behavior: 'instant' });
      });
      await expect.poll(p).toBe(1);
      await expect(page.locator('#percurso .entry').last()).toHaveClass(/is-reached/);
    }
  });

  test('English copy is in place', async ({ page }) => {
    await page.goto('/en/');
    const entries = page.locator('#journey [data-tl-item]');
    await expect(entries).toHaveCount(6);
    await expect(entries.filter({ hasText: 'Software Developer & IT Support' })).toHaveCount(1);
    await expect(entries.last()).toContainText('Belgium');
  });
});

test.describe('hero portrait: flip card', () => {
  test('a click turns the photo over to "about me" and back', async ({ page }, info) => {
    const errors = trackErrors(page);
    await page.goto('/');
    const flip = page.locator('[data-flip]');
    const btn = flip.locator('.flip-btn');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.flip-hint')).toBeVisible();
    if (info.project.name.startsWith('mobile')) await btn.tap();
    else await btn.click();
    await expect(flip).toHaveClass(/is-flipped/);
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    await expect(flip.locator('.back-title')).toHaveText('Sobre mim');
    await expect(flip.locator('.back-text')).toContainText('curiosidade pela tecnologia');
    if (info.project.name.startsWith('mobile')) await btn.tap();
    else await btn.click();
    await expect(flip).not.toHaveClass(/is-flipped/);
    expect(errors).toEqual([]);
  });

  test('keyboard: the card is a toggle button with an accessible name', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'one engine is enough');
    await page.goto('/en/');
    const btn = page.locator('[data-flip] .flip-btn');
    await expect(btn).toHaveAccessibleName('Show about me');
    await btn.focus();
    await page.keyboard.press('Enter');
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-flip] .back-title')).toHaveText('About me');
    await page.keyboard.press('Space');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  test('reduced motion: the faces cross-fade instead of rotating', async ({ browser }) => {
    test.skip(test.info().project.name !== 'chromium', 'one engine is enough');
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    const flip = page.locator('[data-flip]');
    await flip.locator('.flip-btn').click();
    await expect(flip.locator('.back')).toBeVisible();
    await expect(flip.locator('.flip-in')).toHaveCSS('transform', 'none');
    await ctx.close();
  });
});

test('smooth wheel: the page glides to the wheel target instead of jumping', async ({ page }) => {
  test.skip(test.info().project.name !== 'chromium', 'wheel on desktop Chromium');
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 400);
  const early = await page.evaluate(() => window.scrollY);
  expect(early).toBeLessThan(400);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(395);
});

test.describe('scroll stack', () => {
  test('cards stack while scrolling and the ones underneath recede', async ({ page }) => {
    await page.goto('/');
    const stack = page.locator('[data-stack]');
    await expect(stack).toHaveClass(/is-ready/);
    const cards = page.locator('[data-stack-card]');
    await expect(cards).toHaveCount(4);
    // scroll until the last card is stuck
    await page.evaluate(() => {
      const list = document.querySelector('[data-stack]')!;
      const end = list.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      window.scrollTo({ top: end + 200, behavior: 'instant' });
    });
    for (let i = 0; i < 4; i += 1) await expect(cards.nth(i)).toHaveClass(/is-seen/);
    const sticks = !(await stack.evaluate((e) => e.classList.contains('no-stick')));
    if (sticks) {
      await expect.poll(() => cards.nth(0).locator('.card-in').evaluate((e) => Number(e.style.getPropertyValue('--depth')))).toBeGreaterThan(1);
    }
    // never wider than the page
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('short landscape viewport: cards fall back to a normal list', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'one engine is enough');
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/');
    await expect(page.locator('[data-stack-card]').first()).toHaveCSS('position', 'static');
  });

  test('blueprint evolves card by card (rev. A → D) and switches 3D ⇄ plan', async ({ page }, info) => {
    const errors = trackErrors(page);
    await page.goto('/');
    const stack = page.locator('[data-stack]');
    await expect(stack).toHaveClass(/is-ready/);
    const bps = page.locator('[data-bp]');
    await expect(bps).toHaveCount(4);
    // bring each card to its sticky place in turn
    const tops = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-stack-card]')).map(
        (c) => c.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(c).top) || 0),
      ),
    );
    for (let i = 0; i < 4; i += 1) {
      await page.evaluate((y) => window.scrollTo({ top: y + 30, behavior: 'instant' }), tops[i]!);
      await expect(bps.nth(i).locator('[data-bp-rev]')).toHaveText('ABCD'[i]!, { timeout: 6000 });
    }
    // the last step: three modules, each checked, the result lit
    const last = bps.nth(3);
    await expect(last.locator('.bp-ok')).toHaveCount(3, { timeout: 6000 });
    await expect(last.locator('.is-lit')).toHaveCount(1);
    // a click (tap on phones) anywhere on the drawing switches to the plan view
    const btn = last.getByRole('button', { name: 'Mudar o blueprint para planta' });
    await expect(btn).toBeVisible();
    // (on the drawing itself, while its data is flowing)
    const at = { position: { x: 120, y: 60 } };
    if (info.project.name.startsWith('mobile')) await last.tap(at);
    else await last.click(at);
    await expect(last).toHaveClass(/is-plan/);
    await expect(last.getByRole('button')).toHaveAccessibleName('Mudar o blueprint para 3D');
    // and the button (keyboard) switches back
    await last.getByRole('button').focus();
    await page.keyboard.press('Enter');
    await expect(last).not.toHaveClass(/is-plan/);
    expect(errors).toEqual([]);
  });

  test('English copy is in place', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('#step-test')).toContainText('Delivery');
    await expect(page.locator('[data-bp]').first().getByRole('button')).toHaveAccessibleName('Switch the blueprint to plan');
    await expect(page.locator('[data-bp] text').filter({ hasText: 'solution' }).last()).toBeAttached();
  });
});

test.describe('skills: option wheel', () => {
  test('a title selects its area; the text beside it follows', async ({ page }, info) => {
    const errors = trackErrors(page);
    await page.goto('/');
    const sk = page.locator('[data-sk]');
    await sk.scrollIntoViewIfNeeded();
    const wheel = sk.getByRole('listbox');
    await expect(wheel).toBeVisible();
    const opts = wheel.getByRole('option');
    await expect(opts).toHaveCount(7);
    await expect(opts.first()).toHaveAttribute('aria-selected', 'true');
    const activeText = () => sk.locator('[data-sk-panel].is-active .count .cur').textContent();
    expect(await activeText()).toBe('01');
    if (info.project.name.startsWith('mobile')) await opts.nth(1).tap();
    else await opts.nth(2).click();
    const k = info.project.name.startsWith('mobile') ? 1 : 2;
    await expect(opts.nth(k)).toHaveAttribute('aria-selected', 'true');
    await expect(wheel).toHaveAttribute('aria-activedescendant', (await opts.nth(k).getAttribute('id'))!);
    expect(await activeText()).toBe(`0${k + 1}`);
    // keyboard
    await wheel.focus();
    await page.keyboard.press('ArrowDown');
    await expect(opts.nth(k + 1)).toHaveAttribute('aria-selected', 'true');
    expect(errors).toEqual([]);
  });

  test('desktop: dragging anywhere on the left turns the wheel; the mouse wheel scrolls the page', async ({ page }, info) => {
    test.skip(info.project.name.startsWith('mobile'), 'desktop only');
    await page.goto('/');
    const sk = page.locator('[data-sk]');
    await sk.scrollIntoViewIfNeeded();
    const opts = sk.getByRole('option');
    const w = (await sk.getByRole('listbox').boundingBox())!;
    // the mouse wheel over the titles scrolls the page and leaves the selection alone
    await page.mouse.move(w.x + 100, w.y + w.height / 2);
    const y0 = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 200);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y0);
    await expect(opts.first()).toHaveAttribute('aria-selected', 'true');
    // grab an empty spot of the left column and drag up: later areas come to the apex
    await sk.scrollIntoViewIfNeeded();
    const b = (await sk.getByRole('listbox').boundingBox())!;
    const x = b.x + b.width - 20;
    const y = b.y + b.height - 40;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i += 1) await page.mouse.move(x, y - i * 20, { steps: 2 });
    await page.mouse.up();
    await expect(opts.first()).toHaveAttribute('aria-selected', 'false');
  });

  test('mobile: tapping a title goes straight to it (no flicker through the others)', async ({ page }, info) => {
    test.skip(!info.project.name.startsWith('mobile'), 'mobile only');
    await page.goto('/');
    const sk = page.locator('[data-sk]');
    await sk.scrollIntoViewIfNeeded();
    const opts = sk.getByRole('option');
    await expect(opts.first()).toHaveAttribute('aria-selected', 'true');
    // record every title that becomes selected
    await page.evaluate(() => {
      const w = window as unknown as { skLog: number[] };
      w.skLog = [];
      const all = Array.from(document.querySelectorAll('[data-sk-opt]'));
      new MutationObserver((ms) => {
        for (const m of ms) {
          const el = m.target as Element;
          if (el.getAttribute('aria-selected') === 'true') w.skLog.push(all.indexOf(el));
        }
      }).observe(document.querySelector('[data-sk-wheel]')!, { subtree: true, attributeFilter: ['aria-selected'] });
    });
    const log = () => page.evaluate(() => (window as unknown as { skLog: number[] }).skLog);
    for (const [to, from] of [
      [1, 0],
      [2, 1],
      [1, 2],
    ] as const) {
      await page.evaluate(() => ((window as unknown as { skLog: number[] }).skLog = []));
      // tap where the title is, like a finger (locator.tap() would first
      // scrollIntoView it, which scrolls the strip itself)
      const r = (await opts.nth(to).boundingBox())!;
      await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
      await expect(opts.nth(to)).toHaveAttribute('aria-selected', 'true');
      // let the smooth scroll finish, then nothing but the tapped title was selected
      await page.waitForTimeout(900);
      expect(await log(), `tap ${from} → ${to}`).toEqual([to]);
      await expect(opts.nth(to)).toHaveAttribute('aria-selected', 'true');
    }
  });
});
