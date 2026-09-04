# Turning a screenshot of a map into a walk

For a route you can see but not download — an AllTrails or komoot page,
a photograph of a panorama board — the shape of the line is there in the
pixels and can be lifted out. What is *not* there is where those pixels
sit on the earth. Those are two separate problems and the second one is
the one that goes wrong.

`tools/trace-route.py` does the mechanical parts. This file is the
method, the order to do it in, and the things that have bitten.

    pip install Pillow numpy

If you have a GPX, none of this applies — use `tools/gpx-to-walk.js`.

## The rule this exists to enforce

> Do not place a route from an estimated coordinate.

Guessing where a lift station or a trailhead is has been wrong every
time: Monte Piz landed 0.7 km out, Resciesa 658 m. Meanwhile a traced
*shape* has come out within 0.4–2% of the route's published length every
time it has been checked. So:

* Trust the shape. Check it against the published distance.
* Never trust an anchor you have not corroborated against a landmark you
  did not use to fit it.

The `place` step is built round that: it takes exactly one anchor, and
it makes you pass `--check` landmarks so it can tell you how far out
they landed.

## Step by step

The worked example throughout is `data/tre-cime.js`, traced from an
AllTrails screenshot 1080 px wide.

### 1. Find the route's colour

    python3 tools/trace-route.py probe shot.png --at 874,808

Aim `--at` at the middle of the drawn line. It prints the colours in a
small window around that pixel, commonest first, with how many pixels in
the whole image match each one at three tolerances.

A drawn route usually has two colours: a bright core and a dark casing
drawn round it. On the Tre Cime shot the core was `147,243,118` and the
casing `55,92,45` — and the core alone is only about four pixels wide.
Take both. The tolerance that suits each differs; a dark casing will
start matching shadowed vegetation long before a bright core matches
anything.

Right answer: a few thousand pixels. If a tolerance is pulling a million,
it has found the terrain.

### 2. Metres per pixel

    python3 tools/trace-route.py scalebar shot.png --box 430,2312,560,2334

Point `--box` at a strip containing the scale bar's two end ticks and
nothing else dark. It measures the gap and divides by `--metres`
(default 200).

    ticks at 445.5, 521.5
    76.0 px spans 200 m
      --mpp 2.6316

This number is exact and free, so use it rather than deriving scale from
two landmarks. Mapbox and Leaflet scale controls pick a round distance
and size the bar to fit it, so the bar length is the reliable end.

The screenshot must be north-up and unrotated, which phone map
screenshots are unless you deliberately turned them. Over a 3 km frame
the Mercator scale change with latitude is under 0.1% and is ignored.

### 3. Pixel positions of the map's own icons

    python3 tools/trace-route.py marks shot.png --fill 116,86,64 --tol 40

Lists every blob of that colour with its bounding box and centre. Hut
pins, summit triangles and the like. These are what you anchor and check
against, because you can look up what they are.

**The trap:** an icon the route line crosses comes back clipped, and its
centroid is then pulled off to one side. Compare boxes — the clean pins
on this shot were 21×21, and the Rifugio Locatelli pin came back 18×15
because the track ran over its top right corner. Take the centre from
the two edges that are intact (left edge + 10, bottom edge − 10), not
from the centroid.

### 4. Trace

    python3 tools/trace-route.py trace shot.png \
      --colour 147,243,118 --colour 55,92,45:20 \
      --start 440,1673 --dir=-1,-0.3 --out loop.json

It walks the mask a step at a time, always taking the pixel that best
continues the direction it is already going, and refusing to revisit
where it has been. Where a distance badge or a marker has been drawn
over the route it widens its search, and only accepts a pixel that
carries straight on across the gap.

Notes on the arguments:

* `--dir` must be written `--dir=-1,0` when it starts with a minus, or
  argparse reads it as a flag.
* `--start` needs to be on clean line. The first attempt here set off
  from the AllTrails start dot, which is drawn *over* the route, so
  tracing east found nothing at all and stopped after one point. Start a
  little way along instead.
* `--max-jump` is how wide a gap it will bridge, in steps. Lower it if
  the trace cuts a corner; raise it if it keeps stopping at badges.
* Only the drawn route is in the mask, so the walk cannot wander onto a
  side path — every junction it meets is the route crossing itself.

It will tell you whether it closed the loop. Believe nothing yet.

### 5. Look at it

    python3 tools/trace-route.py overlay shot.png --path loop.json \
      --out check.png --crop 0,200,1080,2000 --zoom 0.6

Then actually open the file. This is not optional. On the Tre Cime run
the trace closed a 407-point loop that looked perfect at full-page zoom
and had silently skipped the whole spur up to the Dreizinnenhütte —
about 400 m of route, and the single most important place on the walk.
Crop and zoom into anywhere the route doubles back on itself, passes a
marker, or switchbacks.

### 6. Splice in what the trace missed

    python3 tools/trace-route.py join --out full.json \
      loop.json:reverse:slice=0-196 \
      "876,695;877,687;876,677;...;872,687" \
      loop.json:reverse:slice=196-

Parts are either a traced file, with `:reverse` and `:slice=from-to`
flags that chain, or an inline `"X,Y;X,Y;..."` string of points read off
a zoomed crop by eye. Reading a couple of dozen points off a 4×
enlargement takes a few minutes and is completely reliable; fighting the
tracer into following a hairpin is neither.

`:reverse` matters because the final `line` should run in walking order —
`walk.js` builds the height profile by sorting stops along it.

Use this to fix:

* a spur or side loop the tracer cut across,
* a hairpin sharper than it would follow,
* a switchback zigzag you would rather smooth than reproduce.

### 7. Place it

    python3 tools/trace-route.py place --path full.json --mpp 2.6316 \
      --anchor 46.63682,12.31062@857.5,598 \
      --check "Monte Paterno=46.6304,12.3152@997,882.5" \
      --distance-km 10.1 \
      --stop "Rifugio Lavaredo=907,1408.5"

Prints the `distanceKm`, `centre`, `zoom` and `line` block to paste into
`data/<id>.js`, plus `lat`/`lon` for each `--stop`.

**Anchor** on the best-corroborated coordinate you have — a hut with a
published position, agreed by two independent sources to five or six
decimals. Not a summit, whose "position" is a ridge; not a car park.

**Check** against a landmark you did *not* fit to. This is the whole
point of the exercise. On the Tre Cime run the anchor was the Rifugio
Locatelli pin, and Monte Paterno — untouched by the fit — landed 39 m
from its published summit. That is what makes the placement believable.

Under 50 m on an independent landmark is good. Over 200 m, stop: the
anchor is wrong, or the screenshot is not north-up, or `--mpp` is wrong.

`--distance-km` compares the drawn length against the published one.
Expect the trace to come out 1–3% short, because a polyline through a
drawn line is straighter than the path on the ground. If it comes out
*long*, or more than about 5% short, the scale is wrong.

`--stop` also reports how far each stop sits from the drawn line, which
matters: `walk.js` drops a stop more than 150 m off the line from the
height profile, on the grounds that it is a landmark beside the route
rather than a point on it.

## Reading coordinates off DMS

Many gazetteers publish coordinates rounded to whole arcseconds, which
looks precise and is not — one arcsecond of longitude at 46° N is 21 m,
and the rounding alone can move a hut 90 m. On this run the published
figure for the Rifugio Lavaredo disagreed with the map by 94 m in
longitude while agreeing to 16 m in latitude, which is the signature of
DMS rounding rather than a bad transform. Prefer sources that give
decimals. Where they disagree, believe the one with more digits and say
so in the file header.

## When a route is already on the page and looks wrong

A screenshot of the live page that shows both the drawn line and a real
feature in the same frame makes the error measurable — see the "How to
fix a misplaced route" section of `CLAUDE.md`. It is the same arithmetic
as `place`: the page's own stop markers give you metres per pixel, and
the difference between where the line sits and where the feature sits is
a pure translation to apply to every coordinate in the file.

## What to write in the file header

Whatever you did, so the next person can tell how much to trust it. The
Tre Cime and Resciesa headers are the pattern: what the figures came
from, what the line was traced from, what it was anchored on, and what
the corroborating landmark came out at.
