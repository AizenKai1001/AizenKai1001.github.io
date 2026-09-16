# Research collection and autoplay validation

**Latest expansion:** the subsequent project/research/credits expansion is documented in `docs/expansion-validation.md`. The model/autoplay results below are retained as the earlier collection baseline, not the final site page count.

Validated September 16, 2026 against the production `dist` build served by the
existing loopback preview on port 4174. This record supersedes the earlier
pedestal/kinetic-model validation. The latest browser suite finished at
2026-09-16 04:49:23 UTC.

## Results

| Check | Result |
| --- | --- |
| Production build | Passed |
| Static content | 11 pages: homepage, six experiments, three notes, 404 |
| Local links/assets/anchors | 195 checked; all resolve |
| Published-output scan | No private LAN paths, local workspace paths, retired webhook/CORS integrations or credential assignment patterns found |
| Evidence data | Distinction counts and the three-condition/400-task Plasticity chart match the committed public exports |
| Visible motion and autoplay suite | 6 passed, 0 failed |
| Scene lifecycle suite | 7 passed, 0 failed |
| Theme and motion suite | 11 passed, 0 failed |
| General browser suite | 18 passed, 0 failed |
| Accessibility scans | 20 page scans across light/dark themes, 0 reported axe violations |
| Visual inspection | All three replacement models captured in both themes; 390/320px layouts have no overflow; no uncaught page errors |

## Autoplay and visible output

The main compositor test opens the plain homepage, with no playback query and no
Play click. It waits for at least two seconds of active animation time, then
compares actual canvas PNG screenshots taken two seconds apart. The pointer is
parked away from the model. Direct WebGL readback is not used.

| Model | Whole-canvas pixels changing by at least 10 RGB levels |
| --- | --- |
| Organic neuron / Learning | 10.13% |
| Inspection robot / Simulation | 3.11% |
| Layered processor / Systems | 3.55% |
| Explicitly paused model | 0 pixels; animation clock delta 0 |

The acceptance gate is at least 2% changed pixels when playing and no more than
0.1% when paused. These short measurements establish visible movement, not a
visual-quality rating or a sustained frame-rate result.

An additional case seeds the legacy `research-motion=paused` storage value.
The plain homepage removes that old value and autoplays. Pausing the current
page produces stable pixels; reloading restores autoplay and changing pixels.
Device reduced-motion still starts static unless the visitor has explicitly
chosen Play. The suite verifies that opt-in, compatibility playback query,
restoring the device setting, and native-scroll chapter progression.

## Models and lifecycle

The models are separate original factories in `src/models/`, with one shared
renderer, material palette, light rig, and lifecycle in `src/scene.js`. The neuron
uses tapered curve geometry and instanced terminals/signals; the robot uses a
terrain-following articulated gait; the processor has board layers, traces,
fasteners, cooling parts, and a repeatable separation cycle.

Source-level geometry checks verified outward neuron tube triangles, upward
terrain normals, outward terrain skirts, visible board traces above their backing
surface, and foot-pad footprints within the landscape during a sampled patrol.
The browser suite verifies one canvas, native vertical touch behavior, rapid study
switching, transition settling, explicit pause, offscreen suspension, and changing
theme during WebGL context loss followed by recovery.

Light/dark model captures and phone-width screenshots were reviewed. The public
fallback posters and social image were regenerated from the replacement models.
The capture script allows the actual Google Fonts requests; the broader regression
suites block external requests and also exercise fallback-font layouts.

## Repeating the checks

```powershell
npm ci
npm run build
npm run check
# Start the production preview in a separate terminal.
npm run preview
# Use its port, or the existing review server on port 4174:
$env:BASE_URL='http://127.0.0.1:4174'
npm run test:motion
node scripts/check-models.mjs
npm run test:experience
npm run test:browser
node scripts/capture-collection.mjs
```

Reports and PNG pairs live under ignored `test-results/`. The visible-motion
comparison needs Python and Pillow; the static website build does not. Each
browser script uses a bounded isolated Chrome lifecycle and closes it in `finally`.

## Limits

Testing used Chrome with desktop and phone-sized viewports, not a physical phone,
Safari, Firefox, or a screen reader. Axe is not a complete accessibility audit.
The Three.js chunk produces Vite's usual size warning: approximately 596 kB
minified and 151 kB gzip. It is asynchronously loaded only on the homepage; no new
dependency was installed for the model revision.

The displayed models are illustrations, not the research systems running in the
visitor's browser. Existing scientific results were preserved; training and
evolution experiments were not rerun. No contact message was sent, no user browser
profile was accessed, and the public GitHub Pages deployment was not changed.
