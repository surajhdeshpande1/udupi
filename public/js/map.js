/* Udupi Coast Trip app, part 3b: the Map tab. A Kaavi-drawn map of the coast, where each day is one
   journey that starts and ends at the dorm, with numbered spots in the order you reach them. */
'use strict';
const MAP = (() => {
  const G = TRIP.GEO;
  const W = 360;
  const rad = d => d * Math.PI / 180;
  const km = (a, b) => { const x = Math.sin(rad(b[0] - a[0]) / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(rad(b[1] - a[1]) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
  const r1 = n => Math.round(n * 10) / 10;

  /* ---------- the day as visits: consecutive stops in the same area ---------- */
  const isTravel = it => ({ ride: 1, move: 1, bus: 1, boat: 1 })[it.k] || (it.k === 'train' && !!it.hard);
  const areaOf = it => (it.q && G.at[it.q]) || (it.at && G.areas[it.at] ? it.at : null);
  const COAST_DAYS = ['wed', 'thu', 'fri'];
  function visits(day) {
    const out = [];
    if (!COAST_DAYS.includes(day.id)) return out;
    let cur = null, here = 'udupi';
    for (const it of dayItems(day)) {
      if (it.info || skipped(it)) continue;
      let a = areaOf(it);
      if (!a && !isTravel(it)) a = here;
      if (!a) { here = null; continue; }
      here = a;
      if (cur && cur.a === a) cur.items.push(it); else { cur = { a, items: [it] }; out.push(cur); }
    }
    out.forEach(v => {
      const main = v.items.find(i => !isTravel(i));
      v.main = main || v.items[v.items.length - 1];
      v.t = main ? main.t : hmAdd(v.items[0].t, v.items[0].dur || 0);
      v.q = (main && main.q) || (v.items.find(i => i.q) || {}).q || null;
    });
    return out;
  }

  /* ---------- projection: fit the day's places into the frame, north up ---------- */
  function frame(pts) {
    let la0 = Math.min(...pts.map(p => p[0])), la1 = Math.max(...pts.map(p => p[0]));
    let lo0 = Math.min(...pts.map(p => p[1])), lo1 = Math.max(...pts.map(p => p[1]));
    const kx = Math.cos(rad((la0 + la1) / 2));
    let h = Math.max(la1 - la0, 0.05), w = Math.max((lo1 - lo0) * kx, 0.05);
    const cla = (la0 + la1) / 2, clo = (lo0 + lo1) / 2;
    h *= 1.24; w *= 1.36;
    let H = W * h / w;
    if (H > W * 1.6) { H = W * 1.6; w = h * W / H; } else if (H < W * 0.82) { H = W * 0.82; h = w * H / W; }
    const s = W / w;
    const P = ll => [r1((ll[1] - clo) * kx * s + W / 2), r1((cla - ll[0]) * s + H / 2)];
    return { P, H: Math.round(H), pxKm: s / 111.2 };
  }
  const line = (P, pts) => pts.map((p, i) => (i ? 'L' : 'M') + P(p).join(' ')).join('');

  /* A long ride follows NH66; short hops and boat crossings are drawn straight. */
  function nearestOn(path, ll) { let best = 0, d = Infinity; path.forEach((p, i) => { const k = km(p, ll); if (k < d) { d = k; best = i; } }); return [best, d]; }
  function legPath(a, b, kind) {
    if (kind === 'rail') { const [i] = nearestOn(G.rail, a), [j] = nearestOn(G.rail, b); return [a].concat(i <= j ? G.rail.slice(i, j + 1) : G.rail.slice(j, i + 1).reverse(), [b]); }
    if (kind === 'sea' || km(a, b) < 20) return [a, b];
    const [i, da] = nearestOn(G.nh66, a), [j, db] = nearestOn(G.nh66, b);
    if (da > 4.5 || db > 4.5 || i === j) return [a, b];
    return [a].concat(i < j ? G.nh66.slice(i, j + 1) : G.nh66.slice(j, i + 1).reverse(), [b]);
  }

  /* ---------- drawing ---------- */
  function seaWaves(P, H, coastX) {
    let d = '';
    for (let y = 18; y < H; y += 26) {
      const cx = coastX(y);
      for (let x = ((y / 26) % 2) * 22 + 8; x < cx - 16; x += 44) d += 'M' + r1(x) + ' ' + y + 'q4 -3.4 8 0t8 0';
    }
    return d;
  }
  function coastXAt(P) {
    const pts = G.coast.map(P);
    return y => {
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
        if ((y <= y0 && y >= y1) || (y >= y0 && y <= y1)) { const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0); return x0 + (x1 - x0) * t; }
      }
      return -1;
    };
  }
  function labelBox(x, y, text, pos) {
    const w = text.length * 5.9 + 4, h = 13;
    if (pos === 'r') return { x: x + 13, y: y - 6.5, w, h, tx: x + 15, ty: y + 3.8, a: 'start' };
    if (pos === 'l') return { x: x - 13 - w, y: y - 6.5, w, h, tx: x - 15, ty: y + 3.8, a: 'end' };
    if (pos === 't') return { x: x - w / 2, y: y - 26, w, h, tx: x, ty: y - 16, a: 'middle' };
    return { x: x - w / 2, y: y + 13, w, h, tx: x, ty: y + 23, a: 'middle' };
  }
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function draw(day, vs, anim) {
    const L = live();
    const areaIds = [...new Set(vs.map(v => v.a))];
    const F = frame(areaIds.map(a => G.areas[a].ll));
    const { P, H } = F;
    /* Places that would sit on top of each other at this scale share one spot. */
    const spots = [];
    for (const a of areaIds) {
      const xy = P(G.areas[a].ll);
      const near = spots.find(s => Math.hypot(s.x - xy[0], s.y - xy[1]) < 17);
      if (near) near.areas.push(a); else spots.push({ areas: [a], x: xy[0], y: xy[1] });
    }
    const spotOf = a => spots.find(s => s.areas.includes(a));
    let n = 0;
    spots.forEach(s => { s.home = s.areas.some(a => G.areas[a].home); s.sea = s.areas.every(a => G.areas[a].sea); s.name = s.areas.map(a => G.areas[a].n).join(' · '); s.num = s.home ? 0 : ++n; });
    vs.forEach(v => { v.spot = spotOf(v.a); });
    const isToday = ist(L.t).date === day.date;
    const curV = isToday && L.cur ? vs.find(v => v.items.some(i => i.id === L.cur.id)) : null;
    spots.forEach(s => {
      const mine = vs.filter(v => v.spot === s);
      s.done = mine.every(v => v.items.filter(i => !i.info).every(i => state.done[i.id]));
      s.now = !!curV && curV.spot === s;
      s.first = mine[0];
    });

    /* base: land, sea, rivers, roads, rail, towns */
    const cx = coastXAt(P);
    const coast = [[12.7, 74.86]].concat(G.coast, [[14.05, 74.57]]);
    const seaPath = line(P, coast) + 'L-400 ' + P([14.05, 74.57])[1] + 'L-400 ' + P([12.7, 74.86])[1] + 'Z';
    let g = '<rect class="mp-land" x="0" y="0" width="' + W + '" height="' + H + '"/>';
    g += '<path class="mp-sea" d="' + seaPath + '"/><path class="mp-wave" d="' + seaWaves(P, H, cx) + '"/><path class="mp-coast" d="' + line(P, coast) + '"/>';
    g += G.rivers.map(rv => '<path class="mp-river-edge" d="' + line(P, rv) + '"/><path class="mp-river" d="' + line(P, rv) + '"/>').join('');
    g += G.roads.map(rd => '<path class="mp-road" d="' + line(P, rd) + '"/>').join('');
    g += '<path class="mp-nh" d="' + line(P, G.nh66) + '"/>';
    if (vs.some(v => G.areas[v.a].rail)) g += '<path class="mp-rail" d="' + line(P, G.rail) + '"/>';
    /* Spot labels go first, so the places you visit always get their names; towns fill the gaps. */
    const taken = spots.map(s => ({ x: s.x - 11, y: s.y - 11, w: 22, h: 22, s }));
    const order = spots.slice().sort((p, q) => (p.home ? -1 : 0) - (q.home ? -1 : 0));
    for (const s of order) {
      const text = s.home ? s.name + ' · start' : s.name;
      for (const pos of ['r', 'l', 't', 'b']) {
        const b = labelBox(s.x, s.y, text, pos);
        if (b.x < 3 || b.x + b.w > W - 3 || b.y < 3 || b.y + b.h > H - 3) continue;
        if (taken.some(o => o.s !== s && hit(o, b))) continue;
        s.label = Object.assign(b, { text });
        taken.push(b);
        break;
      }
    }
    const towns = G.towns.map(([name, la, lo, big]) => {
      const [x, y] = P([la, lo]);
      if (x < 6 || x > W - 6 || y < 8 || y > H - 8) return '';
      if (spots.some(s => Math.hypot(s.x - x, s.y - y) < 26)) return '';
      const w = name.length * 5.4 + 4;
      const R = { x: x + 5, y: y - 6, w, h: 11 }, Lf = { x: x - 5 - w, y: y - 6, w, h: 11 };
      const fits = bx => bx.x >= 3 && bx.x + bx.w <= W - 3 && !taken.some(o => hit(o, bx));
      const right = fits(R), left = !right && fits(Lf);
      const dot = '<circle class="mp-town" cx="' + x + '" cy="' + y + '" r="' + (big ? 2.4 : 1.8) + '"/>';
      if (!right && !left) return dot;
      taken.push(right ? R : Lf);
      return dot + '<text class="mp-town-t' + (big ? ' big' : '') + '" x="' + (right ? r1(x + 5) : r1(x - 5)) + '" y="' + r1(y + 3.2) + '" text-anchor="' + (right ? 'start' : 'end') + '">' + esc(name) + '</text>';
    }).join('');
    g += towns;
    /* NH66 badge where the road crosses the middle of the frame */
    const nhMid = G.nh66.map(P).find(([x, y]) => y > H * 0.45 && y < H * 0.6 && x > 30 && x < W - 30);
    if (nhMid) g += '<g class="mp-nhb" transform="translate(' + r1(nhMid[0] + 8) + ' ' + r1(nhMid[1]) + ')"><rect x="0" y="-6" width="30" height="12" rx="3"/><text x="15" y="3.4" text-anchor="middle">NH66</text></g>';

    /* the journey */
    let route = '', k = 0;
    for (let i = 1; i < vs.length; i++) {
      const a = vs[i - 1], b = vs[i];
      if (a.spot === b.spot) continue;
      const kind = a.spot.sea || b.spot.sea ? 'sea' : G.areas[b.a].rail ? 'rail' : 'road';
      const pts = legPath(G.areas[a.a].ll, G.areas[b.a].ll, kind).map(P);
      pts[0] = [a.spot.x, a.spot.y];
      pts[pts.length - 1] = [b.spot.x, b.spot.y];
      route += '<path class="mp-leg ' + kind + '" pathLength="1" style="--k:' + (k++) + '" d="' + pts.map((p, j) => (j ? 'L' : 'M') + p[0] + ' ' + p[1]).join('') + '"/>';
    }
    g += '<g class="mp-route">' + route + '</g>';

    /* spots and their labels */
    let sp = '';
    for (const s of order) {
      const main = s.first.main;
      const cls = 'mp-spot' + (s.home ? ' home' : '') + (s.done ? ' done' : '') + (s.now ? ' now' : '');
      sp += '<g class="' + cls + '" data-act="open" data-id="' + esc(main.id) + '" role="button" tabindex="0" aria-label="' + esc((s.home ? 'Start, ' : 'Spot ' + s.num + ', ') + s.name) + '">' +
        (s.now ? '<circle class="mp-pulse" cx="' + s.x + '" cy="' + s.y + '" r="12"/>' : '') +
        '<circle class="mp-dot" cx="' + s.x + '" cy="' + s.y + '" r="' + (s.home ? 11 : 9.5) + '"/>' +
        (s.home ? '<g transform="translate(' + r1(s.x - 7) + ' ' + r1(s.y - 7.4) + ') scale(.58)"><path class="mp-house" d="M4 11 12 4.5 20 11M6 10v9.5h12V10M10 19.5v-5h4v5"/></g>' : '<text class="mp-num" x="' + s.x + '" y="' + r1(s.y + 3.6) + '" text-anchor="middle">' + s.num + '</text>') + '</g>';
      if (s.label) sp += '<text class="mp-label' + (s.home ? ' home' : '') + '" x="' + r1(s.label.tx) + '" y="' + r1(s.label.ty) + '" text-anchor="' + s.label.a + '">' + esc(s.label.text) + '</text>';
    }
    g += sp;

    /* compass and scale */
    g += '<g class="mp-compass" transform="translate(' + (W - 24) + ' 26)"><circle r="13"/><path d="M0 -9 4 3 0 0 -4 3z"/><text y="-14.5" text-anchor="middle">N</text></g>';
    const kmStep = [20, 10, 5, 2, 1].find(k => F.pxKm * k <= 110) || 1;
    const sw = r1(F.pxKm * kmStep);
    g += '<g class="mp-scale" transform="translate(14 ' + (H - 16) + ')"><path d="M0 -4V0H' + sw + 'V-4"/><text x="' + r1(sw + 6) + '" y="0">' + kmStep + ' km</text></g>';
    return { svg: '<svg class="mp-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc('Map of ' + day.tab + ': ' + spots.length + ' spots') + '">' + g + '</svg>', spots };
  }

  /* ---------- whole-day route links for Google Maps (the app takes up to nine stops in between) ---------- */
  function routeLinks(vs) {
    const qs = [];
    for (const v of vs) {
      const A = G.areas[v.a];
      if (A.sea || A.rail || !v.q) continue;
      if (qs.length && qs[qs.length - 1].a === v.a) continue;
      qs.push({ a: v.a, q: v.q, n: A.n });
    }
    const links = [];
    for (let i = 0; i < qs.length - 1; i += 9) {
      const part = qs.slice(i, i + 10);
      if (part.length < 2) break;
      const mid = part.slice(1, -1).map(p => p.q).join('|');
      const url = 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(part[0].q) + '&destination=' + encodeURIComponent(part[part.length - 1].q) + (mid ? '&waypoints=' + encodeURIComponent(mid) : '') + '&travelmode=driving';
      links.push({ url, from: part[0].n, to: part[part.length - 1].n, stops: part.length });
    }
    return links;
  }

  /* ---------- the screen ---------- */
  function planSeg(day) {
    if (!day.variants) return '';
    const v = state.variant[day.id] || 'A';
    return '<div class="seg planseg mp-plan" role="group" aria-label="Plan for ' + esc(day.tab) + '"><button type="button" data-act="variant" data-day="' + day.id + '" data-v="A" aria-pressed="' + (v === 'A') + '">Plan A</button><button type="button" data-act="variant" data-day="' + day.id + '" data-v="B" aria-pressed="' + (v === 'B') + '">Plan B · ' + esc(day.variants.B.label) + '</button></div>';
  }
  function render(anim) {
    const L = live();
    const sel = DAY[ui.day] || dayOf(L.t);
    ui.day = sel.id;
    const today = ist(L.t).date;
    const vs = visits(sel);
    let body;
    if (vs.length < 2) {
      body = '<div class="mp-travel card"><span class="mp-tr-ic">' + ico(sel.id === 'tue' ? 'bus' : 'train') + '</span><div><b>' + esc(sel.id === 'tue' ? 'Travel day: Bagalkot to the coast' : 'Travel day: back to Bagalkot') + '</b><p class="note">' +
        esc(sel.id === 'tue' ? 'The VRL night bus leaves Bagalkot at 21:00 and reaches Udupi around 06:00 on Wednesday. The map starts there.' : '17378 runs overnight through the Ghats, Hassan and Hubballi, reaching Bagalkot at 07:58.') + '</p></div></div>';
    } else {
      const { svg, spots } = draw(sel, vs, anim);
      const links = routeLinks(vs);
      body = '<figure class="mp-card card' + (anim ? ' draw' : '') + '">' + svg + '<figcaption>Drawn by hand from public maps, north up; positions are approximate. Tap a numbered spot for its stop, or use the list below.</figcaption></figure>';
      body += '<div class="section"><div class="sec-head"><h2>The journey</h2><span class="label">' + spots.filter(s => !s.home).length + ' spots</span></div><ol class="jy card">' + vs.map(v => {
        const s = v.spot, A = G.areas[v.a];
        const names = v.items.filter(i => !isTravel(i)).map(i => i.x);
        const done = v.items.every(i => state.done[i.id]);
        return '<li class="jy-row' + (done ? ' done' : '') + (s.now && L.cur && v.items.some(i => i.id === L.cur.id) ? ' now' : '') + '"><span class="jy-badge' + (s.home ? ' home' : '') + '">' + (s.home ? ico('home') : s.num) + '</span>' +
          '<button class="jy-main" type="button" data-act="open" data-id="' + esc(v.main.id) + '"><span class="jy-t">' + esc(v.t) + '</span><b>' + esc(A.n) + '</b><span class="jy-what">' + esc(names.length ? names.join(' · ') : v.main.x) + '</span></button>' +
          (v.q && !A.sea ? '<a class="jy-go" href="' + esc(mapsUrl(v.q, v.main.m)) + '" target="_blank" rel="noopener" aria-label="Directions to ' + esc(A.n) + '">' + ico('pin') + '</a>' : '<span class="jy-go na" aria-hidden="true">' + ico(A.sea ? 'boat' : 'train') + '</span>') + '</li>';
      }).join('') + '</ol></div>';
      if (links.length) body += '<div class="section"><div class="sec-head"><h2>Ride it in Google Maps</h2></div><div class="mp-links">' + links.map((l, i) => '<a class="btn' + (i ? '' : ' primary') + '" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + ico('map') + (links.length > 1 ? 'Part ' + (i + 1) + ': ' : '') + esc(l.from + ' → ' + l.to) + '</a>').join('') + '</div><p class="note">Opens the whole route with every stop on the way. Switch Google Maps to two-wheeler mode if it offers it; the island and the trains are left out.</p></div>';
    }
    return screenOpen(anim) + strip(sel, today) + '<div class="day-body' + (anim === 'day' ? ' swap' : '') + '">' + heading('Map · ' + sel.eyebrow, sel.name, null) + planSeg(sel) + body + LOTUS + '</div></section>';
  }
  return { render, visits, routeLinks };
})();
