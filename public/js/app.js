/* Udupi Coast Trip app, part 5: taps, typing, gestures, clock and start-up. */
'use strict';

/* ---------- marking stops ---------- */
function toggleDone(id, fromSheet) {
  const it = findItem(id);
  if (!it || it.info) return;
  const was = !!state.done[id];
  if (was) delete state.done[id]; else state.done[id] = Date.now();
  const got = syncSeals(it.day);
  save();
  if (!was) buzz(10);
  if (fromSheet && ui.sheet && ui.sheet.kind === 'detail') { ui.needsRender = true; closeSheet(); }
  else render();
  if (!was) requestAnimationFrame(() => bloom(id));
  if (got) setTimeout(() => showStamp(got), REDUCED ? 0 : 650);
  else if (!was) toast('Done · ' + it.x);
}
function toggleSkip(id) {
  const it = findItem(id);
  if (!it) return;
  if (state.skip[id]) delete state.skip[id]; else state.skip[id] = 1;
  const got = syncSeals(it.day);
  save();
  ui.needsRender = false;
  closeSheet();
  render();
  toast(state.skip[id] ? 'Skipped · ' + it.x : 'Back on the plan');
  if (got) setTimeout(() => showStamp(got), REDUCED ? 0 : 500);
}

/* ---------- taps ---------- */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act],[data-tab]');
  if (!a) return;
  if (a.dataset.tab && !a.dataset.act) { e.preventDefault(); if (ui.sheet) closeSheet(); setTab(a.dataset.tab); return; }
  const act = a.dataset.act, id = a.dataset.id;
  switch (act) {
    case 'toggle': toggleDone(id, a.dataset.from === 'sheet'); break;
    case 'open': detailSheet(id); break;
    case 'rules': rulesSheet(a.dataset.day); break;
    case 'add': editSheet(null, a.dataset.day); break;
    case 'edit': editSheet(id); break;
    case 'skip': toggleSkip(id); break;
    case 'variant': {
      const day = a.dataset.day;
      state.variant[day] = a.dataset.v === 'B' ? 'B' : 'A';
      syncSeals();
      if (a.dataset.from === 'sheet') { save(); ui.needsRender = false; closeSheet(); render(); toast(dayShort(day) + ' is on Plan ' + state.variant[day]); }
      else commit();
      break;
    }
    case 'earlier': ui.earlier = !ui.earlier; render(); break;
    case 'day': if (ui.day !== a.dataset.day) { ui.day = a.dataset.day; ui.earlier = false; render('day'); } break;
    case 'kitview': if (ui.kit !== a.dataset.v) { ui.kit = a.dataset.v; render('view'); } break;
    case 'kit-del': state.packCustom = state.packCustom.filter(p => p.id !== id); delete state.pack[id]; commit(); toast('Removed from Kit'); break;
    case 'mood': {
      const d = a.dataset.day, j = Object.assign({}, state.journal[d]);
      if (j.mood === a.dataset.v) delete j.mood; else j.mood = a.dataset.v;
      if (j.mood || j.note) state.journal[d] = j; else delete state.journal[d];
      save();
      $$('.mood', a.parentNode).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === j.mood)));
      if (j.mood) buzz(6);
      break;
    }
    case 'paid': setPaid(id, a.dataset.v, true); break;
    case 'backup': backup(); break;
    case 'restore': { const f = $('#restoreFile'); if (f) { f.value = ''; f.click(); } break; }
    case 'restore-yes':
      if (ui.pending) { state = ui.pending.data; ui.pending = null; syncSeals(); save(); render(); toast('Backup loaded'); }
      break;
    case 'restore-no': ui.pending = null; render(); break;
    case 'reset': arm(a, 'Tap again to clear', () => { state.done = {}; state.shots = {}; state.pack = {}; state.sealed = {}; commit(); toast('Ticks cleared'); }); break;
    case 'del-stop': arm(a, 'Tap again to delete', () => { state.custom = state.custom.filter(c => c.id !== id); delete state.done[id]; delete state.skip[id]; delete state.spent[id]; syncSeals(); save(); ui.needsRender = false; closeSheet(); render(); toast('Stop deleted'); }); break;
    case 'reset-stop': arm(a, 'Tap again to reset', () => { delete state.edits[id]; save(); ui.needsRender = false; closeSheet(); render(); toast('Back to the original'); }); break;
    case 'close': closeSheet(); break;
    case 'stamp-close': closeStamp(); break;
    case 'install':
      if (deferredPrompt) { const p = deferredPrompt; p.prompt(); p.userChoice.finally(() => { deferredPrompt = null; renderBar(); if (ui.tab === 'sos') render(); }); }
      break;
    case 'reload': location.reload(); break;
  }
});

/* ---------- ticks, typing and forms ---------- */
function kitCounts() {
  const items = kitItems();
  const pd = items.filter(i => state.pack[i.id]).length;
  const [sd, sn] = shotCount();
  const segs = $$('.kitseg .n');
  if (segs[0]) segs[0].textContent = pd + '/' + items.length;
  if (segs[1]) segs[1].textContent = sd + '/' + sn;
  const ks = $('.ksum');
  if (!ks) return;
  const shots = ui.kit === 'shots';
  const [d, n] = shots ? [sd, sn] : [pd, items.length];
  const pr = $('.ring .pr', ks);
  if (pr) { pr.setAttribute('stroke-dashoffset', (C26 * (1 - (n ? d / n : 0))).toFixed(1)); pr.setAttribute('opacity', d ? 1 : 0); }
  const num = $('.ring-wrap span', ks);
  if (num) num.textContent = d;
  const [t1, t2] = kitLine(shots ? 'shots' : 'pack', d, n);
  const b = $('.ksum-t b', ks), s = $('.ksum-t span', ks);
  if (b) b.textContent = t1;
  if (s) s.textContent = t2;
}
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.shot) { if (t.checked) state.shots[t.dataset.shot] = 1; else delete state.shots[t.dataset.shot]; save(); kitCounts(); if (t.checked) buzz(6); }
  else if (t.dataset.pack) { if (t.checked) state.pack[t.dataset.pack] = 1; else delete state.pack[t.dataset.pack]; save(); kitCounts(); if (t.checked) buzz(6); }
  else if (t.id === 'restoreFile') readBackup(t.files && t.files[0]);
  else if (t.dataset.paid) setPaid(t.dataset.paid, t.value, false);
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.sos) { const v = t.value.slice(0, 200); if (v) state.sos[t.dataset.sos] = v; else delete state.sos[t.dataset.sos]; saveSoon(); }
  else if (t.dataset.jr) {
    const d = t.dataset.jr, j = Object.assign({}, state.journal[d]);
    const v = t.value.slice(0, 140);
    if (v.trim()) j.note = v; else delete j.note;
    if (j.mood || j.note) state.journal[d] = j; else delete state.journal[d];
    saveSoon();
  } else if (t.dataset.paid) setPaid(t.dataset.paid, t.value, false);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($('.stamp-wrap')) closeStamp(); else if (ui.sheet) closeSheet(); }
  else if (e.key === 'Enter' && e.target.dataset && (e.target.dataset.jr || e.target.dataset.paid)) e.target.blur();
});
document.addEventListener('submit', e => {
  if (e.target.id === 'editForm') { e.preventDefault(); saveEdit(e.target); }
  else if (e.target.id === 'kitadd') {
    e.preventDefault();
    const inp = $('#kit-label'), label = inp.value.trim();
    if (!label) { inp.focus(); return; }
    state.packCustom.push({ id: 'pc' + Date.now().toString(36), cat: $('#kit-cat').value, label: label.slice(0, 80) });
    commit();
    const again = $('#kit-label');
    if (again) again.focus({ preventScroll: true });
    toast('Added to Kit');
  }
});
document.addEventListener('toggle', e => { const d = e.target; if (d.dataset && d.dataset.acc) ui.open[d.dataset.acc] = d.open; }, true);
window.addEventListener('pagehide', save);
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (TABS.includes(h) && h !== ui.tab) { if (ui.sheet) closeSheet(); setTab(h); } });

/* ---------- gestures: pull the sheet down to close it; swipe days sideways ---------- */
(() => {
  const sheet = $('#sheet .sheet'), grab = $('#sheet .grab');
  let y0 = null, dy = 0, t0 = 0;
  grab.addEventListener('pointerdown', e => { y0 = e.clientY; dy = 0; t0 = e.timeStamp; sheet.style.transition = 'none'; try { grab.setPointerCapture(e.pointerId); } catch (x) {} });
  grab.addEventListener('pointermove', e => { if (y0 == null) return; const d = e.clientY - y0; dy = d > 0 ? d : -Math.sqrt(-d) * 2; sheet.style.transform = 'translateY(' + dy + 'px)'; });
  const end = e => {
    if (y0 == null) return;
    y0 = null;
    sheet.style.transition = '';
    const fast = dy > 30 && dy / Math.max(1, e.timeStamp - t0) > 0.6;
    if (dy > 110 || fast) closeSheet(); else sheet.style.transform = '';
  };
  grab.addEventListener('pointerup', end);
  grab.addEventListener('pointercancel', end);
  grab.addEventListener('click', () => { if (Math.abs(dy) < 4) closeSheet(); });
})();
(() => {
  let sx = null, sy = 0;
  const main = $('#main');
  main.addEventListener('touchstart', e => {
    if (ui.tab !== 'days' || e.touches.length !== 1 || e.target.closest('.tt,input,textarea,select,.strip')) { sx = null; return; }
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  main.addEventListener('touchend', e => {
    if (sx == null) return;
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    sx = null;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
    const i = DAYS.findIndex(d => d.id === ui.day), j = i + (dx < 0 ? 1 : -1);
    if (j < 0 || j >= DAYS.length) return;
    ui.day = DAYS[j].id;
    ui.earlier = false;
    render('day');
    buzz(6);
  }, { passive: true });
})();

/* ---------- clock ---------- */
function tick() {
  const m = Math.floor(now() / 60000);
  if (m === ui.minute) return;
  const a = document.activeElement;
  const typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== 'checkbox';
  if (!ui.sheet && !typing && !$('.stamp-wrap') && (ui.tab === 'today' || ui.tab === 'days')) render();
  else renderBar();
}
setInterval(tick, 15000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); else save(); });
window.addEventListener('online', renderBar);
window.addEventListener('offline', renderBar);
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; renderBar(); });
window.addEventListener('appinstalled', () => { deferredPrompt = null; renderBar(); toast('Installed on your phone'); });

/* ---------- start ---------- */
(() => {
  const h0 = (location.hash || '').slice(1);
  ui.tab = TABS.includes(h0) ? h0 : 'today';
  ui.day = dayOf(now()).id;
  syncSeals();
  let seen = true;
  try { seen = sessionStorage.getItem('udupi.intro') === '1'; sessionStorage.setItem('udupi.intro', '1'); } catch (e) {}
  const root = document.documentElement;
  if (!seen && !REDUCED) {
    root.classList.add('intro-on');
    ui.intro = true;
    setTimeout(() => root.classList.remove('intro-on'), 1500);
  }
  render('tab');
  root.classList.add('ready');
})();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const sw = navigator.serviceWorker;
    const had = !!sw.controller;
    sw.register('/sw.js').then(reg => {
      if (!had) reg.addEventListener('updatefound', () => { const w = reg.installing; if (w) w.addEventListener('statechange', () => { if (w.state === 'activated') toast('Ready to work offline'); }); });
    }).catch(() => {});
    sw.addEventListener('message', e => { if (e.data && e.data.v && e.data.v !== APP_V) showUpdate(); });
    sw.addEventListener('controllerchange', () => { if (had && sw.controller) sw.controller.postMessage('v'); });
  });
}
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
