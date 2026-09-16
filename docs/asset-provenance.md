# Visual and evidence provenance

The homepage uses original procedural graphics and selected real project captures. Reference websites informed the design vocabulary; their branded artwork, splats, textures, models, and page code were not copied into this site.

| Public asset | Origin and treatment | Display meaning |
| --- | --- | --- |
| `media/research-study.webp` | Captured from `src/models/learning.js` through this repository's shared `src/scene.js` renderer and homepage. Replaced in the autoplay/model revision and compressed with Pillow. | Original decorative neuron sculpture; not an active experiment or biological simulation. |
| `media/research-study-dark.webp` | The same replacement neuron rendered with its authored dark-theme materials and lighting. Compressed with Pillow. | Static dark-theme fallback; not an experiment result. |
| `media/social-preview.jpg` | Cropped from the new portfolio's rendered desktop homepage. | Link-preview image of this portfolio. |
| `media/realmforge-editor.webp` | Cropped from `realmforge/docs/realmforge_shadows.png`, excluding the console and local workspace paths; resized and compressed. | Recorded editor/renderer view; a project capture rather than a live embedded engine. |
| `media/veilborn-prototype.webp` | Resized from `VeilbornDevelopment/Artifacts/third-person.png`. The first-playable blueprint identifies original procedural meshes/primitives for this scene. | Recorded compact Unity prototype, not finished game art or a new runtime test. |
| Realm project illustration | Original procedural category illustration from the page builder. | An interface concept. The private library screenshot is excluded from publication because it includes personal viewing/progress data. |
| `favicon.svg` | Original JE letterform mark written for the new site. | Portfolio identity. |
| `media/distinction.webp` | Top portion of `distinction-ai/evidence/dashboard-desktop.png`, preserved as a cropped record and compressed to WebP. | A recorded prototype dashboard at 350 experiences. Its periodic validation snapshot differs from the separately reported frozen benchmark. |
| `media/distinction-full.webp` | The full same recorded dashboard, compressed to WebP. | Uncropped visual evidence, accessible from the experiment page. |
| `media/doomfly.webp` | Converted from `doomfly/doom-ui/public/first-frame.jpg`. The original is an upstream DOOMFLY ViZDoom frame. | A credited game-frame illustration of the experiment environment, not a capture of the locally improved spectator interface. |
| `evidence/distinction.json` | Selected numeric fields exported from recorded `benchmark.json` and `controls.json`. | Compact project evidence with task scope, controls, source basenames, and dates. |
| `evidence/plasticity.json` | Selected numeric fields from `results-long.json`. | Exact three-condition, 400-task Adam/permuted run. |

The ForgeLab `0 / 12` visual is an HTML presentation of the recorded corrected walking verdict. ForgeLab has no renderer; the site does not invent a screenshot. Plasticity bars show rounded values from the public numerical export, checked during the build validation.

The typography uses Google Fonts (Manrope, Instrument Serif, DM Mono) with system fallbacks. No font files are copied into this repository. All page content and interactions remain usable when those requests fail.

The three research collection models are original procedural meshes in
`src/models/learning.js`, `simulation.js`, and `systems.js`. Curves, limbs, board
layers, fasteners, terrain, and related animation are generated locally. They use
the installed Three.js library and its geometry helpers, with no downloaded art
assets. The robot's walking cycle and neuron signals are illustrative animation,
not displayed results of the learning projects. Additional creator references and
their inspection limits are documented in `model-references.md`.

DOOMFLY attribution: https://github.com/nftechie/doomfly. Its source screenshot contains ViZDoom/DOOM artwork and is used here to identify and discuss that project; the portfolio does not claim authorship or relicensing of that artwork. Do not present the screenshot as a new original research image or a measured performance result.
