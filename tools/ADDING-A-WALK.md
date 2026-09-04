# Adding a walk

The whole procedure is two steps: write `data/<id>.js`, and add `'<id>'`
to `WALK_IDS` in `data/site.js`. Both pages build themselves from that
register. Everything below is detail on doing it well.

```
cp tools/walk-template.js data/<id>.js     # the annotated blank
node tools/check-walks.js <id>             # what is still wrong with it
python3 -m http.server 8000                # look at it
```

`tools/walk-template.js` documents every field. `data/tre-cime.js` is the
same thing filled in, and is the one to read alongside it — it is the walk
that exercises every part of the page.

## The order to do it in

A walk can go up in stages. Anything left empty is dropped from the page
rather than rendered blank, so there is no penalty for publishing the
words before the route arrives.

1. **Name it.** `id`, `name`, `card`, `lede`, `region`, `status: 'draft'`.
   Add the id to `WALK_IDS`. It now appears on the landing page as a walk
   whose route is being mapped.
2. **Write the guide.** `chips`, `grade`, `glance`, `facilities`,
   `gettingThere`, `prepare`. None of this needs coordinates.
3. **Get the route.** Below.
4. **Place the stops.** In walking order, on the line, with altitudes.
5. **Check it**, look at it, set `status: 'published'`.

## Getting the route

**From a GPX** — the easy case:

```
node tools/gpx-to-walk.js track.gpx
```

Prints a ready-to-paste `line`, `distanceKm`, `centre` and `zoom`, an
elevation summary for the glance table, and any waypoints in the file as
candidate stops.

**From a screenshot** — an AllTrails or komoot page you can see but not
download. `tools/trace-route.py` lifts the line out of the pixels and
places it on the earth. That has its own write-up in `tools/TRACING.md`,
which is worth reading before you start rather than after.

**By hand** — a dozen points read off a map. This used to be fine and is
now the weakest option, for the reason under "line resolution" below.

Whatever the source: **do not place a route from an estimated
coordinate.** `CLAUDE.md` explains why. It has been wrong every time.

## The four things that go wrong silently

Nothing here throws. The page renders, a section is quietly missing or a
number is quietly wrong, and you find out on the hill. `check-walks.js`
exists to catch all four.

### 1. `distanceKm`

The drawn line cuts corners the path does not, so it always measures
short — 1 to 5% for a good trace, more for a rough one. Every distance on
the page is stretched onto `distanceKm` to compensate: the profile axis,
the "4.6 km in" beside each stop, and the "1.9 km on" a walker sees.

So it is not decoration. Take it from the route's published length, not
from the line. Leave it out and everything falls back to the drawn length
and reads short together.

### 2. Stops must be within 150 m of the line

Further than that and a stop keeps its pin, its name and its note, but
loses its "km in", its "on / back" distance and its place on the height
profile. Nothing says so on the page.

The cut-off is deliberate — a peak above the route has no position along
it, and projecting one onto the nearest bit of path would throw the whole
distance axis out. If a stop is a landmark beside the walk rather than a
point on it, losing the figures is the right outcome. Just know that is
the choice being made. `check-walks.js` tells you which side of the line
each stop fell on and by how much.

### 3. Stops must be in walking order

The list renders in the order you write them but positions them by
projecting onto the line, so one out of place makes the "km in" column
count backwards. On a circuit, walking order means the direction the line
is drawn.

### 4. Line resolution

Aim for a point about every 100 m.

This used to be cosmetic. It is not any more: a walker is placed on the
walk by dropping a perpendicular onto the line, so a long straight chord
across a bend puts them where the chord runs rather than where the path
does, and their distance to every stop goes out with it.

For scale, `data/seceda.js` is 18 points for 9 km — a median of 265 m
between them, and a drawn length of 4.42 km against a real 9 km. It draws
fine and it always did; it is simply too coarse to stand on.

## A route that touches itself

If the line passes through the same place twice — a spur out to a hut and
back, a lollipop — a walker standing on the junction cannot be placed by
geometry alone. `NP.projectOnLine` resolves it by continuity: only
positions the walker could have reached since their last fix are
considered. It needs no help from the data, but it is worth knowing the
mechanism exists, because it is why the drawn direction of the line
matters.

## Checking it

```
node tools/check-walks.js              # every walk
node tools/check-walks.js tre-cime     # just one
```

- **ERROR** — the page will be wrong, or a section will vanish. Exits
  non-zero, so it drops straight into a hook or CI.
- **WARN** — worth a look; usually a section quietly not appearing.
- **NOTE** — fine, but you probably meant something else.

It also checks the register both ways (an id with no file, a file with no
id), that `related` links point at walks that exist, that facility keys
have icons, and that `tools/walk-template.js` still offers exactly the
fields the pages read — the last one because the previous template drifted
out of date precisely by having nothing compare it against the code.

Then look at the thing:

```
python3 -m http.server 8000
```

Geolocation needs `https://` or `localhost`, so opening the file from disk
will not prompt for a position. Check the map draws, the stops are in
order, the profile appears, and the alert says something useful.

## House style

The existing walks are written as an Australian national parks track
guide: plain sentences, no exclamation, specific over enthusiastic. Say
"about 45 minutes, steady rather than steep", not "a rewarding ascent".

Say where a number came from, especially when it is uncertain. The file
header is the place for it — see the headers on `data/tre-cime.js` and
`data/rasciesa.js`, which record what the figures came from, what the
line was traced from, what it was anchored on, and what the corroborating
landmark came out at. A reader can then tell how much to trust the map.
