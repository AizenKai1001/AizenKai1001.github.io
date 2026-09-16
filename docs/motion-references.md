# Motion references for the portfolio iteration

Historical record of the kinetic-pedestal iteration. The subsequent replacement
model collection and updated autoplay behavior are documented in
`model-references.md` and the current `validation.md`. In particular, saved pauses
no longer suppress playback on a new ordinary visit; that older acceptance rule
below has been superseded.

This note records motion-system references and the specific principles worth borrowing for the research portfolio. It is not an art-direction copy sheet: no model, composition, texture, scene, or branded visual should be reproduced from these projects.

## Current portfolio diagnosis

Production preview checked at `http://127.0.0.1:4174/` in a fresh isolated Chrome context with default browser media settings and empty storage.

- `prefers-reduced-motion: reduce` was `false`.
- `prefers-color-scheme: dark` was `false`.
- `research-theme` and `research-motion` were both absent from localStorage.
- The page initialized as `data-theme="light"` and `data-motion="full"`.
- `window.__researchScene` reported `ready`, available, unpaused, and rendering.
- An initial `drawImage/getImageData` readback appeared to show zero change, but that result was discarded because the WebGL renderer does not preserve its drawing buffer by default; reading it after frame presentation can return a cleared/stale buffer.
- A corrected **Playwright compositor screenshot** comparison of the actual canvas, 2.2 seconds apart, changed **36,047 / 343,252 pixels** at an RGB-channel threshold of 10 (**10.50%**). Mean RGB absolute delta was `7.61`.
- After explicitly pausing and allowing the scene to settle, the same compositor method found **0 pixels** changed at that threshold over another 2.2-second interval (mean RGB absolute delta `0.02`).

In this fresh isolated context, the production scene did contain measurable ambient motion, so a stopped render loop was not reproduced there. That does **not** establish what happened in the user's original browser/profile, which was deliberately not inspected or modified. The result still supports treating perceptibility and choreography as first-class acceptance criteria. Future acceptance tests should continue using displayed PNG pixels, not RAF counters or direct WebGL framebuffer readback.

## 1. Bruno Simon — Folio 2025

Primary references:

- https://bruno-simon.com
- https://github.com/brunosimon/folio-2025

What the project demonstrates:

- The portfolio is an inhabited 3D world rather than a static hero render. The visitor drives through it, moves the camera, jumps, interacts, and can trigger world systems directly.
- The public repository documents a real ordered game loop: inputs, pre-physics, physics, post-physics player/vehicle state, view, day/year cycles, weather, lighting, world effects, rendering, and monitoring.
- Motion is therefore stateful and systemic. Several things can be changing at once for different reasons: player movement, physics, environment cycles, wind/weather, foliage, trails, water, lighting, and camera state.
- The project exposes quality/performance controls and supports multiple input types rather than assuming desktop mouse-only interaction.

Useful principle for this portfolio:

**Make the research scene feel continuously inhabited.** A user should be able to notice motion without hunting for it: traveling signals, agents traversing terrain, mechanical parts cycling, subtle camera response, and world-state changes should produce visible pixel movement even when the user is not dragging the model. Interaction should add a second layer of motion instead of being the only source of it.

What not to copy:

- Do not reproduce the car-world concept, controls, assets, environment layout, secret/achievement design, or playful game aesthetic. The transferable idea is the continuous simulation loop and interactive world state.

## 2. Clay Boan / Codrops — The Underdog's Crown

Primary reference:

- https://tympanus.net/codrops/2025/10/14/the-underdogs-crown-clay-boans-3d-playground-of-design-motion-and-gsap-magic/

Important implementation ideas described in the case study:

- The site uses **one WebGL canvas** that is moved/reused across page sections instead of spinning up independent renderers for each visual.
- Three.js is paired with real-time physical materials, dynamic lighting, post-processing, and device-aware quality adjustments.
- GSAP is used as a choreography layer so typography, DOM, and WebGL motion can share timing rather than behaving like unrelated effects.
- The design deliberately preserves tactile imperfections and material character instead of making every surface look generically glossy.

Useful principle for this portfolio:

**Treat scroll as a timeline through one continuous scene.** A sticky research hero can retain the same canvas while scroll progress changes camera framing, focus, mode, or component pose. That creates an obvious sense of progression without replacing the portfolio's research-instrument visual language.

The important bar is perceptibility: a section transition should materially change silhouette, camera, lighting, spatial depth, or animated state—not just update a caption while the 3D image appears frozen.

What not to copy:

- Do not reproduce Clay Boan's clay models, personal symbols, material identity, layouts, typography, or specific GSAP sequences. The transferable ideas are single-canvas continuity, coordinated scroll timelines, real-time material response, and device-aware motion quality.

## 3. Lusion — Oryzo AI

Primary references:

- https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics
- https://lusion.co/projects/oryzo_ai/

What the project demonstrates:

- Oryzo is organized around deliberately staged product moments rather than a single always-identical render.
- Lusion describes building hero scenes and motion studies first, then deciding how to carry the required visual fidelity into an interactive web environment.
- The project uses purposeful physical motion—rigged hand movement, simulated flexible packaging, tearing, particles, and tightly controlled shot timing—to make the product feel tactile.
- Their own write-up emphasizes restraint: later sequences rely on timing, composition, and controlled motion rather than adding technical effects for their own sake.

Useful principle for this portfolio:

**Use choreographed research “beats.”** The three study modes can have small staged sequences that visibly communicate their meaning:

- Learning: signals propagate across branches, a counterexample/revision moment causes a local structural response, then the system settles.
- Simulation: agents move across terrain, environmental markers sweep or pulse, and the camera reveals spatial layers.
- Systems: modules sequence through a clear runtime cycle—input, transform, memory/state, output—using restrained mechanical motion and light cues.

These should read like short product demonstrations, not random perpetual bobbing.

What not to copy:

- Do not reproduce Oryzo's coaster, desk scene, hands, packaging, Gaussian-splat presentation, or campaign art. The transferable idea is controlled staging: motion has a beginning, a readable action, and a settled state.

## Combined motion direction for the research portfolio

The strongest synthesis for this site is:

1. **Continuous ambient life** from Bruno Simon: enough ongoing scene-state motion that the canvas never feels like a still image when motion is enabled.
2. **Scroll-driven scene choreography** from the Clay Boan case study: keep one canvas/sticky hero and let native scrolling move the viewpoint and advance studies.
3. **Staged, meaningful beats** from Lusion: each study should perform a short, legible action rather than only oscillate.

### Motion acceptance criteria

The next implementation should be verifiable from rendered output, not implementation intent:

- With motion enabled, compositor screenshots of **all three modes** two seconds apart should change at least **2% of the whole canvas** at a per-channel RGB threshold of 10. This is deliberately much stricter than merely seeing the render counter advance or a few tiny signal dots move.
- Pausing must make those compositor differences collapse below **0.1%** after any in-flight transition settles, and the scene's reported animation time must stop advancing.
- Native scroll through the sticky hero must visibly change the viewpoint and advance/change the active study.
- A user preference can still default to static when the OS requests reduced motion or the site has a saved paused state, but an explicit **Play** action should permit motion for the current visit when that is the intended UI contract.
- Dark mode and mobile must preserve the same visible motion semantics without horizontal overflow or scroll trapping.
- Touch remains vertical-scroll safe; animation should never require hijacking native page scrolling.

## Source review note

These references were used to establish a quality/motion bar and interaction patterns only. No new artwork or branded visual treatment is intended to be copied into the portfolio.

The public reference pages were also opened in one isolated browser session for visual inspection only. No forms, messages, account actions, profile reuse, or external writes were performed.

## Final rebuilt scene check — September 16, 2026

After the contour correction and the strengthened ongoing-motion gate (wait for animationTime >= 2.0 before the first sample), the production compositor suite passed 6/6 at 04:25:07 UTC. Learning changed 11.54% of canvas pixels, Simulation 9.67%, and Systems 13.82% at the per-channel threshold of 10. The explicitly paused pair changed zero pixels at that threshold and its active clock did not advance. These are observations of the final local preview, not claims about arbitrary visitor devices. See `docs/validation.md` for the complete scope.

## Production verification — build `55b7e2`, 2026-09-16

The stable production build then served at `http://127.0.0.1:4174/` was checked with `scripts/check-visible-motion.mjs` using Playwright compositor screenshots of the canvas and Pillow pixel comparison. That run passed all six focused checks. A later source-only contour polish was not included in these particular measurements, so the next rebuilt production run should be treated as the final confirmation.

- Learning / intelligence mode: **74,809 / 394,940 pixels changed (18.94%)** over the measured interval.
- Simulation / worlds mode: **40,230 / 394,940 pixels changed (10.19%)**.
- Systems mode: **47,846 / 394,940 pixels changed (12.11%)**.
- The settled paused systems scene changed **0 pixels** at the RGB threshold and reported **0.000 s** animation-time advance.
- OS reduced-motion default stayed static (**0 pixels changed**, animation time stayed at zero), while explicit Play changed **52,531 pixels (13.30%)** and advanced animation time.
- A stored `research-motion=paused` state stayed static until explicit Play; `?motion=play` also opted in under OS reduced motion, persisted the choice, animated, and removed the query parameter.
- Native desktop scrolling changed the canvas viewpoint by **68,613 pixels (17.37%)** and advanced the sticky journey through Learning → Simulation → Systems.
- Dark layouts at **390 px** and **320 px** had zero horizontal overflow.

Evidence PNG pairs are retained under `test-results/visible-motion/`; the machine-readable result is `test-results/visible-motion-report.json`.
