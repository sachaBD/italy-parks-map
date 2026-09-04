#!/usr/bin/env node
/* ------------------------------------------------------------------
   Read every walk in data/ and say what is wrong with it.

     node tools/check-walks.js [id ...]

   Most of what a walk file can get wrong fails silently. A stop set
   200 m off the line simply loses its distance figure; stops listed
   out of order make the "km in" column count backwards; a missing
   `distanceKm` quietly rescales the height profile. Nothing throws,
   the page still renders, and you only notice on the hill.

   So this exists to make those loud. It knows what assets/walk.js and
   assets/home.js actually read, and complains when a file will not
   give them what they need.

     ERROR  the page will be wrong, or a section will vanish
     WARN   worth a look; usually a section quietly not appearing
     NOTE   fine, but you probably meant something else

   Exits non-zero if anything is an ERROR, so it works in a hook or CI.

   No dependencies.
   ------------------------------------------------------------------ */
'use strict';

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data');
const FACILITY_KEYS = ['food', 'beds', 'water', 'toilets', 'lookout', 'lift'];
const STOP_KINDS = ['lift', 'hut'];

// assets/walk.js drops a stop from the profile, and gives it no distance
// along the track, once it is further than this from the drawn line.
const OFF_LINE_LIMIT = 250;   // where it starts being worth saying something
const OFF_LINE_MAX = 150;     // the figure walk.js actually uses

/* ------------------------------------------------------------ loading */

global.window = {};
require(path.join(DIR, 'site.js'));
const SITE = window.SITE || {};
const IDS = window.WALK_IDS || [];

const files = fs.readdirSync(DIR)
  .filter((f) => f.endsWith('.js') && f !== 'site.js')
  .map((f) => f.replace(/\.js$/, ''));

for (const id of files) require(path.join(DIR, id + '.js'));
const WALKS = window.WALKS || {};

/* ----------------------------------------------------------- geometry */

const R = 6371008.8, rad = Math.PI / 180;
function metres(aLat, aLon, bLat, bLon) {
  const dLat = (bLat - aLat) * rad, dLon = (bLon - aLon) * rad;
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Nearest point on the line, as metres along it and metres off it. Same
// projection assets/common.js uses, so the answers agree with the page.
function project(line, lat, lon) {
  const kLat = R * rad, kLon = R * rad * Math.cos(lat * rad);
  let along = 0, best = null, run = 0;
  for (let i = 1; i < line.length; i++) {
    const ax = (line[i - 1][1] - lon) * kLon, ay = (line[i - 1][0] - lat) * kLat;
    const bx = (line[i][1] - lon) * kLon,     by = (line[i][0] - lat) * kLat;
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
    const seg = metres(line[i - 1][0], line[i - 1][1], line[i][0], line[i][1]);
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, (-ax * dx + -ay * dy) / len2));
    const off = Math.hypot(ax + t * dx, ay + t * dy);
    if (!best || off < best.off) best = { off: off, along: run + t * seg };
    run += seg;
  }
  return best || { off: Infinity, along: 0 };
}

function lineLength(line) {
  let t = 0;
  for (let i = 1; i < line.length; i++) {
    t += metres(line[i - 1][0], line[i - 1][1], line[i][0], line[i][1]);
  }
  return t;
}

/* ------------------------------------------------------------ report */

let errors = 0, warnings = 0;
const say = { ERROR: [], WARN: [], NOTE: [] };
let current = '';

function log(level, message) {
  say[level].push('  ' + level.padEnd(6) + message);
  if (level === 'ERROR') errors++;
  if (level === 'WARN') warnings++;
}
function flush() {
  const rows = [...say.ERROR, ...say.WARN, ...say.NOTE];
  if (rows.length) {
    console.log('\n' + current);
    rows.forEach((r) => console.log(r));
  }
  say.ERROR = []; say.WARN = []; say.NOTE = [];
}

const num = (v) => typeof v === 'number' && isFinite(v);
const filled = (v) => v !== undefined && v !== null && v !== '' &&
                      !(Array.isArray(v) && v.length === 0);

/* ------------------------------------------------------- the register */

current = 'data/site.js';
if (!filled(SITE.title)) log('WARN', 'no site title');
if (!Array.isArray(SITE.centre) || SITE.centre.length !== 2) {
  log('WARN', 'centre should be [lat, lon]; the overview map opens there before tracks load');
}
for (const id of IDS) {
  if (!files.includes(id)) log('ERROR', "WALK_IDS lists '" + id + "' but data/" + id + ".js does not exist");
}
for (const id of files) {
  if (!IDS.includes(id)) log('WARN', 'data/' + id + '.js exists but is not in WALK_IDS, so nothing links to it');
}
const colours = {};
flush();

/* --------------------------------------------------------- the template

   tools/walk-template.js is the starting point for a new walk, and the
   only reason the old one grew wrong is that nothing compared it against
   the code. So: it should offer exactly the fields the pages read. A
   field the code reads and the template omits is one nobody will know
   exists; a field the template offers and nothing reads is one somebody
   will fill in for nothing.                                            */

current = 'tools/walk-template.js';
const TEMPLATE = path.join(__dirname, 'walk-template.js');
if (!fs.existsSync(TEMPLATE)) {
  log('WARN', 'missing — there is nothing to copy when adding a walk');
} else {
  const reads = new Set();
  for (const f of ['walk.js', 'home.js']) {
    const src = fs.readFileSync(path.join(__dirname, '..', 'assets', f), 'utf8');
    for (const m of src.matchAll(/\b[Ww]\.([a-zA-Z]+)/g)) reads.add(m[1]);
  }
  // Locals that happen to be spelled the same as a field lookup.
  ['WALK', 'google', 'h', 'm'].forEach((k) => reads.delete(k));

  const before = window.WALKS;
  window.WALKS = {};
  require(TEMPLATE);
  const offers = new Set(Object.keys(window.WALKS['CHANGE-ME'] || {}));
  window.WALKS = before;

  const missing = [...reads].filter((k) => !offers.has(k)).sort();
  const unused = [...offers].filter((k) => !reads.has(k)).sort();
  if (missing.length) {
    log('WARN', 'the pages read ' + missing.join(', ') + ' but the template never mentions it, ' +
                'so nobody copying the template will know it exists');
  }
  if (unused.length) {
    log('NOTE', 'the template offers ' + unused.join(', ') + ', which nothing reads');
  }
}
flush();

/* ------------------------------------------------------- each walk */

const wanted = process.argv.slice(2);
for (const id of files) {
  if (wanted.length && !wanted.includes(id)) continue;
  current = 'data/' + id + '.js';
  const W = WALKS[id];

  if (!W) {
    log('ERROR', 'the file did not register a walk under WALKS[' + JSON.stringify(id) + ']');
    flush();
    continue;
  }
  if (W.id !== id) log('ERROR', "id is '" + W.id + "' but the file is " + id + '.js; they must match');

  if (W.status !== 'draft' && W.status !== 'published') {
    log('WARN', "status is '" + W.status + "'; expected 'draft' or 'published'");
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(W.colour || '')) {
    log('WARN', 'colour should be a #rrggbb hex; it draws the track on the overview map');
  } else if (colours[W.colour]) {
    log('NOTE', 'same colour as ' + colours[W.colour] + ', so the two tracks match on the overview map');
  } else {
    colours[W.colour] = id;
  }

  for (const f of ['name', 'card', 'lede', 'region']) {
    if (!filled(W[f])) log(W.status === 'published' ? 'WARN' : 'NOTE', 'no ' + f);
  }
  if (filled(W.grade) && !(W.grade.number >= 1 && W.grade.number <= 5)) {
    log('WARN', 'grade.number should be 1 to 5 (Australian Walking Track Grading System)');
  }
  if (filled(W.lastLift) && !(Array.isArray(W.lastLift) && W.lastLift.length === 2)) {
    log('WARN', 'lastLift should be [hour, minute], e.g. [17, 15]');
  }
  if (num(W.zoom) && (W.zoom < 10 || W.zoom > 18)) log('NOTE', 'zoom ' + W.zoom + ' is an odd starting zoom');

  for (const row of W.facilities || []) {
    if (!FACILITY_KEYS.includes(row[0])) {
      log('WARN', "facility key '" + row[0] + "' has no icon; use one of " + FACILITY_KEYS.join(', '));
    }
  }
  for (const r of W.related || []) {
    if (!IDS.includes(r.id)) log('ERROR', "related links to '" + r.id + "', which is not in WALK_IDS — a dead link");
  }

  /* ------------------------------------------------------------ line */

  const line = W.line || [];
  const hasLine = line.length >= 2;

  if (!hasLine) {
    log(W.status === 'published' ? 'WARN' : 'NOTE',
        'no line, so the page says "route being mapped" and no stop gets a distance');
  } else {
    const bad = line.findIndex((p) => !Array.isArray(p) || !num(p[0]) || !num(p[1]) ||
                                      Math.abs(p[0]) > 90 || Math.abs(p[1]) > 180);
    if (bad >= 0) log('ERROR', 'line[' + bad + '] is not a [lat, lon] pair');

    const gaps = [];
    for (let i = 1; i < line.length; i++) {
      gaps.push(metres(line[i - 1][0], line[i - 1][1], line[i][0], line[i][1]));
    }
    gaps.sort((a, b) => a - b);
    const median = gaps[gaps.length >> 1], worst = gaps[gaps.length - 1];
    // A walker is put on the line by dropping a perpendicular onto it, so a
    // long chord across a bend places them where the chord runs rather than
    // where the path does. One long straight is harmless; a line that is
    // coarse throughout is not.
    if (median > 150) {
      log('WARN', 'points a median ' + Math.round(median) + ' m apart, which is too coarse to ' +
                  'place a walker on. Aim for a point about every 100 m.');
    } else if (worst > 350) {
      log('NOTE', 'longest gap between points is ' + Math.round(worst) + ' m; fine on a straight, ' +
                  'loose if the path bends inside it');
    }

    const drawnKm = lineLength(line) / 1000;
    if (!num(W.distanceKm)) {
      log('WARN', 'no distanceKm, so the profile axis and the "km in" figures fall back to the ' +
                  'drawn length of ' + drawnKm.toFixed(1) + ' km, which is short of the real walk');
    } else {
      const off = (drawnKm - W.distanceKm) / W.distanceKm * 100;
      if (off > 2) {
        log('WARN', 'the drawn line measures ' + drawnKm.toFixed(2) + ' km against a stated ' +
                    W.distanceKm + ' km — longer than the real walk, which is the wrong way round. ' +
                    'Check distanceKm, or check the line is not doubling back.');
      } else if (off < -15) {
        log('WARN', 'the drawn line measures ' + drawnKm.toFixed(2) + ' km against a stated ' +
                    W.distanceKm + ' km, ' + Math.abs(off).toFixed(0) + '% short. Expect 1 to 5%. ' +
                    'Either the line is missing a section or distanceKm is wrong.');
      }
    }

    if (Array.isArray(W.centre) && W.centre.length === 2) {
      const lats = line.map((p) => p[0]), lons = line.map((p) => p[1]);
      const mid = [(Math.min(...lats) + Math.max(...lats)) / 2,
                   (Math.min(...lons) + Math.max(...lons)) / 2];
      if (metres(W.centre[0], W.centre[1], mid[0], mid[1]) > 3000) {
        log('WARN', 'centre is a long way from the middle of the line; the map jumps on load');
      }
    }
  }

  /* ----------------------------------------------------------- stops */

  const stops = W.stops || [];
  if (!stops.length) {
    log(W.status === 'published' ? 'WARN' : 'NOTE', 'no stops');
  }

  let lastAlong = -Infinity, onLine = 0, withAlt = 0;
  stops.forEach((s, i) => {
    const where = 'stop ' + (s.n !== undefined ? s.n : i + 1) + ' (' + (s.name || 'unnamed') + ')';
    if (!filled(s.name)) log('WARN', where + ' has no name');
    if (s.n !== i + 1) log('NOTE', where + ' is numbered ' + s.n + ' but listed ' + (i + 1) + 'th');
    if (filled(s.kind) && !STOP_KINDS.includes(s.kind)) {
      log('WARN', where + ": kind '" + s.kind + "' is not a pin colour; use " + STOP_KINDS.join(' or ') + ', or leave it off');
    }
    if (num(s.lat) !== num(s.lon)) {
      log('ERROR', where + ' has only one of lat/lon; it needs both or neither');
      return;
    }
    if (!num(s.lat)) {
      log('NOTE', where + ' has no coordinates, so it is listed but not mapped');
      return;
    }
    if (!hasLine) return;

    const p = project(line, s.lat, s.lon);
    if (p.off > OFF_LINE_LIMIT) {
      log('NOTE', where + ' is ' + Math.round(p.off) + ' m off the line — a landmark beside the ' +
                  'route rather than a point on it, so no "km in" and no place on the profile');
    } else if (p.off > OFF_LINE_MAX) {
      log('WARN', where + ' is ' + Math.round(p.off) + ' m off the line, just past the ' +
                  OFF_LINE_MAX + ' m cut-off, so it silently loses its "km in" figure and its ' +
                  'point on the profile. Nudge it onto the track or accept it as a landmark.');
    } else {
      onLine++;
      if (p.along < lastAlong - 50) {
        log('ERROR', where + ' comes before the stop above it on the track (' +
                     (p.along / 1000).toFixed(2) + ' km against ' + (lastAlong / 1000).toFixed(2) +
                     ' km). Stops must be listed in walking order or the "km in" column counts backwards.');
      }
      lastAlong = p.along;
      if (s.alt > 0) withAlt++;
      else log('NOTE', where + ' has no alt, so it is left off the height profile');
    }
  });

  if (hasLine && stops.length && onLine && withAlt < 3) {
    log('NOTE', 'only ' + withAlt + ' stop(s) are on the line with an altitude, and the profile ' +
                'needs 3, so no height profile is drawn');
  }

  flush();
}

/* ------------------------------------------------------------ result */

const checked = wanted.length ? wanted.length : files.length;
console.log('\n' + checked + ' walk(s) checked — ' + errors + ' error(s), ' + warnings + ' warning(s).');
if (errors) console.log('Errors mean the page will be wrong. Fix those before publishing.');
process.exit(errors ? 1 : 0);
