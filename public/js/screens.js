/* Udupi Coast Trip app, part 3: screens and frame. Everything runs on IST. */
'use strict';
const screenOpen = anim => '<section class="screen' + (anim === 'tab' ? ' rise' : '') + '"' + (ui.intro && anim ? ' style="--intro:.62s"' : '') + '>';

/* ---------- screens ---------- */
function renderToday(anim) {
  const L = live();
  if (tripOver(L)) {
    const last = DAYS[DAYS.length - 1];
    return screenOpen(anim) + mural(last, L.t, anim, false) + heading('Back in Bagalkot', 'Home') + finCard() + journal(last) + LOTUS + '</section>';
  }
  const day = dayOf(L.t);
  const items = dayItems(day);
  return screenOpen(anim) + mural(day, L.t, anim, ist(L.t).date === day.date) + heading(day.eyebrow, day.name) + nowCard(L) + garland(items, L, anim) +
    '<div class="tl-wrap">' + planBar(day) + timeline(day, items, L, true) + '</div>' + journal(day) + LOTUS + '</section>';
}

function renderDays(anim) {
  const L = live();
  const sel = DAY[ui.day] || dayOf(L.t);
  ui.day = sel.id;
  const today = ist(L.t).date;
  const items = dayItems(sel);
  const [dn, n] = progress(items);
  const [lo, hi] = costOf(items);
  const paid = paidOf(items);
  const s = sunOf(sel.date);
  let facts = '<span class="chip">' + ico('check') + dn + ' of ' + n + ' done</span><span class="chip">' + ico('sunrise') + 'Sunrise ' + s.rise + '</span>';
  if (s.gold) facts += '<span class="chip gold">' + ico('camera') + 'Golden ' + s.gold[0] + '–' + s.gold[1] + '</span>';
  facts += '<span class="chip">' + ico('sunset') + 'Sunset ' + s.set + '</span>';
  if (hi) facts += '<span class="chip">' + ico('wallet') + 'Plan ≈ ' + esc(costStr([lo, hi])) + '</span>';
  if (paid) facts += '<span class="chip areca">' + ico('wallet') + 'Paid ' + inr(paid) + '</span>';
  return screenOpen(anim) + strip(sel, today) + '<div class="day-body' + (anim === 'day' ? ' swap' : '') + '">' +
    mural(sel, L.t, anim, sel.date === today) + heading(sel.eyebrow, sel.name, sel.sub) + '<div class="facts">' + facts + '</div>' +
    (sel.wx ? '<p class="wx">' + ico('rain') + '<span>' + esc(sel.wx) + '</span></p>' : '') +
    '<div class="tl-wrap">' + planBar(sel) + timeline(sel, items, L, false) + '</div>' + journal(sel) + LOTUS + '</div></section>';
}

const C26 = 2 * Math.PI * 26;
const ringSVG = (d, n) => '<span class="ring-wrap"><svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle class="tr" cx="32" cy="32" r="26"/><circle class="pr" cx="32" cy="32" r="26" stroke-dasharray="' + C26.toFixed(1) + '" stroke-dashoffset="' + (C26 * (1 - (n ? d / n : 0))).toFixed(1) + '" transform="rotate(-90 32 32)" opacity="' + (d ? 1 : 0) + '"/></svg><span>' + d + '</span></span>';
function kitLine(view, d, n) {
  if (view === 'shots') return d === n && n ? ['Every shot taken', 'The whole list, golden hours and all.'] : [d + ' of ' + n + ' shots', 'Gold cards fall in golden hour. Tap a stop for its notes.'];
  return d === n ? ['All packed', 'Bag closed. Nothing left on the list.'] : [d + ' of ' + n + ' packed', (n - d) + ' to go. Tick things as they go into the bag.'];
}
function renderKit(anim) {
  const items = kitItems();
  const pd = items.filter(i => state.pack[i.id]).length;
  const [sd, sn] = shotCount();
  const view = ui.kit === 'shots' ? 'shots' : 'pack';
  const [cd, cn] = view === 'shots' ? [sd, sn] : [pd, items.length];
  const [t1, t2] = kitLine(view, cd, cn);
  let h = screenOpen(anim) + heading('Packing and photographs', 'Kit') +
    '<div class="seg kitseg" role="group" aria-label="Kit view"><button type="button" data-act="kitview" data-v="pack" aria-pressed="' + (view === 'pack') + '">Packing<span class="n">' + pd + '/' + items.length + '</span></button><button type="button" data-act="kitview" data-v="shots" aria-pressed="' + (view === 'shots') + '">Shots<span class="n">' + sd + '/' + sn + '</span></button></div>' +
    '<div class="kit-body' + (anim === 'view' ? ' swap' : '') + '"><div class="ksum card">' + ringSVG(cd, cn) + '<div class="ksum-t"><b>' + esc(t1) + '</b><span>' + esc(t2) + '</span></div></div>';
  if (view === 'pack') {
    TRIP.KIT.forEach(g => {
      const list = items.filter(i => i.cat === g.cat);
      h += '<div class="group card"><h2 class="label">' + esc(g.cat) + '</h2><ul class="checks">' + list.map(i => '<li>' + checkHTML('pack', i.id, i.label, !!state.pack[i.id]) +
        (i.custom ? '<button class="x" type="button" data-act="kit-del" data-id="' + esc(i.id) + '" aria-label="Remove ' + esc(i.label) + '">' + ico('x') + '</button>' : '') + '</li>').join('') + '</ul></div>';
    });
    h += '<form class="addrow card" id="kitadd" novalidate><select id="kit-cat" aria-label="Category">' + TRIP.KIT.map(g => '<option>' + esc(g.cat) + '</option>').join('') + '</select><input id="kit-label" type="text" maxlength="80" placeholder="Add your own item" aria-label="Item to add" autocomplete="off" enterkeyhint="done"><button class="btn primary" type="submit">' + ico('plus') + 'Add</button></form>';
  } else {
    shotStops().forEach(g => {
      h += '<div class="sday"><h2 class="sday-h"><span class="label">' + esc(g.day.tab) + '</span>' + esc(g.day.name) + '</h2>' + g.items.map(it => {
        const gold = golden(it, g.day);
        return '<div class="sstop card' + (gold ? ' golden' : '') + '"><button class="ss-head" type="button" data-act="open" data-id="' + esc(it.id) + '"><span class="ss-time">' + esc(it.t) + '</span><span class="ss-title">' + esc(it.x) + '</span>' + (gold ? '<span class="gbadge">' + ico('sun') + 'Golden</span>' : '') + '</button><ul class="checks">' +
          it.sh.map((s, k) => '<li>' + checkHTML('shot', it.id + '-s' + k, s, !!state.shots[it.id + '-s' + k]) + '</li>').join('') + '</ul></div>';
      }).join('') + '</div>';
    });
  }
  return h + '</div>' + LOTUS + '</section>';
}

const acc = (title, body) => { const key = title.toLowerCase().replace(/[^a-z]+/g, '-').slice(0, 24); return '<details class="acc" data-acc="' + key + '"' + (ui.open[key] ? ' open' : '') + '><summary>' + esc(title) + ico('chev') + '</summary><div class="acc-body">' + body + '</div></details>'; };
const tt = (cap, rows) => '<div class="tt"><table><caption>' + esc(cap) + '</caption><thead><tr><th>Station</th><th class="n">Arr</th><th class="n">Dep</th></tr></thead><tbody>' + rows.map(r => '<tr class="' + (r[3] ? 'me' : '') + '"><td>' + esc(r[0]) + '</td><td class="n">' + esc(r[1]) + '</td><td class="n">' + esc(r[2]) + '</td></tr>').join('') + '</tbody></table></div>';
const section = (title, aside, body) => '<div class="section"><div class="sec-head"><h2>' + esc(title) + '</h2>' + (aside ? '<span class="label">' + esc(aside) + '</span>' : '') + '</div>' + body + '</div>';
function moneyCard() {
  const rows = DAYS.map(d => { const its = dayItems(d); const [lo, hi] = costOf(its); return { d, lo, hi, paid: paidOf(its) }; });
  const lo = rows.reduce((a, r) => a + r.lo, 0), hi = rows.reduce((a, r) => a + r.hi, 0), paid = rows.reduce((a, r) => a + r.paid, 0);
  const max = Math.max(hi * 1.12, paid * 1.04, 1);
  const pct = v => Math.min(100, v / max * 100).toFixed(1) + '%';
  const status = !paid ? 'Log amounts from any stop' : paid > hi ? inr(paid - hi) + ' over the plan' : paid >= lo ? 'Inside the plan' : inr(lo - paid) + ' under the low end';
  return '<div class="money card"><div class="mn-top"><div><span class="label">Paid so far</span><div class="mn-big">' + inr(paid) + '</div></div><div class="mn-plan">Plan on the ground<br><b>≈ ' + esc(costStr([lo, hi])) + '</b></div></div>' +
    '<div class="mn-bar" role="img" aria-label="' + esc('Paid ' + inr(paid) + ' against a plan of ' + costStr([lo, hi])) + '"><span class="mn-band" style="left:' + pct(lo) + ';width:' + pct(hi - lo) + '"></span><span class="mn-fill" style="width:' + pct(paid) + '"></span></div>' +
    '<div class="mn-legend"><span>₹0</span><span>' + esc(status) + '</span></div>' +
    '<div class="tt"><table><thead><tr><th>Day</th><th class="n">Plan</th><th class="n">Paid</th></tr></thead><tbody>' + rows.map(r => '<tr><td>' + esc(r.d.tab) + '</td><td class="n">' + (r.hi ? esc(costStr([r.lo, r.hi])) : '—') + '</td><td class="n pd">' + (r.paid ? inr(r.paid) : '—') + '</td></tr>').join('') +
    '</tbody><tfoot><tr><td>Trip</td><td class="n">' + esc(costStr([lo, hi])) + '</td><td class="n pd">' + inr(paid) + '</td></tr></tfoot></table></div>' +
    '<p class="note">Log what you pay in any stop’s sheet. The plan follows the stops you keep, skip or add. The VRL bus, dorm and train tickets are already paid and not counted.</p></div>';
}
function backupCard() {
  let h = '<div class="backup card"><p class="note" style="margin:0">Save everything on this phone to a file: ticks, amounts paid, journal, packing, shots, stamps, bookings and your own stops. Load it back here or on another phone.</p>' +
    '<div class="bk-acts"><button class="btn" type="button" data-act="backup">' + ico('download') + 'Save to a file</button><button class="btn" type="button" data-act="restore">' + ico('upload') + 'Load from a file</button></div>' +
    '<input type="file" id="restoreFile" accept="application/json,.json" hidden>';
  if (ui.pending) h += '<div class="bk-confirm" role="alert"><p><b>' + esc(ui.pending.title) + '</b><br>' + esc(ui.pending.summary) + '</p><div class="bk-acts"><button class="btn primary sm" type="button" data-act="restore-yes">Replace this phone’s data</button><button class="btn sm" type="button" data-act="restore-no">Cancel</button></div></div>';
  return h + '<p class="note">The file includes your bookings, so keep it private.</p></div>';
}
function renderSos(anim) {
  let h = screenOpen(anim) + heading('Help and bookings', 'SOS', 'Tap a number to call it. Bookings stay on this phone.');
  h += '<div class="tiles">' + TRIP.NUMS.map(([n, l], i) => '<a class="tile' + (i === 0 ? ' red' : '') + '" href="tel:' + esc(n) + '"><b>' + esc(n) + '</b><span>' + esc(l) + '</span></a>').join('') + '</div>';
  h += section('Hospitals, police, stations', '', '<ul class="places card">' + TRIP.PLACES.map(([x, d, q]) => '<li><div><b>' + esc(x) + '</b><small>' + esc(d) + '</small></div><a class="go" href="' + esc(mapsUrl(q, 'd')) + '" target="_blank" rel="noopener" aria-label="Directions to ' + esc(x) + '">' + ico('pin') + '</a></li>').join('') + '</ul>');
  h += section('Your bookings', 'On this phone', '<div class="fields card">' + TRIP.FIELDS.map(([k, l]) => '<div class="field"><label for="sos-' + k + '">' + esc(l) + '</label><input id="sos-' + k + '" type="' + (/Phone$/.test(k) ? 'tel' : 'text') + '" data-sos="' + k + '" value="' + esc(state.sos[k] || '') + '" placeholder="Add" autocomplete="off" spellcheck="false"></div>').join('') + '</div>');
  h += section('Money', 'Plan and paid', moneyCard());
  h += section('Reference', '', '<div class="accs">' +
    acc('Your trains', tt('12133 · Mumbai CSMT → Mangaluru Jn (monsoon timetable to 20 Oct)', TRIP.T12133) + tt('17378 · Mangaluru Central → Vijayapura', TRIP.T17378) + '<p class="note">12133 has averaged about an hour late at Udupi but close to on time at Mangaluru Jn, because the timetable builds in slack after Surathkal. Coach orders change; check them on the day.</p>') +
    acc('Rules that protect the trip', '<ul class="bullets">' + TRIP.RULES.map(r => '<li>' + esc(r) + '</li>').join('') + '</ul>') +
    acc('Auto fares', '<div class="tt"><table><tbody>' + TRIP.FARES.map(r => '<tr><td>' + esc(r[0]) + '</td><td class="n">' + esc(r[1]) + '</td></tr>').join('') + '</tbody></table></div><p class="note">Udupi’s meter rate is ₹40 for the first 1.5 km, then ₹20 per km (RTA, Oct 2022). Most drivers quote a fixed fare instead, so agree it before you sit. Bike taxis in Karnataka have been on and off through 2025–26; use one only if the app offers it.</p>') +
    acc('Ways to save', '<ul class="bullets">' + TRIP.SAVERS.map(r => '<li>' + esc(r) + '</li>').join('') + '</ul>') + '</div>');
  h += section('Backup', 'Save and restore', backupCard());
  h += section('This app', '', '<div class="accs">' +
    acc('Install on your phone', '<p class="note" style="margin-top:0"><b>Android:</b> Chrome menu → Install app. <b>iPhone:</b> Safari → Share → Add to Home Screen. Once opened, the app works without signal.</p>' + (deferredPrompt ? '<div class="bk-acts"><button class="btn gold sm" type="button" data-act="install">Install the app</button></div>' : '')) +
    acc('Reset', '<p class="note" style="margin-top:0">Clears every tick, shot, packed item and stamp. Amounts paid, journal lines, your own stops, edits and bookings stay.</p><div class="bk-acts"><button class="btn danger sm" type="button" data-act="reset">Clear all ticks</button></div>') +
    acc('Sources, checked 6 Oct 2026', '<ul class="srcs">' + TRIP.SOURCES.map(([l, u]) => '<li><a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(l) + '</a></li>').join('') + '</ul><p class="note">Opening hours and prices come from venue listings and can change.</p>') + '</div>');
  return h + '<footer class="colophon">' + ART.kindi() + '<span>Udupi Coast Trip · Kaavi edition · v2.0<br>Works offline. Nothing leaves this phone.</span></footer></section>';
}

/* ---------- frame ---------- */
let deferredPrompt = null;
function renderBar() {
  const t = now(), p = ist(t), s = sunOf(p.date), m = p.h * 60 + p.m;
  const isDay = m >= toMin(s.rise) && m < toMin(s.set);
  const label = p.date < DAYS[0].date ? 'Starts Tue 6 Oct' : p.date > DAYS[DAYS.length - 1].date ? 'Trip complete' : dayOf(t).tab + ' Oct';
  let h = '';
  if (!navigator.onLine) h += '<span class="off">Offline</span>';
  if (deferredPrompt) h += '<button class="pill" type="button" data-act="install">Install</button>';
  h += '<span class="datechip">' + ico(isDay ? 'sun' : 'moon') + '<span>' + esc(label) + '</span></span>';
  $('#barMeta').innerHTML = h;
}
function renderNav() {
  $$('.nav [data-tab]').forEach(b => { if (b.dataset.tab === ui.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  const nav = $('.nav-in');
  if (nav) nav.style.setProperty('--i', TABS.indexOf(ui.tab));
}
const oopsHTML = () => '<section class="screen"><div class="oops card"><p class="eyebrow">Something slipped</p><h1 class="title">Let’s try that again</h1><p class="sub">This screen hit an error. Your ticks and notes are safe on this phone.</p><div class="bk-acts"><button class="btn primary" type="button" data-act="reload">Reload</button><button class="btn" type="button" data-tab="today">Back to Today</button></div></div></section>';
function render(anim) {
  renderBar();
  renderNav();
  const main = $('#main');
  try {
    main.innerHTML = ui.tab === 'today' ? renderToday(anim) : ui.tab === 'days' ? renderDays(anim) : ui.tab === 'kit' ? renderKit(anim) : renderSos(anim);
  } catch (err) {
    main.innerHTML = oopsHTML();
    try { console.error(err); } catch (e) {}
  }
  if (anim === 'tab' && !ui.vt) { main.classList.remove('enter'); void main.offsetWidth; main.classList.add('enter'); }
  if (anim) easeSun($('.mural.draw', main), ui.intro ? 620 : 0);
  ui.intro = false;
  ui.minute = Math.floor(now() / 60000);
}
/* The sun eases along its arc from sunrise to where it stands now. */
function easeSun(fig, delay) {
  if (!fig || REDUCED) return;
  const g = $('.sun[data-f]', fig);
  if (!g) return;
  const f1 = Number(g.dataset.f) || 0;
  const past = $('.sky-past', fig);
  const D = 1400 + f1 * 1000;
  const put = f => { const p = ART.sunPt(f); g.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')'); if (past) past.setAttribute('d', ART.arcSeg(0, Math.max(0.002, f))); };
  put(0);
  let t0 = null;
  const step = ts => {
    if (!g.isConnected) return;
    if (t0 == null) t0 = ts + delay;
    const k = Math.min(1, Math.max(0, (ts - t0) / D));
    put(f1 * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function setTab(tab) {
  if (!TABS.includes(tab)) return;
  const from = TABS.indexOf(ui.tab), to = TABS.indexOf(tab);
  if (from === to) { window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); return; }
  ui.tab = tab;
  try { history.replaceState(null, '', location.pathname + location.search + '#' + tab); } catch (e) {}
  const go = () => { render('tab'); window.scrollTo(0, 0); };
  if (document.startViewTransition && !REDUCED && !document.hidden) {
    const root = document.documentElement;
    root.dataset.vt = to > from ? 'fwd' : 'back';
    ui.vt = true;
    try {
      const vt = document.startViewTransition(go);
      vt.finished.finally(() => { ui.vt = false; delete root.dataset.vt; });
    } catch (e) { ui.vt = false; go(); }
  } else go();
}
