/* ------------------------------------------------------------------
   Walk data template
   ------------------------------------------------------------------
   Copy this to data/<id>.js, fill it in, and add '<id>' to WALK_IDS in
   data/site.js. Nothing else needs changing — both the landing page and
   the walk page build themselves from these fields.

   Anything you leave empty is simply left out of the page, so a walk can
   be published in stages. A walk with an empty `line` is shown as "not
   yet mapped" rather than half-drawn.

   Coordinates are WGS84 decimal degrees, [latitude, longitude], the same
   order Google Maps shows when you press and hold a point.
   ------------------------------------------------------------------ */
(window.WALKS = window.WALKS || {})['CHANGE-ME'] = {

  /* --- identity ------------------------------------------------- */

  id:     'CHANGE-ME',        // must match the filename and WALK_IDS
  status: 'draft',            // 'draft' until the route is real, then 'published'
  colour: '#D2542A',          // the track colour on the overview map
  card:   '',                 // one sentence for the card on the landing page

  name:    '',                // 'Seceda Ridge Walk'
  lede:    '',                // two lines under the title, what the walk is
  park:    '',                // 'Parco naturale Puez-Odle'
  parkAlt: '',                // English name, shown small under it
  region:  'Val Gardena · Dolomites · South Tyrol',

  /* --- headline facts ------------------------------------------- */

  // Chips under the title. Short. Four is plenty.
  chips: ['9 km one way', '2½ – 3½ hrs', 'Grade 3', 'Return by gondola'],

  // Australian Walking Track Grading System, 1 (easiest) to 5 (hardest).
  grade: { number: 3, title: 'Grade 3 — moderate', detail: '' },

  // Yellow strip at the top. null to leave it out.
  alert: { title: '', text: '' },

  // The "at a glance" table. Any rows you like, in order.
  glance: [
    ['Distance', ''], ['Time suggested', ''], ['Grade', ''],
    ['Track surface', ''], ['Signage', ''], ['Elevation', ''],
    ['Best time', ''], ['Entry', ''], ['Dogs', '']
  ],

  /* --- the route ------------------------------------------------ */

  // Real walking distance in km. The drawn line is straighter than the
  // path on the ground, so the height profile is scaled onto this.
  distanceKm: null,

  centre: [46.5960, 11.7420],   // map centre before the track loads
  zoom:   14,

  // Stops in walking order. `kind: 'lift'` colours the marker dark for a
  // lift station; leave it off for huts, summits and junctions.
  stops: [
    {
      n: 1, name: '', alt: 0, lat: 0, lon: 0,
      leg:  '',                 // 'Trail 1 east, about 30 minutes, downhill'
      note: '',                 // a paragraph shown when the stop is tapped
      kind: 'lift'
    }
  ],

  // The drawn track: [[lat, lon], ...]. A GPX trace is ideal — run
  //   node tools/gpx-to-walk.js yourtrack.gpx
  // and paste what it prints. Otherwise a dozen hand-picked points that
  // follow the shape of the path are enough; it is drawn as an
  // indicative line, not a survey trace.
  line: [],

  /* --- practical ------------------------------------------------ */

  // Keys: food, beds, water, toilets, lookout, lift.
  facilities: [
    ['food', 'Food and drink', '']
  ],

  gettingThere: [
    ['By lift', ''], ['By car', ''], ['Return', '']
  ],

  prepare: [
    ''
  ],

  shorterOption: '',            // a note about a shorter variant, or ''

  // Assumed last descent, [hour, minute] in local Italian time, for the
  // countdown in the alert strip. null to leave it out.
  lastLift: null
};
