import { test, expect, type Page } from '@playwright/test';
import { trackErrors } from './helpers';

/**
 * Signature effects: the contact "Stack" (physics), odometers
 * (interactions.spec), journey timelines, scroll stack, bento and
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
  test('experience and education apart; the education trace draws with the scroll', async ({ page }, info) => {
    await page.goto('/');
    // experience: the one professional role, as a single card
    await expect(page.locator('#experiencia .job')).toHaveCount(1);
    await expect(page.locator('#experiencia .job')).toContainText('Eleven Systems');
    await expect(page.locator('#experiencia')).not.toContainText('Erasmus');
    // education: Erasmus (next), the degree (current), the diploma
    const tls = page.locator('[data-timeline]');
    await expect(tls).toHaveCount(1);
    const entries = page.locator('#formacoes [data-tl-item]');
    await expect(entries).toHaveCount(3);
    // oldest first, the newest last
    await expect(entries.first()).toContainText('Eletrotecnia');
    await expect(entries.last()).toContainText('Erasmus');
    await expect(page.locator('#formacoes .entry.upcoming')).toContainText('Erasmus');
    // the middle entry sits on the other side of the spine (desktop)
    await expect(entries.nth(1)).toHaveClass(/flip/);
    await expect(page.locator('#formacoes .entry.current')).toHaveCount(1);
    // the trace follows the page's own scroll: nothing scrolls inside
    const inner = await page.locator('#percurso').evaluate((s) =>
      Array.from(s.querySelectorAll('*')).filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY)).length,
    );
    expect(inner).toBe(0);
    if (!info.project.name.startsWith('mobile')) {
      const p = () => tls.first().evaluate((e) => Number(getComputedStyle(e).getPropertyValue('--p') || 1));
      await page.evaluate(() => document.getElementById('percurso')?.scrollIntoView({ behavior: 'instant' }));
      await expect.poll(p).toBeLessThan(1);
      await page.evaluate(() => document.querySelector('#formacoes .tl')?.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await expect.poll(p).toBe(1);
      await expect(page.locator('#formacoes .entry').last()).toHaveClass(/is-reached/);
    }
    // additional courses and languages were removed from the section
    await expect(page.locator('#percurso')).not.toContainText(/Formação complementar|Idiomas/i);
  });

  test('English copy is in place', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('#education .blk-title')).toHaveText('Education');
    await expect(page.locator('#experience .badge.now')).toHaveText('current');
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
    await expect(flip.locator('.back-text')).toContainText('Eleven Systems');
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

  test('English copy is in place', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('#step-test')).toContainText('Testing');
    await expect(page.locator('.case-label').first()).toHaveText('In the log analyser');
    await expect(page.locator('.stack-link')).toHaveAttribute('href', '/en/projects/log-analyzer/');
  });
});

test('skills bento: the area with most tools gets the largest tile', async ({ page }) => {
  await page.goto('/');
  const areas = await page.locator('[data-bento] .tile').evaluateAll((els) =>
    els.map((e) => ({ id: e.className, area: e.getBoundingClientRect().width * e.getBoundingClientRect().height })),
  );
  const largest = areas.reduce((a, b) => (b.area > a.area ? b : a));
  expect(largest.id).toContain('a-backend');
});
