/* Udupi Coast Trip: trip data, reference part. All times are IST. */
'use strict';
window.TRIP = { DAYS: [] };
TRIP.WX = `Forecast as of 5 Oct: showers and thunderstorms likely across Udupi until about 11 Oct, mostly in the afternoon and evening. 24–31 °C and humid. That is why the sea activities sit in the mornings.`;

TRIP.KIT = [
  {cat:`Documents and money`, items:[[`k1`,`Aadhaar or other photo ID, plus a photo of it on your phone`],[`k2`,`College ID card (₹150 student ticket at Hasta Shilpa)`],[`k3`,`Tickets saved offline: VRL, 12133, 17378`],[`k4`,`₹4,000 in cash, mostly ₹100s with a few ₹500s, plus ₹500 kept separately`],[`k5`,`Debit card as a backup to UPI`]]},
  {cat:`Temple`, items:[[`k6`,`Formal trousers`],[`k7`,`Collared shirt that comes off quickly`],[`k8`,`Slip-on sandals (temples and Hasta Shilpa)`]]},
  {cat:`Sea and water`, items:[[`k9`,`Swim shorts`],[`k10`,`Quick-dry towel`],[`k11`,`Waterproof phone pouch with a lanyard`],[`k12`,`Zip-lock bags for wet clothes`],[`k13`,`Sunscreen SPF 50 and lip balm`],[`k37`,`Sandals with grip for the falls and the rocks`],[`k14`,`Cap and sunglasses`],[`k35`,`Rash guard or fitted quick-dry T-shirt, if you surf on Friday`]]},
  {cat:`Night out`, items:[[`k36`,`Smart-casual shirt, trousers or clean jeans, closed shoes`]]},
  {cat:`Rain`, items:[[`k15`,`Compact umbrella or poncho`],[`k16`,`Three quick-dry T-shirts`]]},
  {cat:`Clothes and night travel`, items:[[`k17`,`Innerwear ×4, socks ×2`],[`k18`,`Sleepwear for the dorm`],[`k19`,`Light jacket or shawl for the bus and train`],[`k20`,`Earplugs and eye mask`]]},
  {cat:`Dorm and daily`, items:[[`k21`,`Padlock for the dorm locker`],[`k22`,`Toothbrush, paste, soap, deodorant, comb`],[`k23`,`Small daypack, 10–15 L`],[`k24`,`1 L refillable bottle`]]},
  {cat:`Tech`, items:[[`k25`,`Phone charger`],[`k26`,`Power bank, fully charged`],[`k27`,`Earphones`],[`k28`,`Offline Google Maps area downloaded`]]},
  {cat:`Health`, items:[[`k29`,`Personal medicines`],[`k30`,`ORS sachets ×4`],[`k31`,`Motion-sickness tablet for the boat`],[`k32`,`Plasters and antiseptic cream`],[`k33`,`Mosquito repellent for the mangroves at dusk`]]},
  {cat:`Snacks`, items:[[`k34`,`Dry snacks for the bus and train`]]}
];

TRIP.NUMS = [[`112`,`Any emergency: police, fire, ambulance`],[`108`,`Ambulance`],[`139`,`Railway help (Rail Madad)`],[`1363`,`Tourist helpline, Govt of India, 24×7`]];
TRIP.PLACES = [
  [`Adarsha Hospital`,`About 150 m from CPC Plaza`,`Adarsha Hospital, Udupi`],
  [`Kasturba Hospital, Manipal`,`Large 24×7 hospital, about 15 min by auto`,`Kasturba Hospital, Manipal`],
  [`Udupi Town Police Station`,`Central Udupi`,`Udupi Town Police Station`],
  [`Udupi railway station`,`Indrali, 3 km east, for 12133`,`Udupi Railway Station`],
  [`Mangaluru Junction`,`Padil, for 17378`,`Mangaluru Junction Railway Station`]
];
TRIP.FIELDS = [[`dormName`,`Dorm name`],[`dormPhone`,`Dorm phone`],[`dormAddr`,`Dorm address or landmark`],[`vrlPnr`,`VRL ticket or PNR`],[`vrlBus`,`VRL bus number and driver phone`],[`t1Pnr`,`12133 PNR`],[`t1Seat`,`12133 coach and berth`],[`t2Pnr`,`17378 PNR`],[`t2Seat`,`17378 coach and berth`],[`homeName`,`Emergency contact name`],[`homePhone`,`Emergency contact phone`]];
TRIP.T12133 = [[`Udupi`,`13:20`,`13:22`,1],[`Surathkal`,`14:20`,`14:22`],[`Mangaluru Jn`,`15:40`,`—`,1]];
TRIP.T17378 = [[`Mangaluru Central`,`—`,`16:45`],[`Mangaluru Jn`,`16:57`,`17:00`,1],[`Bantwal`,`17:30`,`17:32`],[`Subrahmanya Road`,`18:50`,`19:00`],[`Sakleshpur`,`21:20`,`21:30`],[`Hassan`,`22:20`,`22:30`],[`Arsikere`,`23:20`,`23:25`],[`Davangere`,`01:48`,`01:50`],[`Hubballi`,`04:40`,`04:50`],[`Gadag`,`06:25`,`06:30`],[`Badami`,`07:29`,`07:30`],[`Guledagudda Road`,`07:44`,`07:45`],[`Bagalkot`,`07:58`,`08:00`,1]];
TRIP.FARES = [[`CPC Plaza → Car Street`,`Walk, 10 min`],[`CPC → Manipal`,`₹110–150`],[`CPC → Arbi Falls`,`₹150–200`],[`Manipal → CPC late at night`,`₹120–180`],[`CPC → Malpe`,`₹120–150`],[`CPC → Kemmannu`,`₹200–240`],[`CPC → Mattu`,`₹230–280`],[`CPC → Kaup`,`₹280–350`],[`Kaup → Malpe`,`₹300–400`],[`Kodi Bengre → CPC`,`₹300–350`],[`CPC → Udupi station`,`₹70–90`],[`Udupi → Mulki, express bus`,`About ₹50`],[`Mulki → Mangaluru Jn by cab`,`₹900–1,200`],[`Udupi → Mangaluru Jn by cab`,`₹1,300–1,800`]];

/* The Kaavi picture each stop shows (see js/vignettes.js); stops not listed get one by their kind. */
TRIP.PICS = {
  tu1: `pack`, tu2: `phonemap`, tu3: `phonemap`, tu4: `pack`, tu5: `phonemap`, tu6: `phonemap`, tu12: `surf`,
  we1: `bus`, we2: `town`, we3: `dorm`, we9: `breakfast`, we36: `dress`, we29: `falls`, we25: `gadbad`, we21: `lighthouse`, we22: `lighthouse`, we40: `seawalk`, we41: `dinnersea`,
  th1: `beachbag`, th2: `breakfast`, th5: `harbour`, th6: `jetty`, th8: `basalt`, th10: `parasail`, th11: `swim`, th12: `shower`, th19: `bridge`, tb3: `beachpalms`, tb6: `bridge`, th21: `delta`, th23: `dress`, th27: `phonetrain`,
  fr1: `pack`, fr3: `phonetrain`, fr5: `valley`, fr7: `breakfast`, fr9: `estuary`, fs1: `pack`, fs4: `surf`, fs6: `bus`, fs7: `stationmng`, fr14: `phonetrain`, fr17: `stationudp`, fr20: `stationmng`, fr21: `stationmng`, fr22: `chai`, fr24: `rivertrain`, fr25: `train`, fr27: `parcel`, fr30: `berth`,
  sa3: `berth`, sa6: `stationbgk`
};

TRIP.SUN = {
  '2026-10-06': { rise: `06:20`, set: `18:17` },
  '2026-10-07': { rise: `06:20`, set: `18:16`, goldAm: [`06:20`,`06:50`], gold: [`17:46`,`18:16`] },
  '2026-10-08': { rise: `06:20`, set: `18:15`, goldAm: [`06:20`,`06:50`], gold: [`17:45`,`18:15`] },
  '2026-10-09': { rise: `06:21`, set: `18:14`, goldAm: [`06:21`,`06:51`], gold: [`17:44`,`18:14`] },
  '2026-10-10': { rise: `06:21`, set: `18:13` }
};
TRIP.RULES = [
  `St Mary’s on Thursday: not on a boat by 10:30, switch Thursday to Plan B. Friday retry, on Plan A only: board by 09:45 and leave Malpe by 11:30.`,
  `12133 on Friday: decide at 12:00 and again at 13:15 using the ETA rules on that stop.`,
  `Surf on Friday only with a confirmed booking. On Plan B, leave Mulki by 14:00.`,
  `Back at the dorm by about 22:00 each night: book the ride home by 21:30.`,
  `Swim only between the flags at Malpe. Paddle only at Kaup, Padukere, the Delta and Mattu.`,
  `Water rides and the parasail: life jacket on, price agreed first, and only when the operators are running.`,
  `Hear thunder: get off the water, the rocks and the lighthouse.`,
  `At Arbi Falls, Kemmannu, the Delta and Mattu, keep the driver’s number or have him wait.`,
  `Arbi Falls: feet in only, no swimming, and slow on the wet rocks.`,
  `Night out: bars serve alcohol only to guests 21 and over, so carry photo ID.`,
  `Temples: formal trousers, shirt off near the sanctum if asked, no photos there.`
];
TRIP.SAVERS = [
  `Student ID at Hasta Shilpa: save ₹150.`,
  `Quote the Rapido Auto price on long legs: save ₹300–500 across the trip.`,
  `NH66 bus from Udupi to Kaup instead of an auto: about ₹30 instead of ₹300.`,
  `Two water rides instead of three: save ₹200–800.`,
  `A 30-minute self-paddle instead of a guided trail: save ₹400–600.`,
  `Friday’s surf plan by bus instead of cabs: save about ₹1,500.`
];
TRIP.SOURCES = [
  [`Train 12133 timetable (ixigo)`, `https://www.ixigo.com/trains/12133`],
  [`Train 17378 timetable (ixigo)`, `https://www.ixigo.com/trains/17378`],
  [`Malpe and St Mary’s reopen (Daijiworld, 19 Sep)`, `https://daijiworld.com/news/newsDisplay?newsID=1326154`],
  [`Rain until 11 Oct (News Karnataka, 5 Oct)`, `https://newskarnataka.com/mangaluru/dakshina-kannada-udupi-rain-to-continue-till-october-11/05102026`],
  [`Chariot season break (Deccan Chronicle)`, `https://www.deccanchronicle.com/nation/udupi-sri-krishna-maths-rathotsava-season-concludes-1959674`],
  [`Konkan monsoon timetable to 20 Oct (Metrovaartha)`, `https://english.metrovaartha.com/news/national/konkan-railway-gears-up-for-monsoon-2026`],
  [`Parasailing at Malpe (Karnataka Tourism)`, `https://karnatakatourism.org/experiences/parasailing-at-malpe-beach`],
  [`Mantra Surf Club: Discover Surfing`, `https://surfingindia.net/discover-surfing/`],
  [`Mantra Surf Club: season and FAQ`, `https://surfingindia.net/faq/`],
  [`Arbi Falls, Manipal (eNidhi)`, `https://www.enidhi.net/2024/07/arbi-falls-manipal-near-udupi.html`],
  [`Malpe Sea Walkway (Udupi Tourism)`, `https://udupitourism.com/explore/leisure-and-lifestyle/malpe-sea-walkway`],
  [`Paradise Isle Beach Resort, Malpe (KSTDC)`, `https://kstdc.co/hotels/paradise-isle-beach-resort-malpe-beach/`],
  [`The High Point Lounge (EazyDiner)`, `https://www.eazydiner.com/mangalore-tricity/the-high-point-lounge-vidyaratna-nagar-manipal-710912`],
  [`Guzzlers Inn (EazyDiner)`, `https://www.eazydiner.com/manipal/guzzlers-inn-manipal-689324`],
  [`Country Inn Manipal: Next-2 and Big Shot`, `https://www.radissonhotels.com/en-us/hotels/country-inn-manipal/restaurant-bar`]
];
