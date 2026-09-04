#!/usr/bin/env python3
# ------------------------------------------------------------------
#  Turn a screenshot of a route on a map into the fields data/<id>.js
#  needs: a `line`, a `centre`, a `zoom` and coordinates for the stops.
#
#  Use this when there is no GPX — an AllTrails or komoot page you can
#  see but not download. For a GPX, use tools/gpx-to-walk.js instead.
#
#  Needs Pillow and numpy:  pip install Pillow numpy
#
#  The method, and why it is split into these steps, is written up in
#  tools/TRACING.md. Read that first; this file is only the machinery.
#
#  The seven steps, in the order you run them:
#
#    probe     what colour is the drawn route, and does a mask of that
#              colour actually cover it
#    scalebar  metres per pixel, off the map's own scale bar
#    marks     pixel centres of the map's icons — the hut and summit
#              pins you will anchor and check against
#    trace     walk the mask from a start pixel and write an ordered
#              pixel path
#    overlay   draw a path back over the screenshot so you can see
#              where the trace went wrong
#    join      splice traced segments and hand-read points into one path
#    place     convert a pixel path to latitude and longitude, and
#              report how far the check landmarks landed out
# ------------------------------------------------------------------

import argparse
import json
import math
import signal
import sys

import numpy as np
from PIL import Image, ImageDraw


# ----------------------------------------------------------- helpers

def load(path):
    return np.asarray(Image.open(path).convert('RGB')).astype(int)


def mask_of(rgb, colour, tol):
    """Pixels within `tol` of `colour` on every channel."""
    d = np.abs(rgb - np.array(colour))
    return (d[..., 0] <= tol) & (d[..., 1] <= tol) & (d[..., 2] <= tol)


def parse_colour(s, default_tol):
    """R,G,B or R,G,B:TOL"""
    body, _, tol = s.partition(':')
    return [int(v) for v in body.split(',')], (int(tol) if tol else default_tol)


def mask_of_all(rgb, colours, default_tol):
    """Union of several colour masks — the route's bright core and the dark
       casing drawn round it are two colours describing one line, and taking
       both leaves far fewer holes to jump."""
    out = None
    for spec in colours:
        colour, tol = parse_colour(spec, default_tol)
        m = mask_of(rgb, colour, tol)
        out = m if out is None else (out | m)
    return out


def points_of(mask):
    ys, xs = np.nonzero(mask)
    return np.stack([xs, ys], 1).astype(float)


def blobs(mask, min_size):
    """Connected components, 8-connected, over a sparse mask."""
    h, w = mask.shape
    seen = np.zeros_like(mask)
    ys, xs = np.nonzero(mask)
    out = []
    for sy, sx in zip(ys, xs):
        if seen[sy, sx]:
            continue
        stack, cells = [(sy, sx)], []
        seen[sy, sx] = True
        while stack:
            y, x = stack.pop()
            cells.append((x, y))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
        if len(cells) >= min_size:
            cx = [c[0] for c in cells]
            cy = [c[1] for c in cells]
            out.append({
                'size': len(cells),
                'x': [min(cx), max(cx)], 'y': [min(cy), max(cy)],
                'centre': [(min(cx) + max(cx)) / 2, (min(cy) + max(cy)) / 2],
            })
    return sorted(out, key=lambda b: -b['size'])


def rdp(pts, eps):
    """Ramer–Douglas–Peucker, on pixels."""
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    ab = b - a
    span = np.linalg.norm(ab)
    if span == 0:
        d = np.linalg.norm(pts - a, axis=1)
    else:
        rel = pts - a
        d = np.abs(rel[:, 0] * ab[1] - rel[:, 1] * ab[0]) / span
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(pts[:i + 1], eps)[:-1], rdp(pts[i:], eps)])
    return np.vstack([a, b])


def metres_per_degree(lat):
    r = math.radians(lat)
    return (111132.92 - 559.82 * math.cos(2 * r) + 1.175 * math.cos(4 * r),
            111412.84 * math.cos(r) - 93.5 * math.cos(3 * r))


def parse_xy(s):
    x, y = s.split(',')
    return [float(x), float(y)]


def parse_fix(s):
    """LAT,LON@X,Y — a coordinate and the pixel it sits on."""
    ll, px = s.split('@')
    lat, lon = (float(v) for v in ll.split(','))
    return (lat, lon, *parse_xy(px))


def read_path(path):
    return np.array(json.load(open(path))['points'], float)


def write_path(path, pts, note):
    json.dump({'note': note, 'units': 'pixels, x right and y down from the top left',
               'points': [[round(float(x), 1), round(float(y), 1)] for x, y in pts]},
              open(path, 'w'), indent=1)


# ------------------------------------------------------------- probe

def cmd_probe(a):
    rgb = load(a.image)
    x, y = (int(v) for v in parse_xy(a.at))
    r = a.radius
    win = rgb[max(0, y - r):y + r + 1, max(0, x - r):x + r + 1].reshape(-1, 3)
    seen, counts = np.unique(win, axis=0, return_counts=True)
    order = np.argsort(-counts)[:a.top]

    print('colours within %d px of %d,%d, commonest first:' % (r, x, y))
    print('')
    print('  colour             here   tol 20     tol 30     tol 40')
    for i in order:
        colour = seen[i].tolist()
        row = '  %-16s %5d' % (','.join(str(v) for v in colour), counts[i])
        for tol in (20, 30, 40):
            row += '   %8d' % int(mask_of(rgb, colour, tol).sum())
        print(row)
    print('')
    print('Aim your --at at the middle of the drawn line, and take the bright')
    print('core rather than the dark casing around it. Want the largest')
    print('tolerance whose count has not started climbing into the terrain —')
    print('a drawn route is usually a few thousand pixels.')


# ---------------------------------------------------------- scalebar

def cmd_scalebar(a):
    rgb = load(a.image)
    x0, y0, x1, y1 = (int(v) for v in a.box.split(','))
    band = rgb[y0:y1, x0:x1]
    dark = band.max(axis=2) < a.dark
    cols = dark.sum(axis=0)
    ticks = [x0 + i for i, v in enumerate(cols) if v >= (y1 - y0) * 0.6]
    if len(ticks) < 2:
        sys.exit('No tick columns found in that box. Widen it, or raise --dark.')
    groups, run = [], [ticks[0]]
    for t in ticks[1:]:
        if t - run[-1] <= 2:
            run.append(t)
        else:
            groups.append(run)
            run = [t]
    groups.append(run)
    if len(groups) < 2:
        sys.exit('Only one tick found. The box needs both ends of the bar in it.')
    centres = [sum(g) / len(g) for g in groups]
    span = centres[-1] - centres[0]
    print('ticks at %s' % ', '.join('%.1f' % c for c in centres))
    print('%.1f px spans %g m' % (span, a.metres))
    print('')
    print('  --mpp %.4f' % (a.metres / span))


# ------------------------------------------------------------- marks

def cmd_marks(a):
    rgb = load(a.image)
    colour = [int(v) for v in a.fill.split(',')]
    found = blobs(mask_of(rgb, colour, a.tol), a.min_size)
    print('%d blobs of %s within %d:' % (len(found), colour, a.tol))
    for b in found:
        w = b['x'][1] - b['x'][0] + 1
        h = b['y'][1] - b['y'][0] + 1
        print('  centre %7.1f,%-7.1f  size %5d  box %dx%d  x %d-%d  y %d-%d'
              % (b['centre'][0], b['centre'][1], b['size'], w, h,
                 b['x'][0], b['x'][1], b['y'][0], b['y'][1]))
    print('')
    print('An icon the route line crosses comes back clipped — its box is')
    print('smaller than the others. Take the centre from whichever two edges')
    print('are intact, not from the centroid.')


# ------------------------------------------------------------- trace

def cmd_trace(a):
    rgb = load(a.image)
    pts = points_of(mask_of_all(rgb, a.colour, a.tol))
    if len(pts) < 50:
        sys.exit('Only %d pixels match those colours. Run `probe` first.' % len(pts))

    start = np.array(parse_xy(a.start))
    direction = np.array(parse_xy(a.dir))
    direction /= np.linalg.norm(direction)
    step = a.step

    # Rings to search, and how straight the next pixel has to be for each.
    # The first ring is the ordinary case; the wider ones jump a gap where
    # a distance badge or a marker has been drawn over the route, and only
    # accept a pixel that carries straight on.
    rings = [(1.0, 0.10), (1.8, 0.65), (3.0, 0.78), (4.5, 0.85), (a.max_jump, 0.90)]

    path = [start.copy()]
    cur, d = start.copy(), direction.copy()
    for _ in range(a.max_steps):
        chosen = None
        for mult, tol in rings:
            if mult > a.max_jump:
                break
            ring = step * mult
            v = pts - cur
            n = np.linalg.norm(v, axis=1)
            near = (n > ring * 0.6) & (n < ring * 1.3)
            if not near.any():
                continue
            c, u = pts[near], v[near] / n[near, None]
            cos = u @ d
            ok = cos > tol
            if not ok.any():
                continue
            c, u, cos = c[ok], u[ok], cos[ok]
            if len(path) > 25:                       # do not double back
                old = np.array(path[:-20])
                gap = np.linalg.norm(c[:, None, :] - old[None, :, :], axis=2).min(axis=1)
                fresh = gap > max(step * 1.5, ring * 0.95)
                if not fresh.any():
                    continue
                c, u, cos = c[fresh], u[fresh], cos[fresh]
            j = int(np.argmax(cos))
            chosen = (c[j], u[j])
            break
        if chosen is None:
            break
        cur, nd = chosen
        d = 0.5 * d + 0.5 * nd
        d /= np.linalg.norm(d)
        path.append(cur.copy())
        if len(path) > 60 and np.linalg.norm(cur - start) < step * 2:
            path.append(start.copy())
            break

    path = np.array(path)
    closed = len(path) > 2 and np.linalg.norm(path[-1] - start) < 2
    print('%d points, %s at %.0f,%.0f'
          % (len(path), 'closed the loop' if closed else 'stopped',
             path[-1][0], path[-1][1]))
    if len(path) < 5:
        print('')
        print('That went nowhere. Either --dir points off the route, or the')
        print('mask has a hole at --start — a start marker drawn over the line')
        print('will do it. Set off from a clean stretch a little further on.')
    elif not closed:
        print('')
        print('A trace that stops has hit a turn sharper than it will follow,')
        print('or a junction. Trace onward from there as a second segment and')
        print('`join` them. Always `overlay` before you believe a trace.')
    write_path(a.out, path, 'traced from ' + a.image)
    print('wrote ' + a.out)


# ----------------------------------------------------------- overlay

def cmd_overlay(a):
    im = Image.open(a.image).convert('RGB')
    d = ImageDraw.Draw(im)
    pts = read_path(a.path)
    d.line([tuple(p) for p in pts], fill=(255, 0, 255), width=3)
    for i, (x, y) in enumerate(pts):
        if i % a.every == 0:
            d.ellipse([x - 4, y - 4, x + 4, y + 4], outline=(0, 0, 0), width=2)
    if a.crop:
        x0, y0, x1, y1 = (int(v) for v in a.crop.split(','))
        im = im.crop((x0, y0, x1, y1))
    if a.zoom != 1:
        im = im.resize((int(im.width * a.zoom), int(im.height * a.zoom)))
    im.save(a.out)
    print('wrote %s — look at it before going any further' % a.out)


# -------------------------------------------------------------- join

def cmd_join(a):
    out = []
    for part in a.parts:
        if part.endswith('.json') or '.json:' in part:
            name, _, rest = part.partition(':')
            seg = read_path(name).tolist()
            for flag in (f for f in rest.split(':') if f):
                if flag == 'reverse':
                    seg = seg[::-1]
                elif flag.startswith('slice='):               # slice=from-to
                    lo, _, hi = flag[6:].partition('-')
                    seg = seg[int(lo) if lo else None:int(hi) if hi else None]
                else:
                    sys.exit('Unknown flag %r on %s' % (flag, name))
        else:
            seg = [parse_xy(p) for p in part.split(';')]      # hand-read points
        out.extend(seg)
    write_path(a.out, np.array(out, float), 'joined from ' + ' '.join(a.parts))
    print('%d points -> %s' % (len(out), a.out))


# ------------------------------------------------------------- place

def cmd_place(a):
    pts = read_path(a.path)
    lat0, lon0, px0, py0 = parse_fix(a.anchor)
    m_lat, m_lon = metres_per_degree(lat0)
    mpp = a.mpp

    def to_ll(x, y):
        return (lat0 - (y - py0) * mpp / m_lat, lon0 + (x - px0) * mpp / m_lon)

    def metres(p, q):
        return math.hypot((p[0] - q[0]) * m_lat, (p[1] - q[1]) * m_lon)

    simple = rdp(pts, a.simplify) if a.simplify else pts
    line = [to_ll(x, y) for x, y in simple]
    drawn = float(np.linalg.norm(np.diff(simple, axis=0), axis=1).sum()) * mpp

    print('/* placed from %s' % a.path)
    print('   anchor %.5f, %.5f on pixel %g,%g at %.4f m per pixel'
          % (lat0, lon0, px0, py0, mpp))
    print('   %d points simplified to %d, drawn length %.2f km'
          % (len(pts), len(simple), drawn / 1000))
    for c in a.check:
        name, _, fix = c.partition('=')
        lat, lon, x, y = parse_fix(fix if fix else name)
        off = metres((lat, lon), to_ll(x, y))
        print('   check %-24s lands %4.0f m from its published position'
              % (name if fix else 'landmark', off))
    if a.distance_km:
        print('   traced %.2f km against a stated %.2f km, %+.1f%%'
              % (drawn / 1000, a.distance_km,
                 100 * (drawn / 1000 - a.distance_km) / a.distance_km))
    print('   ------------------------------------------------------- */')
    print('')

    lats = [c[0] for c in line]
    lons = [c[1] for c in line]
    span = max(max(lats) - min(lats), max(lons) - min(lons))
    zoom = 12 if span > 0.09 else 13 if span > 0.045 else 14 if span > 0.022 \
        else 15 if span > 0.011 else 16
    if a.distance_km:
        print('  distanceKm: %g,' % a.distance_km)
    print('  centre: [%.5f, %.5f],' % ((min(lats) + max(lats)) / 2,
                                       (min(lons) + max(lons)) / 2))
    print('  zoom:   %d,' % zoom)
    print('')
    print('  line: [')
    rows = ['    ' + ', '.join('[%.5f, %.5f]' % c for c in line[i:i + 3]) + ','
            for i in range(0, len(line), 3)]
    rows[-1] = rows[-1].rstrip(',')
    print('\n'.join(rows))
    print('  ],')

    if a.stop:
        print('')
        print('/* --- stops -------------------------------------------- */')
        for s in a.stop:
            name, _, px = s.partition('=')
            x, y = parse_xy(px)
            ll = to_ll(x, y)
            off = min(metres(ll, c) for c in line)
            print('    lat: %.5f, lon: %.5f,   /* %s — %.0f m from the line%s */'
                  % (ll[0], ll[1], name, off,
                     ', TOO FAR, walk.js drops it from the profile' if off > 150 else ''))


# --------------------------------------------------------------- cli

def main():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest='cmd', required=True)

    q = sub.add_parser('probe', help='colour of the route, and how well a mask of it fits')
    q.add_argument('image')
    q.add_argument('--at', required=True, metavar='X,Y', help='a pixel on the drawn route')
    q.add_argument('--radius', type=int, default=3, help='how far around it to sample')
    q.add_argument('--top', type=int, default=6, help='how many colours to list')
    q.set_defaults(fn=cmd_probe)

    q = sub.add_parser('scalebar', help='metres per pixel from the map scale bar')
    q.add_argument('image')
    q.add_argument('--box', required=True, metavar='X0,Y0,X1,Y1',
                   help='a box holding both end ticks and nothing else dark')
    q.add_argument('--metres', type=float, default=200.0, help='what the bar says')
    q.add_argument('--dark', type=int, default=110, help='how dark a tick is')
    q.set_defaults(fn=cmd_scalebar)

    q = sub.add_parser('marks', help='pixel centres of the map icons')
    q.add_argument('image')
    q.add_argument('--fill', required=True, metavar='R,G,B', help='the icon fill colour')
    q.add_argument('--tol', type=int, default=32)
    q.add_argument('--min-size', type=int, default=45)
    q.set_defaults(fn=cmd_marks)

    q = sub.add_parser('trace', help='walk the route into an ordered pixel path')
    q.add_argument('image')
    q.add_argument('--colour', required=True, action='append', metavar='R,G,B[:TOL]',
                   help='repeatable — give the bright core and the dark casing')
    q.add_argument('--tol', type=int, default=40, help='default tolerance for --colour')
    q.add_argument('--start', required=True, metavar='X,Y')
    q.add_argument('--dir', required=True, metavar='DX,DY',
                   help='which way to set off; write it as --dir=-1,0 when it starts with a minus')
    q.add_argument('--step', type=float, default=9.0, help='pixels between points')
    q.add_argument('--max-jump', type=float, default=6.0,
                   help='widest gap to bridge, in steps; lower it if the trace cuts corners')
    q.add_argument('--max-steps', type=int, default=3000)
    q.add_argument('--out', required=True)
    q.set_defaults(fn=cmd_trace)

    q = sub.add_parser('overlay', help='draw a path back over the screenshot')
    q.add_argument('image')
    q.add_argument('--path', required=True)
    q.add_argument('--out', required=True)
    q.add_argument('--crop', metavar='X0,Y0,X1,Y1')
    q.add_argument('--zoom', type=float, default=1.0)
    q.add_argument('--every', type=int, default=10, help='ring every Nth point')
    q.set_defaults(fn=cmd_overlay)

    q = sub.add_parser('join', help='splice segments and hand-read points into one path')
    q.add_argument('--out', required=True)
    q.add_argument('parts', nargs='+',
                   help='a.json | a.json:reverse | a.json:slice=10-40 | "X,Y;X,Y" '
                        '(flags chain: a.json:reverse:slice=0-196)')
    q.set_defaults(fn=cmd_join)

    q = sub.add_parser('place', help='pixels to latitude and longitude')
    q.add_argument('--path', required=True)
    q.add_argument('--mpp', type=float, required=True, help='metres per pixel')
    q.add_argument('--anchor', required=True, metavar='LAT,LON@X,Y')
    q.add_argument('--check', action='append', default=[], metavar='NAME=LAT,LON@X,Y',
                   help='a landmark NOT used in the fit; repeatable')
    q.add_argument('--stop', action='append', default=[], metavar='NAME=X,Y',
                   help='a stop to convert and measure against the line; repeatable')
    q.add_argument('--simplify', type=float, default=3.0, help='pixels; 0 to keep every point')
    q.add_argument('--distance-km', type=float, help='the published length, to check against')
    q.set_defaults(fn=cmd_place)

    a = p.parse_args()
    a.fn(a)


if __name__ == '__main__':
    if hasattr(signal, 'SIGPIPE'):      # so `| head` ends quietly
        signal.signal(signal.SIGPIPE, signal.SIG_DFL)
    main()
