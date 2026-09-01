/* ------------------------------------------------------------------
   Shared helpers for every page: geometry, base maps, walk loading
   and the browser location watcher.
   ------------------------------------------------------------------ */
window.NP = (function () {
  'use strict';

  /* ---------------------------------------------------------- geometry */

  // Great-circle distance in metres (haversine). Accurate both between
  // two huts and between a walk and a reader on the other side of the
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

  /* ------------------------------------------------------- walk loading */

  // Ids come from the URL, so they are checked against the register
  // before being turned into a script path.
  function knownId(id) {
    return typeof id === 'string' &&
           /^[a-z0-9-]+$/.test(id) &&
           (window.WALK_IDS || []).indexOf(id) !== -1;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load ' + src));
      document.head.appendChild(s);
    });
  }

  // Resolves with the walk objects, in the order asked for.
  function loadWalks(ids) {
    const wanted = ids.filter(knownId);
    return Promise.all(wanted.map((id) => loadScript('data/' + id + '.js')))
      .then(() => wanted.map((id) => (window.WALKS || {})[id]).filter(Boolean));
  }

  function isDraft(walk) {
    return walk.status === 'draft' || !walk.line || !walk.line.length;
  }

  /* ------------------------------------------------------------- maps */

  function hasLeaflet() { return typeof L !== 'undefined'; }

  function basemaps() {
    return {
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
    };
  }

  // Map with the base-layer switcher wired to the buttons in `group`.
  function makeMap(elId, centre, zoom, group) {
    const bases = basemaps();
    const map = L.map(elId, {
      center: centre,
      zoom: zoom,
      scrollWheelZoom: false,   // so the page still scrolls over the map
      layers: [bases.topo]
    });
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    // Wheel zoom becomes available once the reader has engaged with the map.
    map.once('click', () => map.scrollWheelZoom.enable());
    map.once('focus', () => map.scrollWheelZoom.enable());

    if (group) {
      let current = 'topo';
      const buttons = group.querySelectorAll('button');
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const want = btn.dataset.base;
          if (want === current || !bases[want]) return;
          map.removeLayer(bases[current]);
          map.addLayer(bases[want]);
          current = want;
          buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
          map.eachLayer((l) => { if (l instanceof L.Polyline) l.bringToFront(); });
        });
      });
    }
    return map;
  }

  // A white casing under a dashed line, the way a park map draws a track.
  function drawTrack(map, line, colour) {
    L.polyline(line, { color: '#ffffff', weight: 8, opacity: 0.95, lineJoin: 'round' }).addTo(map);
    return L.polyline(line, {
      color: colour || '#D2542A', weight: 4, opacity: 1,
      dashArray: '9 7', lineCap: 'round'
    }).addTo(map);
  }

  function stopIcon(stop) {
    return L.divIcon({
      className: '',
      html: '<span class="pin' + (stop.kind ? ' ' + stop.kind : '') + '">' + stop.n + '</span>',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14]
    });
  }

  /* --------------------------------------------------------- location */

  function insecureReason() {
    if (window.isSecureContext) return null;
    return location.protocol === 'file:'
      ? 'Browsers only offer the location prompt on https pages, and this one is open as a file. Publish it, or paste your coordinates below.'
      : 'This page is not on a secure https address, so the browser will not offer the location prompt. Paste your coordinates below instead.';
  }

  // Calls onFix(lat, lon, accuracy) repeatedly, or onFail(message) once.
  function watchLocation(onFix, onFail) {
    const why = insecureReason();
    if (why) { onFail(why); return null; }
    if (!navigator.geolocation) {
      onFail('This browser has no location service. Paste your coordinates below instead.');
      return null;
    }
    return navigator.geolocation.watchPosition(
      (p) => onFix(p.coords.latitude, p.coords.longitude, p.coords.accuracy || 30),
      (err) => onFail(err.code === 1
        ? 'Location is blocked for this page. Open the padlock in the address bar, set Location to Allow, then reload.'
        : 'No fix yet. Satellites can be slow against a rock face — try again, or paste your coordinates below.'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
  }

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

  /* ------------------------------------------------------------- misc */

  // Local time where the walk is, rather than where the reader is.
  function clockAt(timeZone) {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: timeZone, hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      return {
        h: +parts.find((p) => p.type === 'hour').value,
        m: +parts.find((p) => p.type === 'minute').value
      };
    } catch (e) {
      return null;   // No time-zone data, so say nothing rather than something wrong.
    }
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  return {
    metres, bearingWord, fmtDist, cumulative, nearestVertex,
    knownId, loadWalks, isDraft,
    hasLeaflet, basemaps, makeMap, drawTrack, stopIcon,
    watchLocation, parseCoords, clockAt, pad2
  };
})();
