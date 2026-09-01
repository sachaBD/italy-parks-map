#!/usr/bin/env node
/* ------------------------------------------------------------------
   Turn a GPX track into the fields data/<id>.js needs.

     node tools/gpx-to-walk.js track.gpx [maxPoints]

   Prints a `line` array, `distanceKm`, `centre`, a suggested `zoom`,
   an elevation summary for the "at a glance" table, and any waypoints
   in the file as candidate stops.

   No dependencies. Works on GPX from Komoot, AllTrails, Strava,
   Gaia, Garmin and OsmAnd.
   ------------------------------------------------------------------ */
'use strict';

const fs = require('fs');

const file = process.argv[2];
const maxPoints = parseInt(process.argv[3], 10) || 60;

if (!file) {
  console.error('usage: node tools/gpx-to-walk.js <file.gpx> [maxPoints]');
  process.exit(1);
}

const xml = fs.readFileSync(file, 'utf8');

/* ---------------------------------------------------------- parsing */

// Pull lat/lon/ele out of every point of a given tag.
function points(tag) {
  const out = [];
  const re = new RegExp('<' + tag + '\\b[^>]*?lat="(-?[\\d.]+)"[^>]*?lon="(-?[\\d.]+)"[^>]*>([\\s\\S]*?)<\\/' + tag + '>|' +
                        '<' + tag + '\\b[^>]*?lat="(-?[\\d.]+)"[^>]*?lon="(-?[\\d.]+)"[^>]*\\/>', 'g');
  let m;
  while ((m = re.exec(xml)) !== null) {
    const lat = parseFloat(m[1] !== undefined ? m[1] : m[4]);
    const lon = parseFloat(m[2] !== undefined ? m[2] : m[5]);
    const inner = m[3] || '';
    const ele = /<ele>([-\d.]+)<\/ele>/.exec(inner);
    const name = /<name>([\s\S]*?)<\/name>/.exec(inner);
    out.push({
      lat, lon,
      ele: ele ? parseFloat(ele[1]) : null,
      name: name ? name[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : null
    });
  }
  return out;
}

let track = points('trkpt');
if (!track.length) track = points('rtept');
const waypoints = points('wpt');

if (!track.length) {
  console.error('No <trkpt> or <rtept> points found in ' + file);
  process.exit(1);
}

/* --------------------------------------------------------- geometry */

function metres(a, b) {
  const R = 6371008.8, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Perpendicular distance in metres, flat-earth over the few metres involved.
function perpendicular(p, a, b) {
  const r = Math.PI / 180, k = Math.cos(p.lat * r);
  const px = (p.lon - a.lon) * k, py = p.lat - a.lat;
  const bx = (b.lon - a.lon) * k, by = b.lat - a.lat;
  const len2 = bx * bx + by * by;
  let t = len2 ? (px * bx + py * by) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const dx = px - bx * t, dy = py - by * t;
  return Math.sqrt(dx * dx + dy * dy) * 111320;
}

// Ramer-Douglas-Peucker.
function simplify(pts, tol) {
  if (pts.length < 3) return pts.slice();
  let far = 0, worst = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpendicular(pts[i], pts[0], pts[pts.length - 1]);
    if (d > worst) { worst = d; far = i; }
  }
  if (worst <= tol) return [pts[0], pts[pts.length - 1]];
  return simplify(pts.slice(0, far + 1), tol)
    .slice(0, -1)
    .concat(simplify(pts.slice(far), tol));
}

// Loosen the tolerance until the line is short enough to keep the data
// file readable. The drawn track is indicative, so this costs nothing.
let tol = 2, line = track;
while (line.length > maxPoints && tol < 500) {
  line = simplify(track, tol);
  tol *= 1.6;
}

/* --------------------------------------------------------- summary */

let total = 0;
for (let i = 1; i < track.length; i++) total += metres(track[i - 1], track[i]);

const eles = track.map((p) => p.ele).filter((e) => e !== null);
let ascent = 0, descent = 0;
for (let i = 1; i < eles.length; i++) {
  const d = eles[i] - eles[i - 1];
  // Ignore sub-metre wobble, which is GPS noise rather than climbing.
  if (d > 1) ascent += d; else if (d < -1) descent += -d;
}

const lats = track.map((p) => p.lat), lons = track.map((p) => p.lon);
const centre = [
  +((Math.min.apply(null, lats) + Math.max.apply(null, lats)) / 2).toFixed(5),
  +((Math.min.apply(null, lons) + Math.max.apply(null, lons)) / 2).toFixed(5)
];
const span = Math.max(
  Math.max.apply(null, lats) - Math.min.apply(null, lats),
  Math.max.apply(null, lons) - Math.min.apply(null, lons)
);
const zoom = span > 0.09 ? 12 : span > 0.045 ? 13 : span > 0.022 ? 14 : span > 0.011 ? 15 : 16;

/* ----------------------------------------------------------- output */

const f = (n) => n.toFixed(4);
const rows = [];
for (let i = 0; i < line.length; i += 3) {
  rows.push('    ' + line.slice(i, i + 3)
    .map((p) => '[' + f(p.lat) + ', ' + f(p.lon) + ']').join(', ') + ',');
}
if (rows.length) rows[rows.length - 1] = rows[rows.length - 1].replace(/,$/, '');

console.log('/* from ' + file + ' — ' + track.length + ' points reduced to ' + line.length + ' */');
console.log('');
console.log('  distanceKm: ' + (total / 1000).toFixed(1) + ',');
console.log('  centre: [' + centre[0] + ', ' + centre[1] + '],');
console.log('  zoom:   ' + zoom + ',');
console.log('');
console.log('  line: [');
console.log(rows.join('\n'));
console.log('  ],');
console.log('');
console.log('/* --- for the glance table -------------------------------');
console.log('   Distance   ' + (total / 1000).toFixed(1) + ' km');
if (eles.length) {
  console.log('   Elevation  starts ' + Math.round(eles[0]) + ' m, ' +
              'low ' + Math.round(Math.min.apply(null, eles)) + ' m, ' +
              'high ' + Math.round(Math.max.apply(null, eles)) + ' m, ' +
              'ends ' + Math.round(eles[eles.length - 1]) + ' m');
  console.log('   Climb      about ' + Math.round(ascent / 10) * 10 + ' m up, ' +
              Math.round(descent / 10) * 10 + ' m down');
} else {
  console.log('   Elevation  no <ele> data in this file');
}
console.log('   --------------------------------------------------- */');

if (waypoints.length) {
  console.log('');
  console.log('/* --- waypoints in the file, as candidate stops --------- */');
  waypoints.forEach((w, i) => {
    console.log('    { n: ' + (i + 1) + ', name: ' + JSON.stringify(w.name || '') +
                ', alt: ' + (w.ele === null ? 0 : Math.round(w.ele)) +
                ', lat: ' + f(w.lat) + ', lon: ' + f(w.lon) + ', leg: \'\', note: \'\' },');
  });
}
