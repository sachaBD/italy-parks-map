# Seceda Ridge Walk

A single-page walk guide for the Seceda ridge traverse in the Puez-Odle Nature
Park, Val Gardena. Static HTML, CSS and JavaScript, built to be served from
GitHub Pages. No build step and no framework.

Laid out as a digital brochure in the manner of an Australian national parks
track guide: green masthead, yellow alert strip, an "at a glance" fact panel,
a track grade, numbered stops and a "before you go" checklist.

## What it does

- **Track map** on Leaflet, with topographic, aerial and street base maps.
  The route is drawn as a dashed track line with numbered stop markers.
- **Your location** from the browser, shown as a dot with an accuracy ring,
  plus a live straight-line distance to every stop and a plain-language note
  about the nearest one. Falls back to pasting coordinates if there is no fix.
- **Height profile** generated from the stop altitudes.
- Prints tidily, and still works with the map switched off.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | Page structure |
| `assets/style.css` | All styling |
| `assets/app.js` | Map, location, generated sections |
| `assets/data.js` | **The walk itself.** Edit this to change anything |
| `assets/vendor/leaflet/` | Leaflet 1.9.4, vendored (BSD-2-Clause) |

## Changing the walk

Everything readable on the page comes from `assets/data.js` — the stops and
their coordinates, the fact panel, the alert, the facilities, the safety notes
and the track line. Nothing else needs to be touched to describe a different
walk.

The `line` array is the drawn track. It is a hand-drawn indicative shape from
the hut positions, not a GPS trace, and it measures shorter than the real path
because it cuts corners. The height profile is stretched onto `distanceKm` so
the distance axis matches the walking distance quoted at the top of the page.
If you replace `line` with a real GPX trace, set `distanceKm` to its length.

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
