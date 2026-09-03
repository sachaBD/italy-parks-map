# Sources — Seceda area

Everything the Seceda pages assert should be traceable to something in
this folder. When a figure or a coordinate goes into `data/`, note here
where it came from and how it was checked.

## Files

| File | What it is |
| --- | --- |
| `panorama-map-valgardena.png` | Pictorial panorama of the Seceda / Col Raiser area, photographed from a board on the mountain. Oblique, not to scale. |
| `alltrails-seceda-firenze-colraiser.png` | AllTrails screenshot of the Seceda → Rifugio Firenze → Col Raiser route on a Mapbox/OpenStreetMap base. North-up, with a scale bar. |
| `alltrails-derived.json` | The georeferencing fit, the positions read off that screenshot, and the traced route line. |

### What each source is good for

The panorama is the **inventory**: it names most of the huts, the lift
lines and the trail numbers in the area, and shows which paths meet
where. It is drawn in oblique perspective from a viewpoint south of the
valley, so nothing on it can be measured. Use it to know what exists,
never to place anything.

The AllTrails screenshot is the **geometry**. It is north-up with square
pixels, so a single scale and offset maps it to WGS84.

## The georeferencing

Fitted by `tools/trace-screenshot.py` from two control points whose real
coordinates are published:

| Control point | Pixel | Coordinate | Source |
| --- | --- | --- | --- |
| Große Fermeda summit, 2873 m | 715.5, 844.4 | 46.602484, 11.751551 | Wikipedia, 46°36′09″N 11°45′06″E |
| Rifugio Firenze / Regensburger Hütte, 2037 m | 888.5, 1399.7 | 46.587535, 11.758329 | published hut coordinate |

Two control points fix three unknowns — one scale and two offsets — and
leave one constraint spare. That spare constraint is the check:

- metres per pixel from the horizontal separation: **3.0023**
- metres per pixel from the vertical separation: **2.9926**
- they disagree by **0.32%**, so the screenshot really is north-up and
  both control coordinates are sound
- residual at each control point after the least-squares fit: **1.4 m**

Corroborated twice more, by things the fit was not made to match:

- the scale bar. 200 m spans 66.8 px outer edge to outer edge, which is
  2.994 m/px against the fitted 2.997.
- the traced route's last point comes out at 46.58482, 11.74528. The
  Col Raiser coordinate already in `data/seceda.js` is 46.5849, 11.7454
   — about **10 m** away, and it played no part in the fit.

## Positions read off the screenshot

Marker centres, converted with the fit above. Good to roughly ±10 m.

| Feature | Coordinate |
| --- | --- |
| Seceda top station (route start) | 46.59784, 11.72506 |
| Col Raiser top station (route end) | 46.58482, 11.74528 |
| Rifugio Firenze | 46.58753, 11.75828 |
| Brogles hut | 46.61007, 11.72766 |
| Rifugio Juac | 46.57336, 11.74999 |
| Große Fermeda summit | 46.60249, 11.75156 |
| Pieralongia summit | 46.59737, 11.75044 |
| Juacturm summit | 46.57688, 11.75993 |
| Pela de Vit summit | 46.57643, 11.76288 |

## A correction this turned up

The `Seceda ridge` stop in `data/seceda.js` was at 46.6068, 11.7268.
That is **about 700 m from the nearest point of the traced route**, and
roughly a kilometre north of where the walk actually starts — out on the
north face below the escarpment. Every other stop in that file sits
within 90 m of the traced line, so this was a single bad point rather
than a misplaced route, and it is the failure mode `CLAUDE.md` warns
about: a lift station placed from an estimate.

## Distances

The traced line measures **6.0 km**; AllTrails publishes **7.8 km** for
the same route, and its elevation profile runs 2,566 m down to 1,976 m.
A line drawn at 3 m per pixel cannot show the switchbacks below
Pieralongia, so it always measures short. Quote the published figure as
`distanceKm` and let the drawn line be the shape only — which is what
`README.md` at the repository root already says to do.

## Still needed

Positions that this screenshot does not cover, because they are outside
its frame or unlabelled on it: the valley and middle lift stations, and
the huts west and south of the route — Sofie, Daniel, Fermeda, Cuca,
Curona, Mastlé, Sangon, Gamsblut, Séurasas, Odle/Geisler, Gschmagenhart,
Troier. These want OpenStreetMap rather than another screenshot.
