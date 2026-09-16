# Jancarlos Espinal — AI experiments & research

A personal research portfolio built around non-neural learning, embodied simulation, neuroevolution, and controlled experiments. The expanded notebook contains 39 project records (including the six featured experiments), 16 research dossiers, three field notes, a homelab and hardware notebook, an interactive research atlas, and a searchable directory of original sources and creators.

The published site is a static build. It does not call the homelab, load bot statistics, send visitor prompts to an AI endpoint, or require a backend. Contact buttons open an email application or the public GitHub profile.

## Local preview

Use Node.js 22 or later. The pinned Vite 6.4.3 release supports the existing local Node 22.11 installation.

```powershell
npm ci
npm run dev
```

Open `http://127.0.0.1:4173`. Stop with Ctrl+C before starting a production preview on the same port.

```powershell
npm run build
npm run check
npm run preview
```

The build output is `dist/`. The initial build warning about the Three.js chunk exceeding 500 kB refers to its uncompressed minified size. That chunk is loaded asynchronously on the homepage; experiment and notebook pages do not initialize or download the scene. Do not claim a frame rate or device capability from bundle size alone.

## Editing the site

| File | Purpose |
| --- | --- |
| `src/content.js` | Project descriptions, results, limitations, and notebook entries |
| `src/catalog.js`, `src/archive-additions.js` | Wider project archive and historical projects verified from the vault |
| `src/research.js` | Sixteen research dossiers and their primary-source references |
| `src/credits.js` | Featured-project lineage, website software, typography, and creator credits |
| `src/lab-projects.js`, `scripts/render-lab.mjs` | Homelab platform, host observability and Raspberry Pi Pico project stories plus the dedicated lab page |
| `src/lab-visuals.js`, `src/lab.css` | Original animated concept illustrations; no private topology or live lab data |
| `src/explorer.js`, `src/atlas.css` | Search, filters, layout switching, keyboard-accessible atlas, and archive design |
| `site/home.html` | Homepage layout and copy |
| `src/style.css` | Shared desktop/mobile design |
| `src/experience.css` | Light/dark palettes, motion styling, and responsive theme controls |
| `src/theme-init.js`, `src/theme.js` | Theme before first paint, stored choice, and system preference handling |
| `src/motion.js` | Section entrances, filter/chart animations, scroll progress, and global motion preference |
| `src/main.js` | Navigation, filters, scene controls, and fallback behavior |
| `src/scene.js` | Shared renderer, materials, lighting, transitions, and scene lifecycle |
| `src/models/` | Original neuron, walking inspection robot, and layered processor geometry/animation |
| `src/journey.js` | Native-scroll chapter selection and the sticky scene viewpoint |
| `scripts/render-pages.mjs` | Generates the real HTML pages, metadata, redirects, and sitemap |
| `scripts/render-expansion.mjs` | Generates project/research/credit indexes and detail pages, with shared attribution blocks |
| `public/media/` | Optimized captures and original scene poster |
| `public/evidence/` | Compact selected numerical experiment results |
| `docs/project-evidence.md` | Internal provenance for the portfolio copy |
| `docs/asset-provenance.md` | Image origins, attribution, and scope |
| `docs/project-inventory.md`, `docs/research-inventory.md` | Coverage and source provenance, including grouped worktrees and excluded private/support material |

Edit the source template/data rather than generated root, experiment, or note HTML. Run `npm run prepare:pages` after content edits; `dev` and `build` do this on startup. No source project or research dataset needs to be present to build the website.

The wider archive is at `/projects/`, research dossiers at `/research/`, and acknowledgments at `/credits/`. Search/filter/sort/layout state is reflected in the URL. The homepage research atlas can be operated by mouse, touch, or arrow keys; the underlying links and all index content remain available without JavaScript. Public records exclude private workspace paths, service coordinates, account data, and secrets. Historical projects are clearly labeled, including the deleted physics-engine implementation.

The `/lab/` page connects self-hosting, automation, host-network observability and Pico microcontroller audio work. Public notes retain implementation boundaries and upstream credit while omitting operational identifiers. `npm run test:lab` checks the new pages, source links within the site, motion controls, layout and accessibility. Before release, `npm run check:publication` scans the source, built output and outgoing commit snapshots for private information. Internal evidence-path notes are kept outside the published tree.

Every source has a relationship note: a method being studied, an upstream implementation being extended, a library being used, or a visual reference. Typography is linked to official font pages rather than copied into the repository. `public/notices.txt` includes the Three.js license with the static output. Project captures retain their recorded-version and asset-provenance captions.

Run `npm run test:expansion` against the production preview to check the new indexes, filters, sorting, source navigation, atlas keyboard controls, detail routes, mobile/no-JS behavior and accessibility. `npm run check:sources` is a bounded public-link review instrument; publisher blocks or network errors are recorded separately from stale URLs and do not fail the static website build.

`scripts/export-evidence.mjs` is an optional maintainer tool for intentionally refreshing the public numerical summaries from the local experiment files. The exported JSON is committed, so CI does not need access to those local sources. Review any new export for private information before publishing it.

## Interaction and accessibility

The homepage's Learning, Simulation, and Systems controls change among three original models: an organic branching neuron, a six-legged inspection robot in a miniature landscape, and an exploded processor with detailed circuit layers. Each has its own animated mechanism and geometry in `src/models/`. One renderer owns the materials, lighting, lifecycle, and transitions. On desktop the stage stays visible beside three research chapters; native scrolling changes the study and its viewpoint. Smaller screens use a compact layout with the same animated models and manual controls.

Dragging rotates the view; wheel and touch scrolling remain native. The scene and page motion share Play/Pause controls and suspend unnecessary work offscreen or when the document is hidden. The active animation clock stops while paused instead of jumping forward on resume. Light and dark captures provide fallbacks when WebGL is unavailable.

Normal visits autoplay without a special URL or Play click. Pause applies only to the current page; a new visit or reload restores autoplay. An older `research-motion=paused` value is retired on startup. A device's reduced-motion preference still defaults to a static model unless the visitor explicitly opts into Play, which may be remembered. **Use device setting** clears that opt-in. The compatibility `?motion=play` link remains supported but is not needed for ordinary autoplay. Section reveals and chart transitions preserve recorded data; measured numbers are never animated through invented values.

The header theme button switches light/dark on every page and remembers the choice as `research-theme`. It also retints scene materials and lighting. Storage access is optional and guarded. Updated model references and source attribution are recorded in `docs/model-references.md`.

The sculpture is an artistic illustration, not a live neural simulation, model, or measurement. The experiment captures and results below it are labeled separately. Content, navigation, and contact links remain present without JavaScript; filters and scene controls progressively enhance that content.

Run the browser smoke checks while the preview is running:

```powershell
npm run test:browser
node scripts/check-experience.mjs
node scripts/check-visible-motion.mjs
node scripts/capture-collection.mjs
```

The tests use installed Chrome through Playwright, record responsive screenshots and axe reports under ignored `test-results/`, and block external requests. To use a different preview port, set `BASE_URL` before running them. Font-loaded visual captures are made separately by `scripts/capture-preview.mjs` and `scripts/capture-experience.mjs`, which visit only the portfolio but permit its Google Fonts stylesheets. The experience capture includes both themes and all three refined models.

## Publishing to the existing GitHub Pages site

The repository includes `.github/workflows/pages.yml`. It builds and validates the static output, then deploys only the `main` branch. The redesign branch does not deploy. In GitHub repository **Settings → Pages**, use **GitHub Actions** as the build source when this version is approved for publication. The site uses Vite `base: '/'` for the `AizenKai1001.github.io` user site.

The root source HTML is not a substitute for the built `dist` directory: the source references modules that Vite packages during the build. Do not merge while leaving Pages configured to serve the repository root as unbuilt files.

Legacy `/ai/`, `/website/`, `/discord/`, and bot-project links redirect to relevant sections of the research portfolio. The old bot/chat implementation is removed from the new source and public output. This does not revoke previously exposed credentials or remove them from existing Git history; that is a separate backend/repository action.

Deployment approach: [Vite's official GitHub Pages guide](https://vite.dev/guide/static-deploy#github-pages), checked September 15, 2026. The workflow pins the action revisions shown in that guide rather than running a third-party deployment service.

## Research scope and attribution

Distinction, ForgeLab, EvoForge, Plasticity Bench, and ForgeGrad are presented with their implementation and measurement boundaries. The portfolio does not label a narrow synthetic result as general intelligence, memorization as general language ability, or changed weights as successful learning.

DOOMFLY is explicitly attributed to the [upstream `nftechie/doomfly` project](https://github.com/nftechie/doomfly); the case study describes experimental work around it, not sole authorship of upstream code or datasets. Most research code remains local, and no unverified public source/demo links have been invented.

The related [loss-of-plasticity paper](https://www.nature.com/articles/s41586-024-07711-7) is linked for context; the local Plasticity Bench is explicitly described as a smaller, different experiment, not a replication at the paper's scale.
