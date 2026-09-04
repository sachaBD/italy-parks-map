# Val Gardena walks

Walk guides for the lift-served high country above Val Gardena, in the
Dolomites. Static HTML, CSS and JavaScript, served from GitHub Pages. No
build step and no framework.

Laid out as a digital brochure in the manner of an Australian national parks
track guide: green masthead, yellow alert strip, an "at a glance" fact panel,
a track grade, numbered stops and a "before you go" checklist.

## What it does

- **A landing page** listing every walk, with an overview map of all the
  mapped tracks. Tap a track to open its guide.
- **A guide per walk**: track map on Leaflet with topographic, aerial and
  street base maps; the route as a dashed track line with numbered stops.
- **Your location** from the browser, shown as a dot with an accuracy ring.
  Once you are on the track, every stop says how much further there is to
  walk to it and whether it is ahead or behind. Falls back to pasting
  coordinates if there is no fix.
- **A height profile** generated from the stop altitudes.
- Prints tidily, and still works with the map switched off.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | Landing page: overview map and the list of walks |
| `walk.html` | One walk, chosen by `?walk=<id>` |
| `assets/common.js` | Geometry, base maps, walk loading, geolocation |
| `assets/home.js` | Landing page |
| `assets/walk.js` | Walk page |
| `assets/style.css` | All styling |
| `data/site.js` | Site title, intro, and **the register of walk ids** |
| `data/<id>.js` | **One walk.** Everything the guide shows |
| `tools/walk-template.js` | An annotated blank to copy |
| `tools/ADDING-A-WALK.md` | How to add one, and what fails silently |
| `tools/check-walks.js` | Checks every walk against what the pages read |
| `tools/gpx-to-walk.js` | Turns a GPX track into walk data |
| `tools/trace-route.py` | Lifts a route out of a map screenshot |
| `tools/TRACING.md` | How that tracing works, and its traps |
| `assets/vendor/leaflet/` | Leaflet 1.9.4, vendored (BSD-2-Clause) |

## Adding a walk

1. Copy `tools/walk-template.js` to `data/<id>.js` and fill it in. The
   template documents every field.
2. Add `'<id>'` to `WALK_IDS` in `data/site.js`.
3. Run `node tools/check-walks.js <id>`.

That is the whole procedure — both pages build themselves from the register.
Ids from the URL are checked against `WALK_IDS` before they are turned into a
file path, so a walk is only reachable once it is listed there.

`tools/ADDING-A-WALK.md` has the detail, and in particular the four things
that go wrong without the page ever saying so. Step 3 is there because of
them: a stop 200 m off the line, or stops listed out of order, cost you a
section of the page in silence.

Anything left empty is left out of the page, so a walk can go up in stages. A
walk with an empty `line` is shown as "route being mapped" rather than
half-drawn, which is the intended state for a guide whose GPS trace has not
arrived yet.

### Getting the track line

The `line` array is the drawn track. A GPX trace is easiest:

```
node tools/gpx-to-walk.js yourtrack.gpx
```

It prints a ready-to-paste `line`, `distanceKm`, `centre` and `zoom`, an
elevation summary for the glance table, and any waypoints in the file as
candidate stops. It simplifies the trace to about 60 points, which is plenty
for a line that is drawn as indicative rather than as a survey trace.

Without a GPX, trace it off a screenshot of the route — `tools/trace-route.py`,
written up in `tools/TRACING.md`.

A drawn line measures shorter than the real path because it cuts corners, so
set `distanceKm` to the real walking distance. Every distance on the page is
stretched onto it: the profile axis, the "km in" beside each stop, and the
distance a walker on the hill sees to the next hut. Aim for a point about
every 100 m in the line itself — a walker is placed on the walk by dropping a
perpendicular onto it, so a long chord across a bend misplaces them.

## Publishing

The site is served straight from the branch — there is no build step, so no
deploy workflow is needed. To turn it on, once:

1. Go to **Settings → Pages** in this repository.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
   Not *GitHub Actions* — there is no deploy workflow, so that option would
   publish nothing.
3. Choose branch **`main`**, folder **`/ (root)`**, and Save.

Pages has to be switched on by hand once. It cannot be enabled from a
workflow: the Actions `GITHUB_TOKEN` has no admin rights on the repository,
so creating the site is refused with *Resource not accessible by
integration*.

The first build takes a minute or two, after which the guide is at
<https://sachabd.github.io/italy-parks-map/>. Every later push to `main`
republishes it automatically.

## Running it locally

Geolocation only works in a secure context, which means `https://` or
`localhost` — opening the file directly from disk will not prompt for
location. So:

```
python3 -m http.server 8000
```

then open <http://localhost:8000>.

## Notes

- Leaflet is vendored rather than loaded from a CDN, so the page has no
  third-party dependency at run time. Map tiles still need a connection.
- Tiles come from OpenTopoMap, Esri and OpenStreetMap. All three are used
  under their published attribution terms, which the map credits. They are
  free services, so keep traffic modest.
- Not an official park publication. The track line will not keep you on the
  path in cloud — carry a topographic map.
