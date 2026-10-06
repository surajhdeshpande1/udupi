// Shared set-up for the specs: no network fonts, the intro skipped unless asked for,
// and every CSP violation recorded on window.__csp.
export async function prepare(context, { intro = false } = {}) {
  await context.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await context.addInitScript(skipIntro => {
    try { if (skipIntro) sessionStorage.setItem('udupi.intro', '1'); } catch (e) { /* storage blocked */ }
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', e => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI));
  }, !intro);
}

export function trackErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

// The app reads ?t=YYYY-MM-DDTHH:MM as "now" in IST, so every test can stand anywhere in the trip.
export const at = (time, tab = 'today') => `/?t=${time}#${tab}`;
export const stored = page => page.evaluate(() => JSON.parse(localStorage.getItem('udupi.app.v1') || '{}'));
export const live = page => page.evaluate(() => state);
export const sheetOpen = page => page.evaluate(() => {
  const s = document.getElementById('sheet');
  return !s.hidden && s.classList.contains('open');
});
export async function openStop(page, id) {
  await page.click(`#r-${id} .r-body`);
  await page.waitForTimeout(450);
}
export async function closeSheet(page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);
}
