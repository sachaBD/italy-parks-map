/* ------------------------------------------------------------------
   The walk page. Reads ?walk=<id>, loads data/<id>.js and builds the
   guide from it.

   Every section is optional. A walk with no stops, no facilities or no
   track line simply does not show those parts, so a guide can be
   published while it is still being put together.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const mapped = (s) => typeof s.lat === 'number' && typeof s.lon === 'number';
  const drop = (id) => { const el = $(id); if (el) el.remove(); };
  const has = (v) => Array.isArray(v) ? v.length > 0 : (v !== null && v !== undefined && v !== '');

  const wanted = new URLSearchParams(location.search).get('walk') || (window.WALK_IDS || [])[0];

  if (!NP.knownId(wanted)) {
    showNotFound(wanted);
    return;
  }

  NP.loadWalks([wanted]).then((walks) => {
    if (!walks.length) { showNotFound(wanted); return; }
    build(walks[0]);
  }).catch(() => showNotFound(wanted));

  function showNotFound(id) {
    ['sec-map', 'sec-grade', 'sec-glance', 'sec-stops', 'sec-profile',
     'sec-facs', 'sec-getting', 'sec-prep'].forEach(drop);
    $('walkName').textContent = 'Walk not found';
    $('lede').textContent = '';
    const p = $('notFound');
    p.hidden = false;
    p.innerHTML = 'There is no walk called <b></b> on this site. ' +
                  '<a href="index.html">See all walks</a>.';
    p.querySelector('b').textContent = String(id || '—');
  }

  /* ================================================================ */

  function build(W) {
    const draft = NP.isDraft(W);

    /* ------------------------------------------------------------ text */

    document.title = W.name + ' — ' + (W.parkAlt || W.park || SITE.title);
    $('mastPark').textContent = W.park || SITE.title;
    $('mastAlt').textContent = W.parkAlt || SITE.owner;
    $('region').textContent = W.region || '';
    $('walkName').textContent = W.name || 'Walk';

    if (has(W.lede)) $('lede').textContent = W.lede; else $('lede').remove();

    (W.chips || []).forEach((c) => {
      const li = document.createElement('li');
      li.textContent = c;
      $('chips').appendChild(li);
    });

    if (has(W.alert) && has(W.alert.title)) {
      $('alertTitle').textContent = W.alert.title;
      $('alertText').textContent = W.alert.text || '';
      $('alert').hidden = false;
      liftCountdown(W);
    }

    if (draft) {
      $('draftNote').hidden = false;
      if (has(W.draftNote)) $('draftText').textContent = W.draftNote;
    }

    /* ----------------------------------------------------------- grade */

    if (has(W.grade) && has(W.grade.number)) {
      $('gradeNum').textContent = W.grade.number;
      $('gradeTitle').textContent = W.grade.title || '';
      $('gradeDetail').textContent = W.grade.detail || '';
    } else {
      drop('sec-grade');
    }

    /* ------------------------------------------------------ fact lists */

    function fillFacts(el, rows) {
      rows.forEach(([term, def]) => {
        if (!has(def)) return;
        const wrapper = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = term;
        dd.textContent = def;
        wrapper.append(dt, dd);
        el.appendChild(wrapper);
      });
      return el.children.length;
    }

    if (!has(W.glance) || !fillFacts($('glance'), W.glance)) drop('sec-glance');
    if (!has(W.gettingThere) || !fillFacts($('getting'), W.gettingThere)) {
      drop('sec-getting');
    } else if (has(W.stops) && W.stops.some(mapped)) {
      const start = W.stops.filter(mapped)[0];
      const link = $('startLink');
      link.href = 'https://www.google.com/maps/search/?api=1&query=' + start.lat + ',' + start.lon;
      link.textContent = 'Open the start in Google Maps';
    } else {
      $('startLink').remove();
    }

    if (has(W.prepare)) {
      W.prepare.forEach((t) => {
        if (!has(t)) return;
        const li = document.createElement('li');
        li.textContent = t;
        $('prepare').appendChild(li);
      });
    }
    if (!$('prepare') || !$('prepare').children.length) drop('sec-prep');

    if (has(W.shorterOption)) {
      $('shorter').textContent = W.shorterOption;
      $('shorter').hidden = false;
    }

    // Walks that join on to this one — the same lift station, usually.
    if (has(W.related)) {
      const el = $('related');
      W.related.forEach((r, i) => {
        if (i) el.appendChild(document.createTextNode(' '));
        const a = document.createElement('a');
        a.href = 'walk.html?walk=' + encodeURIComponent(r.id);
        a.textContent = r.label;
        el.appendChild(a);
      });
      el.hidden = false;
    }

    /* ------------------------------------------------------ facilities */

    const ICONS = {
      food:    '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17.5 3c-1.6 1.6-2.2 3.2-2.2 5.2s.7 3.1 2.2 3.1V21"/>',
      beds:    '<path d="M3 8v11M3 12h18v7M3 19h18"/><path d="M7 12V9.5h5V12"/>',
      water:   '<path d="M12 3.2s6 6.6 6 10.4a6 6 0 0 1-12 0C6 9.8 12 3.2 12 3.2z"/>',
      toilets: '<circle cx="7.5" cy="5" r="2"/><path d="M7.5 8.2c-1.8 0-2.8 1.3-2.8 2.9v3.6h1.5V21h2.6v-6.3h1.5v-3.6c0-1.6-1-2.9-2.8-2.9z"/><circle cx="16.8" cy="5" r="2"/><path d="M16.8 8.2l-2.9 6.5h1.7V21h2.4v-6.3h1.7l-2.9-6.5z"/>',
      lookout: '<circle cx="6" cy="5.5" r="2.2"/><path d="M2 19.5h20"/><path d="M3.5 19.5l5.5-8 2.7 4"/><path d="M10.5 19.5l5-7.5 6.5 7.5"/>',
      lift:    '<path d="M2.5 6.5l19-3"/><path d="M12 5V9"/><rect x="7" y="9" width="10" height="7" rx="1.6"/><path d="M7 12.5h10"/>'
    };

    if (has(W.facilities)) {
      W.facilities.forEach(([key, title, detail]) => {
        if (!has(title)) return;
        const li = document.createElement('li');
        li.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[key] || '') + '</svg>' +
          '<span><b></b><span></span></span>';
        li.querySelector('b').textContent = title;
        li.querySelector('span span').textContent = detail || '';
        $('facs').appendChild(li);
      });
    }
    if (!$('facs') || !$('facs').children.length) drop('sec-facs');

    /* ------------------------------------------------------------- map */

    const hasMap = NP.hasLeaflet();
    const hasLine = has(W.line);
    const centre = W.centre || (hasLine ? W.line[0] : null);
    let map = null, stopMarkers = [];

    if (!hasMap || !centre) {
      $('map').style.display = 'none';
      $('basemaps').hidden = true;
      const msg = $('mapless');
      msg.hidden = false;
      msg.textContent = !hasMap
        ? 'The map could not be loaded — it needs a connection the first time. ' +
          'The track notes, distances and your location all still work below.'
        : 'No track has been mapped for this walk yet, so there is nothing to draw.';
      if (!hasLine) $('legend').remove();
    } else {
      map = NP.makeMap('map', centre, W.zoom || 14, $('basemaps'));
      if (hasLine) {
        const track = NP.drawTrack(map, W.line, W.colour);
        map.fitBounds(track.getBounds(), { padding: [34, 34] });
      }
      stopMarkers = (W.stops || []).map((s) => mapped(s)
        ? L.marker([s.lat, s.lon], {
            icon: NP.stopIcon(s), title: s.name, alt: 'Stop ' + s.n + ', ' + s.name
          }).addTo(map).bindPopup(
            '<b>' + s.n + '. ' + s.name + '</b><span>' +
            (s.alt ? s.alt + ' m · ' : '') + (s.leg || '') + '</span>')
        : null);
    }

    /* ----------------------------------------------------------- stops */

    const stopsEl = $('stops');
    let openIndex = null;

    if (!has(W.stops)) {
      drop('sec-stops');
    } else {
      W.stops.forEach((s, i) => {
        const li = document.createElement('li');
        li.innerHTML =
          '<button type="button" class="stop" aria-expanded="false" aria-controls="detail-' + i + '">' +
            '<span class="pin' + (s.kind ? ' ' + s.kind : '') + '">' + s.n + '</span>' +
            '<span><span class="nm"></span><span class="leg"></span></span>' +
            '<span class="dist" id="dist-' + i + '"></span>' +
          '</button>' +
          '<div class="detail" id="detail-' + i + '" hidden>' +
            '<span class="txt"></span>' +
            '<span class="alt"></span>' +
            '<button type="button" class="btn btn-ghost">Show on map</button>' +
          '</div>';
        li.querySelector('.nm').textContent = s.name;
        li.querySelector('.leg').textContent = s.leg || '';
        li.querySelector('.detail .txt').textContent = s.note || '';
        li.querySelector('.detail .alt').textContent = s.alt ? s.alt + ' m above sea level' : '';

        li.querySelector('.stop').addEventListener('click', () => toggle(i));
        const showBtn = li.querySelector('.detail .btn');
        if (map && mapped(s)) {
          showBtn.addEventListener('click', () => {
            map.setView([s.lat, s.lon], 16, { animate: true });
            stopMarkers[i].openPopup();
            $('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
        } else {
          showBtn.remove();
        }
        stopsEl.appendChild(li);
      });
    }

    function toggle(i) {
      const items = stopsEl.children;
      if (openIndex !== null && openIndex !== i) setOpen(items[openIndex], false);
      setOpen(items[i], openIndex !== i);
      openIndex = (openIndex === i) ? null : i;
    }
    function setOpen(li, on) {
      li.classList.toggle('open', on);
      li.querySelector('.detail').hidden = !on;
      li.querySelector('.stop').setAttribute('aria-expanded', String(on));
    }

    /* --------------------------------------------------------- profile */

    // A height profile only makes sense for stops that are actually on the
    // track and in walking order. Landmarks placed off to one side — a peak
    // above the route, say — would otherwise be projected onto whatever
    // vertex happens to be nearest and throw the distance axis out.
    const profilePts = (hasLine && has(W.stops)) ? W.stops.map((s) => {
      if (!mapped(s) || !(s.alt > 0)) return null;
      const vi = NP.nearestVertex(W.line, s.lat, s.lon);
      const off = NP.metres(s.lat, s.lon, W.line[vi][0], W.line[vi][1]);
      return off > 150 ? null : { s: s, vi: vi };
    }).filter(Boolean).sort((a, b) => a.vi - b.vi) : [];

    // Two spot heights joined by a straight line is not a profile.
    if (profilePts.length < 3) drop('sec-profile'); else buildProfile(W, profilePts);

    /* ---------------------------------------------------- my location */

    const band = $('whereami'), waBig = $('waBig'), waSm = $('waSm');
    const locateBtn = $('locateBtn');

    if (!has(W.stops)) {
      waSm.textContent = 'Turn on your location to see where you are. ' +
        'This walk has no stops mapped yet, so there are no distances to give.';
    }
    let youDot = null, youRing = null, watchId = null, firstFix = true;

    function showYou(lat, lon, accuracy) {
      band.classList.remove('bad');
      band.classList.add('on');

      if (map && !youDot) {
        youRing = L.circle([lat, lon], {
          radius: accuracy, color: '#1668C4', weight: 1,
          fillColor: '#1668C4', fillOpacity: 0.12
        }).addTo(map);
        youDot = L.circleMarker([lat, lon], {
          radius: 8, color: '#ffffff', weight: 3,
          fillColor: '#1668C4', fillOpacity: 1
        }).addTo(map).bindPopup('You are here');
      } else if (map) {
        youDot.setLatLng([lat, lon]);
        youRing.setLatLng([lat, lon]).setRadius(accuracy);
      }

      if (!has(W.stops)) {
        waBig.textContent = map ? 'You are on the map' : 'Location found';
        waSm.textContent = 'Accurate to about ' + Math.round(accuracy) +
          ' m. This walk has no stops mapped yet, so there are no distances to give.';
        if (map && firstFix) { firstFix = false; map.setView([lat, lon], 15); }
        return;
      }

      let nearest = -1, nd = Infinity;
      W.stops.forEach((s, i) => {
        if (!mapped(s)) return;
        const d = NP.metres(lat, lon, s.lat, s.lon);
        $('dist-' + i).textContent = NP.fmtDist(d) + ' away';
        if (d < nd) { nd = d; nearest = i; }
      });
      if (nearest < 0) {
        waBig.textContent = map ? 'You are on the map' : 'Location found';
        waSm.textContent = 'Accurate to about ' + Math.round(accuracy) +
          ' m. None of the stops on this walk have coordinates yet, so there are no distances to give.';
        return;
      }

      const s = W.stops[nearest];
      if (nd < 150) {
        waBig.textContent = 'You are at ' + s.name;
        waSm.textContent = nearest < W.stops.length - 1
          ? 'Next: ' + W.stops[nearest + 1].name + ', ' + (W.stops[nearest + 1].leg || '').toLowerCase() + '.'
          : 'The end of the walk.';
      } else if (nd < 30000) {
        waBig.textContent = NP.fmtDist(nd) + ' from ' + s.name;
        waSm.textContent = 'Head ' + NP.bearingWord(lat, lon, s.lat, s.lon) +
          '. Straight line, so the walk is longer. Fix accurate to about ' + Math.round(accuracy) + ' m.';
      } else {
        waBig.textContent = NP.fmtDist(nd) + ' from the walk';
        waSm.textContent = 'You are a long way off. Distances will sharpen up when you get there.';
      }

      if (firstFix) {
        firstFix = false;
        if (map && nd < 30000) {
          map.fitBounds(L.latLngBounds([[lat, lon], [s.lat, s.lon]]).pad(0.35));
        }
      }
    }

    function locateFailed(message) {
      band.classList.remove('on');
      band.classList.add('bad');
      waBig.textContent = 'No location';
      waSm.textContent = message;
      $('paste').hidden = false;
    }

    locateBtn.addEventListener('click', () => {
      if (map && youDot) {
        map.setView(youDot.getLatLng(), Math.max(map.getZoom(), 15));
        return;
      }
      band.classList.remove('bad');
      waBig.textContent = 'Finding you';
      waSm.textContent = 'Hold still for a moment.';
      locateBtn.textContent = 'Recentre on me';
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      watchId = NP.watchLocation(showYou, locateFailed);
    });

    /* ------------------------------------------- pasted coordinates */

    const coords = $('coords'), pasteHelp = $('pasteHelp');
    const helpText = pasteHelp.textContent;

    function applyPaste() {
      const c = NP.parseCoords(coords.value);
      if (!c) {
        pasteHelp.classList.add('bad');
        pasteHelp.textContent = 'That did not read as coordinates. Expected something like 46.6068, 11.7268.';
        return;
      }
      pasteHelp.classList.remove('bad');
      pasteHelp.textContent = helpText;
      firstFix = true;
      showYou(c.lat, c.lon, 25);
    }

    $('setBtn').addEventListener('click', applyPaste);
    coords.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyPaste(); });
    coords.addEventListener('input', () => {
      if (pasteHelp.classList.contains('bad')) {
        pasteHelp.classList.remove('bad');
        pasteHelp.textContent = helpText;
      }
    });
  }

  /* ------------------------------------------------------------ profile */

  function buildProfile(W, stopsOn) {
    const svg = $('profile');
    const Wd = 640, Ht = 210;
    const L_ = 48, R_ = 14, T_ = 16, B_ = 34;
    const cum = NP.cumulative(W.line);
    const drawnKm = cum[cum.length - 1] / 1000;

    // The drawn line cuts corners the real path does not, so it measures
    // short. Stretch it onto the real walking distance, which keeps the
    // spacing between stops roughly right and the axis honest against the
    // distance quoted at the top of the page.
    const totalKm = W.distanceKm || drawnKm;
    const scale = totalKm / drawnKm;
    const at = stopsOn.map((p) => (cum[p.vi] / 1000) * scale);
    const alts = stopsOn.map((p) => p.s.alt);
    const lo = Math.floor((Math.min.apply(null, alts) - 80) / 100) * 100;
    const hi = Math.ceil((Math.max.apply(null, alts) + 80) / 100) * 100;

    const x = (km) => L_ + (km / totalKm) * (Wd - L_ - R_);
    const y = (m) => T_ + (1 - (m - lo) / (hi - lo)) * (Ht - T_ - B_);

    let g = '';
    const step = (hi - lo) > 600 ? 200 : 100;
    for (let m = lo; m <= hi; m += step) {
      g += '<line x1="' + L_ + '" y1="' + y(m).toFixed(1) + '" x2="' + (Wd - R_) +
           '" y2="' + y(m).toFixed(1) + '" stroke="#E2E0D6" stroke-width="1"/>' +
           '<text x="' + (L_ - 9) + '" y="' + (y(m) + 4).toFixed(1) +
           '" text-anchor="end" font-size="11" fill="#59635C">' + m + '</text>';
    }

    const pts = at.map((km, i) => x(km).toFixed(1) + ',' + y(alts[i]).toFixed(1));

    g += '<polygon points="' + x(at[0]).toFixed(1) + ',' + y(lo).toFixed(1) + ' ' +
         pts.join(' ') + ' ' + x(at[at.length - 1]).toFixed(1) + ',' + y(lo).toFixed(1) +
         '" fill="#DCEADF"/>';
    g += '<polyline points="' + pts.join(' ') +
         '" fill="none" stroke="#1F7A4C" stroke-width="2.5" stroke-linejoin="round"/>';

    at.forEach((km, i) => {
      const cx = x(km), cy = y(alts[i]);
      g += '<line x1="' + cx.toFixed(1) + '" y1="' + cy.toFixed(1) + '" x2="' + cx.toFixed(1) +
           '" y2="' + y(lo).toFixed(1) + '" stroke="#1F7A4C" stroke-width="1" stroke-dasharray="3 3" opacity=".45"/>' +
           '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) +
           '" r="9" fill="' + (stopsOn[i].s.kind === 'lift' ? '#4A453D'
                              : stopsOn[i].s.kind === 'hut' ? '#A63A25' : '#14563A') +
           '" stroke="#fff" stroke-width="2"/>' +
           '<text x="' + cx.toFixed(1) + '" y="' + (cy + 3.5).toFixed(1) +
           '" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">' + stopsOn[i].s.n + '</text>' +
           '<text x="' + cx.toFixed(1) + '" y="' + (Ht - 12) +
           '" text-anchor="middle" font-size="11" fill="#59635C">' + km.toFixed(1) + '</text>';
    });

    g += '<line x1="' + L_ + '" y1="' + y(lo).toFixed(1) + '" x2="' + (Wd - R_) +
         '" y2="' + y(lo).toFixed(1) + '" stroke="#9AA69D" stroke-width="1"/>';
    g += '<text x="' + (L_ - 9) + '" y="10' +
         '" text-anchor="end" font-size="11" fill="#59635C">m</text>';
    g += '<text x="' + (Wd - R_) + '" y="' + (T_ + 4) +
         '" text-anchor="end" font-size="11" fill="#59635C">km walked</text>';

    svg.innerHTML = g;
  }

  /* -------------------------------------------------- lift countdown */

  function liftCountdown(W) {
    const el = $('liftCount');
    const last = W.lastLift || W.lastGondola;
    if (!last || !el) return;

    const now = NP.clockAt(SITE.timeZone || 'Europe/Rome');
    if (!now) return;

    const mins = now.h * 60 + now.m;
    const lastMins = last[0] * 60 + last[1];
    const clock = NP.pad2(now.h) + ':' + NP.pad2(now.m);
    const lastClock = NP.pad2(last[0]) + ':' + NP.pad2(last[1]);
    const left = lastMins - mins;

    el.textContent = left > 0
      ? 'It is ' + clock + ' in the valley, about ' + Math.floor(left / 60) + ' h ' +
        (left % 60) + ' min before a ' + lastClock + ' last descent.'
      : 'It is ' + clock + ' in the valley. A ' + lastClock + ' lift has already gone for the day.';
  }

})();
