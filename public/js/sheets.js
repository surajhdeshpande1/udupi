/* Udupi Coast Trip app, part 4: sheets, toast, bloom, stamp, backup. Everything runs on IST. */
'use strict';

/* ---------- sheet ---------- */
let lastFocus = null, closeTimer = 0;
const setInert = on => ['.bar', '#main', '.nav'].forEach(s => { const el = $(s); if (el) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } });
function openSheet(html, meta) {
  const wrap = $('#sheet'), sh = $('.sheet', wrap);
  const again = !!ui.sheet;
  $('#sheetBody').innerHTML = html;
  if (!again) { lastFocus = document.activeElement; sh.scrollTop = 0; }
  ui.sheet = meta || {};
  clearTimeout(closeTimer);
  wrap.hidden = false;
  wrap.classList.remove('closing');
  sh.setAttribute('aria-label', (meta && meta.label) || 'Details');
  document.documentElement.classList.add('lock');
  setInert(true);
  if (!again) requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('open')));
  if (!again || (meta && meta.focus)) setTimeout(() => { const f = (meta && meta.focus && $(meta.focus, wrap)) || $('#sheetBody [autofocus]') || $('#sheetBody .sh-title'); if (f) f.focus({ preventScroll: true }); }, again ? 0 : 90);
}
function closeSheet() {
  const wrap = $('#sheet');
  if (wrap.hidden || !ui.sheet) return;
  const sh = $('.sheet', wrap);
  ui.sheet = null;
  wrap.classList.remove('open');
  wrap.classList.add('closing');
  sh.style.transform = '';
  document.documentElement.classList.remove('lock');
  setInert(false);
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => { if (!wrap.classList.contains('open')) { wrap.hidden = true; wrap.classList.remove('closing'); $('#sheetBody').innerHTML = ''; } }, 380);
  if (ui.needsRender) { ui.needsRender = false; render(); }
  if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
}

function detailSheet(id, focus) {
  const it = findItem(id);
  if (!it) return;
  const day = DAY[it.day];
  const t = now();
  const done = !!state.done[it.id], sk = skipped(it);
  const K = KINDS[it.k] || KINDS.prep;
  const chips = ['<span class="chip">' + ico('clock') + esc(day.short + ' ' + it.t + (it.dur ? ' – ' + hmAdd(it.t, it.dur) : '')) + '</span>'];
  if (it.hard) { const diff = it.ts - t; chips.push('<span class="chip red">' + (done ? 'Made it' : diff > 0 ? 'Deadline · in ' + dur(diff) : diff > -10 * 60000 ? 'Deadline · now' : 'Deadline passed') + '</span>'); }
  if (it.star) chips.push('<span class="chip gold">' + ico('star') + 'Iconic</span>');
  if (it.c && (it.c[0] || it.c[1])) chips.push('<span class="chip">' + ico('wallet') + esc(costStr(it.c)) + '</span>');
  if (golden(it, day)) chips.push('<span class="chip gold">' + ico('sun') + 'Golden hour</span>');
  if (it.win) chips.push('<span class="chip sea">' + ico('clock') + esc(it.win) + '</span>');
  let h = VG.pic(it, 'hero', 'draw') + '<p class="eyebrow">' + esc(K.label + ' · ' + day.tab + (done ? ' · Done' : sk ? ' · Skipped' : '')) + '</p><h2 class="sh-title" tabindex="-1">' + esc(it.x) + '</h2>' + (it.kn ? '<p class="sh-kn" lang="kn">' + esc(it.kn) + '</p>' : '');
  h += '<div class="sh-body"><div class="facts">' + chips.join('') + '</div>';
  if (it.b) h += '<p>' + esc(it.b) + '</p>';
  if (it.tips && it.tips.length) h += '<ul class="tips">' + it.tips.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
  if (shotsOf(it).length) h += '<div class="shots-box"><span class="label">Where to shoot' + (golden(it, day) ? ' · golden hour' : '') + '</span>' + shotList(it) + '</div>';
  if (!it.info) h += paidBox(it);
  if (!it.info) {
    h += '<div class="sh-acts">';
    if (it.q) h += '<a class="btn primary wide" href="' + esc(mapsUrl(it.q, it.m)) + '" target="_blank" rel="noopener">' + ico('pin') + 'Directions' + (it.m === 'w' ? ' · walk' : '') + '</a>';
    h += '<button class="btn' + (it.q || done ? '' : ' primary') + (it.q ? '' : ' wide') + '" type="button" data-act="toggle" data-id="' + esc(it.id) + '" data-from="sheet">' + ico(done ? 'undo' : 'check') + (done ? 'Undo done' : 'Mark done') + '</button>';
    if (it.q) h += '<button class="btn" type="button" data-act="edit" data-id="' + esc(it.id) + '">' + ico('edit') + 'Edit</button>';
    h += '<button class="btn' + (it.q ? ' wide' : '') + '" type="button" data-act="skip" data-id="' + esc(it.id) + '">' + ico(sk ? 'undo' : 'skip') + (sk ? 'Restore this stop' : 'Skip this stop') + '</button>';
    if (!it.q) h += '<button class="btn" type="button" data-act="edit" data-id="' + esc(it.id) + '">' + ico('edit') + 'Edit</button>';
    h += '</div>';
  }
  h += '</div>';
  openSheet(h, { kind: 'detail', id: it.id, label: it.x, focus: focus });
}
/* What you actually paid at a stop. Quick picks come from the plan's own estimate. */
function paidBox(it) {
  const v = state.spent[it.id];
  const picks = [];
  if (it.c) { [it.c[0], Math.round((it.c[0] + it.c[1]) / 20) * 10, it.c[1]].forEach(n => { if (n > 0 && !picks.includes(n)) picks.push(n); }); }
  return '<div class="paid-box"><span class="label">Paid here</span><div class="paid-row"><label class="paid-in"><span>₹</span><input type="number" inputmode="numeric" min="0" step="10" data-paid="' + esc(it.id) + '" value="' + (v != null ? v : '') + '" placeholder="' + (it.c && it.c[1] ? esc(String(it.c[0])) : '0') + '" aria-label="Amount paid at ' + esc(it.x) + '" enterkeyhint="done"></label>' +
    (v != null ? '<button class="btn sm" type="button" data-act="paid" data-id="' + esc(it.id) + '" data-v="">Clear</button>' : '') + '</div>' +
    (picks.length ? '<div class="paid-quick">' + picks.map(n => '<button class="chip" type="button" data-act="paid" data-id="' + esc(it.id) + '" data-v="' + n + '">' + inr(n) + '</button>').join('') + '</div>' : '') +
    '<p class="note">Logged amounts add up on the SOS tab against the plan.</p></div>';
}
function setPaid(id, raw, rerender) {
  const s = String(raw == null ? '' : raw).trim();
  const n = s === '' ? undefined : money(Math.round(Number(s)));
  if (n === undefined) delete state.spent[id]; else state.spent[id] = n;
  saveSoon();
  ui.needsRender = true;
  if (rerender && ui.sheet && ui.sheet.id === id) detailSheet(id, '[data-paid]');
}

/* ---------- help: what every circle, colour and tap means ---------- */
const LEGEND = ['temple', 'culture', 'coast', 'nature', 'adventure', 'explore', 'boat', 'photo', 'food', 'night', 'move', 'bus', 'train', 'rest'];
const lgNode = (g, icon, extra) => '<span class="lg-node ' + g + (extra ? ' ' + extra : '') + '" aria-hidden="true"><span class="dot">' + ico(icon) + '</span></span>';
function helpSheet() {
  const mark = (art, k, v) => '<li>' + art + '<span><b>' + k + '</b>' + v + '</span></li>';
  let h = '<p class="eyebrow">Guide</p><h2 class="sh-title" tabindex="-1">How this app works</h2><div class="sh-body hp">' +
    '<p><b>Today</b> runs the day you are in, <b>Days</b> shows any day of the trip, <b>Kit</b> is your packing list, and <b>SOS</b> keeps emergency numbers, bookings, train times and backup.</p>' +
    '<h3 class="hp-h">What the circles mean</h3><ul class="legend">' + LEGEND.map(k => '<li>' + lgNode('g-' + KINDS[k].g, KINDS[k].icon) + '<span>' + esc(KINDS[k].label) + '</span></li>').join('') + '</ul>' +
    '<h3 class="hp-h">Marks and colours</h3><ul class="marks">' +
    mark(lgNode('g-hard', 'clock', 'hard'), 'Red circle', 'A hard deadline: a boat, bus or train that will not wait.') +
    mark('<span class="mk mk-now" aria-hidden="true"></span>', 'Gold row', 'The stop you are at right now.') +
    mark('<span class="mk mk-ico gold" aria-hidden="true">' + ico('star') + '</span>', 'Iconic', 'One of the best moments of the trip.') +
    mark('<span class="mk mk-ico sea" aria-hidden="true">' + ico('camera') + '</span>', 'Where to shoot', 'Unfolds under a stop: where to stand and how to frame each photo.') +
    mark('<span class="mk mk-ico gold" aria-hidden="true">' + ico('sun') + '</span>', 'Golden hour', 'The soft light just after sunrise and before sunset.') + '</ul>' +
    '<h3 class="hp-h">Taps</h3><ul class="tips">' +
    '<li>Tap a circle to mark a stop done, and tap it again to undo.</li>' +
    '<li>Tap a stop for its story, opening hours, tips, Directions, Edit and Skip.</li>' +
    '<li>If plans change has the backup for rain, rough sea or a late train. Days with a Plan B have a switch above the timeline.</li>' +
    '<li>Add a stop, at the end of any day, puts your own plans on the timeline.</li></ul>' +
    '<h3 class="hp-h">Offline and private</h3><p>Open the app once with signal and it works with none. Ticks, notes and bookings stay on this phone, and Backup in SOS saves them to a file.</p>' +
    '<div class="sh-acts"><button class="btn wide" type="button" data-act="guide" data-step="0">' + ico('compass') + 'Show the tour again</button></div></div>';
  openSheet(h, { kind: 'help', label: 'How this app works' });
}

/* ---------- first-run tour: three cards, then out of the way ---------- */
const GUIDE = [
  { t: 'Today runs the trip', b: 'The top card shows where to be now, what comes next and the next deadline, with a countdown. Directions opens Google Maps.',
    art: () => '<div class="gd-now"><span class="tag live"><i></i>Now</span><b>Kaup beach sunset</b><span class="gd-btns"><span class="gd-btn">' + ico('pin') + 'Directions</span><span class="gd-btn p">' + ico('check') + 'Mark done</span></span></div>' },
  { t: 'Tick stops as you go', b: 'Tap the circle when a stop is done, and the day’s garland fills with marigolds. Tap the stop itself for its story, timings, tips and the best photo spots.',
    art: () => '<div class="gd-row"><span class="gd-time">17:30</span>' + lgNode('g-sea', 'check', 'done') + '<span class="gd-t"><b>Kaup beach sunset</b><span>' + ico('camera') + 'Where to shoot</span></span></div>' },
  { t: 'Ready when plans change', b: 'Rain, rough sea or a late train? If plans change has the backup for every day, and some days carry a Plan B. Everything works offline, and your ticks stay on this phone.',
    art: () => '<div class="gd-seg"><span class="on">Plan A</span><span>Plan B · Boats off</span></div>' }
];
function guideSheet(i) {
  const n = GUIDE.length;
  i = Math.max(0, Math.min(n - 1, i || 0));
  const s = GUIDE[i];
  const h = '<div class="gd"><div class="gd-art" aria-hidden="true">' + s.art() + '</div>' +
    '<p class="eyebrow">Welcome · ' + (i + 1) + ' of ' + n + '</p><h2 class="sh-title" tabindex="-1">' + esc(s.t) + '</h2><p class="gd-b">' + esc(s.b) + '</p>' +
    '<div class="gd-dots" aria-hidden="true">' + GUIDE.map((x, k) => '<i' + (k === i ? ' class="on"' : '') + '></i>').join('') + '</div>' +
    '<div class="sh-acts">' + (i < n - 1
      ? '<button class="btn" type="button" data-act="guide-done">Skip</button><button class="btn primary" type="button" data-act="guide" data-step="' + (i + 1) + '">Next</button>'
      : '<button class="btn primary wide" type="button" data-act="guide-done">Start the trip</button>') + '</div></div>';
  openSheet(h, { kind: 'guide', label: 'Welcome tour', focus: '.sh-title' });
}

function rulesSheet(dayId) {
  const day = DAY[dayId];
  if (!day) return;
  let h = '<p class="eyebrow">' + esc(day.tab + ' · ' + day.name) + '</p><h2 class="sh-title" tabindex="-1">If plans change</h2><div class="sh-body">';
  if (day.variants) h += '<p>' + esc(day.variants.B.note) + '</p>';
  h += '<ul class="tips">' + (day.planB || []).map(r => '<li>' + esc(r) + '</li>').join('') + '</ul>';
  if (day.variants) {
    const onB = (state.variant[day.id] || 'A') === 'B';
    h += '<div class="sh-acts"><button class="btn wide' + (onB ? '' : ' primary') + '" type="button" data-act="variant" data-from="sheet" data-day="' + day.id + '" data-v="' + (onB ? 'A' : 'B') + '">' + (onB ? 'Back to Plan A' : 'Switch ' + esc(day.short) + ' to Plan B · ' + esc(day.variants.B.label)) + '</button></div>';
  }
  openSheet(h + '</div>', { kind: 'rules', label: 'If plans change' });
}

function defaultTime(dayId) {
  const day = DAY[dayId], p = ist(now());
  if (day && p.date === day.date) { const m = Math.min(23 * 60 + 55, Math.ceil((p.h * 60 + p.m + 15) / 5) * 5); return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  return '12:00';
}
function editSheet(id, dayId) {
  const it = id ? findItem(id) : null;
  if (id && !it) return;
  const kinds = CUSTOM_KINDS.slice();
  if (it && !kinds.includes(it.k)) kinds.unshift(it.k);
  const dSel = it ? it.day : DAY[dayId] ? dayId : ui.day || dayOf(now()).id;
  const one = it && it.c && it.c[0] === it.c[1] && it.c[0] ? it.c[0] : '';
  const hint = it && it.c && it.c[0] !== it.c[1] ? 'Now ' + costStr(it.c) : '0';
  let extra = '';
  if (it && !it.builtIn) extra = '<button class="btn danger sm" type="button" data-act="del-stop" data-id="' + esc(it.id) + '">Delete stop</button>';
  else if (it && it.edited) extra = '<button class="btn danger sm" type="button" data-act="reset-stop" data-id="' + esc(it.id) + '">Reset to original</button>';
  const opt = (v, l, on) => '<option value="' + esc(v) + '"' + (on ? ' selected' : '') + '>' + esc(l) + '</option>';
  const h = '<p class="eyebrow">' + (it ? 'Edit stop' : 'New stop') + '</p><h2 class="sh-title" tabindex="-1">' + (it ? esc(it.x) : 'Add a stop') + '</h2>' +
    '<form class="sh-form" id="editForm" novalidate data-id="' + esc(it ? it.id : '') + '">' +
    '<div class="two"><div class="field"><label for="f-day">Day</label><select id="f-day"' + (it && it.builtIn ? ' disabled' : '') + '>' + DAYS.map(d => opt(d.id, d.tab, d.id === dSel)).join('') + '</select></div>' +
    '<div class="field"><label for="f-time">Time</label><input id="f-time" type="time" value="' + esc(it ? it.t : defaultTime(dSel)) + '" required></div></div>' +
    '<div class="field"><label for="f-title">What</label><input id="f-title" type="text" maxlength="90" value="' + esc(it ? it.x : '') + '" placeholder="e.g. Tender coconut at Malpe" autocomplete="off"' + (it ? '' : ' autofocus') + '></div>' +
    '<div class="two"><div class="field"><label for="f-kind">Type</label><select id="f-kind">' + kinds.map(k => opt(k, (KINDS[k] || KINDS.prep).label, (it ? it.k : 'coast') === k)).join('') + '</select></div>' +
    '<div class="field"><label for="f-cost">Cost (₹)</label><input id="f-cost" type="number" min="0" step="10" inputmode="numeric" value="' + esc(String(one)) + '" placeholder="' + esc(hint) + '"></div></div>' +
    '<div class="field"><label for="f-place">Place for Google Maps</label><input id="f-place" type="text" maxlength="120" value="' + esc(it ? it.q || '' : '') + '" placeholder="e.g. Malpe Beach, Udupi" autocomplete="off"></div>' +
    '<div class="field"><label for="f-note">Notes</label><textarea id="f-note" maxlength="700">' + esc(it ? it.b || '' : '') + '</textarea></div>' +
    '<label class="toggle"><input id="f-hard" type="checkbox"' + (it && it.hard ? ' checked' : '') + '> Hard deadline, with a countdown</label>' +
    '<p class="err" id="f-err" role="alert" hidden></p>' +
    '<div class="sh-foot"><div>' + extra + '</div><div><button class="btn sm" type="button" data-act="close">Cancel</button><button class="btn primary sm" type="submit">' + (it ? 'Save' : 'Add stop') + '</button></div></div></form>';
  openSheet(h, { kind: 'edit', id: it ? it.id : null, label: it ? 'Edit stop' : 'Add a stop' });
}
function saveEdit(form) {
  const err = $('#f-err');
  const fail = (msg, el) => { err.textContent = msg; err.hidden = false; el.focus(); };
  const t = $('#f-time').value, x = $('#f-title').value.trim();
  if (!HM.test(t)) return fail('Pick a time for this stop.', $('#f-time'));
  if (!x) return fail('Give the stop a name.', $('#f-title'));
  const k = KINDS[$('#f-kind').value] ? $('#f-kind').value : 'prep';
  const q = $('#f-place').value.trim().slice(0, 120), b = $('#f-note').value.trim().slice(0, 700), hard = $('#f-hard').checked ? 1 : 0;
  const raw = $('#f-cost').value.trim();
  const cost = raw === '' ? null : money(Math.round(Number(raw) || 0));
  const id = form.dataset.id;
  let dayId = $('#f-day').value;
  if (!id) {
    const nid = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    state.custom.push({ id: nid, day: DAY[dayId] ? dayId : DAYS[0].id, t, k, x: x.slice(0, 90), q, b, hard, c: cost != null ? [cost, cost] : null });
  } else {
    const it = findItem(id);
    if (!it) { closeSheet(); return; }
    if (!it.builtIn) {
      const c = state.custom.find(z => z.id === id);
      Object.assign(c, { day: DAY[dayId] ? dayId : c.day, t, k, x: x.slice(0, 90), q, b, hard });
      if (cost != null) c.c = [cost, cost];
    } else {
      dayId = it.day;
      const ed = Object.assign({}, state.edits[id] || {}, { t, k, x: x.slice(0, 90), q, b, hard });
      if (cost != null) ed.c = [cost, cost];
      state.edits[id] = ed;
    }
  }
  if (ui.tab === 'days') ui.day = dayId;
  syncSeals();
  save();
  ui.needsRender = false;
  closeSheet();
  render();
  toast(id ? 'Saved' : 'Stop added to ' + dayShort(dayId));
}

/* ---------- toast and the two-tap confirm ---------- */
let toastTimer = 0;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('show'); setTimeout(() => { if (!el.classList.contains('show')) el.hidden = true; }, 300); }, 1900);
}
function arm(btn, label, fn) {
  if (btn.dataset.armed === '1') { btn.dataset.armed = ''; fn(); return; }
  const old = btn.innerHTML;
  btn.dataset.armed = '1';
  btn.textContent = label;
  setTimeout(() => { if (btn.isConnected && btn.dataset.armed === '1') { btn.dataset.armed = ''; btn.innerHTML = old; } }, 3500);
}
const buzz = p => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} };

/* ---------- marigold bloom when a stop is done ---------- */
const BLOOM = (() => {
  let fly = '';
  for (let i = 0; i < 8; i++) fly += '<ellipse class="fly" rx="2.4" ry="4.2" style="--a:' + (i * 45 + 22) + 'deg"/>';
  return '<svg class="bloom" viewBox="-44 -44 88 88" aria-hidden="true"><circle class="burst" r="15"/>' + fly + '<g class="fl-g">' + ART.marigold(14) + '</g></svg>';
})();
function bloom(id) {
  if (REDUCED) return;
  const row = document.getElementById('r-' + id);
  const node = row && $('.r-node', row);
  if (node) {
    row.classList.add('blooming');
    node.insertAdjacentHTML('beforeend', BLOOM);
    setTimeout(() => { row.classList.remove('blooming'); const b = $('.bloom', node); if (b) b.remove(); }, 1000);
  }
  const bead = $$('.bead').find(b => b.getAttribute('data-b') === id);
  if (bead) bead.classList.add('pop');
}

/* ---------- the stamp: a day is sealed when every stop on it is done ---------- */
function showStamp(dayId) {
  const d = DAY[dayId];
  if (!d || $('.stamp-wrap')) return;
  const n = sealCount();
  const el = document.createElement('div');
  el.className = 'stamp-wrap';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'st-title');
  el.innerHTML = '<div class="st-scrim" data-act="stamp-close"></div><div class="st-card"><div class="st-medal">' + ART.medal(d.id, 'big') + '<span class="st-ink"></span></div>' +
    '<p class="eyebrow">' + esc(d.tab) + ' · stamped</p><h2 class="st-title" id="st-title" tabindex="-1">' + esc(d.name) + '</h2>' +
    '<p class="st-sub">' + (n === DAYS.length ? 'Every day of the trip is stamped. The seal is whole.' : 'Every stop on ' + esc(d.tab) + ' is done. ' + n + ' of ' + DAYS.length + ' days stamped.') + '</p>' +
    sealRow('st-seal', 'stp', d.id) + '<button class="btn primary" type="button" data-act="stamp-close" style="width:100%">Keep going</button></div>';
  document.body.appendChild(el);
  setInert(true);
  buzz([18, 60, 30]);
  setTimeout(() => { const f = $('#st-title'); if (f) f.focus({ preventScroll: true }); }, 60);
}
function closeStamp() {
  const el = $('.stamp-wrap');
  if (!el || el.classList.contains('closing-st')) return;
  el.classList.add('closing-st');
  setTimeout(() => { el.remove(); if (!ui.sheet) setInert(false); }, REDUCED ? 0 : 300);
}

/* ---------- backup: everything on this phone to a file, and back ---------- */
function backup() {
  const p = ist(now());
  const data = JSON.stringify({ app: 'udupi-coast-trip', v: 1, saved: new Date().toISOString(), state: state }, null, 1);
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'udupi-trip-' + p.date + '-' + p.hm.replace(':', '') + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast('Saved to your downloads');
}
function readBackup(file) {
  if (!file) return;
  if (file.size > 600000) { toast('That file is too large to be a trip backup'); return; }
  const r = new FileReader();
  r.onload = () => {
    let raw;
    try { raw = JSON.parse(String(r.result)); } catch (e) { toast('That file isn’t a trip backup'); return; }
    const s = raw && raw.app === 'udupi-coast-trip' && raw.state ? raw.state : raw;
    if (!s || s.v !== 1) { toast('That file isn’t a trip backup'); return; }
    const c = clean(s);
    const n = Object.keys(c.done).length, own = c.custom.length, paid = Object.values(c.spent).reduce((a, b) => a + b, 0);
    const at = raw.saved ? new Date(raw.saved) : null;
    ui.pending = { data: c, title: 'Backup' + (at && !isNaN(at) ? ' from ' + Number(ist(at.getTime()).date.slice(8)) + ' Oct, ' + ist(at.getTime()).hm : ''), summary: n + ' stops ticked, ' + own + ' of your own, ' + Object.keys(c.pack).length + ' packed' + (paid ? ', ' + inr(paid) + ' logged' : '') + '. It replaces what is on this phone now.' };
    render();
    const box = $('.bk-confirm');
    if (box) box.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
  };
  r.onerror = () => toast('Couldn’t read that file');
  r.readAsText(file);
}

/* ---------- a fresh version arrived while the app was open ---------- */
function showUpdate() {
  if ($('.update')) return;
  const el = document.createElement('div');
  el.className = 'update';
  el.setAttribute('role', 'status');
  el.innerHTML = '<span>A fresh version of the app is ready.</span><button class="btn gold sm" type="button" data-act="reload">Reload</button>';
  document.body.appendChild(el);
}
