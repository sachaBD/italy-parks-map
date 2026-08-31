/* ---------------------------------------------------------------
   Seceda ridge walk — track data
   Edit this file to change the walk. Nothing else needs to change.
   Coordinates are WGS84 decimal degrees (lat, lon).
   --------------------------------------------------------------- */

window.WALK = {

  park:      'Parco naturale Puez-Odle',
  parkAlt:   'Puez-Odle Nature Park',
  region:    'Val Gardena · Dolomites · South Tyrol',
  name:      'Seceda Ridge Walk',
  lede:      'A high, open traverse under the Odle spires, from the Seceda cable-car station east along the ridge and down through meadow basins to the Col Raiser gondola.',

  /* Headline facts, shown as chips under the title. */
  chips: ['9 km one way', '2½ – 3½ hrs', 'Grade 3', 'Return by gondola'],

  /* Walking track grade, Australian Walking Track Grading System. */
  grade: {
    number: 3,
    title:  'Grade 3 — moderate',
    detail: 'Suitable for most ages and fitness levels. Some walking experience recommended. The track is formed and well signposted throughout, with a sustained steep descent below Pieralongia and a short climb at the end.'
  },

  /* Yellow alert strip. Set to null to hide it. */
  alert: {
    title: 'Plan around the last gondola',
    text:  'The walk finishes at Col Raiser, and the way home is the gondola down to Santa Cristina. Last descent is usually between 17:00 and 17:30 — read the board at the station rather than trusting a published time. On foot, Santa Cristina is a further 1½ hours down.'
  },

  /* "At a glance" rows, NPWS-style fact panel. */
  glance: [
    ['Distance',        '9 km one way, Seceda top station to Col Raiser'],
    ['Time suggested',  '2½ to 3½ hours walking, longer with hut stops'],
    ['Grade',           'Grade 3 (moderate)'],
    ['Track surface',   'Formed gravel and worn earth path, some loose stone on the descent'],
    ['Signage',         'Yellow signposts at every junction. Follow trails 1, then 2, then 4'],
    ['Elevation',       'Starts 2,519 m, low point 2,037 m, finishes 2,106 m. About 480 m down, 70 m up'],
    ['Best time',       'Mid June to early October, once the lifts are running and the snow has gone'],
    ['Entry',           'The park is free. You pay for the Seceda cable car up and the Col Raiser gondola down'],
    ['Dogs',            'Permitted on a lead. Cattle and horses graze the meadows below Rifugio Firenze']
  ],

  /* Real walking distance, km. The drawn line is straighter than the
     path on the ground, so the height profile is scaled to this. */
  distanceKm: 9,

  /* Map framing. */
  centre: [46.5960, 11.7420],
  zoom:   14,

  /* The five stops, in walking order. */
  stops: [
    {
      n: 1, name: 'Seceda ridge', alt: 2519, lat: 46.6068, lon: 11.7268,
      leg: 'Cable-car top station, the start',
      note: 'Walk out to the cliff edge before you turn east. The escarpment drops away to the north and the Odle wall runs the length of the skyline. From here the whole route stays on the sunny southern side, so there is no shade and no water until the first hut.',
      kind: 'lift'
    },
    {
      n: 2, name: 'Troier hut', alt: 2340, lat: 46.5981, lon: 11.7395,
      leg: 'Trail 1 east, about 30 minutes, downhill',
      note: 'The best terrace view back at the ridge you have just walked off. Drinks and sandwiches from opening, full kitchen from 11:30.',
      kind: 'hut'
    },
    {
      n: 3, name: 'Pieralongia', alt: 2280, lat: 46.5974, lon: 11.7477,
      leg: 'Trail 1, about 30 minutes, near level',
      note: 'Sits directly beneath the Pieralongia spires, the two free-standing towers you have been walking towards all morning. Order the apple strudel with vanilla cream.',
      kind: 'hut'
    },
    {
      n: 4, name: 'Rifugio Firenze', alt: 2037, lat: 46.5874, lon: 11.7583,
      leg: 'Trail 2, about 45 minutes, steep descent',
      note: 'The low point of the walk, in a wide meadow basin with grazing horses. A proper rifugio with beds and a full kitchen, which closes around 19:00. Fill your water here before the last climb.',
      kind: 'hut'
    },
    {
      n: 5, name: 'Col Raiser', alt: 2106, lat: 46.5849, lon: 11.7454,
      leg: 'Trail 4, about 45 minutes, back uphill',
      note: 'The end of the walk. Gondola down to Santa Cristina, with a bar at the station if you have time to fill. The climb up from Firenze is only 70 m but it comes at the end of the day, so leave more time for it than the distance suggests.',
      kind: 'lift'
    }
  ],

  /* Indicative track line. Shaping points between the stops so the
     drawn route follows the shape of the walk rather than cutting
     straight across the basins. Not a survey trace. */
  line: [
    [46.6068, 11.7268], [46.6050, 11.7295], [46.6028, 11.7318],
    [46.6008, 11.7345], [46.5993, 11.7372], [46.5981, 11.7395],
    [46.5978, 11.7420], [46.5980, 11.7445], [46.5974, 11.7477],
    [46.5952, 11.7500], [46.5930, 11.7522], [46.5905, 11.7548],
    [46.5888, 11.7570], [46.5874, 11.7583], [46.5866, 11.7555],
    [46.5858, 11.7522], [46.5852, 11.7490], [46.5849, 11.7454]
  ],

  /* Facilities along the way. */
  facilities: [
    ['food',    'Food and drink', 'Three huts on the route'],
    ['beds',    'Accommodation',  'Beds at Rifugio Firenze'],
    ['water',   'Drinking water', 'At the huts only'],
    ['toilets', 'Toilets',        'At the huts and both lift stations'],
    ['lookout', 'Lookouts',       'Seceda ridge and Pieralongia'],
    ['lift',    'Lift access',    'Cable car up, gondola down']
  ],

  gettingThere: [
    ['By lift', 'Ortisei / St Ulrich to Furnes, then the Seceda cable car to the top station at 2,519 m. Allow 25 minutes for both stages plus queueing in high summer.'],
    ['By car',  'Park in the multi-storey at Ortisei, a few minutes walk from the Furnes lift. The walk is one way, so leave the car at Ortisei and take the bus back from Santa Cristina at the end. It runs every 20 to 30 minutes along the valley.'],
    ['Return',  'Col Raiser gondola down to Santa Cristina, then the valley bus back to Ortisei.']
  ],

  prepare: [
    'Carry two litres of water per person. There is none between the huts.',
    'Sun protection matters more than you expect at 2,500 m, and the route has no shade.',
    'Take a warm layer and a shell. Afternoon storms build fast over the Odle in summer.',
    'Boots or trail shoes with grip. The descent below Pieralongia is loose in places.',
    'Check the lift running times for both ends before you start walking.',
    'Emergency number in Italy is 112. Mobile coverage is good on the ridge and patchy in the basin.'
  ],

  /* Shown as a note, not drawn on the map, because we do not have a
     reliable trace for it. */
  shorterOption: 'For a shorter day, drop south from the ridge past the Daniel and Fermeda huts and pick up the Col Raiser gondola directly. It cuts roughly an hour but misses Pieralongia and Rifugio Firenze, which are the best of the walk.',

  /* Assumed last descent, used for the countdown in the alert. */
  lastGondola: [17, 15]
};
