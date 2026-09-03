#!/usr/bin/env python3
"""------------------------------------------------------------------
Georeference a north-up map screenshot, and trace a drawn route off it.

    python3 tools/trace-screenshot.py <image.png> [--route-colour R,G,B]

Unlike tools/place-route.js, which needs one true coordinate and trusts
a scale bar, this fits scale *and* position from two published control
points at once. That leaves a spare degree of freedom: the metres per
pixel implied by the horizontal separation and by the vertical one are
computed independently, and if they disagree by more than about half a
percent something is wrong — a rotated screenshot, a misread marker, or
a bad control coordinate — and the fit should not be used.

Requires pillow and numpy, which nothing else here needs:

    pip install pillow numpy

Fill in CONTROL and the endpoint pixels for the image being worked on.
Marker pixels come from reading them off the image; the ASCII dump that
--probe prints is the easy way to find a marker centre to a pixel.
------------------------------------------------------------------ """

import argparse
import heapq
import json
import math
import sys

import numpy as np
from PIL import Image

# Two points visible in the image whose real coordinates are published.
# Pick them far apart and on opposite diagonals if you can, so the two
# scale estimates are both well conditioned.
CONTROL = [
    {"name": "Grosse Fermeda summit 2873 m",
     "pixel": (715.5, 844.4), "coord": (46.602484, 11.751551)},
    {"name": "Rifugio Firenze 2037 m",
     "pixel": (888.5, 1399.7), "coord": (46.587535, 11.758329)},
]

ROUTE_START_PX = (38.0, 1017.0)     # the drawn line's first point
ROUTE_END_PX = (555.0, 1500.0)      # and its last

# Colours of the drawn route: the bright core, its darker casing, and
# the two endpoint dots. Everything the line is made of has to be here
# or the trace will stop at the first gap.
ROUTE_COLOURS = [(147, 243, 118), (77, 163, 48), (26, 43, 22),
                 (62, 97, 52), (80, 134, 66)]


def metres_per_degree(lat):
    r = math.radians(lat)
    return (111132.92 - 559.82 * math.cos(2 * r) + 1.175 * math.cos(4 * r),
            111412.84 * math.cos(r) - 93.5 * math.cos(3 * r))


def fit(control):
    """Scale and origin from two control points, with the consistency check."""
    lat_mid = sum(c["coord"][0] for c in control) / len(control)
    mlat, mlon = metres_per_degree(lat_mid)
    (p0, g0), (p1, g1) = [(c["pixel"], c["coord"]) for c in control]

    sx = ((g1[1] - g0[1]) * mlon) / (p1[0] - p0[0])
    sy = -((g1[0] - g0[0]) * mlat) / (p1[1] - p0[1])
    scale = (sx + sy) / 2
    disagree = abs(sx - sy) / scale * 100

    lat0 = sum(c["coord"][0] + c["pixel"][1] * scale / mlat for c in control) / len(control)
    lon0 = sum(c["coord"][1] - c["pixel"][0] * scale / mlon for c in control) / len(control)
    return {"lat0": lat0, "lon0": lon0, "scale": scale,
            "mlat": mlat, "mlon": mlon, "sx": sx, "sy": sy, "disagree": disagree}


def to_ll(t, px, py):
    return (t["lat0"] - py * t["scale"] / t["mlat"],
            t["lon0"] + px * t["scale"] / t["mlon"])


def haversine(a, b):
    R, r = 6371008.8, math.pi / 180
    dla, dlo = (b[0] - a[0]) * r, (b[1] - a[1]) * r
    h = (math.sin(dla / 2) ** 2 +
         math.cos(a[0] * r) * math.cos(b[0] * r) * math.sin(dlo / 2) ** 2)
    return 2 * R * math.asin(min(1, math.sqrt(h)))


def route_mask(im, colours, tol=30):
    m = np.zeros(im.shape[:2], bool)
    for c in colours:
        m |= np.abs(im - np.array(c)).max(axis=2) <= tol
    return m


def dilate(m, k):
    """Bridge the trail-number badges that sit on top of the drawn line."""
    out = m.copy()
    for _ in range(k):
        o = out.copy()
        o[1:, :] |= out[:-1, :]
        o[:-1, :] |= out[1:, :]
        o[:, 1:] |= out[:, :-1]
        o[:, :-1] |= out[:, 1:]
        out = o
    return out


def geodesic_path(mask, start_yx, end_yx):
    """Shortest path along the drawn line. Marching along it by heading
    fails at a hairpin, where the turn exceeds any sane angle limit; a
    shortest path through the line's own pixels does not care."""
    h, w = mask.shape
    dist = np.full((h, w), np.inf)
    prev = np.full((h, w, 2), -1, np.int32)
    dist[start_yx] = 0
    pq = [(0.0, start_yx[0], start_yx[1])]
    root2 = math.sqrt(2)
    while pq:
        d, y, x = heapq.heappop(pq)
        if d > dist[y, x]:
            continue
        if (y, x) == end_yx:
            break
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if not dy and not dx:
                    continue
                ny, nx = y + dy, x + dx
                if not (0 <= ny < h and 0 <= nx < w) or not mask[ny, nx]:
                    continue
                nd = d + (root2 if dy and dx else 1.0)
                if nd < dist[ny, nx]:
                    dist[ny, nx] = nd
                    prev[ny, nx] = (y, x)
                    heapq.heappush(pq, (nd, ny, nx))

    if not np.isfinite(dist[end_yx]):
        sys.exit('The start and end are not joined up in the mask. Widen the '
                 'colour tolerance, or add the colour of whatever breaks the line.')
    path, cur = [], end_yx
    while cur != start_yx:
        path.append((cur[1], cur[0]))
        cur = tuple(prev[cur[0], cur[1]])
    path.append((start_yx[1], start_yx[0]))
    return np.array(path[::-1], float)


def smooth(path, k=15):
    out = np.vstack([np.convolve(path[:, i], np.ones(k) / k, 'same')
                     for i in range(2)]).T
    out[:k], out[-k:] = path[:k], path[-k:]      # ends, which the window mangles
    return out


def simplify(p, eps):
    """Douglas-Peucker, so the pasted line is a few dozen points not a few thousand."""
    if len(p) < 3:
        return p
    a, b = p[0], p[-1]
    ab = b - a
    length = np.linalg.norm(ab)
    if length:
        d = np.abs(ab[0] * (p[:, 1] - a[1]) - ab[1] * (p[:, 0] - a[0])) / length
    else:
        d = np.linalg.norm(p - a, axis=1)
    i = int(np.argmax(d))
    if d[i] <= eps:
        return np.array([a, b])
    return np.vstack([simplify(p[:i + 1], eps)[:-1], simplify(p[i:], eps)])


def probe(im, x0, y0, x1, y1, colour, tol):
    """Print a region as characters, to read a marker centre off by eye."""
    sub = np.abs(im[y0:y1, x0:x1] - np.array(colour)).max(axis=2) <= tol
    for j, row in enumerate(sub):
        print(y0 + j, ''.join('#' if v else '.' for v in row))
    ys, xs = np.nonzero(sub)
    if len(xs):
        print(f'centre of bounding box: '
              f'({(xs.min() + xs.max()) / 2 + x0:.1f}, {(ys.min() + ys.max()) / 2 + y0:.1f})')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('image')
    ap.add_argument('--probe', metavar='X0,Y0,X1,Y1,R,G,B,TOL',
                    help='dump a region as characters instead of tracing')
    ap.add_argument('--published-km', type=float, default=None,
                    help='the route length as published, for comparison')
    ap.add_argument('--out', default=None, help='write the result as JSON here')
    args = ap.parse_args()

    im = np.array(Image.open(args.image).convert('RGB')).astype(int)

    if args.probe:
        v = [float(n) for n in args.probe.split(',')]
        probe(im, int(v[0]), int(v[1]), int(v[2]), int(v[3]),
              (v[4], v[5], v[6]), v[7])
        return

    t = fit(CONTROL)
    print(f'metres per pixel   from x {t["sx"]:.4f}   from y {t["sy"]:.4f}   '
          f'disagreement {t["disagree"]:.2f}%')
    if t['disagree'] > 0.5:
        print('  ^ over half a percent. Do not trust this fit — check the marker '
              'pixels and the control coordinates before going on.')
    print(f'adopted            {t["scale"]:.4f} m/px\n')
    for c in CONTROL:
        ll = to_ll(t, *c['pixel'])
        print(f'  {c["name"]:32s} residual {haversine(ll, c["coord"]):5.1f} m')

    mask = dilate(route_mask(im, ROUTE_COLOURS), 9)
    path = geodesic_path(mask,
                         (int(ROUTE_START_PX[1]), int(ROUTE_START_PX[0])),
                         (int(ROUTE_END_PX[1]), int(ROUTE_END_PX[0])))
    line = simplify(smooth(path), 3.0)
    ll = [to_ll(t, x, y) for x, y in line]
    km = sum(haversine(ll[i - 1], ll[i]) for i in range(1, len(ll))) / 1000

    print(f'\ntraced {len(line)} points, {km:.2f} km')
    if args.published_km:
        print(f'published {args.published_km:.2f} km — the drawn line generalises '
              f'switchbacks, so quote the published figure as distanceKm')

    print('\n  line: [')
    for i in range(0, len(ll), 3):
        row = ', '.join(f'[{a:.5f}, {b:.5f}]' for a, b in ll[i:i + 3])
        print('    ' + row + (',' if i + 3 < len(ll) else ''))
    print('  ],')

    if args.out:
        json.dump({'fit': {k: t[k] for k in ('lat0', 'lon0', 'scale', 'disagree')},
                   'traced_km': round(km, 2),
                   'line': [[round(a, 5), round(b, 5)] for a, b in ll]},
                  open(args.out, 'w'), indent=1)
        print(f'\nwrote {args.out}')


if __name__ == '__main__':
    main()
