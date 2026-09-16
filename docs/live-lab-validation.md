# Live lab notebook and widget validation

## Evidence boundary

The September 16, 2026 review collected a bounded, read-only snapshot of
container states, system/user service states, timers, active Conky configurations,
and n8n workflow metadata. A second read compared active widget source with the
older local copies. Raw inventories and configuration material are retained only
in ignored local evidence, not in the public repository or website output.

`src/lab-systems.js` records the public selection by software role and observation
date. It omits instance IDs, image versions, private addresses, machine/account
identifiers, access routes, secret values, storage locations and actual readings.
It is an editorial snapshot, not an infrastructure status API. Running means an
observed process/container state; it does not imply an end-to-end functional test.

## Widget coverage

The eight observed Conky processes are grouped into six active study families:
system/service information, network attribution, application status/logs, quota
freshness, clock/weather and media-library/capacity. Four further studies cover
stored resource rings, training telemetry, game-server panels and decorative
Lua/Cairo effects. Their states are explicitly distinct from the active set.

The active media helper differs from the older local copy: it reads aggregate
library statistics and filesystem capacity, with no transfer-client adapter.
The published study follows that current source. The radar's fixed blips and
Matrix-style glyph motion are decorative, not observations of devices or traffic.

Public previews are original HTML/CSS/SVG schematics. They do not display real
quota percentages, media titles, logs, peer labels, player details or device data.
Animation illustrates the presentation mechanism, not a measured result.

## Validation

| Check | Result |
| --- | --- |
| Production build | Passed |
| Static content | 65 core pages; 2,027 local links/assets/anchors resolve |
| Widget/system behavior suite | 7 passed, 0 failed |
| Accessibility | 18 page/theme/viewport scans, zero reported axe violations |
| Responsive layouts | 1440, 390 and 320 pixels tested in light and dark themes |
| Remote connections from the public interface | No non-font external requests were attempted in the browser checks |
| Existing homepage scene | Initializes one canvas and advances the autoplay clock |

The behavior suite exercises all six system filters, the stopped-workload
disclosure, all ten widget selections and their source blocks, keyboard selection,
reload/hash persistence, deep links into source sections, unknown fragments,
decorative motion and Pause, reduced motion, JavaScript-free reading and page
errors. The initial harness incorrectly required an HTTP response from a
same-document fragment navigation; that harness assumption was fixed before
the successful run. It was not an application failure.

Rendered desktop and phone captures were inspected. The reports and images stay
under ignored `test-results/observatory/`. These checks do not certify other
browsers, physical devices, screen-reader behavior or the functionality of the
underlying private services.

New upstream references were reviewed separately from the existing source
corpus. Canonical repository targets are used for Seerr and Pelican, while the
runtime label still reflects the inspected Jellyseerr deployment. The Codex
widget credits the official developer App Server documentation. The reusable
source checker now also includes system-group and widget-study references.

## Repeating the checks

Build the website and start its production preview, then run:

```powershell
npm run check
npm run test:observatory
npm run check:publication
```

Set `BASE_URL` when using a preview port other than the test's default. Publication
validation must cover both the final source/output and any newly outgoing
commits. No homelab workload, monitoring target, scheduler, or service
configuration is modified by the website build or browser tests.
