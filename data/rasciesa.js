/* ---------------------------------------------------------------
   Circular Trail on Resciesa / Raschötz
   Figures from the komoot route listing; the track line traced from
   its map, which measures 5.13 km against a stated 5.30 km.

   The POSITION of this loop is an estimate of the Resciesa funicular
   top station and has not been verified, exactly like the Monte Piz
   loop. Shape and size are right; the placement may be out by a few
   hundred metres.
   --------------------------------------------------------------- */
(window.WALKS = window.WALKS || {})['rasciesa'] = {

  id:     'rasciesa',
  status: 'published',
  colour: '#B5852A',

  name:    'Circular Trail on Resciesa',
  card:    'An easy-angled circuit along the Resciesa ridge above Ortisei, straight off the top of the funicular.',
  lede:    'A short circuit on the broad ridge north of Val Gardena, starting at the top of the Resciesa funicular from Ortisei. It runs west along the open ridge and returns on a parallel line below, looking south the whole way at Seceda and the Odle.',

  park:    '',
  parkAlt: '',
  region:  'Resciesa · Val Gardena · Dolomites',

  chips: ['5.3 km circuit', '1 hr 40', '180 m climb', 'Funicular access'],

  grade: {
    number: 3,
    title:  'Grade 3 — moderate',
    detail: 'The route is listed as hard on komoot, which is worth taking with a pinch of salt: 5.3 km with 180 m of climbing, ' +
            'walked at an average 3.1 km/h, is a comfortable half day. That rating usually reflects the surface underfoot ' +
            'rather than the effort.'
  },

  alert: {
    title: 'The track line is positioned by estimate',
    text:  'The shape and length of this circuit are traced from the route map and check out, but its position has not been ' +
           'verified against a known coordinate. Treat the line as a picture of the walk, not as something to navigate by, ' +
           'and follow the signposts on the ground.'
  },

  glance: [
    ['Distance',       '5.3 km, a circuit returning to the start'],
    ['Time suggested', 'About 1 hour 40, at a walking average of 3.1 km/h'],
    ['Climb',          '180 m up and the same back down'],
    ['Getting up',     'The Resciesa funicular from Ortisei'],
    ['Terrain',        'Open ridge and alp pasture, on made tracks'],
    ['Outlook',        'South across Val Gardena to Seceda and the Odle']
  ],

  distanceKm: 5.3,
  centre:     [46.59687, 11.66103],
  zoom:       15,

  stops: [
    { n: 1, name: 'Resciesa funicular, top station', alt: 2100,
      lat: 46.59400, lon: 11.67300,
      leg:  'The start and the finish',
      note: 'The funicular climbs straight out of Ortisei to the ridge. The circuit begins and ends here, so it can be walked either way round.',
      kind: 'lift' },
    { n: 2, name: 'Piz da Ciastel / Schlosskofel', alt: 2204,
      lat: 46.60453, lon: 11.66983,
      leg:  'The peak standing over the northern side',
      note: 'Not on the route, but it is the summit above the outward leg and the thing you are walking beneath.' },
    { n: 3, name: 'Western turn', alt: 0,
      lat: 46.59674, lon: 11.64645,
      leg:  'The far end of the circuit',
      note: 'Where the outward leg turns and the return line starts back east, a little lower down the slope.' }
  ],

  line: [
    [46.59400, 11.67300], [46.59484, 11.67328], [46.59460, 11.67223],
    [46.59465, 11.67045], [46.59518, 11.66818], [46.59590, 11.66176],
    [46.59621, 11.66135], [46.59626, 11.66100], [46.59626, 11.66075],
    [46.59602, 11.66040], [46.59614, 11.65922], [46.59612, 11.65716],
    [46.59624, 11.65597], [46.59609, 11.65576], [46.59607, 11.65541],
    [46.59672, 11.65360], [46.59662, 11.65276], [46.59624, 11.65220],
    [46.59650, 11.65147], [46.59684, 11.65109], [46.59674, 11.65060],
    [46.59689, 11.65039], [46.59643, 11.64899], [46.59633, 11.64809],
    [46.59648, 11.64732], [46.59631, 11.64697], [46.59715, 11.64711],
    [46.59737, 11.64701], [46.59831, 11.64788], [46.59855, 11.64756],
    [46.59898, 11.64756], [46.59917, 11.64784], [46.59910, 11.64809],
    [46.59944, 11.64938], [46.59975, 11.64997], [46.59975, 11.65049],
    [46.59941, 11.65091], [46.59948, 11.65172], [46.59934, 11.65210],
    [46.59917, 11.65458], [46.59864, 11.65681], [46.59818, 11.65999],
    [46.59768, 11.66128], [46.59742, 11.66292], [46.59708, 11.66421],
    [46.59698, 11.66585], [46.59684, 11.66665], [46.59686, 11.66832],
    [46.59653, 11.67017], [46.59681, 11.67066], [46.59674, 11.67122],
    [46.59648, 11.67160], [46.59665, 11.67272], [46.59556, 11.67443],
    [46.59561, 11.67453], [46.59544, 11.67488], [46.59523, 11.67509],
    [46.59412, 11.67412], [46.59422, 11.67373], [46.59400, 11.67300]
  ],

  facilities: [
    ['lift',    'Lift access',    'Resciesa funicular from Ortisei'],
    ['lookout', 'Lookouts',       'South the whole way, to Seceda and the Odle']
  ],

  gettingThere: [
    ['By lift', 'The Resciesa funicular leaves from Ortisei and climbs to the ridge in one stage.'],
    ['Return',  'Back down the funicular from the same station the circuit ends at.']
  ],

  prepare: [
    'Open ridge with little shade — the same sun exposure as any of these high walks.',
    'Check the last funicular down before you set out.',
    'Emergency number in Italy is 112.'
  ],

  shorterOption: '',
  lastLift: null,

  related: [
    { id: 'seceda', label: 'The Seceda ridge walk, on the far side of the valley →' }
  ]
};
