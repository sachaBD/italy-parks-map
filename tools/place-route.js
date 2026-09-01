#!/usr/bin/env node
/* ------------------------------------------------------------------
   Turn a traced route (metres east/north of its first point) into
   latitude and longitude, given one known coordinate.

     node tools/place-route.js tools/<walk>.offsets.json <lat> <lon>

   <lat>,<lon> is the real position of the route's FIRST point — for a
   loop, the trailhead. Long-press it in Google Maps and copy the two
   numbers.

   Assumes the source map was north-up, which phone map screenshots are
   unless deliberately rotated.
   ------------------------------------------------------------------ */
'use strict';

const fs = require('fs');
const [, , file, latS, lonS] = process.argv;

if (!file || latS === undefined || lonS === undefined) {
  console.error('usage: node tools/place-route.js <offsets.json> <lat> <lon>');
  process.exit(1);
}

const lat0 = parseFloat(latS), lon0 = parseFloat(lonS);
if (!isFinite(lat0) || !isFinite(lon0) || Math.abs(lat0) > 90 || Math.abs(lon0) > 180) {
  console.error('That does not look like a latitude and longitude.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const pts = data.points;

// Metres per degree at this latitude.
const mPerLat = 111132.92 - 559.82 * Math.cos(2 * lat0 * Math.PI / 180)
              + 1.175 * Math.cos(4 * lat0 * Math.PI / 180);
const mPerLon = 111412.84 * Math.cos(lat0 * Math.PI / 180)
              - 93.5 * Math.cos(3 * lat0 * Math.PI / 180);

const coords = pts.map(([e, n]) => [lat0 + n / mPerLat, lon0 + e / mPerLon]);

const lats = coords.map((c) => c[0]), lons = coords.map((c) => c[1]);
const centre = [
  +((Math.min(...lats) + Math.max(...lats)) / 2).toFixed(5),
  +((Math.min(...lons) + Math.max(...lons)) / 2).toFixed(5)
];
const span = Math.max(Math.max(...lats) - Math.min(...lats),
                      Math.max(...lons) - Math.min(...lons));
const zoom = span > 0.09 ? 12 : span > 0.045 ? 13 : span > 0.022 ? 14 : span > 0.011 ? 15 : 16;

const f = (n) => n.toFixed(5);
const rows = [];
for (let i = 0; i < coords.length; i += 3) {
  rows.push('    ' + coords.slice(i, i + 3)
    .map((c) => '[' + f(c[0]) + ', ' + f(c[1]) + ']').join(', ') + ',');
}
if (rows.length) rows[rows.length - 1] = rows[rows.length - 1].replace(/,$/, '');

console.log('/* placed from ' + file + ' at ' + lat0 + ', ' + lon0 + ' */');
console.log('');
if (data.simplified_km) console.log('  distanceKm: ' + data.simplified_km + ',');
console.log('  centre: [' + centre[0] + ', ' + centre[1] + '],');
console.log('  zoom:   ' + zoom + ',');
console.log('');
console.log('  line: [');
console.log(rows.join('\n'));
console.log('  ],');
