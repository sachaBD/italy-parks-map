/* ------------------------------------------------------------------
   The landing page: an overview map of every mapped walk, and a card
   for each one.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  $('siteTitle').textContent = SITE.title;
  $('siteOwner').textContent = SITE.owner;
  $('siteRegion').textContent = SITE.region;
  $('siteIntro').textContent = SITE.intro;
  document.title = SITE.title + ' — walk guides';

  NP.loadWalks(window.WALK_IDS || []).then(render).catch(() => {
    $('cards').innerHTML = '<li class="card pad">The walk list could not be loaded.</li>';
  });

  function render(walks) {
    if (!walks.length) {
      $('cards').innerHTML = '<li class="card pad">No walks yet.</li>';
      return;
    }

    /* ------------------------------------------------------------ cards */

    walks.forEach((w) => {
      const draft = NP.isDraft(w);
      const li = document.createElement('li');
      li.className = 'walkcard' + (draft ? ' is-draft' : '');
      li.innerHTML =
        '<a href="walk.html?walk=' + encodeURIComponent(w.id) + '">' +
          '<span class="wc-swatch" aria-hidden="true"></span>' +
          '<span class="wc-body">' +
            '<span class="wc-region"></span>' +
            '<span class="wc-name"></span>' +
            '<span class="wc-card"></span>' +
            '<span class="wc-chips"></span>' +
          '</span>' +
        '</a>';
      li.querySelector('.wc-swatch').style.background = w.colour || '#D2542A';
      li.querySelector('.wc-region').textContent = w.region || '';
      li.querySelector('.wc-name').textContent = w.name || w.id;
      li.querySelector('.wc-card').textContent = w.card || '';

      const chips = li.querySelector('.wc-chips');
      if (draft) {
        const b = document.createElement('b');
        b.className = 'wc-flag';
        // A walk still being put together, versus one that is finished but
        // deliberately has no track line to follow.
        b.textContent = (w.status === 'draft') ? 'Route being mapped' : 'No track line';
        chips.appendChild(b);
      }
      (w.chips || []).slice(0, 3).forEach((c) => {
        const s = document.createElement('span');
        s.textContent = c;
        chips.appendChild(s);
      });
      $('cards').appendChild(li);
    });

    /* -------------------------------------------------------- overview */

    const mapped = walks.filter((w) => w.line && w.line.length);
    if (!NP.hasLeaflet() || !mapped.length) {
      $('overview').style.display = 'none';
      $('basemaps').hidden = true;
      const msg = $('overviewNote');
      msg.hidden = false;
      msg.textContent = !NP.hasLeaflet()
        ? 'The map could not be loaded — it needs a connection the first time.'
        : 'No walks have a mapped track yet. They will appear here as they are added.';
      return;
    }

    const map = NP.makeMap('overview', SITE.centre || mapped[0].line[0], 12, $('basemaps'));
    const all = [];

    mapped.forEach((w) => {
      const track = NP.drawTrack(map, w.line, w.colour);
      track.bindPopup('<b>' + w.name + '</b><span>' +
        (w.chips || []).slice(0, 2).join(' · ') + '</span>');
      track.on('click', () => { location.href = 'walk.html?walk=' + encodeURIComponent(w.id); });
      all.push(track.getBounds());

      const start = w.line[0];
      L.marker(start, {
        icon: L.divIcon({
          className: '',
          html: '<span class="pin start" style="background:' + (w.colour || '#D2542A') + '">▲</span>',
          iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14]
        }),
        title: w.name
      }).addTo(map).bindPopup('<b>' + w.name + '</b><span>Start of the walk</span>');
    });

    map.fitBounds(all.reduce((acc, b) => acc.extend(b), L.latLngBounds(all[0])), { padding: [30, 30] });
  }
})();
