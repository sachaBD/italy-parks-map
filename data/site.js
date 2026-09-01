/* Site-wide settings for the landing page. */
window.SITE = {
  title:  'Val Gardena walks',
  owner:  'Gherdëina · Val Gardena · Gröden',
  region: 'Dolomites · South Tyrol',
  intro:  'Walk guides for the lift-served high country above Val Gardena. ' +
          'Each one has a track map, notes for every stop, and your own position ' +
          'on the map while you walk.',
  timeZone: 'Europe/Rome',
  centre: [46.5700, 11.7000]   // rough middle of the area, before tracks load
};

/* The register of walks. A walk only appears on the site once its id is
   listed here and data/<id>.js exists. Ids are also checked against this
   list before anything from the URL is turned into a file path. */
window.WALK_IDS = ['seceda', 'monte-piz', 'saltria-return', 'rasciesa'];
