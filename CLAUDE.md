# Working notes for this repo

## Standing instructions

- **Fix everything you find.** If a bug or inconsistency turns up while
  working on something else, fix it in the same pass rather than reporting
  it and moving on.

## Positioning routes — the hard-won rule

Do not place a route from an estimated coordinate. It has been wrong every
time it has been tried: the Monte Piz loop landed 0.7 km out, and Resciesa
658 m out, both from guessing a lift station's position.

Traced geometry is reliable; the anchor is what goes wrong. A traced shape
checked against a route's published length has come out within 0.4–2%, so
when a walk looks misplaced, suspect the anchor and nothing else.

### How to fix a misplaced route

If a screenshot of the live page shows the drawn line and a real feature
(a lift station, a summit) in the same frame, the error is measurable:

1. The page's own stop markers have known coordinates — find them in the
   screenshot to get metres per pixel.
2. Cross-check by predicting a third marker from two others. Under ~10 m
   means the transform is sound.
3. Read the true feature position off the map and take the difference.

That is a pure translation; apply it to every coordinate in the file.
Corroborate afterwards with an independent landmark the fix was not fitted
to.

## Data

Everything shown comes from `data/<id>.js`, registered in `WALK_IDS` in
`data/site.js`. See `data/TEMPLATE.js`. Empty fields are dropped from the
page, so a walk can go up in stages. `kind` on a stop may be `lift` or
`hut`, which colours its pin.

Tools: `tools/gpx-to-walk.js` for a GPX, `tools/place-route.js` for a
screenshot-traced route plus one anchor coordinate.
