/* =====================================================================
   Code for Your Community: scroll-driven story engine (draft)

   How it works
   - The page scrolls normally. Each <section class="scene"> in index.html
     is one step of the story. The scene in the middle of the screen, and
     how far through it you are (0 to 1), decides what the fixed stage shows.
   - Map: an orthographic (globe) projection drawn on a canvas with D3. The
     same projection is used all the way from the globe down to campus, so
     "zooming in" is just a bigger scale plus a different center.
   - Markers and pop-ups sit in an SVG layer above the canvas.
   - Logo triangle: two SVG layers (faint parts behind the text, the active
     logo in front of it).
   - Readers can drag, pinch or Ctrl/Cmd+scroll the map. Their changes
     ease back toward the story view as they keep scrolling.
   ===================================================================== */
(function () {
  'use strict';

  const SITE = window.SITE, GEO = window.GEO;
  if (!SITE || !GEO || !window.d3 || !window.topojson) {
    console.error('Missing libraries or data files. Check that the vendor/ and js/ files are next to index.html.');
    return;
  }

  /* ---------------- helpers ---------------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const smooth = (t, a, b) => ease(seg(t, a, b));
  const logLerp = (a, b, t) => Math.exp(lerp(Math.log(a), Math.log(b), t));
  const wrap180 = d => ((((d + 180) % 360) + 360) % 360) - 180;
  const DEG = 180 / Math.PI, RAD = Math.PI / 180;
  const NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DEV = /[?&]dev\b/.test(location.search);
  const isPh = s => typeof s === 'string' && s.trim().startsWith('[');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LL = at => [at[1], at[0]]; // [lat, lon] -> [lon, lat]
  function svg(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }
  const mixColor = (a, b, t) => d3.interpolateRgb(a, b)(t);
  const clearOf = c => { const k = d3.color(c); if (!k) return 'rgba(0,0,0,0)'; k.opacity = 0; return k + ''; };

  /* ---------------- color themes (defined in js/themes.js) ---------------- */
  const THEMES = window.THEMES && Object.keys(window.THEMES).length ? window.THEMES : {
    // fallback if js/themes.js is missing: the page keeps the CSS defaults
    fallback: { label: 'Default', tone: 'dark', ui: {}, map: {
      space: '#0B1A2B', glow: 'rgba(255,170,90,0.30)', oceanHi: '#164672', ocean: '#0E2F51', oceanLo: '#081F38',
      land: '#1C3E61', landHi: '#265583', graticule: 'rgba(246,240,230,0.07)', coast: 'rgba(246,240,230,0.30)',
      borders: 'rgba(246,240,230,0.16)', states: 'rgba(246,240,230,0.30)', natBorder: 'rgba(246,240,230,0.50)',
      counties: 'rgba(246,240,230,0.10)', urban: 'rgba(255,190,120,0.07)', roadsNE: 'rgba(246,240,230,0.32)',
      hwCase: 'rgba(11,26,43,0.7)', hw: 'rgba(255,240,222,0.72)', hwState: 'rgba(255,240,222,0.42)', river: '#4C93D6',
      gtFill: 'rgba(179,163,105,0.36)', gtStroke: '#EAAA00', emoryFill: 'rgba(246,240,230,0.16)', emoryStroke: 'rgba(246,240,230,0.75)',
      gaTint: 'rgba(248,156,68,0.22)' } },
  };
  const cssVar = k => '--' + k.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
  let theme = null;     // the active theme, with color interpolators from -> to
  let themeT = -1;      // blend position (0 = from, 1 = to) last applied
  let MAP = {};         // map colors right now
  let paletteRev = 0;   // bumps whenever MAP changes, so the map redraws

  function makeTheme(name) {
    const def = THEMES[name];
    if (!def) return null;
    const from = def.blend ? THEMES[def.blend.from] : def;
    const to = def.blend ? THEMES[def.blend.to] : def;
    if (!from || !to || !from.map || !to.map) return null;
    const pairs = (a, b) => Object.keys(a || {}).map(k => {
      const x = a[k], y = b && b[k] != null ? b[k] : x;
      return [k, x === y ? () => x : d3.interpolateLab(x, y)];
    });
    return {
      name, label: def.label || name, from, to, blend: def.blend || null,
      ui: pairs(from.ui, to.ui).map(([k, f]) => [cssVar(k), f]),
      map: pairs(from.map, to.map),
    };
  }
  const uiCache = new Map();
  function applyTheme(t) {
    if (t === themeT) return;
    themeT = t;
    const root = document.documentElement;
    for (const [prop, f] of theme.ui) {
      const v = f(t);
      if (uiCache.get(prop) !== v) { root.style.setProperty(prop, v); uiCache.set(prop, v); }
    }
    const m = {};
    for (const [k, f] of theme.map) m[k] = f(t);
    m.glowClear = clearOf(m.glow);
    MAP = m; paletteRev++;
    const tone = (t < 0.5 ? theme.from : theme.to).tone || 'dark';
    if (root.dataset.tone !== tone) { root.dataset.tone = tone; root.style.colorScheme = tone; }
  }

  /* ---------------- geo data ---------------- */
  function decodeLine(str, k = 1e4) { // Google encoded polyline -> [[lon, lat], ...]
    const pts = []; let i = 0, lat = 0, lon = 0;
    while (i < str.length) {
      for (let which = 0; which < 2; which++) {
        let b, shift = 0, result = 0;
        do { b = str.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        const d = (result & 1) ? ~(result >> 1) : (result >> 1);
        if (which === 0) lat += d; else lon += d;
      }
      pts.push([lon / k, lat / k]);
    }
    return pts;
  }
  const W1 = GEO.world, NA = GEO.na, SE = GEO.se;
  const countries = topojson.feature(W1, W1.objects.countries);
  const otherCountries = { type: 'FeatureCollection', features: countries.features.filter(f => f.id !== '840' && f.id !== '124') };
  const worldBorders = topojson.mesh(W1, W1.objects.countries, (a, b) => a !== b);
  const worldCoast = topojson.mesh(W1, W1.objects.countries, (a, b) => a === b);
  const naStates = topojson.feature(NA, NA.objects.states);
  const naInner = topojson.mesh(NA, NA.objects.states, (a, b) => a !== b && a.properties.c === b.properties.c);
  const naBorder = topojson.mesh(NA, NA.objects.states, (a, b) => a !== b && a.properties.c !== b.properties.c);
  const naCoast = topojson.mesh(NA, NA.objects.states, (a, b) => a === b);
  const lakes = topojson.feature(NA, NA.objects.lakes);
  const georgia = naStates.features.find(f => f.properties.p === 'GA');
  const countyMesh = topojson.mesh(SE, SE.objects.counties, (a, b) => a !== b);
  const urban = topojson.feature(SE, SE.objects.urban);
  const seRoads = topojson.feature(SE, SE.objects.roads);
  const river = { type: 'MultiLineString', coordinates: (GEO.atl.river || []).map(l => decodeLine(l)) };
  const highways = Object.entries(GEO.atl.highways).map(([ref, lines]) => ({
    type: 'Feature', properties: { ref }, geometry: { type: 'MultiLineString', coordinates: lines.map(l => decodeLine(l)) },
  }));
  const interstates = { type: 'FeatureCollection', features: highways.filter(f => f.properties.ref.startsWith('I-')) };
  const stateRoutes = { type: 'FeatureCollection', features: highways.filter(f => !f.properties.ref.startsWith('I-')) };
  const campusGT = { type: 'Feature', properties: {}, geometry: GEO.atl.campus.gt };
  const campusEmory = { type: 'Feature', properties: {}, geometry: GEO.atl.campus.emory };
  const graticule = d3.geoGraticule10();

  /* ---------------- content data ---------------- */
  const chapters = SITE.chapters.map(c => Object.assign({}, c, { ll: LL(c.at) }));
  const homeChapter = chapters.find(c => c.home) || chapters[0];
  const nonprofits = SITE.atlanta.nonprofits.map(n => Object.assign({}, n, { ll: LL(n.at) }));
  const BOG = LL(SITE.atlanta.bog.at);
  const ATL_CENTER = [-84.39, 33.75];
  const places = SITE.atlanta.places.map(p => Object.assign({}, p, { ll: LL(p.at) }));
  const ORG_INFO = SITE.orgs || {};
  const ORGS = [
    { id: 'bog', name: 'Bits of Good', short: 'BoG', scene: 'bog' },
    { id: 'ei', name: 'Epic Intentions', short: 'EI', scene: 'ei' },
    { id: 'cyc', name: 'Consult Your Community', short: 'CYC', scene: 'cyc' },
  ].map(o => Object.assign(o, ORG_INFO[o.id] || {}));
  const GT_LOGO = Object.assign({ placement: 'center', color: 'gold' }, SITE.gtLogo || {});

  // interstate shields: [highway ref, label, rough anchor]; each snaps to the nearest vertex of that highway
  const SHIELD_SPECS = [
    ['I-75', '75', [-84.432, 33.842]], ['I-85', '85', [-84.335, 33.833]], ['I-75', '75/85', [-84.3905, 33.797]],
    ['I-20', '20', [-84.30, 33.734]], ['I-20', '20', [-84.465, 33.752]], ['I-285', '285', [-84.33, 33.92]],
    ['I-285', '285', [-84.497, 33.70]], ['I-285', '285', [-84.232, 33.76]], ['GA-400', '400', [-84.362, 33.872]],
    ['I-75', '75', [-84.398, 33.685]], ['I-85', '85', [-84.452, 33.672]],
  ];
  const shields = SHIELD_SPECS.map(([ref, label, anchor]) => {
    const f = highways.find(h => h.properties.ref === ref);
    let best = anchor, bd = Infinity;
    if (f) for (const line of f.geometry.coordinates) for (const p of line) {
      const d = (p[0] - anchor[0]) ** 2 + (p[1] - anchor[1]) ** 2;
      if (d < bd) { bd = d; best = p; }
    }
    return { label, ll: best };
  });

  /* ---------------- canvas + projection ---------------- */
  const stage = $('#stage');
  const canvas = $('#map-canvas');
  const ctx = canvas.getContext('2d');
  const proj = d3.geoOrthographic().clipAngle(90).precision(0.6);
  const path = d3.geoPath(proj, ctx);

  let W = 0, H = 0, DPR = 1, L = null, K = null;

  function layout() {
    W = window.innerWidth; H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, W * H > 1.6e6 ? 1.5 : 2); // cap pixels on big screens to keep it smooth
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    lastDrawKey = '';

    const desktop = W >= 900;
    const pad = desktop ? Math.max(28, Math.round(W * 0.04)) : 12;
    const colW = desktop ? Math.round(clamp(W * 0.31, 340, 440)) : W - 24;
    const navW = desktop ? 52 : 0;
    const V = desktop
      ? { x: pad + colW + 36, y: 72, w: W - (pad + colW + 36) - navW - 20, h: H - 72 - 70 }
      : { x: 10, y: 58, w: W - 20, h: Math.round(H * 0.5) - 58 };
    V.cx = V.x + V.w / 2; V.cy = V.y + V.h / 2;

    const logoSize = desktop ? 116 : 84;
    const logoTop = { x: W / 2, y: Math.round(Math.max(desktop ? 112 : 90, H * (desktop ? 0.16 : 0.13))) };
    // big triangle: the two lower corners sit just below the screen (desktop) or at the screen edges (phones)
    const Rbig = desktop ? (H + logoSize * 0.5 - logoTop.y) / 1.5 : Math.min((H + logoSize * 0.5 - logoTop.y) / 1.5, (W / 2 - 12) / 0.866);
    // final diagram: first zoomed out in the middle of the screen, then nudged beside the text column
    const Lsmall = desktop ? 84 : 54;
    const rf = desktop ? Math.min(V.w * 0.30, V.h * 0.40) : Math.min(V.w * 0.27, V.h * 0.40);
    const Rsmall = rf - Lsmall / 2 - (desktop ? 20 : 10);
    const Lcenter = desktop ? 96 : 54;
    const rfc = desktop ? Math.min(W * 0.26, H * 0.36) : Math.min(W * 0.27, H * 0.3);
    const Rcenter = rfc - Lcenter / 2 - (desktop ? 20 : 10);
    L = {
      desktop, pad, colW, V, logoSize, logoTop, Rbig, Lsmall, rf, Rsmall, Lcenter, Rcenter,
      sdgSize: desktop ? 72 : 46,
      hero: { fx: W / 2, fy: H * (desktop ? 0.53 : 0.5), r: Math.min(W, H) * (desktop ? 0.34 : 0.42) },
      globe: { fx: V.cx, fy: V.cy, r: Math.min(V.w, V.h) * 0.43 },
    };
    const root = document.documentElement.style;
    root.setProperty('--col-x', pad + 'px');
    root.setProperty('--col-w', colW + 'px');
    root.setProperty('--band-h', Math.round(logoTop.y + logoSize / 2 + (desktop ? Math.min(110, H * 0.1) : 80)) + 'px');
    root.setProperty('--vis-x', Math.round(V.x + 8) + 'px');
    computeKeyframes();
  }

  // Fit a camera (center + scale) so that `geo` fills `box`.
  function fit(center, geo, box, pad) {
    const p = d3.geoOrthographic().rotate([-center[0], -center[1]]).scale(1).translate([0, 0]).clipAngle(90);
    const b = d3.geoPath(p).bounds(geo);
    const s = Math.min(box.w / (b[1][0] - b[0][0]), box.h / (b[1][1] - b[0][1])) * pad;
    const mx = (b[0][0] + b[1][0]) / 2, my = (b[0][1] + b[1][1]) / 2;
    return { lon: center[0], lat: center[1], scale: s, fx: box.cx - mx * s, fy: box.cy - my * s };
  }
  function edgePoints(x0, y0, x1, y1, n = 12) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push([lerp(x0, x1, t), y0], [lerp(x0, x1, t), y1], [x0, lerp(y0, y1, t)], [x1, lerp(y0, y1, t)]); }
    return { type: 'MultiPoint', coordinates: pts };
  }

  function computeKeyframes() {
    const V = L.V;
    const atlPts = { type: 'MultiPoint', coordinates: nonprofits.map(n => n.ll).concat([BOG, LL(chapters.find(c => c.id === 'emory').at)]) };
    K = {
      hero: { lat: 18, scale: L.hero.r, fx: L.hero.fx, fy: L.hero.fy },
      globe: { lat: 18, scale: L.globe.r, fx: L.globe.fx, fy: L.globe.fy },
      // North America: US + southern Canada, where every chapter except Beirut is
      na: fit([-92, 41], edgePoints(-124.5, 25, -65, 50.5), V, 0.97),
      atl: fit([-84.335, 33.818], atlPts, { w: V.w * 0.84, h: V.h * 0.84, cx: V.cx, cy: V.cy }, 1),
      campus: { lon: BOG[0], lat: BOG[1], scale: Math.min(W, H) / (1.1 / 6371), fx: W / 2, fy: H / 2 },
    };
  }

  /* ---------------- scenes ---------------- */
  const scenes = $$('.scene').map((el, i) => ({
    el, i, id: el.dataset.scene, len: Number(el.dataset.len || 0), top: 0, height: 1,
  }));
  const SC = Object.fromEntries(scenes.map(s => [s.id, s]));
  const ord = id => (SC[id] ? SC[id].i : -1);
  const stepEls = $$('[data-layout="split"] .step');
  const sourcesEl = $('#sources');
  let sourcesTop = 1e9;

  function measure() {
    for (const s of scenes) if (s.len) s.el.style.height = Math.round(s.len / 100 * H) + 'px';
    const y0 = window.scrollY;
    for (const s of scenes) { const r = s.el.getBoundingClientRect(); s.top = r.top + y0; s.height = Math.max(1, r.height); }
    sourcesTop = sourcesEl.getBoundingClientRect().top + y0;
    navItems.forEach(n => { n.y = n.target(); });
  }

  function storyPos() {
    const a = window.scrollY + H * 0.5;
    let cur = scenes[0];
    for (const s of scenes) if (a >= s.top) cur = s;
    return { id: cur.id, i: cur.i, p: clamp((a - cur.top) / cur.height) };
  }

  /* ---------------- story camera ---------------- */
  let autoLon = -38; // globe longitude while it spins

  function zoomToPoint(C0, C1, t) {
    // Zoom from camera C0 to C1 so the target (C1's center) slides on a straight
    // line to its final screen position while the scale grows exponentially.
    const v = ease(t), u = ease(clamp(t * 1.15));
    const s = logLerp(C0.scale, C1.scale, v);
    const fx = lerp(C0.fx, C1.fx, u), fy = lerp(C0.fy, C1.fy, u);
    const P = [C1.lon, C1.lat], c0 = [C0.lon, C0.lat];
    const delta0 = d3.geoDistance(P, c0);
    if (delta0 < 1e-9) return { lon: P[0], lat: P[1], scale: s, fx, fy };
    const d0 = Math.sin(delta0) * C0.scale;
    const delta = Math.asin(clamp((1 - u) * d0 / s, 0, 1));
    const c = d3.geoInterpolate(P, c0)(delta / delta0);
    return { lon: c[0], lat: c[1], scale: s, fx, fy };
  }

  function storyCamera(id, p) {
    switch (id) {
      case 'hero': return { lon: autoLon, lat: K.hero.lat, scale: K.hero.scale, fx: K.hero.fx, fy: K.hero.fy };
      case 'issue': {
        const a = smooth(p, 0, 0.22);
        return { lon: autoLon, lat: K.hero.lat, scale: lerp(K.hero.scale, K.globe.scale, a), fx: lerp(K.hero.fx, K.globe.fx, a), fy: lerp(K.hero.fy, K.globe.fy, a) };
      }
      case 'toNA': {
        const a = smooth(p, 0, 0.6), b = smooth(p, 0.2, 1);
        const dl = wrap180(K.na.lon - autoLon);
        return { lon: autoLon + dl * a, lat: lerp(K.globe.lat, K.na.lat, a), scale: logLerp(K.globe.scale, K.na.scale, b), fx: lerp(K.globe.fx, K.na.fx, a), fy: lerp(K.globe.fy, K.na.fy, a) };
      }
      case 'na': return K.na;
      case 'toATL': return zoomToPoint(K.na, K.atl, p);
      case 'atl': return K.atl;
      case 'toBoG': return zoomToPoint(K.atl, K.campus, clamp(p / 0.8));
      default: return K.campus;
    }
  }

  // What each layer should show at this point of the story.
  function storyState(pos) {
    const { id, p } = pos, o = pos.i;
    const st = { mapAlpha: 1, naEmph: 0, gaTint: 0, chapters: 0, np: 0, bog: 0, globe: false, mapUI: false, map: true };
    if (id === 'hero' || id === 'issue') st.globe = true;
    if (id === 'toNA') { st.naEmph = smooth(p, 0.35, 0.9); st.chapters = smooth(p, 0.62, 0.95); }
    if (o >= ord('na')) { st.naEmph = 1; st.chapters = 1; }
    if (id === 'toATL') { st.gaTint = Math.sin(Math.PI * seg(p, 0.05, 0.8)); st.np = smooth(p, 0.72, 1); st.bog = smooth(p, 0.55, 0.88); }
    if (id === 'atl') { st.np = 1; st.bog = 1; }
    if (id === 'toBoG') {
      st.np = 1 - smooth(p, 0.08, 0.3); st.chapters = 1 - smooth(p, 0.08, 0.3);
      st.bog = 1 - smooth(p, 0.36, 0.46); st.mapAlpha = 1 - smooth(p, 0.5, 0.8);
    }
    if (o > ord('toBoG')) { st.map = false; st.mapAlpha = 0; st.chapters = 0; st.np = 0; st.bog = 0; }
    st.mapUI = id === 'na' || id === 'atl';
    return st;
  }

  /* ---------------- reader's own map moves ---------------- */
  const user = { lon: 0, lat: 0, zoom: 0 };
  let lastBase = null, lastCam = null, lastPos = null, lastSt = null;
  const zoomLimits = () => (lastSt && lastSt.globe ? [-0.5, 1.3] : [-2.6, 2.6]);

  function finalCamera(base) {
    return {
      lon: base.lon + user.lon,
      lat: clamp(base.lat + user.lat, -88, 88),
      scale: base.scale * Math.exp(user.zoom),
      fx: base.fx, fy: base.fy,
    };
  }
  function applyCam(cam) {
    proj.rotate([-cam.lon, -cam.lat, 0]).scale(cam.scale).translate([cam.fx, cam.fy]).clipExtent([[-4, -4], [W + 4, H + 4]]);
  }

  /* ---------------- map drawing ---------------- */
  // Colors come from the theme (MAP). `a` fades a whole layer in or out.
  let layerAlpha = 1;
  function strokeGeo(geo, color, width, a = 1) {
    if (a <= 0.001) return;
    ctx.globalAlpha = layerAlpha * a; ctx.beginPath(); path(geo); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }
  function fillGeo(geo, color, a = 1) {
    if (a <= 0.001) return;
    ctx.globalAlpha = layerAlpha * a; ctx.beginPath(); path(geo); ctx.fillStyle = color; ctx.fill();
  }

  let lastDrawKey = '';
  function drawMap(cam, st) {
    // skip the redraw when nothing visible changed (e.g. scrolling through text in a hold scene)
    const key = [cam.lon, cam.lat, cam.scale, cam.fx, cam.fy, st.mapAlpha, st.naEmph, st.gaTint].map(v => v.toFixed(5)).join('|') + '|' + paletteRev;
    if (key === lastDrawKey) return;
    lastDrawKey = key;
    const M = MAP;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = M.space;
    ctx.fillRect(0, 0, W, H);
    if (st.mapAlpha <= 0.002) return;
    layerAlpha = st.mapAlpha;
    ctx.globalAlpha = layerAlpha;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    applyCam(cam);
    const s = cam.scale;

    // atmosphere and ocean
    if (s < 6000) {
      const g = ctx.createRadialGradient(cam.fx, cam.fy, s * 0.97, cam.fx, cam.fy, s * 1.2);
      g.addColorStop(0, M.glow); g.addColorStop(1, M.glowClear);
      ctx.globalAlpha = layerAlpha * (1 - 0.75 * seg(s, 450, 1000)); // softer once the globe fills the screen
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cam.fx, cam.fy, s * 1.2, 0, 2 * Math.PI); ctx.fill();
      ctx.globalAlpha = layerAlpha;
      const og = ctx.createRadialGradient(cam.fx - s * 0.35, cam.fy - s * 0.42, s * 0.05, cam.fx, cam.fy, s * 1.02);
      og.addColorStop(0, M.oceanHi); og.addColorStop(0.55, M.ocean); og.addColorStop(1, M.oceanLo);
      ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = og; ctx.fill();
    } else {
      ctx.fillStyle = M.ocean; ctx.fillRect(0, 0, W, H);
    }

    strokeGeo(graticule, M.graticule, 0.6, 1 - seg(s, 700, 1900));

    const landNA = mixColor(M.land, M.landHi, st.naEmph);
    // Zoomed into inland Georgia: the whole screen is land, so skip the continent outlines (much faster).
    const inland = s > 60000 && d3.geoDistance([cam.lon, cam.lat], ATL_CENTER) < 1.4 * RAD;
    if (inland) {
      ctx.globalAlpha = layerAlpha; ctx.fillStyle = landNA; ctx.fillRect(0, 0, W, H);
    } else if (st.naEmph < 0.02 && s < 1500) {
      // spinning globe: the light 1:110m world layer is enough and keeps the animation smooth
      fillGeo(countries, M.land);
      strokeGeo(worldBorders, M.borders, 0.6);
      strokeGeo(worldCoast, M.coast, 0.7, 0.7);
    } else {
      if (s < 60000) {
        fillGeo(otherCountries, M.land);
        strokeGeo(worldBorders, M.borders, 0.6);
      }
      fillGeo(naStates, landNA);
      fillGeo(georgia, M.gaTint, st.gaTint);
      fillGeo(lakes, M.ocean);
      strokeGeo(naCoast, M.coast, 0.8, lerp(0.55, 1, seg(s, 400, 1300)));
      strokeGeo(naInner, M.states, 0.7, st.naEmph);
      strokeGeo(naBorder, M.natBorder, 1.1);
    }

    // Georgia / metro Atlanta
    strokeGeo(countyMesh, M.counties, 0.7, seg(s, 7000, 18000));
    fillGeo(urban, M.urban, seg(s, 4000, 12000) * (1 - seg(s, 50000, 120000)));
    strokeGeo(seRoads, M.roadsNE, 0.9, seg(s, 3000, 8000) * (1 - seg(s, 26000, 46000)));
    strokeGeo(river, M.river, lerp(1, 2.6, seg(s, 30000, 400000)), 0.9 * seg(s, 12000, 30000));
    const hA = seg(s, 22000, 46000);
    if (hA > 0) {
      const lw = lerp(1, 3.2, seg(s, 46000, 500000));
      strokeGeo(interstates, M.hwCase, lw + 2.4, hA);
      strokeGeo(stateRoutes, M.hwCase, lw + 1.6, hA);
      strokeGeo(stateRoutes, M.hwState, lw * 0.75, hA);
      strokeGeo(interstates, M.hw, lw, hA);
    }
    const kA = seg(s, 45000, 110000);
    if (kA > 0) {
      fillGeo(campusEmory, M.emoryFill, kA);
      strokeGeo(campusEmory, M.emoryStroke, 1.2, kA);
      fillGeo(campusGT, M.gtFill, kA);
      strokeGeo(campusGT, M.gtStroke, 1.6, kA);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------------- map overlay: markers, labels ---------------- */
  const ov = $('#map-overlay');
  const gPlaces = svg('g', { class: 'places' }, ov);
  const gShields = svg('g', { class: 'shields' }, ov);
  const gCampus = svg('g', { class: 'campus-labels' }, ov);
  const gLeaders = svg('g', { class: 'leaders' }, ov);
  const gChapters = svg('g', { class: 'layer-chapters' }, ov);
  const gNP = svg('g', { class: 'layer-np' }, ov);
  const gBog = svg('g', { class: 'layer-bog' }, ov);

  for (const pl of places) { pl.el = svg('text', { class: 'place-label' }, gPlaces); pl.el.textContent = pl.name; }
  for (const sh of shields) {
    const g = svg('g', { class: 'shield' }, gShields);
    const w = 8 + sh.label.length * 6.4;
    svg('rect', { x: -w / 2, y: -8, width: w, height: 16, rx: 3 }, g);
    svg('text', { x: 0, y: 0.5 }, g).textContent = sh.label;
    sh.el = g;
  }
  const gtLabel = svg('text', { class: 'campus-label' }, gCampus); gtLabel.textContent = 'Georgia Tech'; gtLabel.style.textAnchor = 'end';
  const emoryLabel = svg('text', { class: 'campus-label campus-label--emory' }, gCampus); emoryLabel.textContent = 'Emory';
  const gtLabelLL = [-84.4088, 33.7758], emoryLabelLL = [-84.3215, 33.8085];

  const tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; document.body.appendChild(tip);
  function showTip(text, x, y) { tip.textContent = text; tip.hidden = false; tip.style.left = Math.min(W - 270, x + 14) + 'px'; tip.style.top = (y - 34) + 'px'; }
  function hideTip() { tip.hidden = true; }

  let suppressClickUntil = 0;
  function bindMarker(el, label, open) {
    el.addEventListener('click', e => { if (performance.now() < suppressClickUntil) return; e.stopPropagation(); hideTip(); open(); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') showTip(label(), e.clientX, e.clientY); });
    el.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && !tip.hidden) showTip(label(), e.clientX, e.clientY); });
    el.addEventListener('pointerleave', hideTip);
  }

  for (const c of chapters) {
    const g = svg('g', { class: 'mk mk-chapter' + (c.home ? ' mk-home' : ''), 'data-status': c.status, tabindex: 0, role: 'button', 'aria-label': `${c.school}: Hack4Impact chapter, ${c.status}` }, gChapters);
    svg('circle', { class: 'hit', r: 13 }, g);
    if (c.home) svg('rect', { class: 'ring', x: -7, y: -7, width: 14, height: 14 }, g);
    const size = c.status === 'inactive' ? 7 : (c.home ? 13 : 10);
    svg('rect', { class: 'body', x: -size / 2, y: -size / 2, width: size, height: size }, g);
    if (c.home) { const t = svg('text', { class: 'mk-label mk-label--home', x: 0, y: 24, 'text-anchor': 'middle' }, g); t.textContent = 'Georgia Tech'; }
    if (c.id === 'emory') { c.atlLabel = svg('text', { class: 'mk-label', x: 11, y: 4.5 }, g); c.atlLabel.textContent = 'Hack4Impact Emory'; }
    c.el = g; c.leader = svg('line', { class: 'leader' }, gLeaders);
    bindMarker(g, () => `${c.school} (${c.status})`, () => openChapter(c));
  }
  for (const n of nonprofits) {
    const g = svg('g', { class: 'mk mk-np', tabindex: 0, role: 'button', 'aria-label': `${n.name}: Bits of Good project` }, gNP);
    svg('circle', { class: 'hit', r: 13 }, g);
    svg('circle', { class: 'body', r: 6.5 }, g);
    n.el = g;
    bindMarker(g, () => n.name, () => openNonprofit(n));
  }
  const bogMk = svg('g', { class: 'mk mk-bog', tabindex: 0, role: 'button', 'aria-label': 'Bits of Good at Georgia Tech' }, gBog);
  svg('rect', { class: 'ring', x: -13, y: -13, width: 26, height: 26 }, bogMk);
  svg('circle', { class: 'hit', r: 20 }, bogMk);
  svg('rect', { class: 'badge', x: -14, y: -14, width: 28, height: 28, rx: 3 }, bogMk);
  if (ORGS[0].logo) svg('image', { href: ORGS[0].logo, x: -10.5, y: -10.5, width: 21, height: 21, preserveAspectRatio: 'xMidYMid meet' }, bogMk);
  else svg('text', { class: 'badge-text', x: 0, y: 0.5 }, bogMk).textContent = 'BoG';
  svg('text', { class: 'mk-label mk-label--home', x: 20, y: 0 }, bogMk).textContent = 'Bits of Good';
  svg('text', { class: 'mk-label mk-label--cta', x: 20, y: 14 }, bogMk).textContent = 'Click for more';
  bindMarker(bogMk, () => 'Bits of Good, Georgia Tech', () => openBoG());

  // Spread out markers that overlap on screen (e.g. the three Montreal chapters).
  function dodge(items, minD) {
    for (const it of items) { it.dx = it.x; it.dy = it.y; }
    for (let iter = 0; iter < 40; iter++) {
      let moved = false;
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j];
        let vx = b.dx - a.dx, vy = b.dy - a.dy, d = Math.hypot(vx, vy);
        if (d >= minD) continue;
        if (d < 0.01) { const ang = i * 2.39996 + j * 0.9; vx = Math.cos(ang); vy = Math.sin(ang); d = 0; } else { vx /= d; vy /= d; }
        const push = (minD - d) / 2;
        a.dx -= vx * push; a.dy -= vy * push; b.dx += vx * push; b.dy += vy * push; moved = true;
      }
      if (!moved) break;
    }
  }

  const statusFilter = { active: true, forming: true, inactive: true };
  const catFilter = new Set();

  function updateOverlay(cam, st) {
    const center = [cam.lon, cam.lat];
    const front = ll => d3.geoDistance(ll, center) < Math.PI / 2 - 0.02;
    const onScreen = (x, y, m) => x > -m && y > -m && x < W + m && y < H + m;
    const s = cam.scale;
    const show = (el, on) => { el.style.display = on ? '' : 'none'; };

    // chapters
    gChapters.style.opacity = st.chapters; gLeaders.style.opacity = st.chapters;
    show(gChapters, st.chapters > 0.01); show(gLeaders, st.chapters > 0.01);
    const items = [];
    if (st.chapters > 0.01) {
      for (const c of chapters) {
        c.xy = null;
        const hiddenHome = c.home && st.bog > 0.4;
        if (!statusFilter[c.status] || hiddenHome || !front(c.ll)) { show(c.el, false); show(c.leader, false); continue; }
        const [x, y] = proj(c.ll);
        if (!onScreen(x, y, 30)) { show(c.el, false); show(c.leader, false); continue; }
        items.push({ c, x, y });
      }
      dodge(items, 13);
      for (const it of items) {
        const c = it.c;
        show(c.el, true);
        c.el.setAttribute('transform', `translate(${it.dx.toFixed(1)},${it.dy.toFixed(1)})`);
        c.xy = [it.dx, it.dy];
        const off = Math.hypot(it.dx - it.x, it.dy - it.y) > 3;
        show(c.leader, off);
        if (off) { c.leader.setAttribute('x1', it.x.toFixed(1)); c.leader.setAttribute('y1', it.y.toFixed(1)); c.leader.setAttribute('x2', it.dx.toFixed(1)); c.leader.setAttribute('y2', it.dy.toFixed(1)); }
        if (c.atlLabel) show(c.atlLabel, s > 60000);
      }
    } else chapters.forEach(c => { c.xy = null; });

    // nonprofits
    gNP.style.opacity = st.np; show(gNP, st.np > 0.01);
    for (const n of nonprofits) {
      n.xy = null;
      if (st.np <= 0.01 || !front(n.ll)) { show(n.el, false); continue; }
      const [x, y] = proj(n.ll);
      if (!onScreen(x, y, 30)) { show(n.el, false); continue; }
      show(n.el, true); n.el.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`); n.xy = [x, y];
      n.el.classList.toggle('is-dim', catFilter.size > 0 && !catFilter.has(n.category));
    }

    // Bits of Good badge
    bogMk.xy = null;
    if (st.bog > 0.01 && front(BOG)) {
      const [x, y] = proj(BOG);
      show(gBog, true); gBog.style.opacity = st.bog;
      bogMk.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`); bogMk.xy = [x, y];
    } else show(gBog, false);

    // place names, highway shields, campus labels (only when zoomed into Atlanta)
    const atlA = st.map ? seg(s, 90000, 150000) * st.mapAlpha * (1 - seg(s, 900000, 1500000)) : 0;
    gPlaces.style.opacity = atlA; gShields.style.opacity = atlA; gCampus.style.opacity = atlA;
    show(gPlaces, atlA > 0.01); show(gShields, atlA > 0.01); show(gCampus, atlA > 0.01);
    if (atlA > 0.01) {
      for (const pl of places) {
        const [x, y] = proj(pl.ll);
        pl.el.setAttribute('x', x.toFixed(1)); pl.el.setAttribute('y', y.toFixed(1));
      }
      for (const sh of shields) { const [x, y] = proj(sh.ll); sh.el.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`); }
      const g1 = proj(gtLabelLL), e1 = proj(emoryLabelLL);
      gtLabel.setAttribute('x', g1[0].toFixed(1)); gtLabel.setAttribute('y', g1[1].toFixed(1));
      emoryLabel.setAttribute('x', e1[0].toFixed(1)); emoryLabel.setAttribute('y', e1[1].toFixed(1));
    }
  }

  /* ---------------- logo triangle ---------------- */
  const back = $('#org-back'), frontLayer = $('#org-front');
  const defs = svg('defs', null, back);
  const fBlur = svg('filter', { id: 'blur-soft', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  svg('feGaussianBlur', { stdDeviation: 3.5 }, fBlur);
  const fEdge = svg('filter', { id: 'blur-edge', x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs);
  const edgeBlurNode = svg('feGaussianBlur', { stdDeviation: 1.6 }, fEdge);
  // Georgia Tech: a gold ring around the triangle plus the GT logo
  // ('center': full color in the middle; 'behind': large and faint behind it)
  const gFrame = svg('g', { class: 'gt-frame gt-frame--' + (GT_LOGO.placement === 'behind' ? 'behind' : 'center') }, back);
  const frameRing = svg('circle', { class: 'ring' }, gFrame);
  const gtHref = GT_LOGO[GT_LOGO.color] || GT_LOGO.gold;
  const GT_ASPECT = 180 / 113; // viewBox of the GT logo files
  const gtMark = gtHref ? svg('image', { class: 'gt-mark', href: gtHref, preserveAspectRatio: 'xMidYMid meet' }, gFrame) : null;
  const frameLabel = svg('text', { class: 'label' }, gFrame);
  frameLabel.textContent = gtMark ? '' : '[GT logo]';
  const frameHit = svg('circle', { class: 'hit', tabindex: 0, role: 'button', 'aria-label': 'Georgia Tech Sustainability Next' }, gFrame);
  const gLinks = svg('g', { class: 'sdg-links' }, back);
  const triPath = svg('path', { class: 'tri-edge' }, back);
  const gGhosts = svg('g', { class: 'ghosts' }, back);
  const gSdg = svg('g', { class: 'sdg-nodes' }, back);
  const gNodes = svg('g', { class: 'org-nodes' }, frontLayer);

  const SDGS = [
    { key: 'sdg8', num: '8', cap: 'SDG 8', cap2: ['Decent work &', 'economic growth'], color: getComputedStyle(document.documentElement).getPropertyValue('--sdg8').trim() || '#A21942' },
    { key: 'sdg11', num: '11', cap: 'SDG 11', cap2: ['Sustainable cities', '& communities'], color: getComputedStyle(document.documentElement).getPropertyValue('--sdg11').trim() || '#FD9D24' },
  ];
  for (const sd of SDGS) {
    sd.link = svg('path', { class: 'sdg-link', stroke: sd.color }, gLinks);
    const g = svg('g', { class: 'sdg-node', tabindex: 0, role: 'button', 'aria-label': sd.cap }, gSdg);
    sd.rect = svg('rect', { rx: 4, fill: sd.color }, g);
    sd.numEl = svg('text', { class: 'num' }, g); sd.numEl.textContent = sd.num;
    sd.capEl = svg('text', { class: 'cap' }, g); sd.capEl.textContent = sd.cap;
    sd.cap2El = svg('text', { class: 'cap2' }, g);
    sd.cap2Spans = sd.cap2.map((line, i) => { const t = svg('tspan', { dy: i ? 14 : 0 }, sd.cap2El); t.textContent = line; return t; });
    sd.el = g;
    g.addEventListener('click', () => openSdg(sd.key, () => sd.xy));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSdg(sd.key, () => sd.xy); } });
  }
  frameHit.addEventListener('click', () => openSdg('gt', () => gFrame.xy));
  frameHit.addEventListener('keydown', e => { if (e.key === 'Enter') openSdg('gt', () => gFrame.xy); });

  function buildOrgNode(org, parent, ghost) {
    const g = svg('g', { class: ghost ? 'ghost' : 'org-node', tabindex: ghost ? -1 : 0, role: ghost ? 'presentation' : 'button', 'aria-label': ghost ? '' : org.name }, parent);
    // the disc and ring use the organization's own colors (content.js), so each logo keeps its contrast on any theme
    svg('circle', { class: 'disc', cx: 0, cy: 0, r: 50, fill: org.disc || '#FFFFFF', stroke: org.ring || '#F89C44' }, g);
    if (org.logo) {
      const sz = 100 * (org.scale || 0.62);
      svg('image', { class: 'logo', href: org.logo, x: -sz / 2, y: -sz / 2, width: sz, height: sz, preserveAspectRatio: 'xMidYMid meet' }, g);
    } else {
      // no logo file: show the initials in the ring color
      const t = svg('text', { class: 'initials', x: 0, y: 0, fill: org.ring || '#F89C44', 'font-size': org.short.length > 2 ? 30 : 34 }, g); t.textContent = org.short;
    }
    if (!ghost) { const nm = svg('text', { class: 'name', x: 0, y: 76, 'font-size': 17 }, g); nm.textContent = org.name; org.nameEl = nm; }
    return g;
  }
  for (const org of ORGS) {
    org.ghost = buildOrgNode(org, gGhosts, true);
    org.ghost.setAttribute('filter', 'url(#blur-soft)');
    org.node = buildOrgNode(org, gNodes, false);
    const go = () => scrollToScene(org.scene);
    org.node.addEventListener('click', go);
    org.node.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  }

  function activeness(angleDeg) { return 1 - smooth(Math.abs(wrap180(angleDeg + 90)), 10, 110); }

  // Where the logos are at this point of the story (null = hidden).
  function orgState(pos, cam) {
    const { id, p } = pos, o = pos.i;
    if (o < ord('toBoG') || (id === 'toBoG' && p < 0.36)) return null;
    const V = L.V, Ls = L.logoSize, top = L.logoTop;
    const st = { theta: 0, R: L.Rbig, cx: top.x, cy: top.y + L.Rbig, size: Ls, all: 0, edge: 0.18, edgeBlur: 1, ghosts: 1, frame: 0, sdg: 0, band: 1, focus: null };
    if (id === 'toBoG') {
      applyCam(cam);
      const bp = proj(BOG);
      const q1 = smooth(p, 0.36, 0.78), q2 = smooth(p, 0.8, 1);
      const bx = lerp(bp[0], top.x, q2), by = lerp(bp[1], top.y, q2);
      st.size = lerp(lerp(28, Ls * 1.45, q1), Ls, q2);
      st.cx = bx; st.cy = by + st.R; st.edge = 0.18 * q2; st.ghosts = q2; st.band = q2;
      st.introAlpha = smooth(p, 0.36, 0.46);
      return st;
    }
    if (id === 'bog') st.theta = 0;
    else if (id === 'toEI') st.theta = -120 * ease(p);
    else if (id === 'ei') st.theta = -120;
    else if (id === 'toCYC') st.theta = -120 - 120 * ease(p);
    else if (id === 'cyc') st.theta = -240;
    else {
      const q = id === 'toSDG' ? ease(p) : 1;
      const slide = id === 'sdg' ? smooth(p, 0, 0.12) : 0; // make room for the text column
      st.theta = -240 - 120 * q;
      st.R = lerp(lerp(L.Rbig, L.Rcenter, q), L.Rsmall, slide);
      st.cx = lerp(top.x, V.cx, slide);
      st.cy = lerp(lerp(top.y + L.Rbig, H / 2, q), V.cy + (L.desktop ? 0 : 6), slide);
      st.size = lerp(lerp(Ls, L.Lcenter, q), L.Lsmall, slide);
      st.all = q; st.edge = lerp(0.18, 0.85, q); st.edgeBlur = 1 - q;
      st.frame = id === 'toSDG' ? smooth(p, 0.45, 0.9) : 1;
      st.sdg = id === 'toSDG' ? smooth(p, 0.6, 1) : 1;
      st.band = id === 'toSDG' ? 1 - smooth(p, 0, 0.35) : 0;
    }
    return st;
  }

  function renderOrg(os, endFade) {
    const visible = !!os;
    back.style.display = visible ? '' : 'none';
    frontLayer.style.display = visible ? '' : 'none';
    $('#top-band').style.opacity = visible ? os.band * (1 - endFade) : 0;
    if (!visible) { ORGS.forEach(o => { o.xy = null; }); return; }
    back.style.opacity = 1 - endFade; frontLayer.style.opacity = 1 - endFade;
    const pts = [];
    ORGS.forEach((org, k) => {
      const ang = -90 + 120 * k + os.theta;
      const x = os.cx + os.R * Math.cos(ang * RAD), y = os.cy + os.R * Math.sin(ang * RAD);
      pts.push([x, y]);
      let a = lerp(activeness(ang), 1, os.all);
      let alpha = a;
      if (os.introAlpha !== undefined) alpha = k === 0 ? os.introAlpha : 0; // during the zoom only BoG shows
      const scale = (os.size * lerp(0.7, 1, a)) / 100; // node is drawn 100px wide at scale 1
      org.node.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${scale.toFixed(4)})`);
      org.node.style.opacity = alpha.toFixed(3);
      org.node.style.pointerEvents = alpha > 0.35 ? 'auto' : 'none';
      if (org.nameEl) {
        org.nameEl.style.opacity = (os.all > 0.5 ? (L.desktop ? 1 : 0) : a).toFixed(3); // phones: initials only in the final diagram
        const fs = Math.max(17, 12.5 / scale);
        org.nameEl.setAttribute('font-size', fs.toFixed(1));
        // stacked: under the logo; final diagram: just outside the GT ring, pointing away from the center
        const ux = Math.cos(ang * RAD), uy = Math.sin(ang * RAD);
        const ringR = os.R + os.size / 2 + (L.desktop ? 20 : 10);
        const d = (ringR + 16 - os.R) / scale;
        const fx = ux * d, fy = uy * d + (uy > 0.2 ? fs * 0.9 : uy < -0.2 ? -fs * 0.25 : fs * 0.35);
        const t = smooth(os.all, 0.35, 1);
        org.nameEl.setAttribute('x', lerp(0, fx, t).toFixed(1));
        org.nameEl.setAttribute('y', lerp(76, fy, t).toFixed(1));
        org.nameEl.style.textAnchor = t > 0.5 ? (ux < -0.3 ? 'end' : ux > 0.3 ? 'start' : 'middle') : 'middle';
      }
      org.ghost.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(os.size * 0.72 / 100).toFixed(4)})`);
      org.ghost.style.opacity = ((1 - a) * 0.3 * os.ghosts * (1 - os.all)).toFixed(3);
      org.xy = [x, y];
    });
    triPath.setAttribute('d', `M${pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L')}Z`);
    triPath.style.opacity = os.edge;
    edgeBlurNode.setAttribute('stdDeviation', (1.6 * os.edgeBlur).toFixed(2));
    triPath.setAttribute('filter', os.edgeBlur > 0.02 ? 'url(#blur-edge)' : '');

    // GT frame + SDG nodes
    const show = (el, on) => { el.style.display = on ? '' : 'none'; };
    show(gFrame, os.frame > 0.01); show(gSdg, os.sdg > 0.01); show(gLinks, os.sdg > 0.01);
    const rf = os.R + os.size / 2 + (L.desktop ? 20 : 10);
    if (os.frame > 0.01) {
      const rr = rf * lerp(1.25, 1, os.frame);
      const gtFocus = os.focus === 'gt';
      const dim = os.focus && !gtFocus ? 0.5 : 1; // another card is in focus
      gFrame.style.opacity = os.frame;
      frameRing.style.opacity = dim;
      frameRing.style.strokeWidth = gtFocus ? 2.6 : 1.5;
      frameRing.setAttribute('cx', os.cx); frameRing.setAttribute('cy', os.cy); frameRing.setAttribute('r', rr);
      frameHit.setAttribute('cx', os.cx); frameHit.setAttribute('cy', os.cy); frameHit.setAttribute('r', rr);
      if (gtMark) {
        let w, op = 1;
        if (GT_LOGO.placement === 'behind') {
          w = rr * 1.9;
          op = (document.documentElement.dataset.tone === 'light' ? 0.14 : 0.22) * (gtFocus ? 2.5 : dim);
        } else {
          // the logo itself is never faded (GT's logo rules ask for full contrast)
          w = os.R * 0.72 * (gtFocus ? 1.08 : 1); // fits inside the triangle without touching its edges
        }
        const h = w / GT_ASPECT;
        gtMark.setAttribute('x', (os.cx - w / 2).toFixed(1)); gtMark.setAttribute('y', (os.cy - h / 2).toFixed(1));
        gtMark.setAttribute('width', w.toFixed(1)); gtMark.setAttribute('height', h.toFixed(1));
        gtMark.style.opacity = op;
      } else {
        frameLabel.setAttribute('x', os.cx); frameLabel.setAttribute('y', os.cy + 4);
      }
      gFrame.xy = [os.cx, os.cy + rr];
    } else gFrame.xy = null;
    if (os.sdg > 0.01) {
      const S = L.sdgSize, gap = L.desktop ? 30 : 14;
      SDGS.forEach((sd, i) => {
        const dir = i === 0 ? -1 : 1;
        const x = os.cx + dir * (rf + gap + S / 2) + dir * (1 - os.sdg) * 30;
        const y = os.cy - (L.desktop ? 10 : 0);
        const dim = os.focus && os.focus !== sd.key ? 0.28 : 1;
        sd.el.style.opacity = os.sdg * dim; sd.link.style.opacity = os.sdg * dim;
        sd.rect.setAttribute('x', x - S / 2); sd.rect.setAttribute('y', y - S / 2); sd.rect.setAttribute('width', S); sd.rect.setAttribute('height', S);
        sd.numEl.setAttribute('x', x); sd.numEl.setAttribute('y', y + 1); sd.numEl.setAttribute('font-size', S * 0.5);
        sd.capEl.setAttribute('x', x); sd.capEl.setAttribute('y', y + S / 2 + 17);
        sd.cap2El.setAttribute('x', x); sd.cap2El.setAttribute('y', y + S / 2 + 32); sd.cap2Spans.forEach(t => t.setAttribute('x', x));
        sd.cap2El.style.display = L.desktop ? '' : 'none';
        const x1 = x - dir * S / 2, x2 = os.cx + dir * rf;
        sd.link.setAttribute('d', `M${x1.toFixed(1)},${y.toFixed(1)}L${x2.toFixed(1)},${(os.cy).toFixed(1)}`);
        sd.xy = [x, y - S / 2];
      });
    } else SDGS.forEach(sd => { sd.xy = null; });
    back.setAttribute('class', 'org-layer org-layer--back' + (os.focus ? ' focus-' + os.focus : ''));
    frontLayer.setAttribute('class', 'org-layer org-layer--front' + (os.focus ? ' focus-' + os.focus : ''));
  }

  /* ---------------- pop-ups ---------------- */
  const popup = $('#popup'), popBody = $('.popup__body', popup);
  let popAnchor = null;
  function phOr(text) { return isPh(text) ? `<span class="ph-inline">${esc(text)}</span>` : `<p>${esc(text)}</p>`; }
  // More than one paragraph: a list of strings, e.g. ['First paragraph.', 'Second paragraph.']
  function paras(text) { return Array.isArray(text) ? `<div class="pop__paras">${text.map(phOr).join('')}</div>` : phOr(text); }
  function linkList(pairs) {
    const items = pairs.filter(([, u]) => u).map(([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`);
    return items.length ? `<p class="pop__links">${items.join('')}</p>` : '';
  }
  function openPopup(html, anchor, wide) {
    popBody.innerHTML = html;
    popup.classList.toggle('popup--wide', !!wide); // the Bits of Good pop-up has more text
    popup.hidden = false; popup.scrollTop = 0;
    popAnchor = anchor;
    positionPopup();
    $$('[data-goto]', popBody).forEach(b => b.addEventListener('click', () => { closePopup(); scrollToScene(b.dataset.goto); }));
  }
  function closePopup() { popup.hidden = true; popAnchor = null; }
  function positionPopup() {
    if (popup.hidden || !popAnchor) return;
    const a = popAnchor();
    if (!a) { closePopup(); return; }
    if (!L.desktop) return; // bottom sheet on phones
    const r = popup.getBoundingClientRect();
    let x = a[0] + 18, y = a[1] - r.height * 0.35;
    if (x + r.width > W - 64) x = a[0] - 18 - r.width;
    x = clamp(x, 8, W - r.width - 8);
    y = clamp(y, 66, H - r.height - 10);
    popup.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }
  $('.popup__close', popup).addEventListener('click', closePopup);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closePopup();
    if (nav.classList.contains('is-open')) { setNavOpen(false); if (navToggle) navToggle.focus(); }
    if (themeList && !themeList.hidden) { setThemeMenuOpen(false); themeBtn.focus(); }
  });

  function openChapter(c) {
    const meta = [`<span class="status status--${c.status}">${c.status[0].toUpperCase() + c.status.slice(1)}</span>`];
    if (c.founded) meta.push(`<span>Founded ${c.founded}</span>`);
    const stats = (c.members != null || c.projects != null) ? `<dl class="pop__stats">
        <div><dt>Active members</dt><dd>${c.members ?? '&ndash;'}</dd></div>
        <div><dt>Projects delivered</dt><dd>${c.projects ?? '&ndash;'}</dd></div></dl>` : '';
    const stories = [
      c.nonprofitStory != null ? `<section class="pop__sec"><h4>How it helps nonprofits</h4>${phOr(c.nonprofitStory)}</section>` : '',
      c.studentStory != null ? `<section class="pop__sec"><h4>How it helps students</h4>${phOr(c.studentStory)}</section>` : '',
    ].join('');
    const html = `<p class="pop__meta">${meta.join('')}</p>
      <h3 class="pop__title">${esc(c.school)}</h3>
      <p class="pop__sub">${esc(c.chapter)}, ${esc(c.city)}</p>
      ${stats}${stories}
      ${linkList([['Website', c.web], ['GitHub', c.github], ['Instagram', c.instagram], ['Hack4Impact profile', c.h4i ? 'https://www.hack4impact.org/work/chapters/' + c.h4i : null]])}
      ${c.home ? '<p class="pop__actions"><button class="btn btn--small btn--primary" data-goto="atlanta">Zoom into Atlanta</button></p>' : ''}
      <p class="pop__note">Status and numbers: Hack4Impact chapter directory, Oct. 2026.</p>`;
    openPopup(html, () => c.xy);
  }
  function openNonprofit(n) {
    const meta = [`<span class="tag">${esc(n.category)}</span>`];
    if (n.when) meta.push(`<span>${esc(n.when)}</span>`);
    const link = n.link || SITE.links.bogProjects;
    const note = n.note || (n.approx ? 'Pin location is approximate.' : '');
    const html = `<p class="pop__meta">${meta.join('')}</p>
      <h3 class="pop__title">${esc(n.name)}</h3>
      <p class="pop__sub">${esc(n.sub || 'Bits of Good nonprofit partner')}${n.where ? ' &middot; ' + esc(n.where) : ''}</p>
      <section class="pop__sec"><h4>${esc(n.whatTitle || 'What they do')}</h4>${phOr(n.what)}</section>
      <section class="pop__sec"><h4>What Bits of Good built</h4><p class="pop__built">${esc(n.built)}</p>${phOr(n.builtNote)}</section>
      ${linkList([[link === SITE.links.bogProjects ? 'Bits of Good projects' : 'Project page', link]])}
      ${note ? `<p class="pop__note">${esc(note)}</p>` : ''}`;
    openPopup(html, () => n.xy);
  }
  function openBoG() {
    const c = homeChapter;
    const logo = ORGS[0].logo ? `<img class="pop__logo" src="${esc(ORGS[0].logo)}" alt="Bits of Good logo">` : '';
    const html = `${logo}<p class="pop__meta"><span class="status status--active">Active</span><span>Founded ${c.founded}</span></p>
      <h3 class="pop__title">Bits of Good</h3>
      <p class="pop__sub">Georgia Tech&rsquo;s Hack4Impact chapter</p>
      <dl class="pop__stats"><div><dt>Active members</dt><dd>${c.members}</dd></div><div><dt>Projects delivered</dt><dd>${c.projects}</dd></div></dl>
      <section class="pop__sec"><h4>Summary</h4>${paras(SITE.atlanta.bog.summary)}</section>
      ${linkList([['bitsofgood.org', c.web], ['GitHub', c.github], ['Instagram', c.instagram]])}
      <p class="pop__actions"><button class="btn btn--small btn--primary" data-goto="bog">Meet Bits of Good</button></p>`;
    openPopup(html, () => bogMk.xy, true);
  }
  function openSdg(key, anchor) {
    const d = SITE.sdg[key];
    const html = `<h3 class="pop__title">${esc(d.title)}</h3>
      <section class="pop__sec">${phOr(d.body)}</section>
      ${linkList([['Read more', d.link]])}`;
    openPopup(html, anchor);
  }

  /* ---------------- reader interaction with the map ---------------- */
  let mapLive = true, globeMode = true, autoPauseUntil = 0;
  const pointers = new Map();
  let drag = null, pinch = null;

  function panBy(dx, dy) {
    if (!lastCam) return;
    const s = lastCam.scale, cosLat = Math.max(0.35, Math.cos(lastCam.lat * RAD));
    const dLon = -dx / (s * cosLat) * DEG, dLat = dy / s * DEG;
    if (globeMode) { autoLon += dLon; user.lat = clamp(user.lat + dLat, -55, 55); }
    else { user.lon += dLon; user.lat += dLat; }
    autoPauseUntil = performance.now() + 2500;
    requestRender();
  }
  function zoomAt(factor, px, py) {
    if (!lastBase) return;
    const [zMin, zMax] = zoomLimits();
    let g = null;
    if (px != null && !globeMode) { applyCam(finalCamera(lastBase)); g = proj.invert([px, py]); }
    user.zoom = clamp(user.zoom + Math.log(factor), zMin, zMax);
    if (g) {
      for (let k = 0; k < 2; k++) {
        const cam = finalCamera(lastBase); applyCam(cam);
        const q = proj(g); if (!q) break;
        const cosLat = Math.max(0.35, Math.cos(cam.lat * RAD));
        user.lon += (q[0] - px) / (cam.scale * cosLat) * DEG;
        user.lat -= (q[1] - py) / cam.scale * DEG;
      }
    }
    autoPauseUntil = performance.now() + 2500;
    requestRender();
  }

  stage.addEventListener('pointerdown', e => {
    if (!mapLive || (e.pointerType === 'mouse' && e.button !== 0)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) { drag = { moved: 0, captured: false }; pinch = null; }
    else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) }; drag = null;
    }
  });
  stage.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    const cur = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, cur);
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.d > 0) zoomAt(d / pinch.d, (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch.d = d;
      return;
    }
    if (!drag) return;
    const dx = cur.x - prev.x, dy = cur.y - prev.y;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (!drag.captured && drag.moved > 4) {
      drag.captured = true;
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      stage.classList.add('is-dragging'); hideTip();
    }
    if (drag.captured) panBy(dx, dy);
  });
  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (drag && drag.captured) suppressClickUntil = performance.now() + 80;
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) { drag = null; stage.classList.remove('is-dragging'); }
  }
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);
  stage.addEventListener('click', e => { if (performance.now() >= suppressClickUntil && e.target === canvas) closePopup(); });
  stage.addEventListener('wheel', e => {
    if (!mapLive || !(e.ctrlKey || e.metaKey)) return; // plain scrolling scrolls the page
    e.preventDefault();
    const f = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0025));
    zoomAt(f, e.clientX, e.clientY);
  }, { passive: false });

  $$('#map-controls button').forEach(b => b.addEventListener('click', () => {
    const z = b.dataset.zoom;
    if (z === 'in') zoomAt(1.6, lastBase ? lastBase.fx : W / 2, lastBase ? lastBase.fy : H / 2);
    else if (z === 'out') zoomAt(1 / 1.6, lastBase ? lastBase.fx : W / 2, lastBase ? lastBase.fy : H / 2);
    else recenter();
  }));
  function recenter() {
    const from = { ...user }, t0 = performance.now(), dur = reduceMotion ? 1 : 520;
    (function step(t) {
      const k = ease(clamp((t - t0) / dur));
      user.lon = from.lon * (1 - k); user.lat = from.lat * (1 - k); user.zoom = from.zoom * (1 - k);
      requestRender();
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  function focusOn(ll, zoomTo) {
    if (!lastBase) return;
    user.lon = ll[0] - lastBase.lon;
    user.lat = ll[1] - lastBase.lat;
    if (zoomTo != null) user.zoom = Math.max(user.zoom, zoomTo);
    requestRender();
  }

  /* ---------------- legends, lists, numbers, links ---------------- */
  function buildLegends() {
    const counts = { active: 0, forming: 0, inactive: 0 };
    chapters.forEach(c => { counts[c.status]++; });
    const leg = $('#chapter-legend');
    if (leg) {
      leg.innerHTML = ['active', 'forming', 'inactive'].map(s =>
        `<button type="button" class="chip" aria-pressed="true" data-status="${s}"><span class="sym sym--${s}"></span>${s[0].toUpperCase() + s.slice(1)} <span class="n">${counts[s]}</span></button>`).join('');
      $$('.chip', leg).forEach(b => b.addEventListener('click', () => {
        const s = b.dataset.status; statusFilter[s] = !statusFilter[s];
        b.setAttribute('aria-pressed', String(statusFilter[s])); requestRender();
      }));
    }
    const list = $('#chapter-list');
    if (list) {
      const rank = { active: 0, forming: 1, inactive: 2 };
      list.innerHTML = chapters.slice().sort((a, b) => rank[a.status] - rank[b.status] || a.school.localeCompare(b.school))
        .map(c => `<li><button type="button" data-id="${c.id}"><span>${esc(c.school)}</span><span class="meta">${esc(c.city)}</span></button></li>`).join('');
      $$('button', list).forEach(b => b.addEventListener('click', () => {
        const c = chapters.find(x => x.id === b.dataset.id);
        statusFilter[c.status] = true; $$('#chapter-legend .chip').forEach(ch => ch.setAttribute('aria-pressed', String(statusFilter[ch.dataset.status])));
        focusOn(c.ll, 0.6);
        requestAnimationFrame(() => requestAnimationFrame(() => { if (c.xy) openChapter(c); }));
      }));
    }
    const cats = [...new Set(nonprofits.map(n => n.category))];
    const npLeg = $('#np-legend');
    if (npLeg) {
      npLeg.innerHTML = cats.map(cat => `<button type="button" class="chip" aria-pressed="false" data-cat="${esc(cat)}"><span class="sym sym--np"></span>${esc(cat)} <span class="n">${nonprofits.filter(n => n.category === cat).length}</span></button>`).join('')
        + `<span class="legend legend--static" style="margin:4px 0 0"><span><span class="sym sym--bog"></span>Bits of Good</span><span><span class="sym sym--active"></span>Hack4Impact chapter</span><span><span class="sym sym--campus"></span>Campus</span></span>`;
      $$('.chip', npLeg).forEach(b => b.addEventListener('click', () => {
        const cat = b.dataset.cat;
        if (catFilter.has(cat)) catFilter.delete(cat); else catFilter.add(cat);
        b.setAttribute('aria-pressed', String(catFilter.has(cat)));
        npLeg.classList.toggle('has-filter', catFilter.size > 0); requestRender();
      }));
    }
    const npList = $('#np-list');
    if (npList) {
      npList.innerHTML = nonprofits.map(n => `<li><button type="button" data-id="${n.id}"><span>${esc(n.name)}</span><span class="meta">${esc(n.category)}</span></button></li>`).join('');
      $$('button', npList).forEach(b => b.addEventListener('click', () => {
        const n = nonprofits.find(x => x.id === b.dataset.id);
        focusOn(n.ll, null);
        requestAnimationFrame(() => requestAnimationFrame(() => { if (n.xy) openNonprofit(n); }));
      }));
    }
    const ns = $('#netstats');
    if (ns) {
      const act = chapters.filter(c => c.status === 'active');
      const sum = k => act.reduce((t, c) => t + (c[k] || 0), 0);
      ns.innerHTML = `<div><dt>Chapters listed</dt><dd>${chapters.length}</dd></div><div><dt>Active</dt><dd>${act.length}</dd></div>
        <div><dt>Active members</dt><dd>${sum('members')}</dd></div><div><dt>Projects delivered</dt><dd>${sum('projects')}</dd></div>`;
    }
  }
  function wireLinks() {
    $$('a[data-link]').forEach(a => {
      const url = SITE.links[a.dataset.link];
      if (!url || url.startsWith('#TODO')) {
        a.href = url || '#'; a.classList.add('is-todo'); a.title = 'Link not set yet: edit links in js/content.js';
        a.addEventListener('click', e => e.preventDefault());
      } else { a.href = url; if (/^https?:/.test(url)) { a.target = '_blank'; a.rel = 'noopener'; } }
    });
  }
  // Words in the story text that open a chapter's pop-up on the map, e.g.
  // <button type="button" class="inline-link" data-chapter="cornell">the square in Ithaca</button>
  // data-chapter is a chapter id from js/content.js.
  function wireChapterLinks() {
    $$('[data-chapter]').forEach(el => el.addEventListener('click', e => {
      e.preventDefault();
      const c = chapters.find(x => x.id === el.dataset.chapter);
      if (!c) { console.warn('No chapter with id', el.dataset.chapter); return; }
      if (!statusFilter[c.status]) { // its status is switched off in the legend: show it again
        statusFilter[c.status] = true;
        $$('#chapter-legend .chip').forEach(ch => ch.setAttribute('aria-pressed', String(statusFilter[ch.dataset.status])));
      }
      if (!c.xy) focusOn(c.ll, null); // the reader moved the map away: bring the square back into view
      requestRender();
      requestAnimationFrame(() => requestAnimationFrame(() => { if (c.xy) openChapter(c); }));
    }));
    // Same idea for the Bits of Good logo on the Atlanta map:
    // <button type="button" class="inline-link" data-bog>the Bits of Good logo on campus</button>
    $$('[data-bog]').forEach(el => el.addEventListener('click', e => {
      e.preventDefault();
      if (!bogMk.xy) focusOn(BOG, null); // the reader moved the map away: bring the logo back into view
      requestRender();
      requestAnimationFrame(() => requestAnimationFrame(() => { if (bogMk.xy) openBoG(); }));
    }));
    // ...and for the project dots on the Atlanta map:
    // <button type="button" class="inline-link" data-nonprofit="southface">Southface Energy Institute</button>
    $$('[data-nonprofit]').forEach(el => el.addEventListener('click', e => {
      e.preventDefault();
      const n = nonprofits.find(x => x.id === el.dataset.nonprofit);
      if (!n) { console.warn('No project with id', el.dataset.nonprofit); return; }
      if (!n.xy) focusOn(n.ll, null); // the reader moved the map away: bring the dot back into view
      requestRender();
      requestAnimationFrame(() => requestAnimationFrame(() => { if (n.xy) openNonprofit(n); }));
    }));
  }

  /* ---------------- section nav ----------------
     Collapsed: squares on the right edge. The menu button (top right) opens
     the same list with each section's name to the right of its square.
     A click anywhere outside the list, or Esc, collapses it again. */
  const nav = $('#progress');
  const navToggle = $('#nav-toggle');
  const bar = document.createElement('div'); bar.className = 'progressbar'; document.body.appendChild(bar);
  function setNavOpen(open) {
    nav.classList.toggle('is-open', open);
    if (navToggle) navToggle.setAttribute('aria-expanded', String(open));
  }
  if (navToggle) navToggle.addEventListener('click', () => setNavOpen(!nav.classList.contains('is-open')));
  document.addEventListener('pointerdown', e => {
    if (!nav.classList.contains('is-open')) return;
    if (nav.contains(e.target) || (navToggle && navToggle.contains(e.target))) return;
    setNavOpen(false);
  }, true);
  const navItems = $$('[data-nav], [data-nav-anchor]').map(el => {
    const label = el.dataset.nav || el.dataset.navAnchor;
    const sceneId = el.classList.contains('scene') ? el.dataset.scene : null;
    const target = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (sceneId === 'hero') return 0;
      if (sceneId) {
        const layout = el.dataset.layout;
        return Math.max(0, top - H * (layout === 'stacked' ? 0.02 : 0.08));
      }
      return Math.max(0, top - (el.id === 'act' ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--band-h')) + 20 : 0));
    };
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', label);
    // .lbl = name to the right of the square when the list is open
    // .hint = name that pops out to the left when you hover a square in the collapsed list
    b.innerHTML = `<span class="sq" aria-hidden="true"></span><span class="lbl" aria-hidden="true">${esc(label)}</span><span class="hint" aria-hidden="true">${esc(label)}</span>`;
    nav.appendChild(b);
    const item = { el, label, target, btn: b, y: 0 };
    b.addEventListener('click', () => {
      window.scrollTo({ top: item.target(), behavior: reduceMotion ? 'auto' : 'smooth' });
      if (!L.desktop) setNavOpen(false); // on phones the open list covers the page
    });
    return item;
  });

  /* ---------------- color theme menu (SITE.themePicker) ---------------- */
  const themeMenu = $('#theme-menu'), themeBtn = $('#theme-toggle'), themeList = $('#theme-list');
  function setThemeMenuOpen(open) {
    if (!themeList) return;
    themeList.hidden = !open;
    themeBtn.setAttribute('aria-expanded', String(open));
  }
  if (themeMenu && SITE.themePicker !== false) {
    themeMenu.hidden = false;
    themeList.innerHTML = Object.keys(THEMES).map(name => {
      const d = THEMES[name], a = d.blend ? THEMES[d.blend.from] : d, z = d.blend ? THEMES[d.blend.to] : d;
      if (!a || !z || !a.ui || !z.ui) return '';
      const chips = (d.blend ? [a.ui.bg, z.ui.bg, z.ui.accent] : [a.ui.bg, a.ui.text, a.ui.accent])
        .map(c => `<span style="background:${esc(c)}"></span>`).join('');
      return `<button type="button" role="menuitemradio" aria-checked="false" data-theme="${esc(name)}"><span class="chips">${chips}</span>${esc(d.label || name)}</button>`;
    }).join('');
    themeBtn.addEventListener('click', () => setThemeMenuOpen(themeList.hidden));
    $$('[data-theme]', themeList).forEach(b => b.addEventListener('click', () => {
      setTheme(b.dataset.theme);
      try { const u = new URL(location.href); u.searchParams.set('theme', b.dataset.theme); history.replaceState(null, '', u.href); } catch (err) { /* file:// in some browsers */ }
    }));
    document.addEventListener('pointerdown', e => { if (!themeList.hidden && !themeMenu.contains(e.target)) setThemeMenuOpen(false); }, true);
  }

  // Two-part themes (dusk): `from` until the reader passes `at` in `scene`,
  // then `to`. The change itself is a short timed fade, so the page never
  // sits half-way between the two palettes.
  let themeAnim = null;
  function themeTarget(pos) {
    const b = theme && theme.blend;
    if (!b || !pos) return 0;
    const o = pos.i, so = ord(b.scene);
    return o > so || (o === so && pos.p >= (b.at != null ? b.at : 0.5)) ? 1 : 0;
  }
  function updateTheme(pos, now, instant) {
    const target = themeTarget(pos);
    if (instant || reduceMotion || themeT < 0) { themeAnim = null; applyTheme(target); return; }
    if (!themeAnim && themeT === target) return;
    if (!themeAnim || themeAnim.b !== target) {
      themeAnim = { a: themeT, b: target, t0: now, dur: Math.max(1, (theme.blend.duration || 1000) * Math.abs(target - themeT)) };
    }
    const k = clamp((now - themeAnim.t0) / themeAnim.dur);
    applyTheme(lerp(themeAnim.a, themeAnim.b, ease(k)));
    if (k >= 1) themeAnim = null; else needRender = true;
  }
  function setTheme(name) {
    const th = makeTheme(name) || makeTheme(SITE.theme) || makeTheme(Object.keys(THEMES)[0]);
    if (!th) return;
    theme = th; themeT = -1; uiCache.clear();
    updateTheme(lastPos || storyPos(), performance.now(), true);
    lastDrawKey = '';
    if (themeList) $$('[data-theme]', themeList).forEach(b => b.setAttribute('aria-checked', String(b.dataset.theme === th.name)));
    needRender = true;
  }
  function scrollToScene(id) {
    const s = SC[id]; if (!s) return;
    const item = navItems.find(n => n.el === s.el);
    const y = item ? item.target() : s.top;
    window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function updateNav() {
    const y = window.scrollY + 4;
    let cur = 0;
    navItems.forEach((n, i) => { if (y >= n.y - 2) cur = i; });
    navItems.forEach((n, i) => { n.btn.classList.toggle('is-current', i === cur); n.btn.classList.toggle('is-past', i < cur); });
    const max = document.documentElement.scrollHeight - H;
    bar.style.width = (max > 0 ? 100 * window.scrollY / max : 0) + '%';
  }

  /* ---------------- active step (which card is in focus) ---------------- */
  function activeStep() {
    let best = null, bd = Infinity;
    for (const el of stepEls) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H) continue;
      const d = Math.abs((r.top + r.bottom) / 2 - H * 0.5);
      if (d < bd) { bd = d; best = el; }
    }
    stepEls.forEach(el => el.classList.toggle('is-active', el === best));
    return best;
  }

  /* ---------------- dev panel (add ?dev to the URL) ---------------- */
  const devPanel = $('#dev-panel');
  let wordInfo = '';
  if (DEV) {
    devPanel.hidden = false;
    const count = el => (el.textContent.trim().match(/\S+/g) || []).length;
    const story = $('#story').cloneNode(true);
    $$('.ph, .sources, .listing, .legend, .netstats, script', story).forEach(e => e.remove());
    const written = count(story);
    const budget = $$('.ph').reduce((t, el) => t + Number(el.dataset.words || 0), 0);
    wordInfo = `words written (excl. sources): ${written}\nplaceholder budget: ${budget}\ntotal if filled: ~${written + budget} (target 1,200-2,000)`;
  }

  /* ---------------- render loop ---------------- */
  let needRender = true, lastTime = performance.now(), lastScrollY = window.scrollY;
  const hud = $('#hud-coord');
  function requestRender() { needRender = true; }

  // Each map scene: set the tip over the map and pulse its markers once.
  const mapTip = $('#map-tip');
  let lastSceneId = null;
  function onSceneStart(id) {
    if (mapTip && mapTip.dataset[id]) mapTip.textContent = mapTip.dataset[id];
    if (id === 'na') pulse(gChapters);
    if (id === 'atl') { pulse(gNP); pulse(gBog); }
  }
  function pulse(g) {
    g.classList.remove('is-pulsing');
    g.getBoundingClientRect(); // restart the animation
    g.classList.add('is-pulsing');
    clearTimeout(g.pulseTimer);
    g.pulseTimer = setTimeout(() => g.classList.remove('is-pulsing'), 2600);
  }

  function render() {
    const pos = storyPos();
    updateTheme(pos, performance.now());
    const st = storyState(pos);
    lastPos = pos; lastSt = st;
    globeMode = st.globe;
    mapLive = st.map && st.mapAlpha > 0.5;
    const base = storyCamera(pos.id, pos.p);
    lastBase = base;
    if (globeMode) { user.lon = 0; }
    const [zMin, zMax] = zoomLimits(); user.zoom = clamp(user.zoom, zMin, zMax);
    const cam = finalCamera(base);
    lastCam = cam;

    stage.classList.toggle('is-off', !st.map);
    if (st.map) { drawMap(cam, st); applyCam(cam); updateOverlay(cam, st); }

    const endFade = clamp((window.scrollY + H - sourcesTop) / (H * 0.6));
    const os = orgState(pos, cam);
    if (os && pos.id === 'sdg') { const a = activeStep(); os.focus = a && a.dataset.focus !== 'all' ? a.dataset.focus : null; }
    else activeStep();
    renderOrg(os, endFade);

    document.body.classList.toggle('show-map-ui', st.mapUI);
    if (pos.id !== lastSceneId) { lastSceneId = pos.id; onSceneStart(pos.id); }
    document.body.classList.toggle('org-under', pos.id === 'sdg' || (pos.id === 'toSDG' && pos.p > 0.6));
    $('#map-credit').style.opacity = st.map ? st.mapAlpha : 0;
    if (hud) {
      hud.parentElement.style.opacity = st.map && pos.id !== 'hero' ? st.mapAlpha : 0;
      hud.textContent = `${Math.abs(cam.lat).toFixed(3)}° ${cam.lat >= 0 ? 'N' : 'S'}  ${Math.abs(wrap180(cam.lon)).toFixed(3)}° ${wrap180(cam.lon) <= 0 ? 'W' : 'E'}`;
    }
    positionPopup();
    updateNav();
    if (DEV) devPanel.textContent = `scene: ${pos.id}  p=${pos.p.toFixed(3)}\nscale: ${Math.round(cam.scale)}  center: ${cam.lon.toFixed(3)}, ${cam.lat.toFixed(3)}\nuser: ${user.lon.toFixed(3)}, ${user.lat.toFixed(3)}, z=${user.zoom.toFixed(2)}\n${wordInfo}`;
  }

  function tick(t) {
    const dt = Math.min(0.05, (t - lastTime) / 1000); lastTime = t;
    if (lastSt && lastSt.globe && !reduceMotion && t > autoPauseUntil && !drag && !pinch) {
      autoLon -= dt * (lastPos && lastPos.id === 'hero' ? 6 : 3.5);
      needRender = true;
    }
    if (needRender) { needRender = false; render(); }
    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', () => {
    const y = window.scrollY, d = Math.abs(y - lastScrollY);
    lastScrollY = y;
    if (d > 0) {
      const k = Math.exp(-d / 420);
      user.lon *= k; user.lat *= k; user.zoom *= k;
    }
    hideTip();
    needRender = true;
  }, { passive: true });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { layout(); measure(); needRender = true; }, 120);
  });
  if (window.ResizeObserver) new ResizeObserver(() => { measure(); needRender = true; }).observe($('#story'));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); needRender = true; });
  window.addEventListener('load', () => { measure(); needRender = true; });

  // boot
  buildLegends();
  wireLinks();
  wireChapterLinks();
  layout();
  measure();
  const urlTheme = (location.search.match(/[?&]theme=([\w-]+)/) || [])[1];
  setTheme(THEMES[urlTheme] ? urlTheme : SITE.theme);
  render();
  requestAnimationFrame(tick);

  // handy for debugging in the console
  window.__story = {
    get pos() { return lastPos; }, get cam() { return lastCam; }, get theme() { return theme && theme.name; }, get themeT() { return themeT; },
    user, scrollToScene, SC, render, chapters, nonprofits, setTheme, setNavOpen,
  };
})();
