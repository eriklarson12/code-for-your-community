/* =====================================================================
   COLOR THEMES
   Pick the default in js/content.js (theme: '...').
   Preview any theme by adding ?theme=NAME to the address, or ?themes to
   show a small switcher in the bottom-left corner.

   tone = 'dark' or 'light' (scrollbars, shadows)
   ui   = page colors (they become CSS custom properties: accentInk -> --accent-ink)
   map  = colors of the drawn map
   A theme with `blend` uses two other themes: `from` until the reader
   reaches `at` (0 to 1) in `scene`, then `to`.
   ===================================================================== */
window.THEMES = {

  /* Night sky while the story is global; the "lights come on" as the map
     dives into Georgia. Everything local (Atlanta, the clubs, the SDGs) is
     white, navy and orange. The switch happens when the reader passes 42%
     of the zoom into Atlanta and takes 1 second (instant with reduced motion);
     scrolling back up turns it back to night. */
  dusk: {
    label: 'Dusk to daylight',
    blend: { from: 'ember', to: 'daylight', scene: 'toATL', at: 0.42, duration: 1000 },
  },

  /* Deep navy with BoG orange as the action color and warm white text. */
  ember: {
    label: 'Night + BoG orange',
    tone: 'dark',
    ui: {
      bg: '#0B1A2B', surface: '#10253C', card: 'rgba(12,29,48,0.9)', shadow: 'rgba(0,0,0,0)',
      text: '#F6F0E6', muted: '#B8C2CC', faint: 'rgba(246,240,230,0.14)', line: 'rgba(248,156,68,0.45)',
      accent: '#F89C44', accentInk: '#1A1206', accentText: '#FFB46E',
      gold: '#B3A369', goldText: '#D9CB92', hl: '#FFC37A',
      chapter: '#F6F0E6', chapterStroke: '#0B1A2B', chapterInactive: '#6F7F8F',
      np: '#43C6B5', npStroke: '#0B1A2B', npHover: '#8FE3D8',
      halo: 'rgba(11,26,43,0.85)', place: 'rgba(246,240,230,0.6)',
      shieldBg: '#0B1A2B', shieldFg: '#F6F0E6', shieldStroke: 'rgba(246,240,230,0.7)',
      phBorder: 'rgba(248,156,68,0.55)', phBg: 'rgba(248,156,68,0.07)', phLabel: '#FFB46E',
      topbarA: 'rgba(11,26,43,0.92)', topbarB: 'rgba(11,26,43,0.55)', topbarC: 'rgba(11,26,43,0)',
      heroShadow: 'rgba(11,26,43,0.85)', triEdge: '#F89C44',
    },
    map: {
      space: '#0B1A2B', glow: 'rgba(255,170,90,0.30)',
      oceanHi: '#164672', ocean: '#0E2F51', oceanLo: '#081F38',
      land: '#1C3E61', landHi: '#265583', graticule: 'rgba(246,240,230,0.07)',
      coast: 'rgba(246,240,230,0.30)', borders: 'rgba(246,240,230,0.16)', states: 'rgba(246,240,230,0.30)', natBorder: 'rgba(246,240,230,0.50)',
      counties: 'rgba(246,240,230,0.10)', urban: 'rgba(255,190,120,0.07)', roadsNE: 'rgba(246,240,230,0.32)',
      hwCase: 'rgba(11,26,43,0.7)', hw: 'rgba(255,240,222,0.72)', hwState: 'rgba(255,240,222,0.42)', river: '#4C93D6',
      gtFill: 'rgba(179,163,105,0.36)', gtStroke: '#EAAA00', emoryFill: 'rgba(246,240,230,0.16)', emoryStroke: 'rgba(246,240,230,0.75)',
      gaTint: 'rgba(248,156,68,0.22)',
    },
  },

  /* White page, navy ink, BoG orange actions, a pale-blue and white map. */
  daylight: {
    label: 'Daylight (white)',
    tone: 'light',
    ui: {
      bg: '#FBFAF8', surface: '#FFFFFF', card: 'rgba(255,255,255,0.95)', shadow: 'rgba(19,38,59,0.10)',
      text: '#14263A', muted: '#5D6B79', faint: 'rgba(20,38,58,0.12)', line: 'rgba(20,38,58,0.22)',
      accent: '#F89C44', accentInk: '#14263A', accentText: '#A6500A',
      gold: '#B3A369', goldText: '#7A6A33', hl: '#E8851F',
      chapter: '#003057', chapterStroke: '#FFFFFF', chapterInactive: '#A7B1BB',
      np: '#0E8A86', npStroke: '#FFFFFF', npHover: '#16B3AD',
      halo: 'rgba(255,255,255,0.9)', place: 'rgba(20,38,58,0.55)',
      shieldBg: '#FFFFFF', shieldFg: '#14263A', shieldStroke: 'rgba(20,38,58,0.55)',
      phBorder: 'rgba(232,133,31,0.6)', phBg: 'rgba(248,156,68,0.08)', phLabel: '#A6500A',
      topbarA: 'rgba(251,250,248,0.94)', topbarB: 'rgba(251,250,248,0.6)', topbarC: 'rgba(251,250,248,0)',
      heroShadow: 'rgba(251,250,248,0.9)', triEdge: '#E8851F',
    },
    map: {
      space: '#FBFAF8', glow: 'rgba(130,175,220,0.28)',
      oceanHi: '#E7F1F8', ocean: '#D6E6F1', oceanLo: '#C5D9E8',
      land: '#F1EEE8', landHi: '#FFFFFF', graticule: 'rgba(20,38,58,0.06)',
      coast: 'rgba(20,38,58,0.30)', borders: 'rgba(20,38,58,0.16)', states: 'rgba(20,38,58,0.22)', natBorder: 'rgba(20,38,58,0.45)',
      counties: 'rgba(20,38,58,0.10)', urban: 'rgba(248,156,68,0.08)', roadsNE: 'rgba(20,38,58,0.30)',
      hwCase: 'rgba(255,255,255,1)', hw: 'rgba(95,108,122,0.85)', hwState: 'rgba(95,108,122,0.5)', river: '#7DB2DC',
      gtFill: 'rgba(179,163,105,0.38)', gtStroke: '#9C8541', emoryFill: 'rgba(20,38,58,0.06)', emoryStroke: 'rgba(20,38,58,0.5)',
      gaTint: 'rgba(248,156,68,0.18)',
    },
  },

  /* Warm cream paper instead of white: the friendliest of the light options.
     Same navy text and BoG orange as Daylight; sand-colored land on the map. */
  sunrise: {
    label: 'Sunrise (warm cream)',
    tone: 'light',
    ui: {
      bg: '#FFF6EC', surface: '#FFFDF9', card: 'rgba(255,253,249,0.96)', shadow: 'rgba(122,74,24,0.12)',
      text: '#1B2838', muted: '#6B6359', faint: 'rgba(27,40,56,0.12)', line: 'rgba(214,120,40,0.35)',
      accent: '#F89C44', accentInk: '#1B2838', accentText: '#B0540A',
      gold: '#B3A369', goldText: '#76662F', hl: '#E07A12',
      chapter: '#003057', chapterStroke: '#FFFDF9', chapterInactive: '#B9AFA3',
      np: '#0E8A86', npStroke: '#FFFDF9', npHover: '#16B3AD',
      halo: 'rgba(255,246,236,0.92)', place: 'rgba(27,40,56,0.55)',
      shieldBg: '#FFFDF9', shieldFg: '#1B2838', shieldStroke: 'rgba(27,40,56,0.5)',
      phBorder: 'rgba(224,122,18,0.6)', phBg: 'rgba(248,156,68,0.09)', phLabel: '#B0540A',
      topbarA: 'rgba(255,246,236,0.94)', topbarB: 'rgba(255,246,236,0.6)', topbarC: 'rgba(255,246,236,0)',
      heroShadow: 'rgba(255,246,236,0.9)', triEdge: '#E07A12',
    },
    map: {
      space: '#FFF6EC', glow: 'rgba(248,156,68,0.30)',
      oceanHi: '#E6EFF1', ocean: '#D3E2E8', oceanLo: '#BFD3DD',
      land: '#F5E8D6', landHi: '#FFFBF5', graticule: 'rgba(27,40,56,0.06)',
      coast: 'rgba(27,40,56,0.28)', borders: 'rgba(27,40,56,0.14)', states: 'rgba(27,40,56,0.20)', natBorder: 'rgba(27,40,56,0.42)',
      counties: 'rgba(27,40,56,0.09)', urban: 'rgba(248,156,68,0.10)', roadsNE: 'rgba(27,40,56,0.28)',
      hwCase: 'rgba(255,253,249,1)', hw: 'rgba(122,104,86,0.85)', hwState: 'rgba(122,104,86,0.5)', river: '#86B4D2',
      gtFill: 'rgba(179,163,105,0.40)', gtStroke: '#9C8541', emoryFill: 'rgba(27,40,56,0.06)', emoryStroke: 'rgba(27,40,56,0.5)',
      gaTint: 'rgba(248,156,68,0.20)',
    },
  },

  /* The first draft's colors: GT navy and Tech Gold. */
  classic: {
    label: 'Navy + gold (first draft)',
    tone: 'dark',
    ui: {
      bg: '#041628', surface: '#061C34', card: 'rgba(5,23,42,0.88)', shadow: 'rgba(0,0,0,0)',
      text: '#E3EAF1', muted: '#A3B6C9', faint: 'rgba(227,234,241,0.14)', line: 'rgba(179,163,105,0.42)',
      accent: '#B3A369', accentInk: '#041628', accentText: '#D9CB92',
      gold: '#B3A369', goldText: '#D9CB92', hl: '#EAAA00',
      chapter: '#B3A369', chapterStroke: '#041628', chapterInactive: '#6E8297',
      np: '#FFB088', npStroke: '#041628', npHover: '#FFD3BB',
      halo: 'rgba(4,22,40,0.85)', place: 'rgba(227,234,241,0.58)',
      shieldBg: '#041628', shieldFg: '#E3EAF1', shieldStroke: 'rgba(227,234,241,0.75)',
      phBorder: 'rgba(217,203,146,0.55)', phBg: 'rgba(179,163,105,0.07)', phLabel: '#D9CB92',
      topbarA: 'rgba(4,22,40,0.92)', topbarB: 'rgba(4,22,40,0.6)', topbarC: 'rgba(4,22,40,0)',
      heroShadow: 'rgba(4,22,40,0.85)', triEdge: '#B3A369',
    },
    map: {
      space: '#041628', glow: 'rgba(76,143,214,0.32)',
      oceanHi: '#12416F', ocean: '#0A2A4A', oceanLo: '#061D35',
      land: '#123A61', landHi: '#1C4C7B', graticule: 'rgba(227,234,241,0.08)',
      coast: 'rgba(227,234,241,0.32)', borders: 'rgba(227,234,241,0.16)', states: 'rgba(227,234,241,0.30)', natBorder: 'rgba(227,234,241,0.50)',
      counties: 'rgba(227,234,241,0.10)', urban: 'rgba(227,234,241,0.05)', roadsNE: 'rgba(227,234,241,0.32)',
      hwCase: 'rgba(4,22,40,0.7)', hw: 'rgba(227,234,241,0.62)', hwState: 'rgba(227,234,241,0.40)', river: '#3F80C2',
      gtFill: 'rgba(179,163,105,0.34)', gtStroke: '#EAAA00', emoryFill: 'rgba(227,234,241,0.16)', emoryStroke: 'rgba(227,234,241,0.75)',
      gaTint: 'rgba(179,163,105,0.20)',
    },
  },
};
