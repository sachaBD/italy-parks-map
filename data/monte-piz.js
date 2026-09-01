/* ---------------------------------------------------------------
   Monte Piz – Schgaguler Hut via Monte Sëuc
   Alpe di Siusi / Seiser Alm, reached by the Mont Sëuc cable car
   from Ortisei.

   PARTIAL. The headline figures below are real, taken from the route
   listing. The geometry is not here yet: no track line, no stops, no
   coordinates. Those are deliberately empty rather than estimated —
   a route drawn from a screenshot would look authoritative and put
   someone on the wrong side of a bog.

   To finish it: run a GPX through tools/gpx-to-walk.js and paste the
   result into `line`, `distanceKm`, `centre` and `zoom`, then fill in
   `stops`. See data/TEMPLATE.js.
   --------------------------------------------------------------- */
(window.WALKS = window.WALKS || {})['monte-piz'] = {

  id:     'monte-piz',
  status: 'published',
  colour: '#2E6E8E',

  name:    'Monte Piz – Schgaguler Hut',
  card:    'A loop across the Alpe di Siusi from the Mont Sëuc cable car, over Monte Piz and round by the Schgaguler hut.',
  lede:    'A circuit of the open pasture on the Alpe di Siusi, starting from the top of the Mont Sëuc cable car above Ortisei, out over the Piz ridge and back past the Schgaguler hut. Gentle by Dolomites standards — the plateau does the work for you.',

  park:    'Alpe di Siusi – Seiser Alm',
  parkAlt: 'Europe’s largest high alpine meadow',
  region:  'Alpe di Siusi · Dolomites · South Tyrol',

  /* Figures from the route listing. */
  chips: ['7.7 km loop', '2 – 2½ hrs', '243 m climb', 'Moderate'],

  grade: {
    number: 3,
    title:  'Grade 3 — moderate',
    detail: 'Listed as moderate. 7.7 km with 243 m of climbing spread across a high plateau, ' +
            'on made tracks and farm lanes. The distance rather than the terrain is what makes it a half day.'
  },

  alert: null,

  glance: [
    ['Distance',       '7.7 km, a loop returning to the start'],
    ['Time suggested', '2 to 2½ hours walking'],
    ['Grade',          'Moderate'],
    ['Elevation',      '243 m of climbing over the walk'],
    ['Getting up',     'Mont Sëuc cable car from Ortisei'],
    ['Rating',         '4.8 from about 1,200 reviews']
  ],

  /* --- geometry still to come --------------------------------- */

  distanceKm: 7.7,
  centre:     [46.55160, 11.65188],
  zoom:       14,
  stops: [
    {
      n: 1, name: "Mont Sëuc top station", alt: 2005, lat: 46.55950, lon: 11.65800,
      leg:  '',
      note: "The cable car up from Ortisei lands here. The loop starts and finishes at the station, so it can be walked in either direction.",
      kind: 'lift'
    },
    {
      n: 2, name: "Piz Ridl – Coi da la Dodesc", alt: 2108, lat: 46.55974, lon: 11.64695,
      leg:  '',
      note: "The high point on the skyline above the northern arm, standing over the track as it runs west."
    },
    {
      n: 3, name: "Piz", alt: 1939, lat: 46.54952, lon: 11.64160,
      leg:  '',
      note: "The rounded summit the walk is named for, on the western side of the circuit."
    },
    {
      n: 4, name: "Biotop Großes Moos", alt: 0, lat: 46.54138, lon: 11.64410,
      leg:  '',
      note: "Protected wetland below the southern arm — boardwalk country, and the reason to stay on the track."
    },
    {
      n: 5, name: "Col di Valle – Col da Fil", alt: 0, lat: 46.54414, lon: 11.65507,
      leg:  '',
      note: "Where the southern arm turns north and the return leg begins."
    },
    {
      n: 6, name: "Biotop Moos Col da Fil", alt: 0, lat: 46.54742, lon: 11.65810,
      leg:  '',
      note: "A second protected mire, passed on the eastern side as the loop swings back to the station."
    },
    {
      n: 7, name: "Spring", alt: 0, lat: 46.55473, lon: 11.65174,
      leg:  '',
      note: "A water point marked on the plateau, inside the loop."
    },
    {
      n: 8, name: "Col da Mesdi", alt: 2008, lat: 46.56037, lon: 11.66409,
      leg:  '',
      note: "A low rise just east of the station, passed in the first few minutes."
    }
  ],
  line: [
    [46.55950, 11.65800], [46.55902, 11.65640], [46.55867, 11.65414],
    [46.55871, 11.65361], [46.55836, 11.65265], [46.55831, 11.65116],
    [46.55792, 11.64970], [46.55700, 11.64722], [46.55632, 11.64645],
    [46.55557, 11.64352], [46.55497, 11.64286], [46.55476, 11.64227],
    [46.55410, 11.64131], [46.55262, 11.63982], [46.55184, 11.63980],
    [46.55120, 11.64054], [46.55019, 11.64027], [46.54946, 11.64081],
    [46.54907, 11.64081], [46.54834, 11.64139], [46.54755, 11.64240],
    [46.54724, 11.64251], [46.54692, 11.64219], [46.54681, 11.64166],
    [46.54630, 11.64091], [46.54593, 11.64129], [46.54564, 11.64086],
    [46.54452, 11.64115], [46.54369, 11.64075], [46.54402, 11.64376],
    [46.54406, 11.64690], [46.54434, 11.64735], [46.54529, 11.64807],
    [46.54634, 11.64834], [46.54689, 11.65015], [46.54687, 11.65049],
    [46.54613, 11.65199], [46.54615, 11.65268], [46.54591, 11.65385],
    [46.54612, 11.65526], [46.54597, 11.65680], [46.54468, 11.65856],
    [46.54498, 11.65978], [46.54500, 11.66247], [46.54606, 11.66311],
    [46.54669, 11.66316], [46.54755, 11.66255], [46.54834, 11.66276],
    [46.54865, 11.66266], [46.54997, 11.66138], [46.55065, 11.66138],
    [46.55159, 11.66103], [46.55168, 11.66087], [46.55142, 11.66018],
    [46.55201, 11.65880], [46.55195, 11.65787], [46.55214, 11.65808],
    [46.55247, 11.65805], [46.55296, 11.65853], [46.55467, 11.65765],
    [46.55528, 11.65795], [46.55544, 11.65773], [46.55542, 11.65702],
    [46.55572, 11.65691], [46.55592, 11.65646], [46.55592, 11.65619],
    [46.55546, 11.65528], [46.55609, 11.65518], [46.55660, 11.65574],
    [46.55680, 11.65662], [46.55682, 11.65752], [46.55722, 11.65813],
    [46.55726, 11.65877], [46.55809, 11.66029], [46.55880, 11.66396],
    [46.55911, 11.66306], [46.55950, 11.65800]
  ],

  /* --- practical, still to confirm ---------------------------- */

  facilities: [
    ['food',    'Food and drink', 'The Schgaguler hut and Sanon, out on the plateau'],
    ['water',   'Drinking water', 'A spring is marked inside the loop; otherwise the huts'],
    ['toilets', 'Toilets',        'At the cable-car station and the huts'],
    ['lookout', 'Lookouts',       'Piz, and the Piz Ridl skyline along the northern arm'],
    ['lift',    'Lift access',    'Mont Sëuc cable car from Ortisei']
  ],
  gettingThere: [
    ['By lift', 'The Mont Sëuc cable car from the middle of Ortisei up to the top station at about 2,000 m, where the loop begins and ends.'],
    ['By car',  'Park in Ortisei and take the cable car up. The road onto the Alpe di Siusi is closed to general traffic through the middle of the day, so driving up is not the simple option it looks like on a map.'],
    ['Return',  'The loop comes back to the station, so you go down the way you came up. Check the last descent before you set out.']
  ],
  prepare: [
    'The plateau is open pasture with very little shade. Sun protection matters more than the modest height suggests.',
    'Carry water. There is a spring marked on the loop, but the reliable supply is the huts.',
    'Take a shell. Weather crosses the Alpe di Siusi quickly and there is nowhere to shelter between huts.',
    'Stay on the track through the two protected mires. They are fenced and boarded for a reason.',
    'Emergency number in Italy is 112.'
  ],
  shorterOption: 'The track line is traced by eye from the route map and positioned approximately, so treat it as the shape of the walk rather than a navigation aid.',
  lastLift:      null,

  related: [
    { id: 'saltria-return',
      label: 'Ended up down at Saltria instead? The way back up to the gondola →' }
  ],

};
