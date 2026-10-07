# Udupi · Coast Trip — Kaavi edition

A light, offline-first trip companion for four days on the Udupi coast, 6–10 October 2026: Bagalkot → Udupi by night bus, then three days of beaches, island boats, parasailing, a forest waterfall, kayaking and an optional surf lesson, an evening on Malpe's lamp-lit Sea Walk and a lounge night in Manipal, and the Krishna Matha at dawn, before the Konkan line and the Ghats take you home. Every ride has slack around it, and each day keeps one free hour. It is drawn in the style of Udupi's **Kaavi** wall art: laterite-red line work on lime-plaster white, with Yakshagana gold and kumkum for highlights.

![Today, Days, Kit and SOS screens](docs/screens.png)

**Live:** https://udupi-kaavi.vercel.app (unlisted: served with `noindex`, so it stays out of search results)

## What it does

| Screen | What you get |
| --- | --- |
| **Today** | The day's mural with the real sun moving along its arc, the day's highlights under its title, a **Now** card with directions and a one-tap *Mark done*, the next stop and the next hard deadline with countdowns, a marigold garland of progress, and the timeline (earlier stops fold away). Stops with photos carry a folded **Where to shoot** guide: for each shot, where to stand, how to frame it and, where the light matters, when. It opens by itself at the stop you are at. |
| **Days** | A day brief for every day (route, riding, deadlines, what to wear, carry, eat and spend, the light, and what to watch for), five arched day tiles that take a rubber-stamp seal when every stop on that day is done, sun and golden-hour times, the weather note, Plan A / Plan B where it matters, and *If plans change* for each day. |
| **Map** | A Kaavi-drawn map of the coast for each day: sea, rivers, NH66 and towns, the dorm as the start, every spot numbered in the order you reach it, and the journey drawn between them (rides along NH66, the island crossing dashed, the train dotted). The spot you are at pulses; finished spots turn gold. Below it, the journey as a list with directions to each spot, and the whole day as one route in Google Maps. |
| **Kit** | The packing list, with your own items. |
| **SOS** | Tap-to-call emergency numbers, hospitals and stations with directions, your bookings (kept on the phone), both train timetables, the rules that protect the trip, auto fares, a plan-versus-paid money card, and backup to a file. |

The first time the app opens, a three-card tour shows how it works, and the **?** in the header explains every circle, colour and tap at any time. Every stop opens a sheet with its story, its Kannada name, opening hours, facts at a glance, step-by-step actions, tips, where to shoot, what you paid, and *Directions*, *Edit* and *Skip*. You can add your own stops on any day. A one-line journal with a mood closes each day.

## Design

- **Palette:** lime plaster `#F6F1E7`, laterite `#A63A22`, Yakshagana gold `#E2A72E`, kumkum `#B52B19`, areca green, Arabian Sea teal. Light theme only, with text contrast checked against WCAG AA.
- **Type:** [Tiro Kannada](https://fonts.google.com/specimen/Tiro+Kannada) for headings and every Kannada name, [Figtree](https://fonts.google.com/specimen/Figtree) for the interface.
- **Motifs:** the Kanakana Kindi window as the emblem, Mangalore-tile eaves under the header, a Yakshagana crown over each heading, and five hand-built SVG murals: the Bagalkot night bus, Udupi's chariot and the Kaup lighthouse, St Mary's basalt columns, the Konkan train over the valley, and Bagalkot station.
- **Pictures:** every stop has its own Kaavi vignette (about 45 scenes, from the dawn darshan to the night train), drawn in SVG in `js/vignettes.js`. Each sky follows the stop's time: dawn, morning, noon, afternoon, golden hour, dusk or a lamp-lit night. Rows show a small one, the Now card a wide one, and each stop's sheet opens on a large one that draws itself in. `TRIP.PICS` in `data/trip.js` picks the scene for a stop; anything not listed gets one by its kind, including stops you add.
- **Motion:** the Kindi lights up and opens like temple doors, murals draw themselves in while the sun eases to the current time, the tab pill stretches toward the tab you tap and its icon lifts while the screen slides out and the next one slides in from the same side, sheets spring up, ticked stops burst into marigold petals, and finished days are stamped. Everything respects *reduce motion*.

## Project layout

```
public/                  the whole site, served as-is (no build step)
  index.html
  sw.js                  offline cache: app shell plus Google Fonts
  manifest.webmanifest
  css/                   base · components · pieces · screens · motion
  js/                    art · vignettes · core · pieces · screens · map · sheets · app
  data/                  trip.js (reference data), one file per day, geo.js (the drawn map)
  icons/
tests/                   Playwright tests and a local server that mirrors vercel.json
docs/                    screenshots for this README
vercel.json              security headers (CSP, noindex) and the output directory
```

The scripts are plain classic scripts loaded in order and sharing one global scope: trip data and `geo.js` → `art.js` and `vignettes.js` (the Kaavi drawings) → `core.js` (time, state, plan) → `pieces.js` → `screens.js` → `map.js` → `sheets.js` → `app.js` (events and start-up). All times are computed in IST, whatever the phone's time zone.

## Run it locally

```bash
node tests/server.mjs          # http://127.0.0.1:4173
```

Add `?t=2026-10-07T09:50` to the address to see the app at any moment of the trip.

## Tests

```bash
cd tests
npm ci
npx playwright install chromium
npx playwright test
```

37 browser tests on a phone-sized Chromium cover ticking, sheets, skipping, editing and adding stops, Plan B on Wednesday, Thursday and Friday, the scooter rides, the Map tab and its journeys, day briefs and stop facts, the night-out stops, the shot guide, the first-run tour, the help sheet, day highlights, a picture on every stop, the tab bar motion, days, kit, bookings, backup and restore, reset, the journal, day stamps, loading data saved by the previous version, the intro, security headers, the install manifest, offline use, and layout at 320, 390 and 820 px with no console errors or CSP violations. GitHub Actions runs them on every push to `main`.

## Editing the trip

Each day lives in `public/data/day-*.js`. A stop looks like this:

```js
{id:`we7`, t:`07:15`, k:`temple`, x:`Sri Krishna Matha, dawn darshan`, kn:`ಶ್ರೀ ಕೃಷ್ಣ ಮಠ`,
 q:`Udupi Sri Krishna Matha`, m:`w`, dur:35, win:`Darshan from 05:00`, b:`…`, tips:[`…`], sh:[`…`]}
```

| Field | Meaning |
| --- | --- |
| `id` | Stable id. Ticks, skips and edits are saved against it, so never reuse or renumber ids. |
| `t`, `dur` | Start time (24 h, IST) and minutes. |
| `k` | Kind: `temple`, `culture`, `coast`, `nature`, `adventure`, `explore` (free hour), `photo`, `boat`, `food`, `night`, `ride` (scooter), `move`, `bus`, `train`, `rest`, `prep`, `stop`. |
| `x`, `kn` | Title and Kannada name. |
| `q`, `m` | Google Maps query, and `m:'w'` for walking directions. |
| `c` | Cost range in rupees, `[low, high]`. |
| `win`, `b`, `tips` | Opening hours, body text and tips. |
| `kb`, `steps` | Facts at a glance, `[[label, value], …]`, and a numbered step-by-step list. |
| `at` | The map area for a stop with no Maps query (see `TRIP.GEO.areas` in `data/geo.js`). |
| `brief`, `briefLine` (on the day) | The day brief rows, `[[icon, label, text], …]`, and its one-line summary. |
| `hl` (on the day) | Three to five highlights shown under the day's title. |
| `sh` | Shots, each `{x, at, fr, tm}`: what to shoot, where to stand, how to frame it and, optionally, the best time. Ticks are saved by position, so add new shots at the end. |
| `hard`, `fix`, `star`, `info` | Hard deadline, fixed time, highlight, passing information with no tick. |
| `v` | `A` or `B` for stops that belong to one plan on days with a Plan B. |

## Releasing a change

1. Make the change and run the tests.
2. Bump the version in **both** `public/js/core.js` (`APP_V`) and `public/sw.js` (`V`). They must match.
3. Push to `main`. Vercel deploys it, and phones with the app open see *A fresh version of the app is ready*.

## Privacy

There are no accounts, analytics or servers. Ticks, notes, bookings and amounts paid stay in the browser's `localStorage` under `udupi.app.v1`, and *Backup* writes them to a file only you keep. The site sends `noindex`, a strict Content-Security-Policy and `no-referrer`.

## Credits

Fonts: Tiro Kannada by Tiro Typeworks and Figtree by Erik Kennedy, both from Google Fonts under the SIL Open Font License. The illustrations are drawn in SVG for this project, after the Kaavi art of the Konkan coast and Udupi's temple and Yakshagana traditions.
