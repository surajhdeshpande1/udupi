/* Udupi Coast Trip: Kaavi art. Laterite line drawing on lime-white, with Yakshagana gold and kumkum accents. */
'use strict';
const ART = (() => {
  const r1 = n => Math.round(n * 10) / 10;
  const ln = (d, c) => '<path class="ln' + (c ? ' ' + c : '') + '" pathLength="1" d="' + d + '"/>';
  const fl = (d, c) => '<path class="fl ' + c + '" d="' + d + '"/>';
  const layer = (delay, inner) => '<g style="--d:' + delay + 's">' + inner + '</g>';
  const at = (x, y, s, inner) => '<g transform="translate(' + r1(x) + ' ' + r1(y) + ')' + (s && s !== 1 ? ' scale(' + s + ')' : '') + '">' + inner + '</g>';
  const circ = (cx, cy, r) => 'M' + r1(cx - r) + ' ' + r1(cy) + 'a' + r + ' ' + r + ' 0 1 0 ' + r1(2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + r1(-2 * r) + ' 0';
  const rect = (x, y, w, h) => 'M' + r1(x) + ' ' + r1(y) + 'h' + r1(w) + 'v' + r1(h) + 'h' + r1(-w) + 'z';
  const poly = pts => 'M' + pts.map(p => r1(p[0]) + ' ' + r1(p[1])).join('L') + 'z';

  /* ---------- pattern helpers ---------- */
  function waves(x1, x2, y, w, rows, gap) {
    let d = '';
    for (let r = 0; r < rows; r++) {
      let x = x1 + (r % 2 ? w / 2 : 0);
      const yy = y + r * gap;
      d += 'M' + r1(x) + ' ' + r1(yy);
      while (x + w <= x2 + 0.01) { d += 'q' + r1(w / 2) + ' ' + r1(-w * 0.42) + ' ' + r1(w) + ' 0'; x += w; }
    }
    return d;
  }
  function zig(x1, x2, y, h, n) {
    const step = (x2 - x1) / n;
    let d = 'M' + r1(x1) + ' ' + r1(y + h / 2);
    for (let i = 0; i < n; i++) d += 'L' + r1(x1 + step * (i + 0.5)) + ' ' + r1(y - h / 2) + 'L' + r1(x1 + step * (i + 1)) + ' ' + r1(y + h / 2);
    return d;
  }
  function dots(x1, x2, y, n, r) {
    let d = '';
    for (let i = 0; i < n; i++) d += circ(x1 + (x2 - x1) * (i + 0.5) / n, y, r);
    return d;
  }
  function lozenges(x1, x2, y, h, n) {
    let d = '';
    const w = (x2 - x1) / n;
    for (let i = 0; i < n; i++) { const cx = x1 + w * (i + 0.5); d += 'M' + r1(cx - w * 0.32) + ' ' + y + 'L' + r1(cx) + ' ' + r1(y - h / 2) + 'L' + r1(cx + w * 0.32) + ' ' + y + 'L' + r1(cx) + ' ' + r1(y + h / 2) + 'z'; }
    return d;
  }
  function hatch(x1, x2, y1, y2, gap, slope) {
    let d = '';
    for (let x = x1; x <= x2; x += gap) d += 'M' + r1(x) + ' ' + r1(y2) + 'l' + r1(slope) + ' ' + r1(y1 - y2);
    return d;
  }
  function paddy(x1, x2, y1, y2, gx, gy) {
    let d = '', row = 0;
    for (let y = y1; y <= y2; y += gy, row++) {
      for (let x = x1 + (row % 2 ? gx / 2 : 0); x <= x2; x += gx) d += 'M' + r1(x) + ' ' + r1(y) + 'v-3.6M' + r1(x) + ' ' + r1(y) + 'l-2.4-2.8M' + r1(x) + ' ' + r1(y) + 'l2.4-2.8';
    }
    return d;
  }
  const birds = (x, y, s) => 'M' + x + ' ' + y + 'q' + 3 * s + ' ' + -3 * s + ' ' + 6 * s + ' 0q' + 3 * s + ' ' + -3 * s + ' ' + 6 * s + ' 0';
  const spiralCloud = (x, y, s) => 'M' + r1(x) + ' ' + r1(y) + 'h' + r1(34 * s) + 'M' + r1(x + 4 * s) + ' ' + r1(y) + 'a' + r1(7 * s) + ' ' + r1(7 * s) + ' 0 0 1 ' + r1(13 * s) + ' -3a' + r1(8 * s) + ' ' + r1(8 * s) + ' 0 0 1 ' + r1(14 * s) + ' 3m' + r1(-20 * s) + ' -4a' + r1(3 * s) + ' ' + r1(3 * s) + ' 0 1 1 ' + r1(5 * s) + ' 2';

  /* ---------- motifs ---------- */
  function palm(x, y, h, lean) {
    const cx = x + lean, cy = y - h;
    let trunk = 'M' + x + ' ' + y + 'Q' + r1(x + lean * 0.15) + ' ' + r1(y - h * 0.55) + ' ' + r1(cx) + ' ' + r1(cy);
    let rings = '';
    for (let t = 0.12; t < 0.95; t += 0.11) {
      const px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * (x + lean * 0.15) + t * t * cx;
      const py = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y - h * 0.55) + t * t * cy;
      rings += 'M' + r1(px - 2.6) + ' ' + r1(py) + 'h5.2';
    }
    let fronds = '', leaf = '';
    const L = h * 0.42;
    [-198, -164, -132, -100, -70, -40, -8].forEach(a => {
      const rad = a * Math.PI / 180, ux = Math.cos(rad), uy = Math.sin(rad);
      const tx = cx + L * ux, ty = cy + L * uy + L * 0.22, qx = cx + L * 0.55 * ux, qy = cy + L * 0.55 * uy - L * 0.18;
      fronds += 'M' + r1(cx) + ' ' + r1(cy) + 'Q' + r1(qx) + ' ' + r1(qy) + ' ' + r1(tx) + ' ' + r1(ty);
      [0.4, 0.62, 0.82].forEach(t => {
        const px = (1 - t) * (1 - t) * cx + 2 * (1 - t) * t * qx + t * t * tx, py = (1 - t) * (1 - t) * cy + 2 * (1 - t) * t * qy + t * t * ty;
        leaf += 'M' + r1(px) + ' ' + r1(py) + 'l' + r1(ux * 1.5) + ' 4.2';
      });
    });
    const nuts = circ(cx - 3, cy + 4, 2.3) + circ(cx + 2.5, cy + 5, 2.3) + circ(cx - 0.2, cy + 8.2, 2.3);
    return ln(trunk) + ln(rings) + ln(fronds) + ln(leaf, 'thin') + fl(nuts, 'f-soft') + ln(nuts);
  }
  function lighthouse(x, base, h) {
    const bw = 22, tw = 13, top = base - h;
    const tower = poly([[x - bw / 2, base], [x - tw / 2, top], [x + tw / 2, top], [x + bw / 2, base]]);
    const band = (f1, f2) => { const w = t => bw - (bw - tw) * t; const y1 = base - h * f1, y2 = base - h * f2; return poly([[x - w(f1) / 2, y1], [x - w(f2) / 2, y2], [x + w(f2) / 2, y2], [x + w(f1) / 2, y1]]); };
    const bands = band(0.28, 0.4) + band(0.6, 0.72);
    const door = 'M' + (x - 3) + ' ' + base + 'v-7a3 3 0 0 1 6 0v7';
    const gallery = rect(x - tw / 2 - 4, top - 3, tw + 8, 3) + 'M' + (x - tw / 2 - 4) + ' ' + (top - 3) + 'v-4M' + (x + tw / 2 + 4) + ' ' + (top - 3) + 'v-4M' + (x - tw / 2 - 4) + ' ' + (top - 7) + 'h' + (tw + 8);
    const lamp = rect(x - 4.5, top - 13, 9, 9);
    const dome = 'M' + (x - 6) + ' ' + (top - 13) + 'a6 5 0 0 1 12 0M' + x + ' ' + (top - 18) + 'v-4';
    const rays = 'M' + (x - 9) + ' ' + (top - 10) + 'h-10M' + (x - 9) + ' ' + (top - 14) + 'l-8-5M' + (x + 9) + ' ' + (top - 10) + 'h10M' + (x + 9) + ' ' + (top - 14) + 'l8-5';
    return fl(bands, 'f-soft') + ln(tower) + ln(bands) + ln(door) + ln(gallery) + fl(lamp, 'f-gold') + ln(lamp) + ln(dome) + ln(rays, 'gold');
  }
  function rocks(x, y, w) {
    const d = 'M' + x + ' ' + y + 'q' + r1(w * 0.1) + ' -10 ' + r1(w * 0.28) + ' -9q' + r1(w * 0.12) + ' -7 ' + r1(w * 0.3) + ' -5q' + r1(w * 0.2) + ' -2 ' + r1(w * 0.26) + ' 5q' + r1(w * 0.1) + ' 4 ' + r1(w * 0.16) + ' 9';
    return fl(d + 'z', 'f-soft') + ln(d) + ln(hatch(x + w * 0.2, x + w * 0.8, y - 7, y - 1, 6, 3), 'thin');
  }
  function chariot() {
    /* Udupi's carved wooden ratha, drawn around its base centre (0,0). */
    let wheels = '', spokes = '';
    [-26, 26].forEach(cx => {
      wheels += circ(cx, -14, 13) + circ(cx, -14, 3.2);
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; spokes += 'M' + r1(cx + 3.2 * Math.cos(a)) + ' ' + r1(-14 + 3.2 * Math.sin(a)) + 'L' + r1(cx + 13 * Math.cos(a)) + ' ' + r1(-14 + 13 * Math.sin(a)); }
    });
    const plinth = rect(-46, -36, 92, 13);
    const tier = (yb, yt, half, n) => { let d = rect(-half, yt, 2 * half, yb - yt); for (let i = 1; i < n; i++) { const xx = -half + 2 * half * i / n; d += 'M' + r1(xx) + ' ' + yb + 'V' + yt; } return d; };
    const swags = (y, half, n) => { let d = ''; const w = 2 * half / n; for (let i = 0; i < n; i++) d += 'M' + r1(-half + w * i) + ' ' + y + 'q' + r1(w / 2) + ' 6 ' + r1(w) + ' 0'; return d; };
    const eave = (yb, yt, hb, ht) => poly([[-hb, yb], [-ht, yt], [ht, yt], [hb, yb]]);
    const e1 = eave(-56, -64, 46, 38), e2 = eave(-78, -85, 38, 29), e3 = eave(-97, -102, 29, 22);
    const dome = 'M-23 -102Q-26 -126 0 -129Q26 -126 23 -102M-11 -103Q-12 -120 0 -128M11 -103Q12 -120 0 -128';
    const kalasha = circ(0, -132, 3.6) + 'M0 -135.6v-8M-3 -137.5h6';
    const poles = 'M-43 -60L-52 -110M43 -60L52 -110';
    const flagL = poly([[-52, -110], [-66, -105], [-51.2, -100]]), flagR = poly([[52, -110], [66, -105], [51.2, -100]]);
    return fl(plinth + e1 + e2 + e3, 'f-soft') + fl(flagL, 'f-kum') + fl(flagR, 'f-gold') +
      ln(plinth) + ln(dots(-42, 42, -29.5, 12, 1.4), 'dot') + ln(tier(-36, -56, 38, 5)) + ln(swags(-52, 38, 5), 'thin') +
      ln(e1) + ln(zig(-38, 38, -60, 4, 12), 'thin') + ln(tier(-64, -78, 30, 4)) + ln(swags(-74, 30, 4), 'thin') +
      ln(e2) + ln(dots(-26, 26, -81.5, 8, 1.2), 'dot') + ln(tier(-85, -97, 22, 3)) + ln(e3) + ln(dome) + fl(kalasha, 'f-gold') + ln(kalasha) +
      ln(poles) + ln(flagL) + ln(flagR) + ln(wheels) + ln(spokes, 'thin');
  }
  function basalt() {
    /* St Mary's hexagonal basalt columns, base centre (0,0). */
    const cols = [[-50, 30], [-37, 42], [-24, 56], [-11, 64], [2, 58], [15, 70], [28, 54], [41, 44], [54, 32]];
    let faces = '', edges = '', tops = '', topFill = '';
    cols.forEach(([x, h], i) => {
      const w = 13;
      faces += rect(x, -h, w, h);
      edges += 'M' + r1(x + w * 0.5) + ' ' + (-h + 3) + 'V0';
      const hex = poly([[x, -h], [x + 3.2, -h - 3.6], [x + w - 3.2, -h - 3.6], [x + w, -h], [x + w - 3.2, -h + 3.6], [x + 3.2, -h + 3.6]]);
      tops += hex;
      if (i % 2) topFill += hex;
      faces += 'M' + r1(x) + ' ' + r1(-h * 0.55) + 'h' + r1(w * 0.5);
    });
    const shore = 'M-66 0q14-10 22-6M66 0q-12-9-18-5';
    return fl(topFill, 'f-gold-soft') + ln(faces) + ln(edges, 'thin') + ln(tops) + ln(shore);
  }
  function boat(x, y, s) {
    const hull = 'M-34 -8Q0 12 32 -11L28 -8Q0 4 -30 -6z';
    const top = 'M-34 -8L32 -11';
    const cabin = rect(-4, -21, 15, 11.5) + rect(0, -18, 3.5, 3.5) + rect(5.5, -18, 3.5, 3.5);
    const mast = 'M-16 -9.5V-48M-16 -48L22 -12';
    const flag = poly([[-16, -48], [-4, -44], [-16, -40]]);
    let bunting = '';
    for (let i = 1; i < 5; i++) { const t = i / 5, bx = -16 + 38 * t, by = -48 + 36 * t; bunting += poly([[bx, by], [bx + 3.4, by + 6.5], [bx + 6.4, by + 5.8]]); }
    return at(x, y, s, fl(hull, 'f-soft') + fl(flag, 'f-kum') + fl(bunting, 'f-gold') + ln(hull) + ln(top) + ln(cabin) + ln(mast) + ln(flag) + ln(bunting, 'thin'));
  }
  function bus() {
    /* Night bus, base centre (0,0), facing right. */
    const body = 'M-44 -8V-33q0-4 4-4H36q6 0 8 6l3 9v14z';
    let win = '';
    for (let i = 0; i < 6; i++) win += rect(-39 + i * 12, -32, 9, 9);
    const front = 'M37 -32l5 0q3 1 4 5l1 4H37z';
    const stripe = 'M-44 -18H47';
    const wheels = circ(-27, -8, 6.5) + circ(-27, -8, 2) + circ(27, -8, 6.5) + circ(27, -8, 2);
    const beam = 'M47 -14L92 -26L92 -2z';
    return fl(beam, 'f-beam') + fl(body, 'f-wall') + fl(win + front, 'f-gold-soft') + ln(body) + ln(win) + ln(front) + ln(stripe, 'kum') + fl(wheels, 'f-wall') + ln(wheels);
  }
  function cliffs(x1, x2, base, top, steps) {
    /* Badami-style red sandstone mesas with horizontal strata. */
    const w = x2 - x1;
    const d = 'M' + x1 + ' ' + base + 'L' + r1(x1 + w * 0.06) + ' ' + r1(top + 14) + 'L' + r1(x1 + w * 0.16) + ' ' + r1(top + 9) + 'L' + r1(x1 + w * 0.22) + ' ' + top + 'L' + r1(x1 + w * 0.7) + ' ' + top + 'L' + r1(x1 + w * 0.78) + ' ' + r1(top + 10) + 'L' + r1(x1 + w * 0.9) + ' ' + r1(top + 13) + 'L' + x2 + ' ' + base;
    let strata = '';
    for (let i = 1; i <= steps; i++) { const y = top + (base - top) * i / (steps + 1); const inset = (1 - i / (steps + 1)) * w * 0.12; strata += 'M' + r1(x1 + inset + w * 0.08) + ' ' + r1(y) + 'H' + r1(x2 - inset - w * 0.06); }
    let cracks = '';
    for (let i = 0; i < 4; i++) { const cx = x1 + w * (0.3 + i * 0.13); cracks += 'M' + r1(cx) + ' ' + r1(top + 3) + 'v' + r1(6 + (i % 2) * 5); }
    return fl(d + 'z', 'f-soft') + ln(d) + ln(strata, 'thin') + ln(cracks, 'thin');
  }
  function shikhara(x, base, s) {
    const d = 'M-9 0V-12H9V0M-9 -12Q-8 -30 0 -36Q8 -30 9 -12M-6 -20h12M-4.5 -27h9';
    const am = 'M-4 -36.5a4 2 0 0 0 8 0a4 2 0 0 0-8 0M0 -38.5v-4';
    return at(x, base, s, fl(d.split('M-6')[0] + 'z', 'f-wall') + ln(d) + ln(am));
  }
  function train(x, y, cars, s) {
    /* Engine facing right at the front (x), coaches trailing left; base at y. */
    let d = '', w = '', wh = '';
    const eng = 'M0 0V-17q0-3 3-3H26l7 7V0z';
    d += eng; w += rect(20, -16, 7, 6); wh += circ(7, 0, 2.6) + circ(25, 0, 2.6);
    for (let i = 0; i < cars; i++) {
      const cx = -4 - (i + 1) * 31;
      d += rect(cx, -16, 30, 16) + 'M' + (cx + 30) + ' -6h1';
      for (let k = 0; k < 4; k++) w += rect(cx + 3 + k * 7, -13, 4.6, 5);
      wh += circ(cx + 6, 0, 2.6) + circ(cx + 24, 0, 2.6);
    }
    return at(x, y, s, fl(d, 'f-wall') + fl(w, 'f-gold-soft') + ln(d) + ln(w, 'thin') + fl(wh, 'f-wall') + ln(wh));
  }
  function viaduct(x1, x2, deck, base, n) {
    const span = (x2 - x1) / n;
    let d = 'M' + x1 + ' ' + deck + 'H' + x2 + 'M' + x1 + ' ' + (deck + 4) + 'H' + x2;
    for (let i = 0; i < n; i++) {
      const a = x1 + span * i;
      d += 'M' + r1(a) + ' ' + base + 'V' + r1(deck + 12) + 'A' + r1(span / 2) + ' ' + r1(span / 2.4) + ' 0 0 1 ' + r1(a + span) + ' ' + r1(deck + 12) + 'V' + base;
    }
    return ln(d);
  }
  function station(x, base) {
    const platform = rect(x - 70, base - 7, 140, 7);
    const roof = poly([[x - 64, base - 52], [x - 56, base - 62], [x + 56, base - 62], [x + 64, base - 52]]);
    let tiles = '';
    for (let i = 0; i < 16; i++) tiles += 'M' + r1(x - 64 + i * 8) + ' ' + (base - 52) + 'a4 4 0 0 0 8 0';
    let rib = '';
    for (let i = 1; i < 14; i++) rib += 'M' + r1(x - 56 + i * 8) + ' ' + (base - 62) + 'l' + r1((i - 7) * 0.6) + ' 10';
    const pillars = 'M' + (x - 54) + ' ' + (base - 48) + 'V' + (base - 7) + 'M' + (x - 18) + ' ' + (base - 48) + 'V' + (base - 7) + 'M' + (x + 18) + ' ' + (base - 48) + 'V' + (base - 7) + 'M' + (x + 54) + ' ' + (base - 48) + 'V' + (base - 7);
    const board = rect(x - 30, base - 44, 60, 13);
    return fl(roof + platform, 'f-soft') + fl(board, 'f-gold-soft') + ln(roof) + ln(rib, 'thin') + ln(tiles) + ln(pillars) + ln(platform) + ln(hatch(x - 66, x + 66, base - 6, base - 1, 6, 2), 'thin') + ln(board) +
      '<text class="sc-txt" x="' + x + '" y="' + (base - 34.5) + '" text-anchor="middle" lang="kn">ಬಾಗಲಕೋಟೆ</text>';
  }
  function hills(pts, cls) {
    let d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x, y] = pts[i]; d += 'Q' + r1((x0 + x) / 2) + ' ' + r1(Math.min(y0, y) - 8) + ' ' + x + ' ' + y; }
    return ln(d, cls);
  }

  /* ---------- sun on the mural ---------- */
  const SUNCX = 180, SUNCY = 150, SRX = 160, SRY = 118;
  const sunPt = f => { const a = Math.PI * (1 - f); return [SUNCX + SRX * Math.cos(a), SUNCY - SRY * Math.sin(a)]; };
  const arcSeg = (f0, f1) => { const a = sunPt(Math.max(0, f0)), b = sunPt(Math.min(1, f1)); return 'M' + r1(a[0]) + ' ' + r1(a[1]) + 'A' + SRX + ' ' + SRY + ' 0 0 1 ' + r1(b[0]) + ' ' + r1(b[1]); };
  function sunLayer(s) {
    let h = '<path class="sky-arc" d="' + arcSeg(0, 1) + '"/>';
    if (s.gAm) h += '<path class="sky-gold" d="' + arcSeg(s.gAm[0], s.gAm[1]) + '"/>';
    if (s.gPm) h += '<path class="sky-gold" d="' + arcSeg(s.gPm[0], s.gPm[1]) + '"/>';
    if (s.night) {
      h += '<g class="moon"><path class="f-gold" d="' + circ(302, 38, 10) + '"/><path class="f-paper" d="' + circ(307, 34, 9) + '"/></g>';
      h += '<path class="stars" d="' + [[250, 30], [272, 56], [326, 66], [212, 46], [118, 34], [86, 58]].map(([x, y]) => 'M' + x + ' ' + (y - 2.5) + 'v5M' + (x - 2.5) + ' ' + y + 'h5').join('') + '"/>';
    } else {
      const f = Math.max(0, Math.min(1, s.f));
      const [x, y] = sunPt(f);
      h += '<path class="sky-past" d="' + arcSeg(0, Math.max(0.002, f)) + '"/>';
      let rays = '';
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; rays += 'M' + r1(9.5 * Math.cos(a)) + ' ' + r1(9.5 * Math.sin(a)) + 'L' + r1(13 * Math.cos(a)) + ' ' + r1(13 * Math.sin(a)); }
      h += '<g class="sun" data-f="' + r1(f * 1000) / 1000 + '" transform="translate(' + r1(x) + ' ' + r1(y) + ')"><circle class="sun-halo" r="19"/><path class="sun-rays" d="' + rays + '"/><circle class="sun-disc" r="7"/></g>';
    }
    return '<g class="sky">' + h + '</g>';
  }

  /* ---------- the five murals ---------- */
  const SCENES = {
    tue: () =>
      layer(0, cliffs(-6, 128, 150, 92, 5) + cliffs(214, 366, 150, 100, 4) + shikhara(62, 92, 0.9)) +
      layer(0.25, ln('M0 150H360M0 166H360', '') + ln(hatch(4, 356, 150, 166, 9, -5), 'thin') + ln('M20 182h24M76 182h24M132 182h24M188 182h24M244 182h24M300 182h24', 'dash')) +
      layer(0.5, at(170, 166, 1, bus())) +
      layer(0.8, ln(lozenges(0, 360, 194, 6, 24), 'thin')),
    wed: () =>
      layer(0, palm(34, 152, 82, 12) + ln('M0 152H236') + ln(lozenges(0, 230, 166, 7, 15), 'thin') + ln('M0 178H230', 'thin') + ln(dots(0, 230, 186, 23, 1.1), 'dot')) +
      layer(0.3, at(134, 152, 0.74, chariot())) +
      layer(0.55, rocks(254, 152, 66) + lighthouse(288, 145, 66) + ln(waves(236, 360, 164, 12, 4, 9)) + ln(birds(318, 92, 1.2) + birds(330, 104, 0.9), 'thin')),
    thu: () =>
      layer(0, palm(250, 104, 46, 6) + palm(274, 108, 40, -5) + ln(waves(-6, 366, 160, 14, 4, 10)) + ln('M0 150H360', 'thin')) +
      layer(0.3, at(250, 150, 0.95, basalt())) +
      layer(0.55, boat(84, 154, 1.1) + ln(birds(130, 88, 1.3) + birds(146, 98, 1), 'thin') + ln(spiralCloud(40, 72, 1), 'thin')),
    fri: () =>
      layer(0, hills([[0, 116], [70, 104], [150, 114], [230, 98], [300, 110], [360, 100]]) + hills([[0, 132], [90, 124], [180, 132], [270, 122], [360, 130]], 'thin') + ln('M14 120h40M110 124h56M250 118h48', 'mist')) +
      layer(0.25, viaduct(140, 340, 96, 128, 5) + train(306, 96, 4, 0.92)) +
      layer(0.5, ln('M30 200Q80 170 132 160T206 140', '') + ln('M62 200Q104 176 150 166T214 146', '') + ln('M70 186h10M106 170h12M150 158h10', 'thin') +
        ln(paddy(6, 96, 160, 196, 11, 9), 'thin') + ln(paddy(176, 352, 156, 196, 12, 9), 'thin') + ln('M0 150H40M226 146H360', 'thin')),
    sat: () =>
      layer(0, cliffs(-6, 140, 136, 84, 4) + cliffs(236, 366, 136, 94, 4)) +
      layer(0.25, station(208, 150) + ln('M0 158H360M0 164H360', '') + ln(hatch(2, 358, 158, 164, 7, 0), 'thin')) +
      layer(0.5, train(118, 156, 2, 0.95) + ln(lozenges(0, 360, 186, 7, 24), 'thin'))
  };
  const sceneCache = {};
  function scene(id, sun) {
    if (!sceneCache[id]) sceneCache[id] = (SCENES[id] || SCENES.wed)();
    return '<svg class="scene-svg" viewBox="0 0 360 200" role="img" aria-hidden="true">' + sunLayer(sun) + '<g class="art">' + sceneCache[id] + '</g></svg>';
  }

  /* ---------- medallions (day stamps) ---------- */
  function medalMotif(id) {
    switch (id) {
      case 'tue': return '<path d="M-6 -12a13 13 0 1 0 14 17a10 10 0 1 1-14-17z"/><path d="M9 -10l1.6 3.6 3.8.4-2.9 2.6.9 3.8-3.4-2-3.4 2 .9-3.8-2.9-2.6 3.8-.4z"/>';
      case 'wed': { let d = ''; for (let i = 0; i < 8; i++) d += '<path transform="rotate(' + i * 45 + ')" d="M0 -3C5 -8 4 -16 0 -19C-4 -16 -5 -8 0 -3z"/>'; return d + '<circle r="4"/>'; }
      case 'thu': return '<path d="M-15 0C-8 -10 6 -10 12 0C6 10 -8 10 -15 0z"/><path d="M12 0l7-6v12z"/><circle cx="-8" cy="-1.5" r="1.6"/><path d="M-3 -5a5 5 0 0 1 0 10M2 -5.5a5 5 0 0 1 0 11"/>';
      case 'fri': { let d = '<circle r="15"/><circle r="4"/>'; for (let i = 0; i < 8; i++) d += '<path transform="rotate(' + i * 45 + ')" d="M0 -4V-15"/>'; return d; }
      default: return '<path d="M-10 -2C-10 10 10 10 10 -2z"/><path d="M-12 -2h24M-6 -6h12v4h-12z"/><path d="M0 -6c-6-4-12-2-14 2M0 -6c6-4 12-2 14 2M0 -6c-2-5-1-9 3-11"/><circle cx="0" cy="-12" r="4"/>';
    }
  }
  const MEDAL_TEXT = { tue: 'LIFT-OFF · BAGALKOT · 6 OCT', wed: 'TEMPLE TOWN · UDUPI · 7 OCT', thu: 'ISLAND & SEA · MALPE · 8 OCT', fri: 'VALLEY & TRAINS · 9 OCT', sat: 'HOME · BAGALKOT · 10 OCT' };
  function medal(id, uid) {
    const pid = 'mp-' + id + '-' + uid;
    let ring = '';
    for (let i = 0; i < 28; i++) { const a = i * Math.PI * 2 / 28; ring += '<circle cx="' + r1(33.2 * Math.cos(a)) + '" cy="' + r1(33.2 * Math.sin(a)) + '" r=".9"/>'; }
    return '<svg class="medal" viewBox="-40 -40 80 80" aria-hidden="true"><g class="ink"><circle class="m-ring" r="37"/><circle class="m-ring" r="29.5"/>' + ring +
      '<path id="' + pid + '" d="M-24 0a24 24 0 1 1 48 0a24 24 0 1 1-48 0" fill="none" stroke="none"/><text class="m-txt"><textPath href="#' + pid + '" startOffset="0">' + MEDAL_TEXT[id] + '</textPath></text>' +
      '<g class="m-motif" transform="scale(.82)">' + medalMotif(id) + '</g></g></svg>';
  }

  /* ---------- small ornaments ---------- */
  const kirita = () => '<svg class="kirita" viewBox="0 0 64 26" aria-hidden="true"><path class="k-fan" d="M6 24C6 12 18 4 32 4s26 8 26 20z"/><path class="k-line" d="M6 24C6 12 18 4 32 4s26 8 26 20M14 24c0-8 8-14 18-14s18 6 18 14M32 4V0"/>' +
    '<g class="k-dots"><circle cx="12" cy="17" r="1.4"/><circle cx="19" cy="10.5" r="1.4"/><circle cx="32" cy="7" r="1.4"/><circle cx="45" cy="10.5" r="1.4"/><circle cx="52" cy="17" r="1.4"/></g><circle class="k-jewel" cx="32" cy="18" r="3.4"/><path class="k-base" d="M2 24h60"/></svg>';
  const kindi = cls => '<svg class="' + (cls || 'kindi') + '" viewBox="0 0 26 30" aria-hidden="true"><path class="kd-f" d="M3 28.5V12a10 10 0 0 1 20 0v16.5z"/><g class="kd-h"><circle cx="13" cy="7.2" r="1.6"/>' +
    [11.1, 16.7, 22.3].map(y => [5.6, 11.2, 16.8].map(x => '<rect x="' + x + '" y="' + y + '" width="3.6" height="3.6" rx=".9"/>').join('')).join('') + '</g></svg>';
  const MOODS = [
    ['radiant', 'Radiant', '<circle cx="12" cy="12" r="4.2"/><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7"/>'],
    ['bright', 'Bright', '<circle cx="9" cy="9" r="3.4"/><path d="M9 2.8v1.6M2.8 9h1.6M4.6 4.6l1.1 1.1M13.4 4.6l-1.1 1.1"/><path d="M8 19.5h9.5a3.5 3.5 0 0 0 .4-7a5 5 0 0 0-9.4 1.3A2.9 2.9 0 0 0 8 19.5z"/>'],
    ['calm', 'Calm', '<path d="M3 9.5c2.2 0 2.2-1.8 4.5-1.8s2.2 1.8 4.5 1.8 2.2-1.8 4.5-1.8 2.3 1.8 4.5 1.8M3 14.5c2.2 0 2.2-1.8 4.5-1.8s2.2 1.8 4.5 1.8 2.2-1.8 4.5-1.8 2.3 1.8 4.5 1.8"/>'],
    ['tired', 'Tired', '<path d="M18.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 9 10z"/><path d="M15 4h3l-3 3.5h3"/>'],
    ['stormy', 'Stormy', '<path d="M7 15.5h10a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 8 9.8 2.9 2.9 0 0 0 7 15.5z"/><path d="M12.5 15.5 11 18.5h2.5L12 21.5"/>']
  ];
  /* A marigold for the garland and the check-off bloom: two rings of petals round a kumkum heart. */
  function marigold(r) {
    let a = '', b = '';
    for (let i = 0; i < 10; i++) { const t = i * Math.PI / 5; a += circ(r * 0.6 * Math.cos(t), r * 0.6 * Math.sin(t), r1(r * 0.42)); }
    for (let i = 0; i < 6; i++) { const t = i * Math.PI / 3 + 0.5; b += circ(r * 0.3 * Math.cos(t), r * 0.3 * Math.sin(t), r1(r * 0.34)); }
    return '<path class="pt" d="' + a + '"/><path class="pt" d="' + b + '"/><circle class="ct" r="' + r1(Math.max(0.9, r * 0.26)) + '"/>';
  }
  /* The lotus that closes every screen. */
  const lotus = () => '<div class="orn" aria-hidden="true"><i></i><svg viewBox="0 0 26 26"><path class="lp" d="M13 4C16.2 8 16.2 14 13 18.5C9.8 14 9.8 8 13 4z"/><path class="lp" d="M13 18.5C9 17.8 5.2 14 4.2 9.6C8.4 10.2 11.4 13 13 18.5zM13 18.5C17 17.8 20.8 14 21.8 9.6C17.6 10.2 14.6 13 13 18.5z"/><path class="lp" d="M13 18.5C9.4 20 4.6 19.4 2.2 16.2C6.4 15 10.2 16 13 18.5zM13 18.5C16.6 20 21.4 19.4 23.8 16.2C19.6 15 15.8 16 13 18.5z"/><circle class="lc" cx="13" cy="21.6" r="1.7"/></svg><i></i></div>';
  /* Drawing kit shared with the stop pictures in vignettes.js. */
  const kit = { r1, ln, fl, layer, at, circ, rect, poly, waves, zig, dots, lozenges, hatch, paddy, birds, spiralCloud, palm, lighthouse, rocks, chariot, basalt, boat, bus, train, viaduct, hills };
  return { scene, medal, kirita, kindi, marigold, lotus, MOODS, sunPt, arcSeg, kit };
})();
