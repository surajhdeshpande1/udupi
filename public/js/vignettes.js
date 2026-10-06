/* Udupi Coast Trip: a Kaavi picture for every stop. Each scene is drawn in laterite line on lime plaster,
   and its sky follows the stop's time of day, from dawn gold to a lamp-lit night. */
'use strict';
const VG = (() => {
  const { r1, ln, fl, layer, at, circ, rect, poly, waves, hatch, paddy, birds, palm, lighthouse, rocks, chariot, basalt, boat, bus, train, hills } = ART.kit;
  const HZ = 62;

  /* ---------- time of day ---------- */
  const PHASES = ['night', 'dawn', 'morning', 'noon', 'afternoon', 'golden', 'dusk'];
  function phaseOf(hm) {
    const [h, m] = String(hm || '12:00').split(':').map(Number);
    const t = h * 60 + m;
    if (t < 340 || t >= 1145) return 'night';
    if (t < 410) return 'dawn';
    if (t < 630) return 'morning';
    if (t < 870) return 'noon';
    if (t < 1035) return 'afternoon';
    if (t < 1100) return 'golden';
    return 'dusk';
  }

  /* ---------- sky ---------- */
  const SUN = { dawn: [30, 52, 6.5], morning: [34, 22, 5.5], noon: [80, 17, 5.5], afternoon: [124, 24, 5.5], golden: [118, 47, 8.5], dusk: [126, 58, 7.5] };
  const starPath = pts => '<path class="vg-star" d="' + pts.map(([a, b]) => 'M' + r1(a) + ' ' + r1(b - 1.7) + 'v3.4M' + r1(a - 1.7) + ' ' + r1(b) + 'h3.4').join('') + '"/>';
  function orb(ph, x, y, r, small) {
    if (ph === 'night') {
      const moon = fl(circ(x, y, r), 'f-gold') + fl(circ(x + r * 0.55, y - r * 0.35, r * 0.86), 'f-cut');
      return moon + (small ? starPath([[x - r * 3, y + r * 1.4]]) : starPath([[x - 34, y + 8], [x - 18, y - 6], [x - 58, y - 2], [x - 84, y + 12], [x + 14, y + 16]]));
    }
    let rays = '';
    if (!small && ph !== 'golden' && ph !== 'dusk') for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; rays += 'M' + r1(x + (r + 2.6) * Math.cos(a)) + ' ' + r1(y + (r + 2.6) * Math.sin(a)) + 'L' + r1(x + (r + 5.2) * Math.cos(a)) + ' ' + r1(y + (r + 5.2) * Math.sin(a)); }
    return '<circle class="vg-halo" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r1(r * (ph === 'golden' || ph === 'dusk' ? 2.8 : 2.2)) + '"/>' + (rays ? '<path class="vg-rays" d="' + rays + '"/>' : '') + '<circle class="vg-sun" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r + '"/>';
  }
  const sky = (ph, pos) => {
    if (ph === 'night') { const [x, y] = pos || [126, 21]; return orb(ph, x, y, 6); }
    const s = SUN[ph], p = pos || s;
    return orb(ph, p[0], p[1], s[2]);
  };
  const cloud = (x, y, s) => ln('M' + r1(x) + ' ' + r1(y) + 'h' + r1(26 * s) + 'M' + r1(x + 4 * s) + ' ' + r1(y) + 'a' + r1(5 * s) + ' ' + r1(5 * s) + ' 0 0 1 ' + r1(9 * s) + ' -2.5a' + r1(6 * s) + ' ' + r1(6 * s) + ' 0 0 1 ' + r1(11 * s) + ' 2.5', 'thin');

  /* ---------- ground ---------- */
  const sea = (y = HZ, x1 = 0, x2 = 160) => fl(rect(x1, y, x2 - x1, 100 - y), 'f-sea') + ln('M' + x1 + ' ' + y + 'H' + x2) + ln(waves(x1 + 6, x2 - 6, y + 9, 12, 3, 9), 'thin');
  const sand = (y, bow = 6) => { const d = 'M-2 ' + y + 'Q80 ' + r1(y - bow) + ' 162 ' + y; return fl(d + 'V102H-2z', 'f-sand') + ln(d); };
  const road = y => fl(rect(-2, y, 164, 102 - y), 'f-road') + ln('M-2 ' + y + 'H162') + ln('M6 ' + r1(y + 8) + 'h16M42 ' + r1(y + 8) + 'h16M78 ' + r1(y + 8) + 'h16M114 ' + r1(y + 8) + 'h16M150 ' + r1(y + 8) + 'h12', 'dash');
  const floor = y => fl(rect(-2, y, 164, 102 - y), 'f-floor') + ln('M-2 ' + y + 'H162') + ln(hatch(2, 158, y + 1, 101, 10, 8), 'thin');
  const grass = (x1, x2, y) => { let d = ''; for (let x = x1; x <= x2; x += 7) d += 'M' + x + ' ' + y + 'l-2-5M' + x + ' ' + y + 'l2.4-5.5M' + x + ' ' + y + 'v-6'; return ln(d, 'thin'); };

  /* ---------- small motifs ---------- */
  function arch(x, y, w, h) { const r = w / 2; return 'M' + r1(x) + ' ' + r1(y + h) + 'V' + r1(y + r) + 'A' + r1(r) + ' ' + r1(r) + ' 0 0 1 ' + r1(x + w) + ' ' + r1(y + r) + 'V' + r1(y + h) + 'Z'; }
  /* An arched window that shows the stop's sky: sun, moon or golden light. */
  function win(ph, x, y, w, h) {
    const cx = x + w * 0.6, cy = y + h * (ph === 'dawn' || ph === 'golden' || ph === 'dusk' ? 0.62 : 0.42);
    const o = ph === 'night' ? orb('night', cx, cy, w * 0.13, true) : orb(ph, cx, cy, w * 0.11, true);
    return fl(arch(x, y, w, h), 'f-win') + o + ln('M' + r1(x + w / 2) + ' ' + r1(y + 2) + 'V' + r1(y + h) + 'M' + r1(x) + ' ' + r1(y + h * 0.6) + 'H' + r1(x + w), 'thin') + ln(arch(x, y, w, h)) + ln('M' + r1(x - 3) + ' ' + r1(y + h + 2) + 'h' + r1(w + 6));
  }
  function house(x, base, w, h) {
    const rh = 11;
    const roof = poly([[x - 5, base - h], [x + w / 2, base - h - rh], [x + w + 5, base - h]]);
    let tiles = '';
    const n = Math.max(3, Math.round((w + 10) / 6)), tw = (w + 10) / n;
    for (let i = 0; i < n; i++) tiles += 'M' + r1(x - 5 + i * tw) + ' ' + (base - h) + 'a' + r1(tw / 2) + ' 2.2 0 0 0 ' + r1(tw) + ' 0';
    const body = rect(x, base - h, w, h);
    const door = 'M' + r1(x + w / 2 - 3.5) + ' ' + base + 'v-9a3.5 3.5 0 0 1 7 0v9';
    const wins = rect(x + 3.5, base - h + 4.5, 5.5, 5.5) + rect(x + w - 9, base - h + 4.5, 5.5, 5.5);
    return fl(roof, 'f-roof') + fl(body, 'f-paper') + ln(body) + ln(roof) + ln(tiles, 'thin') + fl(wins, 'f-win') + ln(wins, 'thin') + ln(door);
  }
  const lampPost = (x, base, h, lit) => (lit ? '<circle class="vg-glow" cx="' + x + '" cy="' + r1(base - h - 3) + '" r="10"/>' : '') + ln('M' + x + ' ' + base + 'V' + r1(base - h) + 'M' + r1(x - 3.5) + ' ' + r1(base - h) + 'h7') + fl(circ(x, base - h - 3, 2.5), 'f-gold') + ln(circ(x, base - h - 3, 2.5), 'thin');
  function auto(night) {
    const shell = 'M-28 -7V-24Q-28 -36 -14 -37H10Q22 -37 27 -24L30 -7Z';
    const front = 'M12 -35Q21 -34 25.5 -24H12Z';
    const door = 'M-21 -25H6V-10H-21Z';
    const wheels = circ(-17, -5, 5.5) + circ(20, -5, 5.5);
    const beam = night ? fl('M31 -15L74 -25V-4z', 'f-beam') : '';
    return beam + fl(shell, 'f-auto') + fl(door, 'f-cut2') + fl(front, 'f-win') + ln(shell) + ln('M-28 -27.5H25.5') + ln(front) + ln(door) + ln('M-19 -15H4', 'thin') + ln('M6 -25V-7') + fl(wheels, 'f-paper') + ln(wheels) + ln(circ(-17, -5, 1.6) + circ(20, -5, 1.6), 'thin') + fl(circ(29.6, -15, 1.9), 'f-gold') + ln(circ(29.6, -15, 1.9), 'thin');
  }
  function bed(x, base, w, blanket) {
    const frame = 'M' + x + ' ' + base + 'V' + (base - 22) + 'M' + (x + w) + ' ' + base + 'V' + (base - 13);
    const mat = rect(x, base - 11, w, 5.5);
    const bl = 'M' + r1(x + w * 0.34) + ' ' + (base - 11) + 'q' + r1(w * 0.3) + ' -5 ' + r1(w * 0.66) + ' -0.5v6h' + r1(-w * 0.66) + 'z';
    const pil = 'M' + (x + 2.5) + ' ' + (base - 11) + 'q1 -5.5 6.5 -5.5h5.5q4.5 0 4.5 5.5z';
    return fl(mat, 'f-paper') + fl(bl, blanket || 'f-kumsoft') + fl(pil, 'f-paper') + ln(frame) + ln(mat) + ln(bl) + ln(pil);
  }
  const zzz = (x, y) => ln('M' + x + ' ' + y + 'h4.5l-4.5 5h4.5M' + (x + 7) + ' ' + (y - 8) + 'h3.6l-3.6 4h3.6M' + (x + 13) + ' ' + (y - 14) + 'h2.8l-2.8 3.2h2.8', 'gold');
  function coffee(x, base) {
    const dab = 'M' + (x - 11) + ' ' + (base - 5) + 'Q' + (x - 10) + ' ' + base + ' ' + x + ' ' + base + 'Q' + (x + 10) + ' ' + base + ' ' + (x + 11) + ' ' + (base - 5) + 'Z';
    const tum = poly([[x - 5.5, base - 5], [x - 7, base - 21], [x + 7, base - 21], [x + 5.5, base - 5]]);
    const steam = 'M' + (x - 3) + ' ' + (base - 24) + 'q-2.4 -3 0 -6t0 -6M' + (x + 3) + ' ' + (base - 25) + 'q-2.4 -3 0 -6t0 -6';
    return fl(dab + tum, 'f-steel') + ln(dab) + ln(tum) + ln('M' + (x - 7.6) + ' ' + (base - 21) + 'h15.2') + ln(steam, 'gold');
  }
  function leaf(x, y, w, h) {
    const d = 'M' + r1(x - w / 2) + ' ' + y + 'C' + r1(x - w / 2) + ' ' + r1(y - h) + ' ' + r1(x + w / 2) + ' ' + r1(y - h * 1.1) + ' ' + r1(x + w / 2) + ' ' + r1(y - 2) + 'C' + r1(x + w / 2) + ' ' + r1(y + h * 0.7) + ' ' + r1(x - w / 2) + ' ' + r1(y + h * 0.75) + ' ' + r1(x - w / 2) + ' ' + y + 'Z';
    let veins = '';
    for (let i = 1; i < 8; i++) { const vx = x - w / 2 + w * i / 8; veins += 'M' + r1(vx) + ' ' + r1(y - 1 - i * 0.12) + 'l' + r1(w * 0.04) + ' ' + r1(-h * 0.45) + 'M' + r1(vx) + ' ' + r1(y - 1 - i * 0.12) + 'l' + r1(w * 0.04) + ' ' + r1(h * 0.4); }
    return fl(d, 'f-leaf') + ln(d) + ln('M' + r1(x - w / 2 + 3) + ' ' + y + 'L' + r1(x + w / 2 - 3) + ' ' + (y - 2), 'thin') + ln(veins, 'thin');
  }
  const bowl = (x, y, r, f) => fl(circ(x, y, r), f) + ln(circ(x, y, r)) + ln(circ(x, y, r * 0.55), 'thin');
  function dosa(x, y) {
    const d = 'M' + (x - 24) + ' ' + (y + 3) + 'L' + (x + 20) + ' ' + (y - 6) + 'Q' + (x + 25) + ' ' + (y - 1) + ' ' + (x + 21) + ' ' + (y + 4) + 'Z';
    return fl(d, 'f-goldsoft') + ln(d) + ln('M' + (x - 14) + ' ' + (y + 1.4) + 'L' + (x + 19) + ' ' + (y - 5) + 'M' + (x - 4) + ' ' + (y + 2.6) + 'l3 -5M' + (x + 8) + ' ' + y + 'l3 -4.6', 'thin');
  }
  function sundae(x, base) {
    const top = base - 42, bot = base - 9;
    const hw = y => 6 + 3.5 * (bot - y) / (bot - top);
    const band = (y1, y2) => poly([[x - hw(y1), y1], [x - hw(y2), y2], [x + hw(y2), y2], [x + hw(y1), y1]]);
    const glass = band(top, bot);
    const scoop = 'M' + (x - 9.5) + ' ' + top + 'q0 -10 9.5 -10t9.5 10z';
    return fl(band(bot - 9, bot), 'f-kumsoft') + fl(band(bot - 18, bot - 9), 'f-goldsoft') + fl(band(bot - 26, bot - 18), 'f-leaf') + fl(band(top, bot - 26), 'f-paper') +
      fl(scoop, 'f-paper') + ln(scoop) + ln('M' + (x - 7) + ' ' + (top - 4) + 'q3.5 3 7 0t7 0', 'kum') + fl(circ(x + 2, top - 13, 2.6), 'f-kum') + ln(circ(x + 2, top - 13, 2.6), 'thin') +
      ln(glass) + ln('M' + (x - hw(bot - 9)) + ' ' + (bot - 9) + 'H' + (x + hw(bot - 9)) + 'M' + (x - hw(bot - 18)) + ' ' + (bot - 18) + 'H' + (x + hw(bot - 18)) + 'M' + (x - hw(bot - 26)) + ' ' + (bot - 26) + 'H' + (x + hw(bot - 26)), 'thin') +
      ln('M' + x + ' ' + bot + 'V' + (base - 2) + 'M' + (x - 8) + ' ' + base + 'h16') + ln('M' + (x + 7) + ' ' + (top - 4) + 'L' + (x + 15) + ' ' + (top - 17));
  }
  function plate(x, y, rx, food) {
    const p = 'M' + (x - rx) + ' ' + y + 'a' + rx + ' ' + r1(rx * 0.32) + ' 0 1 0 ' + 2 * rx + ' 0a' + rx + ' ' + r1(rx * 0.32) + ' 0 1 0 ' + -2 * rx + ' 0';
    return fl(p, 'f-paper') + ln(p) + (food || '');
  }
  function tree(x, base, r) {
    const c = circ(x, base - r * 2.1, r) + circ(x - r * 0.8, base - r * 1.6, r * 0.75) + circ(x + r * 0.85, base - r * 1.55, r * 0.8);
    return fl(c, 'f-leaf') + ln('M' + x + ' ' + base + 'V' + r1(base - r * 1.4) + 'M' + x + ' ' + r1(base - r * 1.2) + 'l' + r1(r * 0.5) + ' ' + r1(-r * 0.5), '') + ln(c);
  }
  function shack(x, base) {
    const roof = poly([[x - 22, base - 22], [x, base - 37], [x + 22, base - 22]]);
    const counter = rect(x - 15, base - 11, 30, 11);
    const nuts = circ(x - 8, base - 14, 3.2) + circ(x - 1, base - 14.5, 3.2) + circ(x + 6, base - 14, 3.2);
    return fl(roof, 'f-roof') + ln(roof) + ln(hatch(x - 15, x + 15, base - 34, base - 23, 4.5, 3.5), 'thin') + ln('M' + (x - 17) + ' ' + (base - 22) + 'V' + base + 'M' + (x + 17) + ' ' + (base - 22) + 'V' + base) +
      fl(counter, 'f-paper') + ln(counter) + fl(nuts, 'f-leaf') + ln(nuts) + ln('M' + (x + 6) + ' ' + (base - 17) + 'l3 -6', 'kum');
  }
  function backpack(x, base, s) {
    const body = 'M-13 0V-29Q-13 -39 0 -39Q13 -39 13 -29V0Z';
    const pocket = 'M-9 -2V-13Q-9 -16 -6 -16H6Q9 -16 9 -13V-2Z';
    return at(x, base, s, fl(body, 'f-kumsoft') + fl(pocket, 'f-paper') + ln(body) + ln(pocket) + ln('M-13 -27Q0 -21 13 -27', 'thin') + ln('M-4 -39q4 -6 8 0') + ln('M-5 -9h10', 'thin') + ln('M-16 -24v18M16 -24v18', 'thin'));
  }
  function flag(x, base, h, f) { const p = poly([[x, base - h], [x + 11, base - h + 4], [x, base - h + 8]]); return ln('M' + x + ' ' + base + 'V' + (base - h)) + fl(p, f || 'f-kum') + ln(p, 'thin'); }
  function deepa(x, base, h) {
    let rings = '', fl2 = '';
    for (let i = 0; i < 5; i++) { const y = base - 8 - i * (h - 12) / 4, w = 9 - i * 1.2; rings += 'M' + r1(x - w) + ' ' + r1(y) + 'h' + r1(2 * w); fl2 += 'M' + r1(x - w) + ' ' + r1(y) + 'q-1.4 -2.4 0 -4.2q1.4 1.8 0 4.2M' + r1(x + w) + ' ' + r1(y) + 'q-1.4 -2.4 0 -4.2q1.4 1.8 0 4.2'; }
    return ln('M' + (x - 5) + ' ' + base + 'h10M' + x + ' ' + base + 'V' + (base - h)) + ln(rings) + fl(fl2, 'f-gold') + ln(fl2, 'thin') + fl(circ(x, base - h - 2.5, 2.5), 'f-gold') + ln(circ(x, base - h - 2.5, 2.5), 'thin');
  }
  function stringLights(x1, x2, y, sag) {
    const d = 'M' + x1 + ' ' + y + 'Q' + r1((x1 + x2) / 2) + ' ' + r1(y + sag * 2) + ' ' + x2 + ' ' + y;
    let b = '', g = '';
    for (let i = 1; i < 8; i++) { const t = i / 8, bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * (x1 + x2) / 2 + t * t * x2, by = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + sag * 2) + t * t * y; b += circ(bx, by + 2.4, 1.6); g += '<circle class="vg-glow s" cx="' + r1(bx) + '" cy="' + r1(by + 2.4) + '" r="5"/>'; }
    return g + ln(d, 'thin') + fl(b, 'f-gold') + ln(b, 'thin');
  }
  function phone(x, y, scr) {
    const body = 'M' + (x - 13) + ' ' + (y - 24) + 'q0-4 4-4h18q4 0 4 4v44q0 4-4 4h-18q-4 0-4-4z';
    const screen = rect(x - 10, y - 24, 20, 40);
    return fl(body, 'f-paper') + fl(screen, 'f-win') + ln(body) + ln(screen, 'thin') + ln('M' + (x - 3) + ' ' + (y + 20.5) + 'h6', 'thin') + (scr || '');
  }
  function station(x, base, name) {
    const platform = rect(x - 62, base - 6, 124, 6);
    const roof = poly([[x - 58, base - 44], [x - 50, base - 53], [x + 50, base - 53], [x + 58, base - 44]]);
    let tiles = '';
    for (let i = 0; i < 14; i++) tiles += 'M' + r1(x - 58 + i * 116 / 14) + ' ' + (base - 44) + 'a' + r1(58 / 14) + ' 3 0 0 0 ' + r1(116 / 14) + ' 0';
    const pillars = [-48, -16, 16, 48].map(dx => 'M' + (x + dx) + ' ' + (base - 41) + 'V' + (base - 6)).join('');
    const board = rect(x - 26, base - 38, 52, 12);
    const clock = circ(x + 34, base - 33, 4.2);
    return fl(roof + platform, 'f-soft') + fl(board, 'f-goldsoft') + ln(roof) + ln(tiles, 'thin') + ln(pillars) + ln(platform) + ln(board) + fl(clock, 'f-paper') + ln(clock) + ln('M' + (x + 34) + ' ' + (base - 35.6) + 'v2.6l1.8 1.2', 'thin') +
      '<text class="vg-txt" x="' + x + '" y="' + (base - 29.3) + '" text-anchor="middle" lang="kn">' + name + '</text>';
  }
  function kayak(x, y) {
    const hull = 'M' + (x - 30) + ' ' + y + 'Q' + x + ' ' + (y + 7) + ' ' + (x + 30) + ' ' + y + 'Q' + x + ' ' + (y + 2) + ' ' + (x - 30) + ' ' + y + 'Z';
    const pad = 'M' + (x - 16) + ' ' + (y + 6) + 'L' + (x + 14) + ' ' + (y - 22);
    const blades = poly([[x - 18.5, y + 8.5], [x - 14, y + 4], [x - 12.5, y + 5.6], [x - 17, y + 10]]) + poly([[x + 12, y - 21], [x + 16.5, y - 25.5], [x + 18, y - 24], [x + 13.5, y - 19.5]]);
    return fl(hull, 'f-auto') + ln(hull) + ln('M' + (x - 2) + ' ' + (y + 2.5) + 'L' + (x + 1) + ' ' + (y - 9)) + fl(circ(x + 1.5, y - 12.5, 3.2), 'f-paper') + ln(circ(x + 1.5, y - 12.5, 3.2)) + ln(pad) + fl(blades, 'f-kum') + ln(blades, 'thin');
  }
  function mangrove(x, base, s) {
    const crown = circ(-8, -30, 9) + circ(4, -34, 10) + circ(14, -27, 8) + circ(-16, -24, 7);
    const roots = 'M0 -18Q-4 -8 -12 0M0 -18Q-1 -8 -4 0M0 -18Q3 -8 6 0M0 -18Q6 -8 14 0M-6 -14Q-12 -6 -18 0';
    return at(x, base, s, fl(crown, 'f-leaf') + ln(crown) + ln('M0 -18V-28M0 -24l6 -6M0 -22l-7 -5') + ln(roots));
  }
  function person(x, base, s, pose) {
    const head = circ(0, -26, 3.4);
    const body = pose === 'crouch' ? 'M0 -22L-2 -12L6 -6M-2 -12L-8 -3M0 -19L8 -21M0 -19L-8 -15' : 'M0 -22V-9M0 -9L-4 0M0 -9L4 0M0 -19L-6 -13M0 -19L6 -13';
    return at(x, base, s, fl(head, 'f-paper') + ln(head) + ln(body));
  }

  /* ---------- the scenes ---------- */
  const night = ph => ph === 'night' || ph === 'dusk';
  const S = {
    bus: ph => [sky(ph) + hills([[0, 60], [50, 52], [110, 58], [160, 50]], 'thin'),
      palm(18, 76, 38, 5) + palm(140, 76, 34, -4) + road(76),
      at(80, 84, 0.86, bus())],
    town: ph => [sky(ph, ph === 'night' ? [30, 20] : null),
      house(8, 76, 34, 24) + house(58, 76, 30, 30) + house(104, 76, 40, 22) + floor(76),
      lampPost(52, 76, 34, night(ph)) + lampPost(148, 76, 30, night(ph)) + backpack(96, 92, 0.5)],
    dorm: ph => [win(ph, 104, 14, 34, 40),
      floor(84) + ln('M10 84V22M46 84V22M10 30H46M10 54H46', '') + ln('M14 22v62M14 34h-4M14 44h-4M14 64h-4M14 74h-4', 'thin'),
      bed(10, 52, 36, 'f-goldsoft') + bed(10, 82, 36) + backpack(70, 84, 0.62) + ln('M88 84v-14h14v14', 'thin')],
    carstreet: ph => [sky(ph) + house(4, 78, 26, 26) + house(130, 78, 28, 24),
      floor(78) + flag(40, 50, 18, 'f-gold') + flag(118, 50, 18),
      at(80, 82, 0.48, chariot())],
    temple: ph => [sky(ph, ph === 'dawn' ? [130, 50] : null),
      (() => {
        const x = 70, base = 80;
        const wall = rect(x - 36, base - 26, 72, 26);
        const r1p = poly([[x - 44, base - 26], [x - 31, base - 40], [x + 31, base - 40], [x + 44, base - 26]]);
        const r2p = poly([[x - 27, base - 40], [x - 17, base - 52], [x + 17, base - 52], [x + 27, base - 40]]);
        const gate = 'M' + (x - 8) + ' ' + base + 'v-15a8 8 0 0 1 16 0v15';
        let kindi = '';
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) kindi += rect(x + 18 + c * 4, base - 21 + r * 4, 2.4, 2.4);
        return fl(r1p + r2p, 'f-roof') + fl(wall, 'f-paper') + ln(wall) + ln(r1p) + ln(r2p) + ln(hatch(x - 38, x + 38, base - 39, base - 27, 5, 3) + hatch(x - 22, x + 22, base - 51, base - 41, 5, 2.5), 'thin') +
          fl(circ(x, base - 56, 2.6), 'f-gold') + ln(circ(x, base - 56, 2.6) + 'M' + x + ' ' + (base - 58.6) + 'v-4') + ln(gate) + fl(rect(x + 16.5, base - 22.5, 13.5, 13.5), 'f-gold') + ln(rect(x + 16.5, base - 22.5, 13.5, 13.5)) + fl(kindi, 'f-cut2') + ln('M' + (x - 30) + ' ' + (base - 20) + 'h14', 'thin');
      })() + floor(80),
      deepa(132, 80, 40) + flag(22, 54, 18, 'f-gold')],
    breakfast: ph => [win(ph, 116, 8, 30, 34),
      ln('M-2 48H162') + fl(rect(-2, 48, 164, 54), 'f-floor') + ln(hatch(2, 158, 49, 101, 12, 10), 'thin'),
      leaf(66, 74, 104, 26) + dosa(62, 72) + bowl(38, 80, 6, 'f-paper') + bowl(90, 82, 6, 'f-kumsoft') + coffee(136, 90)],
    meals: ph => [win(ph, 118, 6, 28, 32),
      ln('M-2 44H162') + fl(rect(-2, 44, 164, 58), 'f-floor') + ln(hatch(2, 158, 45, 101, 12, 10), 'thin'),
      leaf(72, 74, 116, 30) + fl('M54 78q8 -14 22 0z', 'f-paper') + ln('M54 78q8 -14 22 0z') + bowl(34, 70, 5.5, 'f-goldsoft') + bowl(48, 62, 5, 'f-kumsoft') + bowl(92, 64, 5.5, 'f-leaf') + bowl(106, 74, 5.5, 'f-goldsoft') + coffee(144, 92)],
    gadbad: ph => [win(ph, 12, 8, 30, 34),
      ln('M-2 70H162') + fl(rect(-2, 70, 164, 32), 'f-floor'),
      sundae(76, 88) + plate(118, 84, 20, fl('M106 82q12 -8 24 0q-12 6 -24 0z', 'f-goldsoft') + ln('M106 82q12 -8 24 0q-12 6 -24 0z')) + ln('M98 92l6 -12M100 93l6 -12', 'thin')],
    auto: ph => [sky(ph) + hills([[0, 58], [60, 50], [120, 56], [160, 48]], 'thin'),
      palm(20, 74, 40, 6) + palm(142, 74, 36, -5) + road(74),
      at(74, 86, 0.9, auto(night(ph))) + ln('M24 66h10M18 70h12', 'thin')],
    walk: ph => [sky(ph), house(6, 74, 30, 22) + house(112, 74, 40, 24) + floor(74), lampPost(56, 74, 30, night(ph)) + person(84, 90, 0.9) + ln('M70 96l3 -2M78 98l3 -2', 'thin')],
    falls: ph => [sky(ph, [130, 18]) + tree(20, 46, 9) + tree(148, 44, 9) + tree(118, 40, 7),
      fl('M34 74L40 40Q46 30 58 30L70 26H92L104 30Q116 30 122 40L128 74Z', 'f-soft') + ln('M34 74L40 40Q46 30 58 30L70 26M92 26L104 30Q116 30 122 40L128 74') + ln('M46 44q6 -3 12 0M44 56q7 -3 14 0M106 44q6 -3 12 0M108 58q7 -3 14 0M50 66h10M104 68h12', 'thin') +
        fl('M70 26H92Q94 50 98 76H64Q68 50 70 26Z', 'f-paper') + ln('M70 26Q68 50 64 76M92 26Q94 50 98 76') + ln('M75 28q-1 16 -3 46M81 27v48M87 28q1 16 3 46', 'thin') + fl('M60 74q8 -6 16 -2q8 -6 16 -2q8 -4 14 2z', 'f-paper') + ln('M60 74q8 -6 16 -2q8 -6 16 -2q8 -4 14 2', 'thin'),
      fl('M48 80Q81 70 116 80Q81 92 48 80Z', 'f-sea') + ln('M48 80Q81 70 116 80Q81 92 48 80Z') + ln('M64 81q8 -3 16 0M84 82q8 -3 16 0', 'thin') + rocks(16, 92, 36) + rocks(110, 94, 40) + grass(0, 30, 98) + grass(128, 160, 98)],
    nap: ph => [win(ph, 104, 12, 34, 40), floor(84), bed(18, 84, 70) + zzz(64, 56) + ln('M120 84v-12h20v12M120 76h20', 'thin')],
    sleep: ph => [win(ph === 'night' ? ph : 'night', 104, 12, 34, 40), floor(84), bed(18, 84, 70, 'f-goldsoft') + zzz(64, 56) + ln('M128 84v-22M124 62h8l-2 -6h-4z', 'thin') + '<circle class="vg-glow" cx="128" cy="58" r="8"/>'],
    beach: ph => [sky(ph) + at(150, HZ, 0.34, lighthouse(0, 0, 60)),
      sea(HZ) + sand(80, 5),
      shack(40, 84) + palm(116, 86, 44, -7) + fl(circ(86, 88, 4), 'f-leaf') + ln(circ(86, 88, 4)) + ln('M86 84l2 -6', 'kum') + ln(birds(70, 30, 1.1) + birds(84, 36, 0.8), 'thin')],
    lighthouse: ph => [sky(ph) + ln(birds(30, 30, 1.2) + birds(44, 38, 0.9), 'thin'),
      sea(HZ + 6) + rocks(52, 72, 70) + at(88, 66, 0.8, lighthouse(0, 0, 66)),
      sand(88, 3)],
    seawalk: ph => [sky(ph),
      sea(56) + fl('M-2 102L58 58H70L44 102Z', 'f-paper') + ln('M-2 102L58 58M44 102L70 58'),
      [[6, 96, 26], [26, 82, 18], [42, 71, 12], [53, 63, 8]].map(([x, b, h]) => lampPost(x, b, h, night(ph))).join('') + ln(hatch(4, 56, 60, 100, 6, 4), 'thin') +
        boat(120, 70, 0.42) + boat(146, 66, 0.3) + (night(ph) ? '<path class="vg-star" d="M108 60v3M118 58v3M132 59v3"/>' : '')],
    dinnersea: ph => [sky(ph) + sea(HZ),
      fl(rect(-2, 78, 164, 24), 'f-sand') + ln('M-2 78H162') + palm(18, 80, 44, 8),
      (() => { const cloth = 'M56 74H124V84Q119 88 114 84Q109 88 104 84Q99 88 94 84Q89 88 84 84Q79 88 74 84Q69 88 64 84Q59 88 56 84Z'; return fl(cloth, 'f-kumsoft') + ln(cloth) + ln('M64 86V98M116 86V98', ''); })() +
        plate(76, 73, 8) + plate(104, 73, 8) + '<circle class="vg-glow" cx="90" cy="62" r="10"/>' + fl(rect(86, 60, 8, 12), 'f-goldsoft') + ln(rect(86, 60, 8, 12) + 'M85 60h10M90 60v-4', '') + fl('M90 70q-2 -3 0 -6q2 3 0 6z', 'f-gold') + ln('M66 73v-9M114 73v-9M64 64h4M112 64h4', 'thin')],
    beachbag: ph => [win(ph, 112, 10, 30, 36), floor(82),
      (() => { const towel = 'M40 54V36Q40 32 48 32Q56 32 56 36V54Z'; const bag = 'M30 52H90L85 82Q60 88 35 82Z';
        return fl(towel, 'f-kumsoft') + ln(towel) + ln('M40 40H56M40 46H56', 'kum') + fl(bag, 'f-goldsoft') + ln(bag) + ln('M42 52q0 -18 9 -18M78 52q0 -18 -9 -18', '') + ln('M34 60H86', 'thin') + ln(hatch(36, 84, 62, 80, 6, 0), 'thin'); })() +
        ln(circ(104, 79, 5) + circ(118, 79, 5) + 'M109 78h4M99 77l-5 -3M123 77l5 -3', '') + fl(circ(104, 79, 5) + circ(118, 79, 5), 'f-cut2') + (() => { const b = 'M130 82V62Q130 58 134 58H138Q142 58 142 62V82Z'; return fl(b, 'f-paper') + ln(b) + fl(rect(133, 52, 6, 6), 'f-kum') + ln(rect(133, 52, 6, 6), 'thin') + ln('M133 68h6', 'thin'); })()],
    harbour: ph => [sky(ph) + ln(birds(40, 26, 1.1) + birds(54, 32, 0.8), 'thin'),
      sea(60) + ln('M-2 74H40', ''),
      boat(36, 72, 0.6) + boat(84, 76, 0.66) + boat(130, 70, 0.52) + ln('M70 86q8 -3 16 0M110 82q8 -3 16 0', 'thin')],
    jetty: ph => [sky(ph) + sea(HZ),
      fl('M-2 74H120V80H-2Z', 'f-paper') + ln('M-2 74H120M-2 80H120') + ln('M8 80v14M32 80v14M56 80v14M80 80v14M104 80v14', '') + house(14, 74, 36, 20),
      boat(134, 74, 0.5) + fl(rect(22, 47, 20, 6), 'f-goldsoft') + ln(rect(22, 47, 20, 6), 'thin') + person(70, 74, 0.7) + person(82, 74, 0.7)],
    boatsea: ph => [sky(ph) + fl('M104 62Q116 54 128 56Q140 54 150 62Z', 'f-soft') + ln('M104 62Q116 54 128 56Q140 54 150 62') + at(122, 56, 0.4, palm(0, 0, 22, 2)) + at(136, 57, 0.4, palm(0, 0, 18, -2)),
      sea(HZ),
      boat(62, 80, 0.8) + ln('M18 84q6 -6 12 -2M100 86q6 -6 12 -2', 'thin')],
    basalt: ph => [sky(ph) + palm(130, 54, 30, 5) + palm(146, 56, 26, -4),
      sea(70),
      at(76, 78, 0.82, basalt()) + sand(92, 2)],
    parasail: ph => [sky(ph, ph === 'noon' ? [30, 18] : null) + (() => {
        const c = 'M84 20Q104 6 124 20Q104 13 84 20Z';
        return fl(c, 'f-kumsoft') + ln(c) + ln('M98 12l-2 8M104 10v10M110 12l2 8', 'thin') + ln('M86 20L102 36M122 20L106 36', 'thin') + fl(circ(104, 38, 2.6), 'f-paper') + ln(circ(104, 38, 2.6)) + ln('M104 41v6M100 44h8', 'thin');
      })(),
      sea(HZ) + ln('M104 47L56 72', 'thin'),
      (() => { const h = 'M30 74Q48 80 70 72L66 70H34Z'; return fl(h, 'f-paper') + ln(h) + ln('M46 70v-6h10v6', 'thin'); })() + (() => { const j = 'M118 84q10 4 24 -2l-4 -4h-16z'; return fl(j, 'f-kumsoft') + ln(j) + person(130, 80, 0.5, 'crouch') + ln('M110 86q-6 -4 -10 -1M106 82q-6 -5 -11 -2', 'thin'); })()],
    swim: ph => [sky(ph) + sea(HZ),
      sand(80, 4) + flag(28, 82, 30, 'f-kum') + flag(132, 82, 30, 'f-gold'),
      (() => { const t = 'M58 82L62 58H78L82 82M60 70H80M56 58H84L70 50Z'; return fl('M56 58H84L70 50Z', 'f-kumsoft') + ln(t); })() + fl(circ(104, 70, 2.8), 'f-paper') + ln(circ(104, 70, 2.8) + 'M98 72q6 -4 12 0', '') + fl(circ(116, 66, 2.4), 'f-paper') + ln(circ(116, 66, 2.4) + 'M111 68q5 -3 10 0', '')],
    shower: ph => [sky(ph) + sea(HZ),
      sand(78, 3),
      ln('M70 92V34Q70 28 78 28H90M90 28v6') + ln('M86 38l-1 5M90 38v6M94 38l1 5M88 46l-1 5M92 46l1 5', 'kum') + fl(rect(96, 54, 16, 24), 'f-goldsoft') + ln(rect(96, 54, 16, 24) + 'M96 60h16M96 66h16', 'thin') + ln('M70 54h26', 'thin')],
    kayak: ph => [sky(ph, ph === 'golden' ? [80, 40] : null),
      mangrove(24, 66, 1.1) + mangrove(136, 64, 1.05) + mangrove(78, 56, 0.6) + fl(rect(-2, 62, 164, 40), 'f-river') + ln('M-2 62H162'),
      kayak(82, 82) + ln('M30 92q8 -3 16 0M112 90q8 -3 16 0M54 74q6 -2 12 0', 'thin') + ln(birds(108, 32, 1), 'thin')],
    bridge: ph => [sky(ph) + palm(150, 58, 30, -4) + palm(10, 58, 28, 4),
      fl(rect(-2, 70, 164, 32), 'f-river') + ln('M-2 70H162') + ln('M30 30V72M130 30V72M26 30h8M126 30h8') + ln('M30 32Q80 66 130 32'),
      ln((() => { let d = ''; for (let x = 38; x < 125; x += 8) { const t = (x - 30) / 100; const y = (1 - t) * (1 - t) * 32 + 2 * (1 - t) * t * 66 + t * t * 32; d += 'M' + x + ' ' + r1(y) + 'V60'; } return d; })(), 'thin') + ln('M30 60H130M30 56H130') + ln('M50 84q8 -3 16 0M96 86q8 -3 16 0', 'thin')],
    beachpalms: ph => [sky(ph) + sea(HZ), sand(76, 4), palm(30, 92, 56, 18) + palm(70, 92, 48, 12) + palm(128, 92, 40, -10) + ln('M90 88q4 -2 8 0', 'thin')],
    delta: ph => [sky(ph),
      fl(rect(-2, HZ, 164, 40), 'f-sea') + ln('M-2 ' + HZ + 'H162') + ln(waves(96, 156, 72, 12, 3, 9), 'thin') + fl('M-2 100Q30 74 92 72Q112 72 118 70Q98 80 70 86Q40 92 30 102Z', 'f-sand') + ln('M-2 100Q30 74 92 72Q112 72 118 70Q98 80 70 86Q40 92 30 102'),
      boat(44, 70, 0.4) + palm(14, 88, 30, 6) + ln('M10 76q8 -2 16 0', 'thin')],
    dress: ph => [win(ph, 112, 10, 30, 38), floor(86),
      ln('M50 14v6M50 20L30 30H70Z') + (() => { const sh = 'M34 30L22 40L28 48L36 42V82H64V42L72 48L78 40L66 30L58 28Q50 34 42 28Z'; return fl(sh, 'f-paper') + ln(sh) + ln('M50 34V82M44 30l6 8l6 -8', 'thin') + ln('M48 44h4M48 54h4M48 64h4', 'thin'); })() +
        fl(arch(86, 34, 18, 44), 'f-win') + ln(arch(86, 34, 18, 44)) + ln('M90 86l4 -6h10l2 6z', '')],
    lounge: ph => [sky('night', [138, 18]) + stringLights(-2, 162, 12, 10) + ln('M10 54h16M34 50h12M54 54h22M96 48h14M118 54h30', 'thin'),
      fl(rect(-2, 70, 164, 32), 'f-paper') + ln('M-2 70H162M-2 74H162'),
      (() => { const m = 'M50 46L70 46L60 58Z'; return fl(m, 'f-goldsoft') + ln(m) + ln('M60 58V68M53 70h14') + fl(circ(66, 45, 3), 'f-leaf') + ln(circ(66, 45, 3), 'thin'); })() +
        fl(rect(86, 48, 14, 22), 'f-kumsoft') + ln(rect(86, 48, 14, 22)) + ln('M90 54h4v4h-4zM94 60h4v4h-4z', 'thin') + ln('M96 48l6 -10', 'kum') + ln('M120 40q4 -6 8 0v14M122 50a3 3 0 1 0 0.1 0M134 36v12a3 3 0 1 1 -3 -3', 'gold')],
    phonetrain: ph => [win(ph, 116, 10, 30, 36), floor(86),
      phone(66, 56, (() => { const t = 'M58 58V40Q58 36 62 36H70Q74 36 74 40V58Z'; return fl(t, 'f-paper') + ln(t) + fl(rect(60, 39, 12, 7), 'f-goldsoft') + ln(rect(60, 39, 12, 7), 'thin') + fl(circ(61.5, 52, 1.4) + circ(70.5, 52, 1.4), 'f-gold') + ln('M60 58l-3 5M72 58l3 5M56 66h20', 'thin'); })() + fl(circ(73, 30, 2), 'f-kum'))],
    phonemap: ph => [win(ph, 116, 10, 30, 36), floor(86),
      phone(66, 56, ln('M58 66Q62 52 68 50T74 36', 'dash') + fl('M70 34a4 4 0 1 1 8 0c0 3 -4 7 -4 7s-4 -4 -4 -7z', 'f-kum') + ln('M70 34a4 4 0 1 1 8 0c0 3 -4 7 -4 7s-4 -4 -4 -7z', 'thin') + fl(circ(58, 66, 2), 'f-gold'))],
    pack: ph => [win(ph, 114, 10, 30, 36), floor(84),
      backpack(46, 84, 1.05) + (() => { const d = 'M70 84V60Q70 54 76 54H108Q114 54 114 60V84Z'; return fl(d, 'f-goldsoft') + ln(d) + ln('M80 54q0 -8 12 -8t12 8', '') + ln('M70 66H114', 'thin') + ln('M88 72h8', ''); })()],
    valley: ph => [sky(ph, ph === 'morning' ? [40, 26] : null) + hills([[0, 40], [40, 32], [90, 40], [130, 30], [160, 38]], 'thin') + hills([[0, 52], [50, 44], [100, 50], [160, 42]]) + ln('M10 46h30M70 52h40M120 44h30', 'mist'),
      fl('M40 100Q60 80 96 72T160 62V72Q130 76 104 84T64 100Z', 'f-river') + ln('M40 100Q60 80 96 72T160 62M64 100Q80 90 104 84T160 72', '') + ln(paddy(4, 50, 64, 96, 10, 8) + paddy(110, 156, 82, 98, 10, 8), 'thin'),
      ln('M-2 90H162M-2 84H162') + ln('M10 84v14M40 84v14M70 84v14M100 84v14M130 84v14M156 84v14', '')],
    estuary: ph => [sky(ph) + palm(130, 60, 34, -5) + palm(146, 62, 30, 3),
      fl(rect(-2, 60, 164, 42), 'f-sea') + ln('M-2 60H162') + fl('M-2 80Q40 72 90 76T162 70V102H-2Z', 'f-sand') + ln('M-2 80Q40 72 90 76T162 70'),
      (() => { const c = 'M24 70Q50 76 80 68L76 66H28Z'; return fl(c, 'f-roof') + ln(c) + ln('M40 66l6 -10M58 66V58M56 58h4', 'thin'); })() + ln('M96 92q6 -2 12 0l6 -2', 'thin') + ln(birds(60, 28, 1), 'thin')],
    surf: ph => [sky(ph),
      fl('M-2 102V70Q30 50 70 46Q104 44 112 62Q98 54 88 62Q100 66 96 76Q120 76 162 72V102Z', 'f-sea') + ln('M-2 70Q30 50 70 46Q104 44 112 62Q98 54 88 62Q100 66 96 76Q120 76 162 72') + ln('M10 82q10 -6 20 0t20 0M50 92q10 -6 20 0t20 0M110 88q10 -6 20 0', 'thin'),
      (() => { const b = 'M44 74Q60 68 80 70Q62 76 44 74Z'; return fl(b, 'f-goldsoft') + ln(b); })() + person(62, 71, 0.95, 'crouch')],
    stationudp: ph => [sky(ph), floor(84) + station(80, 84, 'ಉಡುಪಿ'), ln('M8 90h40M112 90h40', 'thin')],
    stationmng: ph => [sky(ph), floor(84) + station(80, 84, 'ಮಂಗಳೂರು'), ln('M8 90h40M112 90h40', 'thin')],
    stationbgk: ph => [sky(ph), floor(84) + station(80, 84, 'ಬಾಗಲಕೋಟೆ'), ln('M8 90h40M112 90h40', 'thin')],
    train: ph => [sky(ph) + hills([[0, 56], [60, 46], [120, 54], [160, 44]], 'thin'),
      palm(24, 74, 36, 5) + palm(140, 72, 30, -4) + ln('M-2 74H162M-2 78H162') + ln(hatch(0, 160, 74, 78, 6, 0), 'thin'),
      train(128, 74, 3, 0.86)],
    rivertrain: ph => [sky(ph) + hills([[0, 46], [50, 36], [110, 44], [160, 34]], 'thin'),
      ln('M-2 62H162M-2 66H162') + train(132, 62, 3, 0.8),
      fl('M-2 80Q60 70 100 78T162 74V102H-2Z', 'f-river') + ln('M-2 80Q60 70 100 78T162 74') + ln('M20 90q8 -3 16 0M90 92q8 -3 16 0', 'thin') + palm(150, 66, 24, -3)],
    chai: ph => [sky(ph), floor(80) + station(80, 80, 'ಮಂಗಳೂರು'),
      (() => { const g = 'M64 98L62 80H76L74 98Z'; return fl('M63 86H75L74 98H64Z', 'f-goldsoft') + ln(g) + ln('M66 76q-2 -3 0 -6M72 76q-2 -3 0 -6', 'gold'); })() + ln('M90 98h40M92 98v-8h36v8', '')],
    parcel: ph => [win(night(ph) ? 'night' : ph, 98, 8, 40, 42),
      ln('M-2 66H162') + fl(rect(-2, 66, 164, 36), 'f-floor'),
      (() => { const p = rect(40, 44, 38, 22); return fl(p, 'f-goldsoft') + ln(p) + ln('M59 44V66M40 55H78', 'kum') + ln('M55 44q4 -6 8 0', 'thin'); })() + fl(rect(92, 36, 10, 30), 'f-sea') + ln(rect(92, 36, 10, 30)) + ln(rect(94, 31, 6, 5), 'thin')],
    berth: ph => [win(ph === 'night' || ph === 'dusk' ? 'night' : ph, 112, 18, 32, 34),
      ln('M-2 92H162') + fl(rect(-2, 92, 164, 10), 'f-floor'),
      fl(rect(8, 30, 84, 8) + rect(8, 64, 84, 8), 'f-goldsoft') + ln(rect(8, 30, 84, 8) + rect(8, 64, 84, 8)) + ln('M8 38V92M92 38V92M8 72h84', 'thin') + bed(14, 64, 66, 'f-kumsoft') + ln('M100 30v62M100 40h8M100 54h8M100 68h8M100 82h8', 'thin') + zzz(54, 26)]
  };
  const TH = { bus: [38, 20, 82], town: [30, 18, 84], dorm: [4, 14, 86], carstreet: [34, 8, 92], temple: [24, 14, 92], breakfast: [22, 32, 72], meals: [26, 36, 70], gadbad: [44, 28, 64], auto: [38, 28, 74], walk: [40, 26, 76],
    falls: [36, 18, 84], nap: [12, 24, 76], sleep: [12, 24, 76], beach: [22, 26, 80], lighthouse: [40, 2, 96], seawalk: [0, 30, 72], dinnersea: [46, 42, 62], beachbag: [22, 28, 76], harbour: [20, 24, 90], jetty: [6, 26, 84],
    boatsea: [24, 30, 76], basalt: [30, 14, 96], parasail: [36, 8, 92], swim: [40, 26, 80], shower: [50, 22, 72], kayak: [36, 30, 72], bridge: [20, 12, 96], beachpalms: [14, 12, 96], delta: [10, 30, 90], dress: [16, 8, 76],
    lounge: [38, 22, 74], phonetrain: [36, 18, 64], phonemap: [36, 18, 64], pack: [26, 28, 92], valley: [20, 20, 90], estuary: [14, 30, 80], surf: [32, 30, 70], stationudp: [30, 28, 96], stationmng: [30, 28, 96], stationbgk: [30, 28, 96],
    train: [52, 30, 90], rivertrain: [50, 22, 90], chai: [44, 40, 70], parcel: [30, 18, 84], berth: [4, 12, 96] };
  const CARD = { parasail: 4, lighthouse: 6, carstreet: 10, temple: 18, falls: 18, dress: 10, beachpalms: 16, bridge: 18, basalt: 16, dorm: 16, berth: 18 };
  const NIGHT_ONLY = { lounge: 1 };
  const INDOOR = { dorm: 1, breakfast: 1, meals: 1, gadbad: 1, nap: 1, sleep: 1, beachbag: 1, dress: 1, phonetrain: 1, phonemap: 1, pack: 1, parcel: 1, berth: 1 };

  /* ---------- which picture a stop gets ---------- */
  const BY_KIND = { temple: 'temple', culture: 'carstreet', coast: 'beach', nature: 'falls', adventure: 'kayak', explore: 'beach', photo: 'beach', boat: 'boatsea', food: 'meals', night: 'lounge', move: 'auto', bus: 'bus', train: 'train', prep: 'pack' };
  function keyFor(it) {
    if (!it || it.info) return null;
    const pick = TRIP.PICS && TRIP.PICS[it.id];
    if (pick && S[pick]) return pick;
    if (it.k === 'move' && it.m === 'w') return 'walk';
    if (it.k === 'rest') return phaseOf(it.t) === 'night' ? 'sleep' : 'nap';
    return BY_KIND[it.k] || null;
  }
  const mid = it => { const [h, m] = String(it.t).split(':').map(Number); const t = h * 60 + m + Math.round((it.dur || 0) / 2); return String(Math.floor(t / 60) % 24).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); };
  const phaseFor = it => phaseOf(mid(it));

  /* ---------- drawing ---------- */
  const cache = {}, art = {};
  function viewBox(key, size) {
    if (size === 'thumb') { const t = TH[key] || [36, 14, 88]; return t[0] + ' ' + t[1] + ' ' + t[2] + ' ' + t[2]; }
    if (size === 'card') return '0 ' + (CARD[key] != null ? CARD[key] : 24) + ' 160 67';
    return '0 0 160 100';
  }
  function svg(key, ph, size) {
    const id = key + '|' + ph + '|' + (size || 'hero');
    if (!cache[id]) {
      const a = key + '|' + ph;
      if (!art[a]) art[a] = S[key](ph).map((p, i) => layer(r1(i * 0.22), p)).join('');
      cache[id] = '<svg class="vg-svg" viewBox="' + viewBox(key, size) + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><g class="art">' + art[a] + '</g></svg>';
    }
    return cache[id];
  }
  /* size: 'thumb' on timeline rows, 'card' on the Now card, 'hero' at the top of a stop's sheet. */
  function pic(it, size, extra) {
    const key = keyFor(it);
    if (!key) return '';
    const ph = NIGHT_ONLY[key] ? 'night' : phaseFor(it);
    return '<span class="vg vg-' + size + ' ph-' + ph + (INDOOR[key] ? ' in' : '') + (extra ? ' ' + extra : '') + '" data-vg="' + key + '">' + svg(key, ph, size) + '</span>';
  }
  return { pic, keyFor, phaseFor, phaseOf, svg, KEYS: Object.keys(S), PHASES, INDOOR };
})();
