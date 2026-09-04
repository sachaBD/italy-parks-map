/* ==================================================================
   A walk, annotated. Copy this to data/<id>.js and fill it in.

     cp tools/walk-template.js data/<id>.js
     …edit…
     node tools/check-walks.js <id>

   Then add '<id>' to WALK_IDS in data/site.js. That is the whole
   procedure — both pages build themselves from the register.

   The full write-up is tools/ADDING-A-WALK.md. data/tre-cime.js is
   the same thing filled in, and is worth reading alongside this.

   Every field is optional. Anything left empty is dropped from the
   page rather than rendered blank, so a walk can go up in stages: a
   name and a card on Monday, the route on Saturday.

   Four things, though, are wrong silently. They are marked ⚠ below,
   and tools/check-walks.js exists to catch all four:

     · a stop more than 150 m off the line loses its distance figures
     · stops listed out of walking order make those figures count down
     · a wrong distanceKm rescales every figure on the page
     · a line with points too far apart cannot place a walker on it

   Coordinates are WGS84 decimal degrees, [latitude, longitude] — the
   order Google Maps gives when you press and hold a point.
   ================================================================== */
(window.WALKS = window.WALKS || {})['CHANGE-ME'] = {

  /* --- identity --------------------------------------------------
     `id` must match the filename and the entry in WALK_IDS. Ids from
     the URL are checked against that register before they are turned
     into a file path, so a walk is unreachable until it is listed.

     `status` is 'draft' until the route is real. A draft is labelled
     on the landing page and can carry a `draftNote` saying what is
     still missing. Everything else works exactly as normal.
     --------------------------------------------------------------- */

  id:     'CHANGE-ME',
  status: 'draft',

  // The track colour on the overview map. Give each walk its own.
  colour: '#D2542A',

  /* --- what it is ------------------------------------------------ */

  name:    '',            // 'Tre Cime di Lavaredo circuit'
  card:    '',            // one sentence, for the card on the landing page
  lede:    '',            // two or three lines under the title
  park:    '',            // 'Parco naturale Tre Cime di Lavaredo'
  parkAlt: '',            // the other language, shown small under it
  region:  '',            // 'Tre Cime di Lavaredo · Sesto Dolomites'

  // Shown while status is 'draft'. Say what is missing, so the page is
  // honest about being half-built rather than looking broken.
  draftNote: '',

  /* --- headline facts -------------------------------------------- */

  // Chips under the title. Short. Four is plenty.
  chips: ['10 km circuit', '3½ – 4 hrs', '490 m climb', 'Circular from the car park'],

  // Australian Walking Track Grading System, 1 (easiest) to 5 (hardest).
  // `detail` is where to say what actually makes it that grade.
  grade: { number: 3, title: 'Grade 3 — moderate', detail: '' },

  // The yellow strip at the top of the page. For the one thing that
  // will ruin the day if it is not known in advance — a road that has
  // to be booked, a lift that stops early, a bridge that is out.
  // null to leave it out.
  alert: { title: '', text: '' },

  // The "at a glance" table. Any rows you like, in any order, as
  // [label, value]. Distance, time and grade are the ones people look
  // for first.
  glance: [
    ['Distance', ''], ['Time suggested', ''], ['Grade', ''],
    ['Climb', ''], ['High point', ''], ['Start', ''],
    ['Trails', ''], ['Terrain', ''], ['Best time', '']
  ],

  /* --- the route -------------------------------------------------
     ⚠ `distanceKm` is the real walking distance, and it does more work
     than it looks. The drawn line cuts corners the path does not, so
     it always measures short; every distance on the page is stretched
     onto this figure. Get it wrong and the profile axis, the "km in"
     beside each stop and the "1.9 km on" a walker sees on the hill are
     all wrong together. Take it from the route's own listing rather
     than measuring the line.

     `centre` and `zoom` are only what the map shows before the track
     loads — it fits the bounds of the line once it has one.
     --------------------------------------------------------------- */

  distanceKm: null,
  centre:     [46.5700, 11.7000],
  zoom:       14,

  /* --- stops -----------------------------------------------------
     ⚠ In walking order, following the direction the line is drawn.
     The page lists them in this order but positions them by projecting
     onto the line, so a stop out of order counts backwards.

     ⚠ Within 150 m of the line, or the stop keeps its pin and its note
     but silently loses its "km in" figure, its "on / back" distance and
     its point on the height profile. That cut-off is deliberate: a peak
     above the route has no position along it. If a stop is a landmark
     beside the walk rather than a point on it, that is the right
     outcome — just know that is what you are choosing.

     `alt` in metres feeds the height profile, which needs at least
     three stops on the line with one before it draws anything.

     `kind` colours the pin: 'lift' dark for a lift station, 'hut' red
     for a refuge. Leave it off for summits, saddles and junctions.

     `leg` is how you get to this stop from the one before — trail
     number, rough time, up or down. `note` is the paragraph shown when
     the stop is tapped.
     --------------------------------------------------------------- */

  stops: [
    {
      n: 1, name: '', alt: 0, lat: 0, lon: 0,
      leg:  '',           // 'Path 101 east, about 30 minutes, almost level'
      note: '',
      kind: 'hut'
    }
  ],

  /* --- the drawn track -------------------------------------------
     [[lat, lon], ...] in walking order.

     ⚠ Aim for a point about every 100 m. This used to be cosmetic and
     is not any more: a walker is placed on the walk by dropping a
     perpendicular onto this line, so a long straight chord across a
     bend puts them where the chord runs rather than where the path
     does, and their distance to every stop goes out with it.

     From a GPX:            node tools/gpx-to-walk.js track.gpx
     From a screenshot:     see tools/TRACING.md

     Do not place a route from an estimated coordinate. See CLAUDE.md
     for why — it has been wrong every time it has been tried.
     --------------------------------------------------------------- */

  line: [],

  /* --- practical -------------------------------------------------
     `facilities` keys must be one of food, beds, water, toilets,
     lookout, lift — anything else renders with a blank icon.
     --------------------------------------------------------------- */

  facilities: [
    ['food',    'Food and drink', ''],
    ['beds',    'Accommodation',  ''],
    ['water',   'Water',          ''],
    ['toilets', 'Toilets',        ''],
    ['lookout', 'Lookouts',       ''],
    ['lift',    'Lift access',    '']
  ],

  gettingThere: [
    ['By car', ''], ['By bus', ''], ['By lift', ''], ['Return', '']
  ],

  // The "before you go" list. One line each, plainly.
  prepare: [
    '',
    'Emergency number in Italy is 112.'
  ],

  // A note about a shorter variant, or ''.
  shorterOption: '',

  // Assumed last descent, [hour, minute] local time, for the countdown
  // in the alert strip. null for a walk with no lift.
  lastLift: null,

  // Cross-links to other walks, shown at the foot of the page. The id
  // has to be in WALK_IDS or it is a dead link.
  related: [
    // { id: 'seceda', label: 'The Seceda ridge walk, across the valley →' }
  ]
};
