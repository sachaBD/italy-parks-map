/* ------------------------------------------------------------------
   Seceda Ridge Walk — page behaviour
   Everything is driven from assets/data.js. No build step, no
   dependencies beyond Leaflet.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  const W = window.WALK;
  const $ = (id) => document.getElementById(id);

  /* ---------------------------------------------------------- geometry */

  // Great-circle distance in metres (haversine). Accurate both between
  // two huts and between the walk and a reader on the other side of the
  // world, which a flat-earth approximation is not.
  function metres(aLat, aLon, bLat, bLon) {
    const R = 6371008.8, r = Math.PI / 180;
    const dLat = (bLat - aLat) * r, dLon = (bLon - aLon) * r;
    const h = Math.sin(dLat / 2) ** 2 +
              Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function bearingWord(aLat, aLon, bLat, bLon) {
    const r = Math.PI / 180;
    const y = (bLon - aLon) * Math.cos((aLat + bLat) / 2 * r);
    const x = (bLat - aLat);
    const deg = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    const names = ['north', 'north-east', 'east', 'south-east',
                   'south', 'south-west', 'west', 'north-west'];
    return names[Math.round(deg / 45) % 8];
  }

  function fmtDist(m) {
    if (m < 950) return Math.round(m / 10) * 10 + ' m';
    if (m < 100000) return (m / 1000).toFixed(1) + ' km';
    return Math.round(m / 1000).toLocaleString() + ' km';
  }

  // Cumulative along-line distance at each vertex.
  function cumulative(line) {
    const out = [0];
    for (let i = 1; i < line.length; i++) {
      out.push(out[i - 1] + metres(line[i - 1][0], line[i - 1][1], line[i][0], line[i][1]));
    }
    return out;
  }

  function nearestVertex(line, lat, lon) {
    let best = 0, bd = Infinity;
    line.forEach((p, i) => {
      const d = metres(lat, lon, p[0], p[1]);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  /* ------------------------------------------------------------- text */

  $('region').textContent = W.region;
  $('walkName').textContent = W.name;
  $('lede').textContent = W.lede;
  document.title = W.name + ' — ' + W.parkAlt;

  W.chips.forEach((c) => {
    const li = document.createElement('li');
    li.textContent = c;
    $('chips').appendChild(li);
  });

  $('gradeNum').textContent = W.grade.number;
  $('gradeTitle').textContent = W.grade.title;
  $('gradeDetail').textContent = W.grade.detail;

  function fillFacts(el, rows) {
    rows.forEach(([term, def]) => {
      const wrapper = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = term;
      dd.textContent = def;
      wrapper.append(dt, dd);
      el.appendChild(wrapper);
    });
  }
  fillFacts($('glance'), W.glance);
  fillFacts($('getting'), W.gettingThere);

  W.prepare.forEach((t) => {
    const li = document.createElement('li');
    li.textContent = t;
    $('prepare').appendChild(li);
  });

  $('shorter').textContent = W.shorterOption;

  if (W.alert) {
    $('alertTitle').textContent = W.alert.title;
    $('alertText').textContent = W.alert.text;
    $('alert').hidden = false;
  }

  const start = W.stops[0];
  const startLink = $('startLink');
  startLink.href = 'https://www.google.com/maps/search/?api=1&query=' + start.lat + ',' + start.lon;
  startLink.textContent = 'Open the start in Google Maps';

  /* -------------------------------------------------------- facilities */

  const ICONS = {
    food:    '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17.5 3c-1.6 1.6-2.2 3.2-2.2 5.2s.7 3.1 2.2 3.1V21"/>',
    beds:    '<path d="M3 8v11M3 12h18v7M3 19h18"/><path d="M7 12V9.5h5V12"/>',
    water:   '<path d="M12 3.2s6 6.6 6 10.4a6 6 0 0 1-12 0C6 9.8 12 3.2 12 3.2z"/>',
    toilets: '<circle cx="7.5" cy="5" r="2"/><path d="M7.5 8.2c-1.8 0-2.8 1.3-2.8 2.9v3.6h1.5V21h2.6v-6.3h1.5v-3.6c0-1.6-1-2.9-2.8-2.9z"/><circle cx="16.8" cy="5" r="2"/><path d="M16.8 8.2l-2.9 6.5h1.7V21h2.4v-6.3h1.7l-2.9-6.5z"/>',
    lookout: '<circle cx="6" cy="5.5" r="2.2"/><path d="M2 19.5h20"/><path d="M3.5 19.5l5.5-8 2.7 4"/><path d="M10.5 19.5l5-7.5 6.5 7.5"/>',
    lift:    '<path d="M2.5 6.5l19-3"/><path d="M12 5V9"/><rect x="7" y="9" width="10" height="7" rx="1.6"/><path d="M7 12.5h10"/>'
  };

  W.facilities.forEach(([key, title, detail]) => {
    const li = document.createElement('li');
    li.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[key] || '') + '</svg>' +
      '<span><b></b><span></span></span>';
    li.querySelector('b').textContent = title;
    li.querySelector('span span').textContent = detail;
    $('facs').appendChild(li);
  });

  /* -------------------------------------------------------------- map */

  // Leaflet comes from a CDN. If it does not arrive, the rest of the guide
  // must still work, so everything that touches the map is optional.
  const hasMap = (typeof L !== 'undefined');
  let map = null, track = null, stopMarkers = [];

  if (!hasMap) {
    const slot = $('map');
    slot.style.display = 'none';
    const msg = $('mapless');
    msg.hidden = false;
    msg.textContent = 'The map could not be loaded — it needs a connection the first time. ' +
      'The track notes, distances and your location all still work below.';
    document.querySelector('.basemaps').hidden = true;
  }

  const bases = hasMap ? {
    topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: '© <a href="https://www.opentopomap.org">OpenTopoMap</a> (CC-BY-SA), © OpenStreetMap contributors'
    }),
    aerial: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Imagery © Esri, Maxar, Earthstar Geographics'
    }),
    street: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    })
  } : {};

  if (hasMap) buildMap();

  function buildMap() {
  map = L.map('map', {
    center: W.centre,
    zoom: W.zoom,
    scrollWheelZoom: false,   // so the page still scrolls over the map
    layers: [bases.topo]
  });
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

  // Wheel zoom becomes available once the reader has engaged with the map.
  map.once('click', () => map.scrollWheelZoom.enable());
  map.once('focus', () => map.scrollWheelZoom.enable());

  let currentBase = 'topo';
  document.querySelectorAll('.basemaps button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const want = btn.dataset.base;
      if (want === currentBase) return;
      map.removeLayer(bases[currentBase]);
      map.addLayer(bases[want]);
      currentBase = want;
      document.querySelectorAll('.basemaps button').forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      track.bringToFront();
    });
  });

  // A white casing under a dashed line, the way a park map draws a track.
  L.polyline(W.line, { color: '#ffffff', weight: 8, opacity: 0.95, lineJoin: 'round' }).addTo(map);
  track = L.polyline(W.line, {
    color: '#D2542A', weight: 4, opacity: 1, dashArray: '9 7', lineCap: 'round'
  }).addTo(map);

  stopMarkers = W.stops.map((s) => {
    const icon = L.divIcon({
      className: '',
      html: '<span class="pin' + (s.kind === 'lift' ? ' lift' : '') + '">' + s.n + '</span>',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14]
    });
    return L.marker([s.lat, s.lon], { icon, title: s.name, alt: 'Stop ' + s.n + ', ' + s.name })
      .addTo(map)
      .bindPopup('<b>' + s.n + '. ' + s.name + '</b><span>' + s.alt + ' m · ' + s.leg + '</span>');
  });

  map.fitBounds(track.getBounds(), { padding: [34, 34] });
  }

  /* ------------------------------------------------------------- stops */

  const stopsEl = $('stops');
  let openIndex = null;

  W.stops.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML =
      '<button type="button" class="stop" aria-expanded="false" aria-controls="detail-' + i + '">' +
        '<span class="pin' + (s.kind === 'lift' ? ' lift' : '') + '">' + s.n + '</span>' +
        '<span><span class="nm"></span><span class="leg"></span></span>' +
        '<span class="dist" id="dist-' + i + '"></span>' +
      '</button>' +
      '<div class="detail" id="detail-' + i + '" hidden>' +
        '<span class="txt"></span>' +
        '<span class="alt"></span>' +
        '<button type="button" class="btn btn-ghost">Show on map</button>' +
      '</div>';
    li.querySelector('.nm').textContent = s.name;
    li.querySelector('.leg').textContent = s.leg;
    li.querySelector('.detail .txt').textContent = s.note;
    li.querySelector('.detail .alt').textContent = s.alt + ' m above sea level';

    li.querySelector('.stop').addEventListener('click', () => toggle(i));
    const showBtn = li.querySelector('.detail .btn');
    if (hasMap) {
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

  /* ---------------------------------------------------------- profile */

  (function buildProfile() {
    const svg = $('profile');
    const Wd = 640, Ht = 210;
    const L_ = 48, R_ = 14, T_ = 16, B_ = 34;
    const cum = cumulative(W.line);
    const drawnKm = cum[cum.length - 1] / 1000;

    // The drawn line cuts corners the real path does not, so it measures
    // short. Stretch it onto the real walking distance, which keeps the
    // spacing between stops roughly right and the axis honest against the
    // distance quoted at the top of the page.
    const totalKm = W.distanceKm || drawnKm;
    const scale = totalKm / drawnKm;
    const at = W.stops.map((s) => (cum[nearestVertex(W.line, s.lat, s.lon)] / 1000) * scale);
    const alts = W.stops.map((s) => s.alt);
    const lo = Math.floor((Math.min.apply(null, alts) - 80) / 100) * 100;
    const hi = Math.ceil((Math.max.apply(null, alts) + 80) / 100) * 100;

    const x = (km) => L_ + (km / totalKm) * (Wd - L_ - R_);
    const y = (m) => T_ + (1 - (m - lo) / (hi - lo)) * (Ht - T_ - B_);

    let g = '';

    // Horizontal grid and height labels.
    const step = (hi - lo) > 600 ? 200 : 100;
    for (let m = lo; m <= hi; m += step) {
      g += '<line x1="' + L_ + '" y1="' + y(m).toFixed(1) + '" x2="' + (Wd - R_) +
           '" y2="' + y(m).toFixed(1) + '" stroke="#E2E0D6" stroke-width="1"/>' +
           '<text x="' + (L_ - 9) + '" y="' + (y(m) + 4).toFixed(1) +
           '" text-anchor="end" font-size="11" fill="#59635C">' + m + '</text>';
    }

    const pts = at.map((km, i) => x(km).toFixed(1) + ',' + y(alts[i]).toFixed(1));

    // Shaded ground under the profile line.
    g += '<polygon points="' + x(0).toFixed(1) + ',' + y(lo).toFixed(1) + ' ' +
         pts.join(' ') + ' ' + x(totalKm).toFixed(1) + ',' + y(lo).toFixed(1) +
         '" fill="#DCEADF"/>';
    g += '<polyline points="' + pts.join(' ') +
         '" fill="none" stroke="#1F7A4C" stroke-width="2.5" stroke-linejoin="round"/>';

    // Stop markers and distance labels.
    at.forEach((km, i) => {
      const cx = x(km), cy = y(alts[i]);
      g += '<line x1="' + cx.toFixed(1) + '" y1="' + cy.toFixed(1) + '" x2="' + cx.toFixed(1) +
           '" y2="' + y(lo).toFixed(1) + '" stroke="#1F7A4C" stroke-width="1" stroke-dasharray="3 3" opacity=".45"/>' +
           '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) +
           '" r="9" fill="' + (W.stops[i].kind === 'lift' ? '#4A453D' : '#14563A') +
           '" stroke="#fff" stroke-width="2"/>' +
           '<text x="' + cx.toFixed(1) + '" y="' + (cy + 3.5).toFixed(1) +
           '" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">' + W.stops[i].n + '</text>' +
           '<text x="' + cx.toFixed(1) + '" y="' + (Ht - 12) +
           '" text-anchor="middle" font-size="11" fill="#59635C">' + km.toFixed(1) + '</text>';
    });

    g += '<line x1="' + L_ + '" y1="' + y(lo).toFixed(1) + '" x2="' + (Wd - R_) +
         '" y2="' + y(lo).toFixed(1) + '" stroke="#9AA69D" stroke-width="1"/>';
    g += '<text x="' + (L_ - 9) + '" y="' + (T_ + 4) +
         '" text-anchor="end" font-size="11" fill="#59635C">m</text>';
    g += '<text x="' + (Wd - R_) + '" y="' + (T_ + 4) +
         '" text-anchor="end" font-size="11" fill="#59635C">km walked</text>';

    svg.innerHTML = g;
  })();

  /* ------------------------------------------------------ my location */

  const band = $('whereami'), waBig = $('waBig'), waSm = $('waSm');
  const locateBtn = $('locateBtn');
  let youDot = null, youRing = null, watchId = null, firstFix = true;

  function showYou(lat, lon, accuracy) {
    band.classList.remove('bad');
    band.classList.add('on');

    if (hasMap && !youDot) {
      youRing = L.circle([lat, lon], {
        radius: accuracy, color: '#1668C4', weight: 1,
        fillColor: '#1668C4', fillOpacity: 0.12
      }).addTo(map);
      youDot = L.circleMarker([lat, lon], {
        radius: 8, color: '#ffffff', weight: 3,
        fillColor: '#1668C4', fillOpacity: 1
      }).addTo(map).bindPopup('You are here');
    } else if (hasMap) {
      youDot.setLatLng([lat, lon]);
      youRing.setLatLng([lat, lon]).setRadius(accuracy);
    }

    // Distances to every stop, and the nearest one.
    let nearest = 0, nd = Infinity;
    W.stops.forEach((s, i) => {
      const d = metres(lat, lon, s.lat, s.lon);
      $('dist-' + i).textContent = fmtDist(d);
      if (d < nd) { nd = d; nearest = i; }
    });

    const s = W.stops[nearest];
    if (nd < 150) {
      waBig.textContent = 'You are at ' + s.name;
      waSm.textContent = nearest < W.stops.length - 1
        ? 'Next: ' + W.stops[nearest + 1].name + ', ' + W.stops[nearest + 1].leg.toLowerCase() + '.'
        : 'The end of the walk. The gondola down leaves from here.';
    } else if (nd < 30000) {
      waBig.textContent = fmtDist(nd) + ' from ' + s.name;
      waSm.textContent = 'Head ' + bearingWord(lat, lon, s.lat, s.lon) +
        '. Straight line, so the walk is longer. Fix accurate to about ' + Math.round(accuracy) + ' m.';
    } else {
      waBig.textContent = fmtDist(nd) + ' from the walk';
      waSm.textContent = 'You are a long way from Val Gardena. Distances will sharpen up when you get there.';
    }

    if (firstFix) {
      firstFix = false;
      if (hasMap && nd < 30000) {
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

  function startLocating() {
    if (!window.isSecureContext) {
      locateFailed(location.protocol === 'file:'
        ? 'Browsers only offer the location prompt on https pages, and this one is open as a file. Publish it, or paste your coordinates below.'
        : 'This page is not on a secure https address, so the browser will not offer the location prompt. Paste your coordinates below instead.');
      return;
    }
    if (!navigator.geolocation) {
      locateFailed('This browser has no location service. Paste your coordinates below instead.');
      return;
    }

    band.classList.remove('bad');
    waBig.textContent = 'Finding you';
    waSm.textContent = 'Hold still for a moment.';
    locateBtn.textContent = 'Recentre on me';

    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(
      (p) => showYou(p.coords.latitude, p.coords.longitude, p.coords.accuracy || 30),
      (err) => locateFailed(err.code === 1
        ? 'Location is blocked for this page. Open the padlock in the address bar, set Location to Allow, then reload.'
        : 'No fix yet. Satellites can be slow against a rock face — try again, or paste your coordinates below.'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
  }

  locateBtn.addEventListener('click', () => {
    if (hasMap && youDot) {
      map.setView(youDot.getLatLng(), Math.max(map.getZoom(), 15));
      return;
    }
    startLocating();
  });

  /* --------------------------------------------- pasted coordinates */

  const coords = $('coords'), pasteHelp = $('pasteHelp');
  const helpText = pasteHelp.textContent;

  function parseCoords(raw) {
    const s = (raw || '').trim();
    if (!s) return null;
    let m = s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);              // maps link: ...@lat,lon
    if (!m) m = s.match(/[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/);  // maps link: ...?q=lat,lon
    if (!m) m = s.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
    if (!m) return null;
    const lat = parseFloat(m[1]), lon = parseFloat(m[2]);
    if (!isFinite(lat) || !isFinite(lon)) return null;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return { lat, lon };
  }

  function applyPaste() {
    const c = parseCoords(coords.value);
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

  /* ------------------------------------------------- gondola countdown */

  (function gondolaCountdown() {
    const el = $('gondolaCount');
    if (!W.lastGondola || !el) return;

    let hh, mm;
    try {
      // The reader may be anywhere; the gondola is on Italian time.
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      hh = +parts.find((p) => p.type === 'hour').value;
      mm = +parts.find((p) => p.type === 'minute').value;
    } catch (e) {
      return; // No time-zone data, so say nothing rather than something wrong.
    }

    const now = hh * 60 + mm;
    const last = W.lastGondola[0] * 60 + W.lastGondola[1];
    const clock = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    const lastClock = String(W.lastGondola[0]).padStart(2, '0') + ':' +
                      String(W.lastGondola[1]).padStart(2, '0');
    const left = last - now;

    el.textContent = left > 0
      ? 'It is ' + clock + ' in Val Gardena, about ' + Math.floor(left / 60) + ' h ' +
        (left % 60) + ' min before a ' + lastClock + ' last descent.'
      : 'It is ' + clock + ' in Val Gardena. A ' + lastClock +
        ' gondola has already gone for the day.';
  })();

})();
