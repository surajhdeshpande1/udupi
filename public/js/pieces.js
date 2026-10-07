/* Udupi Coast Trip app, part 2: pieces: mural, heading, now card, garland, timeline, journal, seal. */
'use strict';
/* ---------- mural: each day opens on its own drawn scene, with Udupi's sun on its arc ---------- */
const SIG = { tue: 'night', wed: 0.45, thu: 0.2, fri: 0.6, sat: 0.06 };
function skyFor(day, t, isLive) {
  const s = sunOf(day.date);
  const rise = abs(day.date, s.rise), set = abs(day.date, s.set), span = set - rise;
  const fr = ms => (ms - rise) / span;
  const sky = {};
  if (s.goldAm) sky.gAm = [fr(abs(day.date, s.goldAm[0])), fr(abs(day.date, s.goldAm[1]))];
  if (s.gold) sky.gPm = [fr(abs(day.date, s.gold[0])), fr(abs(day.date, s.gold[1]))];
  let cap;
  if (isLive) {
    const f = fr(t);
    if (f < 0 || f > 1) {
      sky.night = true;
      const next = ist(t + 864e5).date;
      const nr = t < rise ? rise : abs(next, sunOf(next).rise);
      cap = 'Sunrise ' + ist(nr).hm + ' · in ' + dur(nr - t);
    } else {
      sky.f = f;
      const gs = s.gold ? abs(day.date, s.gold[0]) : set - 30 * 60000;
      cap = t < gs ? 'Golden hour ' + ist(gs).hm + ' · in ' + dur(gs - t) : 'Golden hour now · sunset ' + s.set;
    }
  } else {
    if (SIG[day.id] === 'night') sky.night = true; else sky.f = SIG[day.id] == null ? 0.4 : SIG[day.id];
    cap = s.gold ? 'Golden hour ' + s.gold[0] + '–' + s.gold[1] : 'Sun up ' + s.rise + ' to ' + s.set;
  }
  return { sky, cap, rise: s.rise, set: s.set };
}
function mural(day, t, anim, liveSky) {
  const k = skyFor(day, t, liveSky);
  return '<figure class="mural' + (k.sky.night ? ' night' : '') + (anim ? ' draw' : '') + '"><div class="mural-frame">' + ART.scene(day.id, k.sky) + '</div>' +
    '<figcaption class="mural-cap"><span class="mc-a">' + ico('sunrise') + k.rise + '</span><span class="mc-s">' + esc(k.cap) + '</span><span class="mc-b">' + k.set + ico('sunset') + '</span></figcaption></figure>';
}
const KIRITA = ART.kirita();
const LOTUS = ART.lotus();
const heading = (eyebrow, title, sub, hl) => '<header class="heading">' + KIRITA + '<p class="eyebrow">' + esc(eyebrow) + '</p><h1 class="title">' + esc(title) + '</h1>' + (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') +
  (hl && hl.length ? '<ul class="hl" aria-label="Highlights of the day">' + hl.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') + '<div class="rule" aria-hidden="true"></div></header>';

/* ---------- now card ---------- */
function nowCard(L) {
  const t = L.t;
  if (!L.first) return '';
  const cur = L.cur;
  const curLive = cur && !state.done[cur.id] && t - cur.ts < ((cur.dur || 30) + 30) * 60000;
  const focus = curLive ? cur : L.next;
  if (!focus) return '';
  const follow = curLive ? L.next : L.after;
  const label = focus.hard ? 'Deadline' : curLive ? 'Now' : 'Up next';
  const tagCls = focus.hard ? 'red' : curLive ? 'live' : '';
  const timeTxt = curLive && !focus.hard ? (focus.dur ? focus.t + ' – ' + hmAdd(focus.t, focus.dur) : 'since ' + focus.t) : dayShort(focus.day) + ' ' + focus.t + ' · ' + (focus.ts - t > 0 ? 'in ' + dur(focus.ts - t) : 'now');
  const acts = [];
  if (focus.q) acts.push('<a class="btn" href="' + esc(mapsUrl(focus.q, focus.m)) + '" target="_blank" rel="noopener">' + ico('pin') + 'Directions</a>');
  acts.push('<button class="btn primary" type="button" data-act="toggle" data-id="' + esc(focus.id) + '">' + ico('check') + 'Mark done</button>');
  let foot = '';
  if (follow) {
    const red = follow.hard && follow.ts - t < 3 * 3600e3;
    foot += '<div class="nf' + (red ? ' red' : '') + '"><span class="k">' + (follow.hard ? 'Deadline' : 'Next') + '</span><span class="v"><b>' + esc(follow.t) + '</b>' + esc(follow.x) + '</span><span class="c">' + esc(dur(follow.ts - t)) + '</span></div>';
  }
  if (L.hard && L.hard.id !== focus.id && !(follow && L.hard.id === follow.id)) {
    const diff = L.hard.ts - t;
    foot += '<div class="nf' + (diff < 3 * 3600e3 ? ' red' : '') + '"><span class="k">Deadline</span><span class="v"><b>' + esc(dayShort(L.hard.day) + ' ' + L.hard.t) + '</b>' + esc(L.hard.x) + '</span><span class="c">' + esc(diff <= 0 ? 'now' : dur(diff)) + '</span></div>';
  }
  return '<article class="now" aria-label="' + esc(label) + '">' + VG.pic(focus, 'card') + '<div class="now-top"><span class="tag ' + tagCls + '"><i></i>' + label + '</span><span class="now-time">' + esc(timeTxt) + '</span></div>' +
    '<button class="now-main" type="button" data-act="open" data-id="' + esc(focus.id) + '"><span class="now-title">' + esc(focus.x) + '</span>' + (focus.kn ? '<span class="now-kn" lang="kn">' + esc(focus.kn) + '</span>' : '') + '</button>' +
    '<div class="now-acts">' + acts.join('') + '</div>' + (foot ? '<div class="now-foot">' + foot + '</div>' : '<div class="now-foot empty"></div>') + '</article>';
}
const sealRow = (cls, uid, fresh) => '<div class="' + cls + '" role="img" aria-label="Trip seal: ' + sealCount() + ' of ' + DAYS.length + ' days stamped">' + DAYS.map(d => (state.sealed[d.id]
  ? '<span class="slot on' + (d.id === fresh ? ' new' : '') + '">' + ART.medal(d.id, uid) + '</span>'
  : '<span class="slot">' + esc(d.short) + '</span>')).join('') + '</div>';
function finCard() {
  const all = allItems();
  const [d, n] = progress(all);
  const paid = paidOf(all);
  return '<article class="now"><div class="now-top"><span class="tag ok"><i></i>Home</span><span class="now-time">' + sealCount() + ' of ' + DAYS.length + ' stamped</span></div>' +
    '<div class="now-main"><span class="now-title">Trip complete</span><span class="now-kn" lang="kn">ಮನೆಗೆ ಸ್ವಾಗತ</span></div>' +
    '<p class="now-note">' + d + ' of ' + n + ' stops done' + (paid ? ', ' + inr(paid) + ' paid on the ground' : '') + '. Welcome back to Bagalkot.</p>' + sealRow('fin-seal', 'fin') +
    '<div class="now-acts"><button class="btn" type="button" data-tab="days">' + ico('list') + 'Look back through the days</button></div><div class="now-foot empty"></div></article>';
}

/* ---------- garland: a toran of marigolds, one bead per stop ---------- */
function garland(items, L, anim) {
  const tg = targets(items);
  const n = tg.length;
  if (!n) return '';
  const d = tg.filter(i => state.done[i.id]).length;
  const W = 336, PAD = 12, TOP = 9, SAG = 22;
  const r = n > 24 ? 4.6 : 5.4;
  const curId = L.cur ? L.cur.id : null;
  const leaf = (x, a) => '<g transform="translate(' + x + ' ' + TOP + ') rotate(' + a + ')"><path class="leaf" d="M0 0C3.6 4 3.6 11 0 16C-3.6 11 -3.6 4 0 0z"/><path class="leaf-v" d="M0 2.5V13.5"/></g>';
  const beads = tg.map((it, i) => {
    const u = n === 1 ? 0.5 : i / (n - 1);
    const x = PAD + 10 + u * (W - 2 * PAD - 20);
    const s = (x - PAD) / (W - 2 * PAD);
    const y = TOP + 4 * SAG * s * (1 - s);
    let cls, inner;
    if (state.done[it.id]) { cls = 'b-done'; inner = ART.marigold(r); }
    else if (it.id === curId) { cls = 'b-now'; inner = '<circle class="ring" r="' + (r + 1.6) + '"/><circle class="core" r="' + (r * 0.78).toFixed(1) + '"/>'; }
    else { cls = 'b-todo' + (it.hard ? ' b-hard' : ''); inner = '<circle r="' + (r * 0.64).toFixed(1) + '"/>'; }
    return '<g class="bead ' + cls + '" data-b="' + esc(it.id) + '" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" style="--i:' + i + '"><g class="bd">' + inner + '</g></g>';
  }).join('');
  const [lo, hi] = costOf(items);
  const paid = paidOf(items);
  const foot = hi || paid ? '<p class="gl-foot"><span>' + (paid ? 'Paid today <b>' + inr(paid) + '</b>' : 'Nothing paid yet') + '</span>' + (hi ? '<span>Plan ≈ ' + esc(costStr([lo, hi])) + '</span>' : '') + '</p>' : '';
  return '<section class="garland' + (anim ? ' drop' : '') + '" aria-label="' + d + ' of ' + n + ' stops done today"><div class="gl-head"><span class="label">Today’s garland</span><span class="gl-count">' + d + '<small>/ ' + n + '</small></span></div>' +
    '<svg class="gl-svg" viewBox="0 0 ' + W + ' 48" aria-hidden="true"><path class="thread" d="M' + PAD + ' ' + TOP + 'Q' + W / 2 + ' ' + (TOP + 2 * SAG) + ' ' + (W - PAD) + ' ' + TOP + '"/>' +
    leaf(PAD, 24) + leaf(PAD, -10) + leaf(W - PAD, 10) + leaf(W - PAD, -24) + beads + '</svg>' + foot + '</section>';
}

/* ---------- timeline ---------- */
/* The day brief: route, riding, deadlines, what to wear, carry, eat and spend, and what to watch for. */
function dayBrief(day, openDefault) {
  if (!day.brief || !day.brief.length) return '';
  const key = 'brief-' + day.id + (openDefault ? '-d' : '-t');
  const open = ui.open[key] != null ? ui.open[key] : openDefault;
  return '<details class="acc brief" data-acc="' + key + '"' + (open ? ' open' : '') + '><summary><span class="br-sum"><span class="br-ic">' + ico('list') + '</span><span class="br-t"><b>Day brief</b>' + (day.briefLine ? '<small>' + esc(day.briefLine) + '</small>' : '') + '</span></span>' + ico('chev') + '</summary>' +
    '<div class="acc-body"><dl class="br">' + day.brief.map(([ic, k, v]) => '<div class="br-row"><dt>' + ico(ic) + '<span>' + esc(k) + '</span></dt><dd>' + esc(v) + '</dd></div>').join('') + '</dl></div></details>';
}
function planBar(day) {
  let h = '<div class="tl-head"><h2>Timeline</h2><button class="link" type="button" data-act="rules" data-day="' + day.id + '">If plans change' + ico('right') + '</button></div>';
  if (day.variants) {
    const v = state.variant[day.id] || 'A';
    h += '<div class="seg planseg" role="group" aria-label="Plan for ' + esc(day.tab) + '"><button type="button" data-act="variant" data-day="' + day.id + '" data-v="A" aria-pressed="' + (v === 'A') + '">Plan A</button><button type="button" data-act="variant" data-day="' + day.id + '" data-v="B" aria-pressed="' + (v === 'B') + '">Plan B · ' + esc(day.variants.B.label) + '</button></div>';
  }
  return h;
}
function timeline(day, items, L, collapse) {
  const t = L.t;
  const isToday = ist(t).date === day.date;
  const curId = L.cur && L.cur.day === day.id ? L.cur.id : null;
  let list = items, fold = '';
  if (collapse && isToday) {
    /* On Today, stops that are already over fold into one quiet row, so the list starts at now. */
    let cut = items.findIndex(it => it.id === curId || it.ts + (it.dur || 0) * 60000 > t);
    if (cut < 0) cut = items.length;
    const early = targets(items.slice(0, cut));
    if (early.length >= 3) {
      const dn = early.filter(i => state.done[i.id]).length;
      const label = ui.earlier ? 'Hide earlier stops' : early.length + ' earlier stops · ' + dn + ' done';
      fold = '<li class="earlier"><button class="ea" type="button" data-act="earlier" aria-expanded="' + !!ui.earlier + '"><span class="dot">' + ico('chev') + '</span><span class="t">' + esc(label) + '</span></button></li>';
      if (!ui.earlier) list = items.slice(cut);
    }
  }
  let h = '<ol class="tl">' + fold;
  let placed = !isToday, i = 0;
  for (const it of list) {
    if (!placed && it.ts > t) { h += nowLine(t, i++); placed = true; }
    h += rowHTML(it, t, curId, i++);
  }
  if (!placed && list.length && t < list[list.length - 1].ts + 4 * 3600e3) h += nowLine(t, i);
  return h + '</ol><button class="add" type="button" data-act="add" data-day="' + day.id + '">' + ico('plus') + 'Add a stop</button>';
}
const nowLine = (t, i) => '<li class="nowline" aria-hidden="true" style="--i:' + i + '"><span>' + ist(t).hm + '</span><i></i></li>';
function rowHTML(it, t, curId, i) {
  const K = KINDS[it.k] || KINDS.prep;
  const done = !!state.done[it.id], sk = skipped(it);
  const cls = ['row'];
  if (it.info) cls.push('info');
  if (done) cls.push('done');
  if (sk) cls.push('skipped');
  if (it.hard) cls.push('hard');
  if (it.id === curId && !done && !it.info) cls.push('now');
  if (!done && it.ts + (it.dur || 0) * 60000 < t) cls.push('past');
  const g = it.hard ? 'g-hard' : 'g-' + K.g;
  const meta = [];
  if (sk) meta.push('Skipped');
  else if (it.hard && !done) {
    const diff = it.ts - t;
    meta.push('<span class="hard">' + (diff < -10 * 60000 ? 'Missed? Tap the circle if you made it' : diff > 0 && diff < 12 * 3600e3 ? 'Deadline · in ' + dur(diff) : 'Hard deadline') + '</span>');
  } else if (it.fix) meta.push('Fixed time');
  if (it.star) meta.push('<span class="star">★ Iconic</span>');
  if (!it.info && it.dur && !it.hard) meta.push(esc(mins(it.dur)));
  if (state.spent[it.id] != null) meta.push('<span class="paid">Paid ' + inr(state.spent[it.id]) + '</span>');
  else if (it.c && (it.c[0] || it.c[1])) meta.push(esc(costStr(it.c)));
  if (!it.builtIn) meta.push('Yours');
  const node = it.info
    ? '<span class="r-node ' + g + '" aria-hidden="true"><span class="dot"></span></span>'
    : '<button class="r-node ' + g + '" type="button" data-act="toggle" data-id="' + esc(it.id) + '" aria-pressed="' + done + '" aria-label="' + (done ? 'Undo: ' : 'Mark done: ') + esc(it.x) + '"><span class="dot">' + ico(done ? 'check' : it.k === 'move' && it.m === 'w' ? 'walk' : K.icon) + '</span></button>';
  const pic = it.info ? '' : VG.pic(it, 'thumb');
  const inner = '<span class="r-txt"><span class="r-title">' + esc(it.x) + '</span>' + (meta.length ? '<span class="r-meta">' + meta.join(' · ') + '</span>' : '') + '</span>' + pic;
  const body = it.info && !it.b ? '<span class="r-body">' + inner + '</span>' : '<button class="r-body' + (pic ? ' has-vg' : '') + '" type="button" data-act="open" data-id="' + esc(it.id) + '">' + inner + '</button>';
  const guide = !it.info && shotsOf(it).length ? shotGuide(it, it.id === curId && !done && !sk) : '';
  return '<li class="' + cls.join(' ') + '" id="r-' + esc(it.id) + '" style="--i:' + i + '"><span class="r-time">' + esc(it.t) + '</span>' + node + body + guide + '</li>';
}

/* ---------- shot guide: where to stand and how to frame, folded under its stop ---------- */
function shotGuide(it, auto) {
  const list = shotsOf(it);
  const open = ui.shots[it.id] != null ? ui.shots[it.id] : auto;
  const gold = DAY[it.day] && golden(it, DAY[it.day]);
  return '<div class="r-shots' + (open ? ' open' : '') + (gold ? ' gold' : '') + '"><button class="sg-tog" type="button" data-act="shots" data-id="' + esc(it.id) + '" aria-expanded="' + open + '">' + ico('camera') +
    '<span class="sg-l">Where to shoot</span>' + (gold ? '<span class="sg-gold">' + ico('sun') + '<span class="vh">Golden hour</span></span>' : '') +
    '<span class="sg-n" data-sgn="' + esc(it.id) + '">' + shotsDone(it) + '/' + list.length + '</span>' + ico('chev') + '</button>' +
    '<div class="sg-body"><div class="sg-in">' + shotList(it) + '</div></div></div>';
}
function shotList(it) {
  const line = (cls, icon, label, v) => v ? '<span class="sg-line ' + cls + '">' + ico(icon) + '<span><span class="vh">' + label + ': </span>' + esc(v) + '</span></span>' : '';
  return '<ul class="sg-list">' + shotsOf(it).map((s, k) => {
    const key = it.id + '-s' + k;
    return '<li><label class="check sg-item"><input type="checkbox" data-shot="' + esc(key) + '"' + (state.shots[key] ? ' checked' : '') + '><span class="box">' + ico('check') + '</span>' +
      '<span class="sg-txt"><span class="txt">' + esc(s.x) + '</span>' + line('sg-at', 'pin', 'Where to stand', s.at) + line('sg-fr', 'frame', 'Framing', s.fr) + line('sg-tm', 'sun', 'Best time', s.tm) + '</span></label></li>';
  }).join('') + '</ul>';
}

/* ---------- day journal: one line and a mood ---------- */
function journal(day) {
  const j = state.journal[day.id] || {};
  const isToday = ist(now()).date === day.date;
  const moods = ART.MOODS.map(([k, label, svg]) => '<button class="mood" type="button" data-act="mood" data-day="' + day.id + '" data-v="' + k + '" aria-pressed="' + (j.mood === k) + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + svg + '</svg><span>' + label + '</span></button>').join('');
  return '<section class="journal card" aria-label="Day journal, ' + esc(day.tab) + '"><div class="jr-head"><h2>Day journal</h2><span class="jr-kn" lang="kn">ದಿನಚರಿ</span></div>' +
    '<div class="moods" role="group" aria-label="How the day felt">' + moods + '</div>' +
    '<input class="jr-note" type="text" maxlength="140" data-jr="' + day.id + '" value="' + esc(j.note || '') + '" placeholder="' + (isToday ? 'One line to remember today' : 'One line to remember ' + esc(day.tab)) + '" aria-label="One line for ' + esc(day.tab) + '" enterkeyhint="done" autocomplete="off"></section>';
}

/* ---------- days strip: five arches that take their stamps ---------- */
function strip(sel, today) {
  return '<div class="seal-head"><span class="label">Trip seal</span><span class="seal-count">' + sealCount() + ' of ' + DAYS.length + ' stamped</span></div><div class="strip" role="group" aria-label="Trip days">' + DAYS.map(d => {
    const [dn, n] = progress(dayItems(d));
    const sealed = !!state.sealed[d.id];
    const off = (100 - (n ? dn / n : 0) * 100).toFixed(1);
    const mark = sealed ? ART.medal(d.id, 'sd')
      : '<svg class="dring" viewBox="0 0 40 40" aria-hidden="true"><circle class="tr" cx="20" cy="20" r="15.5"/>' + (dn ? '<circle class="pr" cx="20" cy="20" r="15.5" pathLength="100" stroke-dasharray="100" stroke-dashoffset="' + off + '" transform="rotate(-90 20 20)"/>' : '') + '<text x="20" y="23.6" text-anchor="middle">' + dn + '</text></svg>';
    return '<button class="dbtn' + (sealed ? ' sealed' : '') + '" type="button" data-act="day" data-day="' + d.id + '" aria-pressed="' + (d.id === sel.id) + '" aria-label="' + esc(d.tab + ' October, ' + dn + ' of ' + n + ' done' + (sealed ? ', stamped' : '')) + '">' + (d.date === today ? '<i class="tdot"></i>' : '') + '<small>' + esc(d.short) + '</small><b>' + Number(d.date.slice(8)) + '</b><span class="dmark">' + mark + '</span></button>';
  }).join('') + '</div>';
}
const checkHTML = (kind, key, label, on) => '<label class="check"><input type="checkbox" data-' + kind + '="' + esc(key) + '"' + (on ? ' checked' : '') + '><span class="box">' + ico('check') + '</span><span class="txt">' + esc(label) + '</span></label>';
