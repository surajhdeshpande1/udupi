/* Udupi Coast Trip: the drawn map's geography. Latitude, longitude in degrees, from public maps and
   Wikipedia; positions are approximate to a few hundred metres, which is plenty for a drawn map. */
'use strict';
TRIP.GEO = {
  /* Each place the plan visits. a: the area it belongs to on the map. */
  areas: {
    udupi: { n: `Udupi`, ll: [13.3402, 74.7478], home: 1 },
    arbi: { n: `Arbi Falls`, ll: [13.3505, 74.8150] },
    endpoint: { n: `End Point`, ll: [13.3585, 74.7950] },
    manipal: { n: `Manipal`, ll: [13.3510, 74.7860] },
    station: { n: `Udupi station`, ll: [13.3361, 74.7708] },
    malpe: { n: `Malpe`, ll: [13.3495, 74.7010] },
    stmarys: { n: `St Mary’s Island`, ll: [13.3795, 74.6730], sea: 1 },
    padukere: { n: `Padukere`, ll: [13.3330, 74.7040] },
    hoode: { n: `Hoode`, ll: [13.3940, 74.6965] },
    kemmannu: { n: `Kemmannu`, ll: [13.4085, 74.7045] },
    delta: { n: `Delta`, ll: [13.4497, 74.6951] },
    kodi: { n: `Kodi beach`, ll: [13.6455, 74.6675] },
    maravanthe: { n: `Maravanthe`, ll: [13.7040, 74.6435] },
    ottinene: { n: `Ottinene`, ll: [13.8730, 74.6110] },
    someshwara: { n: `Someshwara`, ll: [13.8605, 74.6075] },
    mattu: { n: `Mattu`, ll: [13.2750, 74.7335] },
    kaup: { n: `Kaup`, ll: [13.2215, 74.7440] },
    padubidri: { n: `Padubidri`, ll: [13.1455, 74.7610] },
    mulki: { n: `Mulki`, ll: [13.0870, 74.7795] },
    mangaluru: { n: `Mangaluru Jn`, ll: [12.8667, 74.8814], rail: 1 }
  },
  /* Which area each stop's Maps query belongs to. */
  at: {
    'CPC Plaza, Udupi': `udupi`, 'Car Street, Udupi': `udupi`, 'Udupi Sri Krishna Matha': `udupi`, 'Woodlands Restaurant, Udupi': `udupi`,
    'Diana Restaurant, Udupi': `udupi`, 'Mitra Samaj, Udupi': `udupi`, 'Pai Tiffins, Udupi': `udupi`,
    'Arbi Falls, Manipal': `arbi`, 'End Point, Manipal': `endpoint`, 'Hasta Shilpa Heritage Village, Manipal': `manipal`, 'The High Point Lounge, Manipal': `manipal`,
    'Udupi Railway Station': `station`,
    'Malpe Beach': `malpe`, 'Malpe Sea Walk': `malpe`, 'Malpe Fishing Harbour': `malpe`, "St Mary's Island Boating, Malpe": `malpe`, 'Hotel Shivsagar, Malpe': `malpe`, 'Paradise Isle Beach Resort, Malpe': `malpe`,
    "St Mary's Island, Malpe": `stmarys`, 'Padukere Beach, Malpe': `padukere`, 'Hoode Beach, Udupi': `hoode`, 'Kemmannu Hanging Bridge': `kemmannu`, 'Delta Beach, Kodi Bengre': `delta`,
    'Kodi Beach, Kundapura': `kodi`, 'Maravanthe Beach': `maravanthe`, 'Kshitija Nesaradhama, Ottinene': `ottinene`, 'Someshwara Beach, Byndoor': `someshwara`,
    'Mattu Beach, Udupi': `mattu`, 'Kaup Beach': `kaup`, 'Kaup Lighthouse': `kaup`, 'Padubidri Blue Flag Beach': `padubidri`, 'Mantra Surf Club, Mulki': `mulki`,
    'Mangaluru Junction Railway Station': `mangaluru`
  },
  /* The coastline, south to north. */
  coast: [[12.84, 74.835], [12.9, 74.812], [12.95, 74.8], [13, 74.79], [13.04, 74.783], [13.07, 74.777], [13.084, 74.775], [13.11, 74.769], [13.145, 74.759], [13.185, 74.75], [13.22, 74.741], [13.245, 74.737], [13.262, 74.734], [13.285, 74.729], [13.31, 74.716], [13.333, 74.702], [13.343, 74.699], [13.355, 74.7], [13.375, 74.698], [13.394, 74.695], [13.42, 74.694], [13.449, 74.693], [13.457, 74.699], [13.48, 74.693], [13.52, 74.684], [13.57, 74.676], [13.61, 74.67], [13.64, 74.666], [13.654, 74.663], [13.68, 74.651], [13.704, 74.641], [13.74, 74.633], [13.78, 74.625], [13.825, 74.615], [13.866, 74.605], [13.9, 74.598], [13.96, 74.588]],
  rivers: [
    [[13.1, 74.86], [13.093, 74.82], [13.09, 74.795], [13.086, 74.783], [13.084, 74.775]],
    [[13.272, 74.775], [13.266, 74.752], [13.262, 74.735]],
    [[13.297, 74.775], [13.302, 74.752], [13.309, 74.735], [13.32, 74.718], [13.332, 74.708], [13.343, 74.7]],
    [[13.395, 74.9], [13.378, 74.85], [13.368, 74.812], [13.374, 74.785], [13.39, 74.752], [13.398, 74.728], [13.406, 74.708], [13.42, 74.7], [13.438, 74.698], [13.451, 74.696]],
    [[13.47, 74.8], [13.462, 74.76], [13.458, 74.725], [13.455, 74.705], [13.452, 74.697]],
    [[13.625, 74.73], [13.632, 74.7], [13.645, 74.68], [13.654, 74.664]],
    [[13.79, 74.76], [13.745, 74.69], [13.718, 74.655], [13.706, 74.648], [13.69, 74.656], [13.672, 74.663], [13.656, 74.665]],
    [[13.875, 74.68], [13.87, 74.64], [13.868, 74.618], [13.866, 74.606]]
  ],
  nh66: [[12.9, 74.83], [12.95, 74.815], [13, 74.8], [13.05, 74.798], [13.091, 74.792], [13.105, 74.783], [13.141, 74.771], [13.17, 74.763], [13.2, 74.757], [13.224, 74.751], [13.245, 74.757], [13.262, 74.76], [13.285, 74.752], [13.305, 74.742], [13.322, 74.74], [13.34, 74.741], [13.36, 74.744], [13.385, 74.743], [13.41, 74.745], [13.432, 74.747], [13.46, 74.733], [13.487, 74.721], [13.524, 74.705], [13.58, 74.699], [13.625, 74.692], [13.65, 74.682], [13.672, 74.664], [13.692, 74.65], [13.704, 74.645], [13.73, 74.642], [13.758, 74.64], [13.8, 74.633], [13.84, 74.632], [13.866, 74.634], [13.92, 74.625], [13.96, 74.618]],
  roads: [
    [[13.3405, 74.7475], [13.3425, 74.735], [13.3455, 74.72], [13.348, 74.708], [13.349, 74.702]],
    [[13.3405, 74.7475], [13.342, 74.76], [13.3465, 74.772], [13.35, 74.783], [13.353, 74.792]],
    [[13.349, 74.703], [13.37, 74.701], [13.394, 74.6985], [13.42, 74.6975], [13.448, 74.6965]],
    [[13.395, 74.742], [13.401, 74.725], [13.4085, 74.706]],
    [[13.346, 74.712], [13.338, 74.711], [13.333, 74.706]],
    [[13.262, 74.76], [13.27, 74.745], [13.275, 74.735]]
  ],
  rail: [[13.3361, 74.7708], [13.3, 74.765], [13.22, 74.766], [13.14, 74.786], [13.09, 74.805], [13, 74.808], [12.95, 74.83], [12.9, 74.86], [12.8667, 74.8814]],
  towns: [[`Udupi`, 13.3405, 74.748, 1], [`Manipal`, 13.35, 74.788, 1], [`Malpe`, 13.352, 74.705], [`Brahmavar`, 13.432, 74.748], [`Kota`, 13.524, 74.706], [`Kundapura`, 13.625, 74.693, 1], [`Byndoor`, 13.866, 74.6333], [`Katapady`, 13.262, 74.762], [`Kaup`, 13.2236, 74.75], [`Padubidri`, 13.1408, 74.7721], [`Mulki`, 13.0915, 74.7935], [`Surathkal`, 13, 74.8], [`Mangaluru`, 12.9141, 74.856, 1]]
};
