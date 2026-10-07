/* Udupi Coast Trip app, part 1: time, icons, state, plan. Everything runs on IST. */
'use strict';
const APP_V = 'udupi-kaavi-8';
const DAYS = TRIP.DAYS;
const DAY = Object.fromEntries(DAYS.map(d => [d.id, d]));
const TABS = ['today', 'days', 'kit', 'sos'];

/* ---------- time ---------- */
const IST = 330 * 60000;
const pad = n => String(n).padStart(2, '0');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = n => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');
const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const abs = (date, t) => { const [y, mo, d] = date.split('-').map(Number); const [h, mi] = t.split(':').map(Number); return Date.UTC(y, mo - 1, d, h, mi) - IST; };
const ist = ms => { const d = new Date(ms + IST); return { date: d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()), hm: pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()), h: d.getUTCHours(), m: d.getUTCMinutes() }; };
const OVERRIDE = (() => { const m = /[?&]t=([0-9]{4}-[0-9]{2}-[0-9]{2})T([0-9]{2}):([0-9]{2})/.exec(location.search); return m ? abs(m[1], m[2] + ':' + m[3]) : null; })();
const BOOT = Date.now();
const now = () => (OVERRIDE != null ? OVERRIDE + (Date.now() - BOOT) : Date.now());
const dur = ms => { if (ms <= 30000) return 'now'; const m = Math.ceil(ms / 60000); if (m < 60) return m + 'm'; const h = Math.floor(m / 60); if (h < 24) return h + 'h ' + pad(m % 60) + 'm'; return Math.floor(h / 24) + 'd ' + (h % 24) + 'h'; };
const mins = n => (!n ? '' : n < 60 ? n + ' min' : n % 60 ? Math.floor(n / 60) + ' h ' + (n % 60) + ' min' : n / 60 + ' h');
const costStr = c => (!c ? '' : c[0] === c[1] ? inr(c[0]) : inr(c[0]) + '–' + Number(c[1]).toLocaleString('en-IN'));
const hmAdd = (t, n) => { const x = toMin(t) + n; return pad(Math.floor(x / 60) % 24) + ':' + pad(x % 60); };
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
let REDUCED = false;
try { const mq = matchMedia('(prefers-reduced-motion: reduce)'); REDUCED = mq.matches; if (mq.addEventListener) mq.addEventListener('change', e => { REDUCED = e.matches; }); } catch (e) {}

/* ---------- icons ---------- */
const P = {
  temple: '<path d="M12 2.5v2"/><path d="M9.5 4.5h5l.9 3.5H8.6z"/><path d="M7.5 8h9l1.2 4.5H6.3z"/><path d="M5 12.5h14V21H5z"/><path d="M10 21v-4.5h4V21"/>',
  culture: '<path d="M3 10.5 12 4l9 6.5"/><path d="M5 10v10h14V10"/><path d="M9.5 20v-5.5h5V20"/>',
  wave: '<circle cx="16.5" cy="7" r="2.8"/><path d="M2 14.5c2.5 0 2.5-1.8 5-1.8s2.5 1.8 5 1.8 2.5-1.8 5-1.8 2.5 1.8 5 1.8"/><path d="M2 19c2.5 0 2.5-1.8 5-1.8s2.5 1.8 5 1.8 2.5-1.8 5-1.8 2.5 1.8 5 1.8"/>',
  palm: '<path d="M12.5 21c0-4-.5-7-1.5-10"/><path d="M11 11C9.5 7.5 6.5 6.5 3.5 7.5c3 .5 5 2 6.5 4"/><path d="M11 11c1.5-3.5 5-4.5 8-3.5-3 .5-5 2-6.5 4"/><path d="M11 11c0-3.5-2-6-5-7 2 2 3.5 4.2 3.8 6.6"/>',
  paddle: '<path d="M6 18 18 6"/><path d="M15.5 3.8l4.7 4.7-2.3 2.3-4.7-4.7z"/><path d="M8.5 20.2 3.8 15.5l2.3-2.3 4.7 4.7z"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7l1.4-2.5h4.2L15.5 7"/><circle cx="12" cy="13.5" r="3.4"/>',
  boat: '<path d="M3 15.5h18l-2.6 4.5H5.6z"/><path d="M12 15.5V4l6 8.5h-6"/>',
  leaf: '<path d="M4.5 19.5C4.5 11 10.5 4.5 19.5 4.5c0 9-6.5 15-15 15z"/><path d="M4.5 19.5 14 10"/>',
  auto: '<path d="M4 17v-6a5.5 5.5 0 0 1 5.5-5.5H14l4.5 5.5h1a1 1 0 0 1 1 1v5"/><path d="M4 12.5h16.5"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/><path d="M9.5 17.5h6"/>',
  scooter: '<circle cx="17.8" cy="16.6" r="2.3"/><path d="M4.3 16.6a2.3 2.3 0 0 0 4.6 0"/><path d="M3 16.6v-1.4a3.6 3.6 0 0 1 3.6-3.6h3.2v5h3.4a5.6 5.6 0 0 1 4.6-5.5V6.4A1.9 1.9 0 0 0 15.9 4.5H14.6"/><path d="M5 8.8h4.2"/>',
  bus: '<rect x="4.5" y="3" width="15" height="14.5" rx="3"/><path d="M4.5 10.5h15"/><path d="M8 20.5v-3M16 20.5v-3"/><circle cx="8.3" cy="14" r=".9"/><circle cx="15.7" cy="14" r=".9"/>',
  train: '<rect x="5.5" y="3" width="13" height="14" rx="4"/><path d="M5.5 10h13"/><path d="M9 21l1.8-4M15 21l-1.8-4"/><circle cx="9.2" cy="13.5" r=".9"/><circle cx="14.8" cy="13.5" r=".9"/>',
  night: '<path d="M10 3.5l1.6 4.4 4.4 1.6-4.4 1.6L10 15.5l-1.6-4.4L4 9.5l4.4-1.6z"/><path d="M17.5 13.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>',
  moon: '<path d="M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z"/>',
  list: '<path d="M10 6.5h10M10 12h10M10 17.5h10"/><path d="M3.8 6.5l1.4 1.4 2.4-2.6M3.8 12l1.4 1.4 2.4-2.6M3.8 17.5l1.4 1.4 2.4-2.6"/>',
  check: '<path d="M5.5 12.5l4 4 9-9.5"/>',
  frame: '<path d="M4 9V6a2 2 0 0 1 2-2h3M15 4h3a2 2 0 0 1 2 2v3M20 15v3a2 2 0 0 1-2 2h-3M9 20H6a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="2.6"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.4 8.6l-1.9 4.9-4.9 1.9 1.9-4.9z"/>',
  help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.4a2.4 2.4 0 1 1 3.4 2.2c-.7.3-1.1.9-1.1 1.6v.4"/><circle cx="12" cy="16.6" r=".9" fill="currentColor" stroke="none"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11.5a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/>',
  edit: '<path d="M4.5 19.5h4l10-10-4-4-10 10z"/><path d="M13 7l4 4"/>',
  skip: '<circle cx="12" cy="12" r="8"/><path d="M8.5 12h7"/>',
  undo: '<path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chev: '<path d="M7 10l5 5 5-5"/>',
  right: '<path d="M9.5 6l6 6-6 6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
  sunrise: '<path d="M5 17a7 7 0 0 1 14 0"/><path d="M2.5 20.5h19M12 8V3.5M9.5 6 12 3.5 14.5 6"/>',
  sunset: '<path d="M5 17a7 7 0 0 1 14 0"/><path d="M2.5 20.5h19M12 3.5v4.5M9.5 6 12 8.5 14.5 6"/>',
  star: '<path d="M12 3.8l2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z" fill="currentColor" stroke="none"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16 14.5h2"/>',
  rain: '<path d="M7 14.5h10a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 8 8.8 2.9 2.9 0 0 0 7 14.5z"/><path d="M9 17.5l-1 2.5M13 17.5l-1 2.5M17 17.5l-1 2.5"/>',
  download: '<path d="M12 3.5v11M7.5 10 12 14.5 16.5 10"/><path d="M4.5 19.5h15"/>',
  upload: '<path d="M12 14.5v-11M7.5 8 12 3.5 16.5 8"/><path d="M4.5 19.5h15"/>',
  walk: '<path d="M8.6 13.4c-1.6.2-2.9-1.4-3.1-3.6-.3-2.5.6-4.6 2.2-4.8s3 1.6 3.1 4.1c.1 2.3-.6 4.1-2.2 4.3z"/><path d="M6.3 16.3l4-.5.2 1.6c.1 1.1-.7 2.1-1.9 2.2s-2.1-.6-2.2-1.7z"/><path d="M15.4 10.4c1.6.2 2.9-1.4 3.1-3.6.3-2.5-.6-4.6-2.2-4.8s-3 1.6-3.1 4.1c-.1 2.3.6 4.1 2.2 4.3z"/><path d="M17.7 13.3l-4-.5-.2 1.6c-.1 1.1.7 2.1 1.9 2.2s2.1-.6 2.2-1.7z"/>'
};
const ico = n => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || '') + '</svg>';

const KINDS = {
  temple: { g: 'spirit', label: 'Temple', icon: 'temple' },
  culture: { g: 'spirit', label: 'Heritage', icon: 'culture' },
  coast: { g: 'sea', label: 'Coast', icon: 'wave' },
  nature: { g: 'sea', label: 'Nature', icon: 'palm' },
  explore: { g: 'sea', label: 'Free hour', icon: 'compass' },
  adventure: { g: 'sea', label: 'Adventure', icon: 'paddle' },
  photo: { g: 'sea', label: 'Photo', icon: 'camera' },
  boat: { g: 'sea', label: 'Boat', icon: 'boat' },
  food: { g: 'food', label: 'Food', icon: 'leaf' },
  night: { g: 'night', label: 'Night out', icon: 'night' },
  move: { g: 'ink', label: 'Auto or walk', icon: 'auto' },
  ride: { g: 'ink', label: 'Scooter ride', icon: 'scooter' },
  bus: { g: 'ink', label: 'Bus', icon: 'bus' },
  train: { g: 'ink', label: 'Train', icon: 'train' },
  rest: { g: 'ink', label: 'Rest', icon: 'moon' },
  prep: { g: 'ink', label: 'Prep', icon: 'list' },
  stop: { g: 'ink', label: 'On the way', icon: '' }
};
const CUSTOM_KINDS = ['temple', 'culture', 'coast', 'nature', 'adventure', 'explore', 'photo', 'food', 'night', 'ride', 'move', 'rest', 'prep'];
const MOOD_KEYS = ART.MOODS.map(m => m[0]);

/* ---------- state: stays on this phone, and every value is checked on the way in ---------- */
const LS = 'udupi.app.v1';
const fresh = () => ({ v: 1, done: {}, skip: {}, edits: {}, custom: [], shots: {}, pack: {}, packCustom: [], sos: {}, variant: {}, spent: {}, journal: {}, sealed: {} });
const isObj = o => !!o && typeof o === 'object' && !Array.isArray(o);
const KEY = /^[A-Za-z0-9][A-Za-z0-9_-]{0,47}$/;
const HM = /^[0-9]{2}:[0-9]{2}$/;
function pick(o, fn) { const out = {}; if (isObj(o)) for (const k of Object.keys(o)) { if (!KEY.test(k)) continue; const v = fn(o[k]); if (v !== undefined) out[k] = v; } return out; }
const flag = v => (v ? 1 : undefined);
const when = v => (typeof v === 'number' && isFinite(v) && v > 0 ? v : v ? 1 : undefined);
const money = v => (typeof v === 'number' && isFinite(v) && v >= 0 && v < 1e7 ? Math.round(v) : undefined);
function cleanStop(c, custom) {
  if (!isObj(c)) return undefined;
  const o = {};
  if (custom) { if (!KEY.test(String(c.id || '')) || !DAY[c.day]) return undefined; o.id = c.id; o.day = c.day; }
  if (HM.test(String(c.t || ''))) o.t = c.t; else if (custom) return undefined;
  if (typeof c.k === 'string' && KINDS[c.k]) o.k = c.k; else if (custom) o.k = 'prep';
  ['x', 'q', 'b'].forEach(f => { if (typeof c[f] === 'string') o[f] = c[f].slice(0, f === 'b' ? 700 : 120); });
  if (custom && !(o.x && o.x.trim())) return undefined;
  if (c.hard != null) o.hard = c.hard ? 1 : 0;
  if (Array.isArray(c.c) && c.c.length === 2 && c.c.every(n => money(n) !== undefined)) o.c = [money(c.c[0]), money(c.c[1])];
  else if (custom) o.c = null;
  return o;
}
function clean(s) {
  const f = fresh();
  if (!isObj(s)) return f;
  f.done = pick(s.done, when);
  f.sealed = pick(s.sealed, when);
  f.skip = pick(s.skip, flag);
  f.shots = pick(s.shots, flag);
  f.pack = pick(s.pack, flag);
  f.sos = pick(s.sos, v => (typeof v === 'string' && v ? v.slice(0, 200) : undefined));
  f.variant = pick(s.variant, v => (v === 'A' || v === 'B' ? v : undefined));
  f.spent = pick(s.spent, money);
  f.journal = pick(s.journal, v => {
    if (!isObj(v)) return undefined;
    const o = {};
    if (MOOD_KEYS.includes(v.mood)) o.mood = v.mood;
    if (typeof v.note === 'string' && v.note.trim()) o.note = v.note.slice(0, 140);
    return o.mood || o.note ? o : undefined;
  });
  f.edits = pick(s.edits, v => cleanStop(v, false));
  if (Array.isArray(s.custom)) f.custom = s.custom.slice(0, 300).map(c => cleanStop(c, true)).filter(Boolean);
  if (Array.isArray(s.packCustom)) f.packCustom = s.packCustom.slice(0, 300).filter(p => isObj(p) && KEY.test(String(p.id || '')) && typeof p.label === 'string' && p.label.trim() && TRIP.KIT.some(g => g.cat === p.cat)).map(p => ({ id: p.id, cat: p.cat, label: p.label.slice(0, 80) }));
  return f;
}
function load() { try { const raw = localStorage.getItem(LS); if (raw) { const s = JSON.parse(raw); if (s && s.v === 1) return clean(s); } } catch (e) {} return fresh(); }
let state = load();
let saveTimer = 0;
function save() { clearTimeout(saveTimer); saveTimer = 0; try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {} }
function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 300); }
const ui = { tab: 'today', day: null, sheet: null, needsRender: false, minute: -1, earlier: false, open: {}, pending: null, vt: false, intro: false, shots: {} };
function commit(opts) { save(); if (!opts || opts.render !== false) { if (ui.sheet && !(opts && opts.force)) ui.needsRender = true; else render(); } }

/* ---------- plan ---------- */
function dayItems(day) {
  const v = state.variant[day.id] || 'A';
  const out = [];
  day.items.forEach((it, i) => {
    if (it.v && it.v !== v) return;
    const ed = state.edits[it.id];
    const o = Object.assign({}, it, ed || {}, { day: day.id, builtIn: true, edited: !!ed, o: i });
    o.ts = abs(day.date, o.t);
    out.push(o);
  });
  state.custom.forEach((c, i) => {
    if (c.day !== day.id) return;
    const o = Object.assign({}, c, { builtIn: false, o: 1000 + i });
    o.ts = abs(day.date, o.t);
    out.push(o);
  });
  return out.sort((a, b) => a.ts - b.ts || a.o - b.o);
}
const allItems = () => DAYS.flatMap(dayItems);
const skipped = it => !!state.skip[it.id];
const targets = items => items.filter(i => !i.info && !skipped(i));
const findItem = id => allItems().find(i => i.id === id) || null;
const progress = items => { const t = targets(items); return [t.filter(i => state.done[i.id]).length, t.length]; };
const costOf = items => items.reduce((a, i) => (skipped(i) || !i.c ? a : [a[0] + (Number(i.c[0]) || 0), a[1] + (Number(i.c[1]) || 0)]), [0, 0]);
const paidOf = items => items.reduce((a, i) => a + (state.spent[i.id] != null ? state.spent[i.id] : 0), 0);
const sunOf = date => TRIP.SUN[date] || { rise: '06:20', set: '18:15' };
const dayShort = id => (DAY[id] ? DAY[id].short : '');
function dayOf(t) { const d = ist(t).date; return DAYS.find(x => x.date === d) || (d < DAYS[0].date ? DAYS[0] : DAYS[DAYS.length - 1]); }
function golden(it, day) {
  if (!day.sun || !it.sh || !it.sh.length) return false;
  const s = it.ts, e = it.ts + (it.dur || 30) * 60000;
  return [day.sun.goldAm, day.sun.gold].some(w => w && s < abs(day.date, w[1]) && e > abs(day.date, w[0]));
}
function live() {
  const t = now();
  const all = allItems().filter(i => !skipped(i));
  const tg = all.filter(i => !i.info);
  let cur = null; const up = [];
  for (const it of tg) { if (it.ts <= t) cur = it; else if (!state.done[it.id]) up.push(it); }
  const hard = all.find(i => i.hard && !state.done[i.id] && i.ts > t - 10 * 60000) || null;
  return { t, cur, next: up[0] || null, after: up[1] || null, hard, first: tg[0], last: tg[tg.length - 1] };
}
const tripOver = L => !!L.last && L.t > L.last.ts + 3 * 3600e3;
const mapsUrl = (q, m) => 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q) + '&travelmode=' + (m === 'w' ? 'walking' : 'driving');
function kitItems() {
  const out = [];
  TRIP.KIT.forEach(g => g.items.forEach(([id, label]) => out.push({ id, label, cat: g.cat })));
  state.packCustom.forEach(p => out.push({ id: p.id, label: p.label, cat: p.cat, custom: true }));
  return out;
}
/* A shot is {x: what, at: where to stand, fr: how to frame it, tm: best time}; plain strings still work. */
const shotsOf = it => (Array.isArray(it.sh) ? it.sh : []).map(s => (typeof s === 'string' ? { x: s } : s)).filter(s => s && s.x);
const shotsDone = it => shotsOf(it).filter((s, k) => state.shots[it.id + '-s' + k]).length;

/* ---------- the trip seal: a day is stamped when every stop on it is done ---------- */
function complete(day) { const t = targets(dayItems(day)); return t.length > 0 && t.every(i => state.done[i.id]); }
function syncSeals(watch) {
  let got = null;
  for (const d of DAYS) {
    const c = complete(d);
    if (c && !state.sealed[d.id]) { state.sealed[d.id] = Date.now(); if (d.id === watch) got = d.id; }
    else if (!c && state.sealed[d.id]) delete state.sealed[d.id];
  }
  return got;
}
const sealCount = () => DAYS.filter(d => state.sealed[d.id]).length;
