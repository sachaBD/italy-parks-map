/* ---------------------------------------------------------------
   Circular Trail on Resciesa / Raschötz
   Figures from the komoot route listing; the track line traced from
   its map, which measures 5.13 km against a stated 5.30 km.

   Position: anchored on the funicular top station as OpenStreetMap
   maps it, read off a screenshot of this page by comparing the drawn
   line against the terrain beneath it. The first placement was an
   estimate and sat 658 m south-west of the station.
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

  alert: null,

  glance: [
    ['Distance',       '5.3 km, a circuit returning to the start'],
    ['Time suggested', 'About 1 hour 40, at a walking average of 3.1 km/h'],
    ['Climb',          '180 m up and the same back down'],
    ['Getting up',     'The Resciesa funicular from Ortisei'],
    ['Terrain',        'Open ridge and alp pasture, on made tracks'],
    ['Outlook',        'South across Val Gardena to Seceda and the Odle']
  ],

  distanceKm: 5.3,
  centre:     [46.60081, 11.66745],
  zoom:       15,

  stops: [
    { n: 1, name: 'Resciesa funicular, top station', alt: 2122,
      lat: 46.59794, lon: 11.67942,
      leg:  'The start and the finish',
      note: 'The funicular climbs straight out of Ortisei to the ridge. The circuit begins and ends here, so it can be walked either way round.',
      kind: 'lift' },
    { n: 2, name: 'Piz da Ciastel / Schlosskofel', alt: 2204,
      lat: 46.60847, lon: 11.67625,
      leg:  'The peak standing over the northern side',
      note: 'Not on the route, but it is the summit above the outward leg and the thing you are walking beneath.' },
    { n: 3, name: 'Western turn', alt: 0,
      lat: 46.60068, lon: 11.65287,
      leg:  'The far end of the circuit',
      note: 'Where the outward leg turns and the return line starts back east, a little lower down the slope. The Rasciesa di Fuori summit, 2283 m, stands just above.' }
  ],

  line: [
    [46.59794, 11.67942], [46.59878, 11.67970], [46.59854, 11.67865],
    [46.59859, 11.67687], [46.59912, 11.67460], [46.59984, 11.66818],
    [46.60015, 11.66777], [46.60020, 11.66742], [46.60020, 11.66717],
    [46.59996, 11.66682], [46.60008, 11.66564], [46.60006, 11.66358],
    [46.60018, 11.66239], [46.60003, 11.66218], [46.60001, 11.66183],
    [46.60066, 11.66002], [46.60056, 11.65918], [46.60018, 11.65862],
    [46.60044, 11.65789], [46.60078, 11.65751], [46.60068, 11.65702],
    [46.60083, 11.65681], [46.60037, 11.65541], [46.60027, 11.65451],
    [46.60042, 11.65374], [46.60025, 11.65339], [46.60109, 11.65353],
    [46.60131, 11.65343], [46.60225, 11.65430], [46.60249, 11.65398],
    [46.60292, 11.65398], [46.60311, 11.65426], [46.60304, 11.65451],
    [46.60338, 11.65580], [46.60369, 11.65639], [46.60369, 11.65691],
    [46.60335, 11.65733], [46.60342, 11.65814], [46.60328, 11.65852],
    [46.60311, 11.66100], [46.60258, 11.66323], [46.60212, 11.66641],
    [46.60162, 11.66770], [46.60136, 11.66934], [46.60102, 11.67063],
    [46.60092, 11.67227], [46.60078, 11.67307], [46.60080, 11.67474],
    [46.60047, 11.67659], [46.60075, 11.67708], [46.60068, 11.67764],
    [46.60042, 11.67802], [46.60059, 11.67914], [46.59950, 11.68085],
    [46.59955, 11.68095], [46.59938, 11.68130], [46.59917, 11.68151],
    [46.59806, 11.68054], [46.59816, 11.68015], [46.59794, 11.67942]
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
