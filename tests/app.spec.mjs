// Interaction tests: everything a traveller taps, types or swipes, checked against what the app saves.
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { prepare, trackErrors, at, stored, live, sheetOpen, openStop, closeSheet } from './helpers.mjs';

let errors;
test.beforeEach(async ({ context, page }) => {
  await prepare(context);
  errors = trackErrors(page);
});
test.afterEach(async ({ page }) => {
  expect(errors, 'console errors').toEqual([]);
  expect(await page.evaluate(() => window.__csp || []), 'CSP violations').toEqual([]);
});

test('Today shows the Now card, the garland and the timeline', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50'));
  await expect(page.locator('article.now .tag')).toContainText('Now');
  await expect(page.locator('article.now .now-title')).toHaveText('Back to the dorm, change for the falls');
  await expect(page.locator('.garland .bead')).toHaveCount(22);
  await expect(page.locator('.mural .scene-svg')).toHaveCount(1);
  await expect(page.locator('.nav [data-tab=today]')).toHaveAttribute('aria-current', 'page');
});

test('ticking a stop blooms, counts and can be undone', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50'));
  await page.click('#r-we37 .r-node');
  await expect(page.locator('#r-we37 .bloom')).toHaveCount(1);
  await expect(page.locator('#toast')).toHaveText(/^Done/);
  await expect(page.locator('.bead.pop')).toHaveCount(1);
  expect((await stored(page)).done.we37).toBeTruthy();
  await expect(page.locator('.bloom')).toHaveCount(0, { timeout: 3000 });
  await page.click('#r-we37 .r-node');
  expect((await stored(page)).done.we37).toBeFalsy();
});

test('a stop sheet logs what was paid and closes on Escape', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50'));
  await openStop(page, 'we29');
  expect(await sheetOpen(page)).toBe(true);
  expect(await page.evaluate(() => document.activeElement.classList.contains('sh-title'))).toBe(true);
  expect(await page.evaluate(() => document.getElementById('main').hasAttribute('inert'))).toBe(true);
  await page.fill('input[data-paid=we29]', '300');
  await page.waitForTimeout(400);
  expect((await stored(page)).spent.we29).toBe(300);
  await closeSheet(page);
  expect(await sheetOpen(page)).toBe(false);
  await expect(page.locator('#r-we29')).toContainText('Paid ₹300');
  expect(await page.evaluate(() => document.getElementById('main').hasAttribute('inert'))).toBe(false);
});

test('skipping and restoring a stop from its sheet', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50'));
  await openStop(page, 'we39');
  await page.click('#sheetBody [data-act=skip]');
  await expect(page.locator('#r-we39')).toHaveClass(/skipped/);
  expect((await stored(page)).skip.we39).toBeTruthy();
  await page.waitForTimeout(400);
  await openStop(page, 'we39');
  await page.click('#sheetBody [data-act=skip]');
  await expect(page.locator('#r-we39')).not.toHaveClass(/skipped/);
});

test('editing a built-in stop, then resetting it to the original', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50'));
  await openStop(page, 'we25');
  await page.click('#sheetBody [data-act=edit]');
  await page.fill('#f-title', 'Lunch at Diana, edited');
  await page.click('#editForm [type=submit]');
  await expect(page.locator('#r-we25 .r-title')).toHaveText('Lunch at Diana, edited');
  await page.waitForTimeout(400);
  await openStop(page, 'we25');
  await page.click('#sheetBody [data-act=edit]');
  await page.click('[data-act=reset-stop]');
  await page.click('[data-act=reset-stop]');
  await expect(page.locator('#r-we25 .r-title')).toHaveText(/^Lunch at Diana, home/);
});

test('adding a stop checks its fields, and deleting it takes two taps', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50'));
  await page.click('.add[data-act=add]');
  await page.waitForTimeout(450);
  await page.click('#editForm [type=submit]');
  await expect(page.locator('#f-err')).toBeVisible();
  await page.fill('#f-title', 'Tender coconut at Malpe');
  await page.fill('#f-time', '16:10');
  await page.fill('#f-cost', '60');
  await page.click('#editForm [type=submit]');
  await page.waitForTimeout(450);
  const custom = (await stored(page)).custom;
  expect(custom).toHaveLength(1);
  expect(custom[0]).toMatchObject({ t: '16:10', c: [60, 60], x: 'Tender coconut at Malpe' });
  const row = page.locator('#r-' + custom[0].id);
  await expect(row).toContainText('Yours');
  await openStop(page, custom[0].id);
  await page.click('#sheetBody [data-act=edit]');
  await page.click('[data-act=del-stop]');
  await page.click('[data-act=del-stop]');
  await expect(row).toHaveCount(0);
  expect((await stored(page)).custom).toHaveLength(0);
});

test('earlier stops fold away on Today', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50'));
  const folded = await page.locator('.tl .row').count();
  await page.click('[data-act=earlier]');
  expect(await page.locator('.tl .row').count()).toBeGreaterThan(folded);
});

test('Plan B from the rules sheet, and back to Plan A', async ({ page }) => {
  await page.goto(at('2026-10-08T08:00'));
  await page.click('[data-act=rules]');
  await page.waitForTimeout(450);
  await page.click('#sheetBody [data-act=variant]');
  await expect(page.locator('#r-tb1')).toHaveCount(1);
  expect((await stored(page)).variant.thu).toBe('B');
  await page.waitForTimeout(400);
  await page.click('.planseg [data-v=A]');
  await expect(page.locator('#r-th6')).toHaveCount(1);
  expect((await stored(page)).variant.thu).toBe('A');
});

test('Friday Plan B swaps 12133 for the surf and the road to Mangaluru', async ({ page }) => {
  await page.goto(at('2026-10-09T08:00'));
  await expect(page.locator('#r-fr18')).toHaveCount(1);
  await expect(page.locator('#r-fs4')).toHaveCount(0);
  await page.click('.planseg [data-v=B]');
  await expect(page.locator('#r-fs4')).toHaveCount(1);
  await expect(page.locator('#r-fr18')).toHaveCount(0);
  await expect(page.locator('#r-fr23')).toHaveCount(1);
  await expect(page.locator('article.now .now-title')).toHaveText('Surf lesson with Mantra Surf Club');
  expect((await stored(page)).variant.fri).toBe('B');
});

test('Thursday night out shows the night stops with their own kind', async ({ page }) => {
  await page.goto(at('2026-10-08T21:00'));
  await expect(page.locator('article.now .now-title')).toHaveText('Dinner and drinks at The High Point Lounge');
  await expect(page.locator('#r-th30 .r-node')).toHaveClass(/g-night/);
  await expect(page.locator('#r-th32')).toContainText('Rapido back to the dorm');
});

test('the first-run tour shows once and walks through three cards', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await prepare(context, { guide: true });
  const page = await context.newPage();
  await page.goto(at('2026-10-07T09:50'));
  await expect(page.locator('#sheetBody .gd')).toBeVisible({ timeout: 4000 });
  await expect(page.locator('#sheetBody .sh-title')).toHaveText('Today runs the trip');
  await page.click('#sheetBody [data-act=guide][data-step="1"]');
  await expect(page.locator('#sheetBody .sh-title')).toHaveText('Tick stops as you go');
  await page.click('#sheetBody [data-act=guide][data-step="2"]');
  await expect(page.locator('#sheetBody .sh-title')).toHaveText('Ready when plans change');
  await page.click('#sheetBody [data-act=guide-done]');
  await expect.poll(() => sheetOpen(page)).toBe(false);
  expect(await page.evaluate(() => localStorage.getItem('udupi.guide'))).toBe('1');
  await page.reload();
  await page.waitForTimeout(1200);
  expect(await sheetOpen(page)).toBe(false);
  await context.close();
});

test('the help sheet explains every circle and mark, and replays the tour', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50'));
  await page.click('.bar [data-act=help]');
  await page.waitForTimeout(450);
  expect(await sheetOpen(page)).toBe(true);
  await expect(page.locator('#sheetBody .legend li')).toHaveCount(14);
  await expect(page.locator('#sheetBody .marks li')).toHaveCount(5);
  await page.click('#sheetBody [data-act=guide]');
  await expect(page.locator('#sheetBody .sh-title')).toHaveText('Today runs the trip');
  await closeSheet(page);
  expect(await sheetOpen(page)).toBe(false);
});

test('each day shows its highlights under the title', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50'));
  await expect(page.locator('.heading .hl li')).toHaveCount(4);
  await expect(page.locator('.heading .hl li').first()).toHaveText('Dawn darshan');
  await page.goto(at('2026-10-07T09:50', 'days'));
  await page.click('.dbtn[data-day=thu]');
  await expect(page.locator('.heading .hl li')).toHaveCount(5);
});

test('Days: the arched tiles switch the day', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50'));
  await page.click('.nav [data-tab=days]');
  await expect(page.locator('.strip .dbtn')).toHaveCount(5);
  await expect(page).toHaveURL(/#days$/);
  await page.click('.dbtn[data-day=fri]');
  await expect(page.locator('.day-body .title')).toContainText('two trains');
  await expect(page.locator('.dbtn[data-day=fri]')).toHaveAttribute('aria-pressed', 'true');
});

test('Kit is a packing list: ticks and your own items', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50', 'kit'));
  await page.click('label.check:has(input[data-pack=k1])');
  await expect(page.locator('.ring-wrap span')).toHaveText('1');
  expect((await stored(page)).pack.k1).toBeTruthy();
  await page.fill('#kit-label', 'Spare specs');
  await page.press('#kit-label', 'Enter');
  await expect(page.locator('#main')).toContainText('Spare specs');
  await page.click('[data-act=kit-del]');
  await expect(page.locator('#main')).not.toContainText('Spare specs');
  await expect(page.locator('[data-act=kitview], .sg-item')).toHaveCount(0);
});

test('the day checklist shows where to shoot, folded under each stop and open at the current one', async ({ page }) => {
  await page.goto(at('2026-10-07T16:00'));
  const here = page.locator('#r-we39 .r-shots');
  await expect(here).toHaveClass(/open/);
  await expect(here.locator('.sg-item')).toHaveCount(1);
  await expect(here.locator('.sg-at')).toContainText('south of the rocks');
  await expect(here.locator('.sg-fr')).toBeVisible();
  await expect(page.locator('#r-we22 .r-shots')).toHaveClass(/gold/);
  await expect(page.locator('#r-we22 .r-shots')).not.toHaveClass(/open/);
  const later = page.locator('#r-we21 .r-shots');
  await expect(later).not.toHaveClass(/open/);
  await expect(later.locator('.sg-item').first()).toBeHidden();
  await later.locator('.sg-tog').click();
  await expect(later).toHaveClass(/open/);
  await expect(later.locator('.sg-tog')).toHaveAttribute('aria-expanded', 'true');
  await later.locator('.sg-item').first().click();
  expect((await stored(page)).shots['we21-s0']).toBeTruthy();
  await expect(later.locator('.sg-n')).toHaveText('1/2');
  await openStop(page, 'we21');
  await expect(page.locator('#sheetBody input[data-shot="we21-s0"]')).toBeChecked();
  await closeSheet(page);
  await page.locator('#r-we39 .sg-tog').click();
  await expect(here).not.toHaveClass(/open/);
});

test('rows stay clean: Kannada names only on the Now card and in the sheet', async ({ page }) => {
  await page.goto(at('2026-10-07T17:40'));
  await expect(page.locator('.tl .r-kn')).toHaveCount(0);
  await expect(page.locator('article.now .now-kn')).toHaveText('ಕಾಪು ಬೀಚ್');
  await openStop(page, 'we22');
  await expect(page.locator('#sheetBody .sh-kn')).toHaveText('ಕಾಪು ಬೀಚ್');
});

test('SOS: bookings survive a reload and the money card adds up', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50', 'sos'));
  await page.fill('#sos-dormName', 'Coast Dorm');
  await page.evaluate(() => { state.spent.we29 = 300; save(); });
  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.locator('#sos-dormName')).toHaveValue('Coast Dorm');
  await expect(page.locator('.money .mn-big')).toContainText('300');
  await expect(page.locator('.tiles .tile')).toHaveCount(4);
});

test('Backup saves a file, and restore asks before replacing', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50', 'sos'));
  await page.evaluate(() => { state.done.we5 = 1; save(); });
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=backup]')]);
  expect(download.suggestedFilename()).toMatch(/^udupi-trip-2026-10-07-[0-9]{4}[.]json$/);
  const backup = JSON.parse(readFileSync(await download.path(), 'utf8'));
  expect(backup.app).toBe('udupi-coast-trip');
  backup.state.done = { tu1: 1, tu2: 1 };
  await page.setInputFiles('#restoreFile', { name: 'trip.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.locator('.bk-confirm')).toHaveCount(1);
  await page.click('[data-act=restore-yes]');
  await expect.poll(async () => Object.keys((await stored(page)).done).sort()).toEqual(['tu1', 'tu2']);
});

test('Reset clears ticks but keeps bookings', async ({ page }) => {
  await page.goto(at('2026-10-07T09:50', 'sos'));
  await page.evaluate(() => { state.done.we5 = 1; state.sos.dormName = 'Coast Dorm'; save(); render(); });
  await page.click('details[data-acc=reset] summary');
  await page.click('[data-act=reset]');
  await page.click('[data-act=reset]');
  await expect.poll(async () => Object.keys((await stored(page)).done).length).toBe(0);
  expect((await stored(page)).sos.dormName).toBe('Coast Dorm');
});

test('Journal keeps a mood and a line', async ({ page }) => {
  await page.goto(at('2026-10-07T20:00'));
  await page.click('.mood[data-v=calm]');
  await page.fill('input[data-jr=wed]', 'Lamps at night');
  await page.waitForTimeout(450);
  expect((await stored(page)).journal.wed).toEqual({ mood: 'calm', note: 'Lamps at night' });
  await expect(page.locator('.mood[data-v=calm]')).toHaveAttribute('aria-pressed', 'true');
});

test('Finishing a day stamps it, and undoing lifts the stamp', async ({ page }) => {
  await page.goto(at('2026-10-06T21:20'));
  await page.evaluate(() => { for (let i = 1; i <= 12; i++) if (i !== 11) state.done['tu' + i] = 1; save(); render(); });
  await page.click('#r-tu11 .r-node');
  await expect(page.locator('.stamp-wrap .medal').first()).toBeVisible();
  expect((await stored(page)).sealed.tue).toBeTruthy();
  await page.click('.stamp-wrap .btn');
  await expect(page.locator('.stamp-wrap')).toHaveCount(0);
  await page.click('#r-tu11 .r-node');
  expect((await stored(page)).sealed.tue).toBeFalsy();
});

test('Data saved by the earlier version still loads', async ({ page }) => {
  await page.goto(at('2026-10-07T12:00', 'days'));
  await page.evaluate(() => {
    removeEventListener('pagehide', save);
    save = () => {};
    localStorage.setItem('udupi.app.v1', JSON.stringify({ v: 1, done: { we5: 1791234000000, we6: 1 }, skip: { we16: 1 }, edits: {}, custom: [{ id: 'cabc123', day: 'wed', t: '11:00', k: 'food', x: 'Old custom', q: '', b: '', hard: 0, c: null }], shots: { 'we8-s0': 1 }, pack: { k3: 1 }, packCustom: [{ id: 'pcx1', cat: 'Tech', label: 'Old cable' }], sos: { vrlPnr: 'PNR1' }, variant: { thu: 'A' }, theme: 'dark' }));
  });
  await page.reload();
  const s = await live(page);
  expect(s.done.we5).toBeTruthy();
  expect(s.skip.we16).toBeTruthy();
  expect(s.custom).toHaveLength(1);
  expect(s.sos.vrlPnr).toBe('PNR1');
  expect(s).not.toHaveProperty('theme');
  await expect(page.locator('#r-cabc123')).toHaveCount(1);
});

test('Hash links and the brand switch tabs', async ({ page }) => {
  await page.goto(at('2026-10-07T12:00', 'days'));
  await page.evaluate(() => { location.hash = '#kit'; });
  await expect(page.locator('.nav [data-tab=kit]')).toHaveAttribute('aria-current', 'page');
  await page.click('.brand');
  await expect(page.locator('.nav [data-tab=today]')).toHaveAttribute('aria-current', 'page');
});

test('The Kindi intro plays once per session', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await prepare(context, { intro: true });
  const page = await context.newPage();
  await page.goto(at('2026-10-07T09:50'), { waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => document.documentElement.classList.contains('intro-on'))).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('intro-on')), { timeout: 4000 }).toBe(false);
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.classList.contains('intro-on'))).toBe(false);
  await context.close();
});

