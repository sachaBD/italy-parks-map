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
  centre:     [46.55159, 11.65236],
  zoom:       14,
  stops:      [],
  line: [
    [46.55950, 11.65800], [46.55410, 11.64131], [46.54369, 11.64075],
    [46.54406, 11.64690], [46.54689, 11.65015], [46.54500, 11.66247],
    [46.55159, 11.66103], [46.55609, 11.65518], [46.55880, 11.66396],
    [46.55950, 11.65800]
  ],

  /* --- practical, still to confirm ---------------------------- */

  facilities:   [],
  gettingThere: [],
  prepare:      [],
  shorterOption: 'The track line is traced by eye from the route map and positioned approximately, so treat it as the shape of the walk rather than a navigation aid.',
  lastLift:      null,

};
