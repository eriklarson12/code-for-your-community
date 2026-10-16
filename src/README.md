# Code for Your Community: website draft

First draft of the LMC 3403 promotional website (Group 4). All page text is placeholder.
The point of this draft is the interactive, scroll-driven design.

## Open it

Double-click `index.html`. It runs offline from the folder with no install or build step.
Use Chrome, Edge, Firefox or Safari.

Add `?dev` to the end of the address (e.g. `index.html?dev`) to show a small panel with:
- the current scroll scene
- how many words are written so far
- the total word budget of the remaining placeholders

The assignment asks for 1,200 to 2,000 words. The placeholders add up to about 1,500, plus headings,
which leaves some room for pop-up text.

## What the scroll does

| Scroll position | What happens | Text that goes here (index.html) |
|---|---|---|
| Hero | Spinning globe with the title | Tagline |
| The issue | Globe keeps turning, notes on the left | 3 cards: issue, evidence (stat tiles), opportunity |
| Transition | Globe turns to North America and zooms in | 1 bridge sentence |
| Hack4Impact | North America map, 22 chapter squares, click for pop-ups | 2 cards + status filter + chapter list |
| Transition | Zoom from North America into Atlanta (with the `dusk` theme, the page switches from night to day here) | 1 bridge sentence |
| Atlanta | Interstates, river, GT + Emory campuses, Bits of Good badge, 10 nonprofit pins | 2 cards + category filter + partner list |
| Transition | Zoom into campus; the map fades and the BoG badge becomes the logo | none |
| Bits of Good | Logo pinned on top, faint triangle behind | what BoG does, 4 roles, video slot, 3 calls to action |
| Transition | Triangle turns; Epic Intentions comes to the top | 1 bridge sentence |
| Epic Intentions | Logo pinned on top | what they do, who can join, how it complements BoG, 2 links |
| Transition | Triangle turns; Consult Your Community comes to the top | none |
| CYC | Logo pinned on top | same structure as Epic Intentions |
| Transition | All three logos zoom out in the middle; the GT logo, a gold ring and SDG 8/11 appear | none |
| SDGs and GT | Diagram moves beside the text; the matching part lights up per card | SDG 8, SDG 11, Sustainability Next, closing + buttons |
| Sources | Normal page | Your research report's sources are already listed |

The square buttons on the right edge show where you are; hover over one to see the section's name.
The **Sections** button (top right) opens the same list with every section's full name; click outside
it or press Esc to close it.

Readers can still use the maps at any point:
- drag to move or rotate
- pinch, or hold Ctrl/⌘ while scrolling, to zoom (a plain scroll always scrolls the page)
- use the + / − / Recenter buttons
- click any square or dot

Anything a reader moves eases back to the story view as they keep scrolling.

## Where to edit

| To change... | Edit |
|---|---|
| Section text | `index.html`. Replace each `<div class="ph" data-words="N">…</div>` with your own `<p>` text. N is the suggested word count. |
| Map pop-up text (chapter stories, nonprofit descriptions, BoG summary, SDG pop-ups) | `js/content.js`. Any text in `[brackets]` shows as a dashed placeholder. Set a story to `null` to hide it. |
| Button links (apply, propose a project, idea form) | `js/content.js` → `links`. Buttons with a dashed "link TBD" badge still need a URL. |
| Logos | Files are in `assets/logos/` (sources in `LOGO-SOURCES.txt`). Paths, disc colors and logo size: `js/content.js` → `orgs` and `gtLogo`. |
| Where the GT logo sits | `js/content.js` → `gtLogo.placement`: `'center'` (full color inside the triangle, the default) or `'behind'` (large and faint behind it). |
| Nonprofit pin locations | `js/content.js` → `atlanta.nonprofits[].at` as `[latitude, longitude]`. They're placeholders now, and each pop-up says "Pin location is approximate". |
| Demo video | `index.html`: search for `video-slot` and paste a YouTube/Vimeo `<iframe>` (there's a commented example). |
| Color theme | `js/content.js` → `theme` (`dusk`, `ember`, `daylight`, `sunrise`, `classic`). The colors themselves are in `js/themes.js`. |
| The "Colors" menu | Draft only, so the group can compare themes live. Turn it off with `themePicker: false` in `js/content.js`. |
| Fonts | Archivo, embedded in `css/font.css`. |
| How long each animation lasts | `index.html`: the `data-len` number on each transition section, as % of screen height. Bigger means slower. |

Leave the `data-scene` names in `index.html` as they are; `js/app.js` uses them.

## Files

```
index.html          page structure + all placeholder text
css/style.css       styles
js/content.js       chapters, nonprofits, links, logos, theme, pop-up text  ← edit this
js/themes.js        the color themes
js/app.js           scroll + map + triangle engine (D3)
js/geo-data.js      generated map data (don't edit)
vendor/             D3 v7.9 and topojson-client (bundled so the site works offline)
css/font.css        Archivo variable font, embedded (SIL Open Font License in assets/fonts)
assets/logos/       BoG, Epic Intentions, CYC and GT logo files (+ LOGO-SOURCES.txt)
```

## Before you submit

- **Hosting.** The scroll effects need a real web host such as GitHub Pages or Netlify (drag-and-drop the folder).
  If the class requires Wix or Google Sites, check first: an embedded iframe of this page won't scroll-drive properly.
- **Facts to verify.**
  - Chapter status and numbers were copied from hack4impact.org on Oct. 16, 2026. Re-check them close to the deadline.
  - The 10 nonprofits come from bitsofgood.org/projects. Their pin locations are approximate.
- **Logos.** The group reports permission to use the GT and club logos. Two of GT's published logo rules
  (brand.gatech.edu) are worth checking with whoever approved the project:
  - keep contrast with the background and don't alter the logo. That's why the default shows the GT logo at full color
    with nothing on top of it (`placement: 'center'`). The `'behind'` option fades it, which those rules may not allow.
  - the interlocking GT shouldn't be used by itself for organization purposes.
  - The UN publishes rules for using the SDG icons. The draft uses plain colored squares in the official SDG colors.
- **Map credit.** Keep the map credit line, "© OpenStreetMap contributors". The highways and campus outlines come from OpenStreetMap.
