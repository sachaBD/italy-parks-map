/* ---------------------------------------------------------------
   Saltria to Mont Sëuc — the way back without repeating trail 9
   Written from a field handoff, 1 September 2026.

   Only one coordinate here is verified: Gostner Schwaige. The other
   waypoints are named turns with trail numbers and no coordinates,
   which is why there is no track line — a guessed line on a mountain
   is worse than none. Navigate by the trail numbers on the yellow
   signposts.
   --------------------------------------------------------------- */
(window.WALKS = window.WALKS || {})['saltria-return'] = {

  id:     'saltria-return',
  status: 'published',
  colour: '#7A4FA3',

  name:    'Saltria to Mont Sëuc',
  card:    'The way back up to the Ortisei gondola from Saltria, without repeating trail 9. Via Gostner Schwaige.',
  lede:    'A return leg rather than an outing: from Saltria, back up to the Mont Sëuc station for the gondola down to Ortisei, taking a different line to the one most people come down on. Around 320 m of climbing, with a hut worth stopping at halfway.',

  park:    'Alpe di Siusi – Seiser Alm',
  parkAlt: 'Europe’s largest high alpine meadow',
  region:  'Alpe di Siusi · Dolomites · South Tyrol',

  chips: ['~6 km from Saltria', '2 – 2½ hrs', '~320 m ascent', 'Ends at the gondola'],

  grade: {
    number: 3,
    title:  'Grade 3 — moderate',
    detail: 'Not hard walking, but it is uphill at the end of a day and the navigation is the difficult part: ' +
            'several junctions in quick succession, each signed only by trail number. Read every signpost.'
  },

  alert: {
    title: 'Confirm the last gondola before you start the climb',
    text:  'The last descent from Mont Sëuc has not been verified. Check it on the spot before committing to the ' +
           '320 m climb, because the bail-out is at the bottom, not the top. If in doubt, take the Almbus from ' +
           'Saltria to Compatsch instead — roughly every 20 minutes, cash on board, seasonal timetable.'
  },

  glance: [
    ['Distance',       'About 6 km from Saltria'],
    ['Time suggested', '2 to 2½ hours including a hut stop'],
    ['Ascent',         'About 320 m'],
    ['Start',          'Saltria, or Rifugio Saltner about 5 minutes west of it'],
    ['Finish',         'Mont Sëuc top station, for the gondola down to Ortisei'],
    ['Navigation',     'By trail number at every junction: 30, then 3, then 6, then 6A'],
    ['Bail-out',       'Almbus line 11, Saltria to Compatsch, roughly every 20 minutes, cash on board']
  ],

  distanceKm: 6,
  centre:     [46.53872, 11.63501],
  zoom:       14,

  /* Only Gostner Schwaige has a verified position. The rest are turns,
     listed in order, deliberately without coordinates. */
  stops: [
    { n: 1, name: 'Rifugio Saltner', alt: 1690,
      leg:  'The start, about 5 minutes west of Saltria',
      note: 'Head east on trail 30 to reach Saltria.' },

    { n: 2, name: 'Saltria', alt: 0,
      leg:  'Trail 30 east, about 5 minutes',
      note: 'Carry on east on 30. Do not follow 30 west out of Saltria — that is the forestry road to Monte Pana, the wrong direction entirely.' },

    { n: 3, name: 'Junction with trail 6', alt: 0,
      leg:  'Stay straight on 30',
      note: 'The first place to go wrong. Trail 6 is the way you will come back later; for now keep straight ahead on 30.' },

    { n: 4, name: 'Gostner Schwaige', alt: 1900,
      lat: 46.53872, lon: 11.63501,
      leg:  'Short left spur off 30 — about 3.5 km, 1 hour from Saltria',
      note: 'The hut, and the one point on this route with a confirmed position. Worth the stop. Afterwards drop back down to trail 30 the way you came up.' },

    { n: 5, name: 'Right onto trail 3', alt: 0,
      leg:  'Back down to 30, then right onto 3',
      note: 'Trail 3 runs alongside the tarmac for a stretch. On the panorama maps, white lines are tarmac and red are trail.' },

    { n: 6, name: 'Left onto trail 6', alt: 0,
      leg:  'Past Rifugio Contrin',
      note: 'Take plain 6. There is a 6-S near Contrin — that is a spur, not the route.' },

    { n: 7, name: 'Left onto trail 6A', alt: 0,
      leg:  'The final climb',
      note: 'The last of the ascent, up to the station.' },

    { n: 8, name: 'Mont Sëuc top station', alt: 2005,
      leg:  'The end — gondola down to Ortisei',
      note: 'Gondola down to Ortisei. Check the board for the last descent rather than trusting a published time.',
      kind: 'lift' }
  ],

  line: [],

  facilities: [
    ['food',    'Food and drink', 'Gostner Schwaige on the way, Rifugio Saltner at the start'],
    ['lift',    'Lift access',    'Mont Sëuc gondola down to Ortisei at the finish'],
    ['toilets', 'Toilets',        'At the huts and the gondola station']
  ],

  gettingThere: [
    ['Start',  'Saltria, at the south-eastern corner of the Alpe di Siusi. Rifugio Saltner is about 5 minutes west of the hamlet.'],
    ['Finish', 'Mont Sëuc top station, then the gondola down into Ortisei.'],
    ['By bus', 'Almbus line 11 runs Saltria to Compatsch roughly every 20 minutes on a seasonal timetable, cash on board. This is the fallback if the gondola time does not work out.']
  ],

  prepare: [
    'Navigate by trail number, not by map shape. The junctions come in quick succession and each is signed only by number.',
    'Check the last Mont Sëuc gondola before starting the climb — the bail-out is at the bottom of the route, not the top.',
    'On the panorama maps, white lines are tarmac and red are trail.',
    'Emergency number in Italy is 112.'
  ],

  shorterOption: 'Duller but simpler: trail 8, the road north out of Saltria, to the Rauch Hütte — about 20 minutes on tarmac — then 6 and 6A to the station. Fewer junctions to get wrong.',

  related: [
    { id: 'monte-piz',
      label: 'The Monte Piz loop from the same station →' }
  ],

  draftNote: 'There is no track line for this route. Only Gostner Schwaige has a verified position, and drawing a ' +
             'plausible-looking line through guessed waypoints would be worse than drawing none. Follow the trail ' +
             'numbers below and the yellow signposts.'
};
