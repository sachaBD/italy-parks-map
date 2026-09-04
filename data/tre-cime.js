/* ---------------------------------------------------------------
   Tre Cime di Lavaredo / Drei Zinnen circuit
   Figures from the AllTrails listing (10.1 km, 493 m of climb,
   3½–4 hrs); the track line traced from a screenshot of its map,
   which measures 9.8 km against the stated 10.1 km.

   Position: anchored on the Rifugio Locatelli / Dreizinnenhütte
   marker (46.63682, 12.31062), with the scale read off the map's
   own 200 m scale bar — 76 px, so 2.632 m per pixel. Checked
   against the Rifugio Lavaredo marker, which lands 16 m from its
   published latitude, and corroborated afterwards on Monte Paterno,
   which was not part of the fit and lands 38 m from its published
   summit. The start marker sits about 90 m south of the mapped
   Rifugio Auronzo building, which is the car park, not an error.
   --------------------------------------------------------------- */
(window.WALKS = window.WALKS || {})['tre-cime'] = {

  id:     'tre-cime',
  status: 'published',
  colour: '#8C2F55',

  name:    'Tre Cime di Lavaredo circuit',
  card:    'The full lap of the Three Peaks from the Rifugio Auronzo car park, past three refuges and round the back of the north faces.',
  lede:    'A circuit of the three most photographed towers in the Alps, starting and finishing at the Rifugio Auronzo car park. Path 101 runs east under the south faces to Forcella Lavaredo, drops to the Rifugio Locatelli for the head-on view of all three north walls, and path 105 brings you back round the western side over Forcella Col di Mezzo.',

  park:    'Parco naturale Tre Cime di Lavaredo',
  parkAlt: 'Drei Zinnen Nature Park',
  region:  'Tre Cime di Lavaredo · Sesto Dolomites',

  chips: ['10.1 km circuit', '3½ – 4 hrs', '493 m climb', 'Circular from the car park'],

  grade: {
    number: 3,
    title:  'Grade 3 — moderate',
    detail: 'A broad, well-made and heavily walked track for nearly all of its length, signposted at every junction. What makes it a half day rather than a stroll is the length and the repeated ups and downs — the climb back out of the basin below the Rifugio Locatelli, and the pull up to Forcella Col di Mezzo on the way home, are both steady rather than steep.'
  },

  alert: {
    title: 'The toll road has to be booked the day before',
    text:  'The road up to the Rifugio Auronzo car park is a private toll road and the only way to park at the trailhead is an online reservation through pass.auronzo.info. Same-day bookings are not accepted — reserve by 23:59 the night before and have the number plate on the booking. Reckon on about €40 for a car, which covers the road and up to 12 hours of parking. The road usually opens for the season in late May.'
  },

  glance: [
    ['Distance',       '10.1 km, a circuit back to the car park'],
    ['Time suggested', '3½ to 4 hours walking, longer with refuge stops'],
    ['Grade',          'Grade 3 (moderate)'],
    ['Climb',          'About 493 m of ascent, spread over three separate climbs'],
    ['High point',     'Forcella Lavaredo, 2454 m, about a third of the way round'],
    ['Start',          'Rifugio Auronzo car park, 2320 m, at the end of the toll road'],
    ['Trails',         '101 out to Forcella Lavaredo and the Rifugio Locatelli, 105 back over Forcella Col di Mezzo'],
    ['Terrain',        'Wide gravel track and stony mountain path, no exposure'],
    ['Refuges',        'Auronzo, Lavaredo and Locatelli on the route, Malga Langalm just off it'],
    ['Best time',      'Late June to early October, once the toll road is open and the snow has gone'],
    ['Direction',      'Drawn anticlockwise, east first, which is the way nearly everyone walks it']
  ],

  distanceKm: 10.1,
  centre:     [46.62432, 12.29954],
  zoom:       14,

  stops: [
    { n: 1, name: 'Rifugio Auronzo', alt: 2320,
      lat: 46.61137, lon: 12.29627,
      leg:  'The start and the finish',
      note: 'The end of the toll road, and where the walk begins and ends. A big refuge with a bar, restaurant, beds and toilets, sitting on the Forcella Longeres saddle with the three towers immediately above it. The car park stretches along the road below the building — the walk starts from the eastern end of it, on the wide gravel track signed 101.',
      kind: 'hut' },
    { n: 2, name: 'Rifugio Lavaredo', alt: 2344,
      lat: 46.61763, lon: 12.31232,
      leg:  'Path 101 east, about 30 minutes, almost level',
      note: 'A gentle traverse under the south faces on a track wide enough to walk two abreast, passing the small Cappella degli Alpini chapel on the way. The refuge is much smaller than the Auronzo — a bar, a restaurant and 24 beds — and it is the last food before the far side of the peaks.',
      kind: 'hut' },
    { n: 3, name: 'Forcella Lavaredo', alt: 2454,
      lat: 46.62181, lon: 12.31167,
      leg:  'Path 101, a 15 to 20 minute climb',
      note: 'The saddle between Cima Piccola and Monte Paterno, and the high point of the walk. This is where the peaks turn round: you come up looking at the south side and arrive looking down the far slope with the north walls beginning to show. The provincial border between Belluno and South Tyrol runs across the gap.' },
    { n: 4, name: 'Rifugio Antonio Locatelli / Dreizinnenhütte', alt: 2405,
      lat: 46.63682, lon: 12.31062,
      leg:  'Path 101 down and round, about 45 minutes',
      note: 'The classic view. The track drops from the forcella and traverses below Monte Paterno before the short climb to the hut, which faces the three north walls square on. A large refuge with meals and beds, busy from mid-morning onward. The drawn line makes a small loop here because the route goes up past the hut on path 102 and comes back down beside it.',
      kind: 'hut' },
    { n: 5, name: 'Malga Langalm', alt: 2235,
      lat: 46.62520, lon: 12.28936,
      leg:  'Path 105 south-west, about 50 minutes, downhill then up',
      note: 'From the hut the path zigzags down into the basin below the north faces, then rises across the far side of it to the alm. A working alp with a simple hut selling cheese, milk and something to eat — quieter than anything else on the circuit. It stands about 120 m off the path, which is why the marker sits a little to one side of the drawn line.',
      kind: 'hut' },
    { n: 6, name: 'Forcella Col di Mezzo', alt: 2315,
      lat: 46.61679, lon: 12.28376,
      leg:  'Path 105, the last climb',
      note: 'The gap on the western ridge, and the last of the three climbs. Crossing it puts you back on the Belluno side with the car park in sight; the rest is a steady descent east under Torre Lavaredo and Croda di Mezzo to the Rifugio Auronzo, about an hour from here.' }
  ],

  line: [
    [46.61137, 12.29627], [46.61258, 12.29658], [46.61289, 12.29768],
    [46.61289, 12.29936], [46.61355, 12.30160], [46.61336, 12.30270],
    [46.61336, 12.30424], [46.61274, 12.30521], [46.61270, 12.30583],
    [46.61267, 12.30734], [46.61305, 12.30840], [46.61443, 12.30899],
    [46.61568, 12.31009], [46.61708, 12.31102], [46.61795, 12.31225],
    [46.61985, 12.31212], [46.62015, 12.31325], [46.62001, 12.31459],
    [46.62025, 12.31476], [46.62086, 12.31466], [46.62098, 12.31504],
    [46.62134, 12.31541], [46.62193, 12.31459], [46.62221, 12.31380],
    [46.62219, 12.31277], [46.62181, 12.31163], [46.62193, 12.31153],
    [46.62247, 12.31177], [46.62380, 12.31308], [46.62427, 12.31328],
    [46.62550, 12.31304], [46.62655, 12.31212], [46.62792, 12.31119],
    [46.62877, 12.31119], [46.62991, 12.31064], [46.63095, 12.31067],
    [46.63211, 12.31136], [46.63403, 12.31212], [46.63450, 12.31184],
    [46.63452, 12.31126], [46.63665, 12.31102], [46.63684, 12.31088],
    [46.63701, 12.31029], [46.63727, 12.30899], [46.63725, 12.30827],
    [46.63677, 12.30803], [46.63564, 12.30813], [46.63545, 12.30830],
    [46.63535, 12.30864], [46.63507, 12.31064], [46.63452, 12.31126],
    [46.63441, 12.31064], [46.63455, 12.30943], [46.63436, 12.30827],
    [46.63467, 12.30785], [46.63462, 12.30741], [46.63448, 12.30710],
    [46.63391, 12.30682], [46.63379, 12.30593], [46.63348, 12.30534],
    [46.63358, 12.30517], [46.63351, 12.30473], [46.63296, 12.30390],
    [46.63280, 12.30383], [46.63182, 12.30383], [46.63083, 12.30421],
    [46.63024, 12.30363], [46.62984, 12.30177], [46.62972, 12.29844],
    [46.62955, 12.29754], [46.62861, 12.29459], [46.62782, 12.29404],
    [46.62737, 12.29304], [46.62572, 12.29070], [46.62415, 12.28974],
    [46.62394, 12.28933], [46.62368, 12.28689], [46.62299, 12.28589],
    [46.62210, 12.28517], [46.62058, 12.28527], [46.61989, 12.28465],
    [46.61925, 12.28431], [46.61738, 12.28452], [46.61648, 12.28366],
    [46.61632, 12.28376], [46.61599, 12.28414], [46.61516, 12.28644],
    [46.61464, 12.28675], [46.61440, 12.28713], [46.61414, 12.28878],
    [46.61376, 12.28974], [46.61327, 12.29180], [46.61310, 12.29222],
    [46.61220, 12.29307], [46.61199, 12.29397], [46.61170, 12.29459],
    [46.61137, 12.29627]
  ],

  facilities: [
    ['food',    'Food and drink', 'Rifugio Auronzo at the start and finish, Rifugio Lavaredo, Rifugio Locatelli, and Malga Langalm just off the path'],
    ['beds',    'Accommodation',  'Beds at all three refuges — the Locatelli is the one to book if you want the north faces at sunrise'],
    ['toilets', 'Toilets',        'At the Rifugio Auronzo and at the refuges on the way round'],
    ['lookout', 'Lookouts',       'Forcella Lavaredo for the turn of the peaks, the Rifugio Locatelli for the three north walls together']
  ],

  gettingThere: [
    ['By car',  'From Misurina, the toll road climbs to the Rifugio Auronzo car park at 2320 m. Access is by online booking only, made the day before at pass.auronzo.info, and costs around €40 for a car including up to 12 hours of parking. The car park fills through the morning, so an early slot is worth having.'],
    ['By bus',  'Seasonal buses run up the toll road from Cortina, Dobbiaco and Misurina, which avoids the booking and the parking altogether.'],
    ['Return',  'The walk is a circuit, so it finishes at the car park it starts from.']
  ],

  prepare: [
    'Nothing on the circuit is technical, but it is 10 km at 2300 m with three climbs in it — take it as a half day, not an hour.',
    'The high side of the loop faces north and holds snow into early summer; the path below the Rifugio Locatelli is the part that stays under it longest.',
    'Almost no shade anywhere on the route, and afternoon thunderstorms are common in July and August. Start early.',
    'Refuges are open roughly late June to late September. Outside that, carry everything, including water.',
    'Emergency number in Italy is 112.'
  ],

  shorterOption: 'For the view without the full lap, walk path 101 out to Forcella Lavaredo and back — about 4.5 km return and an hour and a half, with the best of the south faces and the turn of the peaks at the saddle. Carrying on to the Rifugio Locatelli and returning the same way makes it about 8 km, and still avoids the climb over Forcella Col di Mezzo.',

  lastLift: null
};
