// Platform checks: headers, install manifest, offline support and layout at every phone width.
import { test, expect } from '@playwright/test';
import { prepare, trackErrors, at } from './helpers.mjs';

test('security and privacy headers are served', async ({ request }) => {
  const res = await request.get('/');
  expect(res.status()).toBe(200);
  const h = res.headers();
  expect(h['content-security-policy']).toContain("script-src 'self';");
  expect(h['x-robots-tag']).toContain('noindex');
  expect(h['referrer-policy']).toBe('no-referrer');
  expect((await request.get('/sw.js')).headers()['cache-control']).toBe('no-cache');
});

test('the manifest is valid and the app is installable', async ({ context, page }) => {
  await prepare(context);
  await page.goto(at('2026-10-07T09:50'));
  const cdp = await context.newCDPSession(page);
  const manifest = await cdp.send('Page.getAppManifest');
  expect(manifest.errors).toEqual([]);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
  // Test browsers run in incognito-like contexts; any other reason is a real problem.
  expect(installabilityErrors.filter(e => e.errorId !== 'in-incognito')).toEqual([]);
});

test.describe('offline', () => {
  test.use({ serviceWorkers: 'allow' });

  test('the app works with no signal after one visit', async ({ context, page }) => {
    await prepare(context);
    const errors = trackErrors(page);
    await page.goto(at('2026-10-07T09:50'));
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(async () => (await caches.keys()).length), { timeout: 15000 }).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 15000 }).toBe(true);
    const shell = await page.evaluate(async () => { for (const k of await caches.keys()) if (!k.includes('fonts')) return (await (await caches.open(k)).keys()).length; return 0; });
    expect(shell).toBe(23);
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('article.now')).toHaveCount(1);
    await expect(page.locator('.bar .off')).toHaveText('Offline');
    await page.goto('/#sos');
    await expect(page.locator('.tiles .tile')).toHaveCount(4);
    expect(errors.filter(e => !/ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(e))).toEqual([]);
  });
});

for (const width of [320, 390, 820]) {
  test(`every screen fits at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 800 }, isMobile: width < 600, hasTouch: true, serviceWorkers: 'block' });
    await prepare(context);
    const page = await context.newPage();
    const errors = trackErrors(page);
    for (const [i, tab] of ['today', 'days', 'kit', 'sos'].entries()) {
      await page.goto(at(`2026-10-0${6 + i}T10:3${i}`, tab));
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, `${tab} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
    }
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => window.__csp)).toEqual([]);
    await context.close();
  });
}
