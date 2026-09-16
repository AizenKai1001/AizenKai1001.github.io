# Project archive, research atlas and attribution validation

Validated September 16, 2026 through the existing production preview at port 4174.
The public GitHub Pages deployment was not changed.

## Coverage and public content

The project inventory was compared with the actual root directory names: **89
current directories, 89 inventory entries, zero unaccounted directories, zero
stale inventory names**. Worktrees, vendored repositories, backups, data folders,
and deployment copies are grouped rather than presented as independent projects.

The final public site contains **36 project records**, **16 research dossiers**,
the existing **three field notes**, and **126 distinct credited source URLs**.
There are 60 core HTML pages: the home and 404 pages, 36 project/experiment
details, 16 research details, three field notes, and three index pages. Legacy
service/bot URLs remain redirects. Bot service marketing stays retired.

Four final records came from the vault rather than current source directories:
the deleted physics-engine implementation, TryNum1's collaborative Unreal
prototype, the Weapon MM Combo integration, and the media-library workflow.
Their pages identify historical status and distinguish custom implementation
from collaborators, Epic's sample systems, external assets, and platform tools.

## Browser checks

| Check | Recorded result |
| --- | --- |
| Production build and static check | Passed: 60 core pages and 1,737 local links/assets/anchors; metadata, evidence values and published-output privacy checks passed |
| Full archive/research/credits suite | 8 passed, 0 failed; finished 05:17:49 UTC |
| Full expansion accessibility pass | 51 page/theme scans, 0 reported violations |
| Final four-record addition and index regression | 8 passed, 0 failed; finished 05:28:25 UTC |
| Final addition accessibility pass | 12 page/theme scans, 0 reported violations |
| Original-site smoke regression | 18 passed, 0 failed; finished 05:21:48 UTC |
| Original-site accessibility regression | 10 page scans, 0 reported violations |
| Existing visible-motion/autoplay regression | 6 passed, 0 failed; finished 05:23:10 UTC |
| Font-loaded visual captures | Desktop and 390/320px layouts inspected; no overflow or uncaught runtime errors in the capture reports |

The full expansion suite checked all 45 pages added in the first expansion.
The final targeted pass checked the four later project pages and affected indexes,
then repeated search/filter/sort/layout, source search, atlas keyboard controls,
dark/mobile layout, JavaScript-free content, and runtime-error checks against
the final 36-record archive. Repeated index/theme scans are not unique pages.

A final wording cleanup in the image-to-3D dossier retained its planning status
and existing layout. The production build and static checks were rerun after
that text-only edit; no scene or interactive behavior changed.

The project index supports multi-word search, category filters, A–Z sorting,
grid/list switching, URL state, and a useful empty state. The research and source
directories support independent lookup and clearing filters. The research atlas
updates a single visible panel and supports click and arrow-key selection.
The static HTML retains the entries and links when JavaScript is unavailable.

The original collection model files were not modified for this expansion. The
existing compositor test still verified motion after opening assembly, all three
models, frozen pixels after Pause, autoplay despite legacy saved pause, native
scroll transitions, reduced-motion opt-in, and mobile bounds.

Reports are in ignored `test-results/expansion/report-full.json`,
`test-results/expansion/report.json`, `test-results/smoke-report.json`, and
`test-results/visible-motion-report.json`. Captures are under
`test-results/expansion/`. The first tall element captures occasionally sampled a
page transition; subsequent viewport/layout inspection confirmed the skip link
was unfocused and positioned offscreen normally. No accessibility control was
hidden to alter the screenshots.

## Sources and authorship

The first bounded source review checked 115 distinct HTTPS links and recorded
110 reachable sources, two 404 responses, two publisher automation blocks, and
one timeout. Availability was checked separately from paper/repository identity.
The stale Manrope GitHub URL was replaced with its official font-family page.
Realm's anonymous public request returned 404, despite an earlier local Git query
succeeding; its public repository button was withheld rather than assuming that
local authenticated access established public availability.

The review corrected the Jiang/Litwin-Kumar paper title, the TwinProp paper label,
LoopLM's independent-reimplementation attribution, Clay Boan's WebGL/frontend
collaborator credits, and specific font designers. Added historical entries and
integration dependencies were checked against their primary sources separately.
This record does not claim every final external URL was refetched in a single
pass, or that publisher blocks imply broken sources.

Credits appear beside each project/dossier and in the source directory, with
links back to where they are referenced. The Three.js license accompanies the
static output in `notices.txt`. Fonts remain externally served; no font files
are copied or redistributed. Image versions, crops, and rights-holder notes are
recorded in `docs/asset-provenance.md`.

## Repeating validation

```powershell
npm ci
npm run build
npm run check
# Start the production preview in a separate terminal.
$env:BASE_URL='http://127.0.0.1:4174'
npm run test:expansion
npm run test:browser
npm run test:motion
node scripts/capture-expansion.mjs
```

`npm run check:sources` is optional network-based availability review, not a
build gate. Browser checks use installed Chrome; compositor comparison also
requires Python with Pillow. No experiment training, homelab service mutation,
external messaging, or live credentialed project action was performed for the
portfolio expansion. Automated viewport and axe checks are not physical-phone,
cross-browser, or screen-reader certification.
