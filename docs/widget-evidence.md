# Widget evidence review

This note records the public-safe evidence behind `widgetStudies`. It does not contain private network details, deployment identities, account or quota values, media history, player/session data, credentials, private file locations, or screenshots of a live desktop.

The `state` field uses a separate live process/config inventory from the release review on 2026-09-16. Source presence alone is never treated as proof that a widget is currently running.

## `system-service-overview`

**State:** Observed running.

**Evidence:** the current live-source snapshot for `sysinfo.conf` reads processor, memory, filesystem, graphics, temperature, uptime, and process information, using host tools including the graphics-management CLI, temperature sensors, and process sampling. `services.conf` combines Docker state, systemd state, process checks, and memory information. `start-conky.sh` names both panels in the core desktop set and shows delayed startup after the graphical session. The reviewed `boot` definitions add restart/backoff context for supporting services.

**Boundary:** live inventory establishes that both panel configs are running, but their displayed values remain private. Service/process presence is a health signal, not proof that the application behind it is semantically correct.

## `network-flow-attribution`

**State:** Observed running.

**Evidence:** `network.conf`, `netflows.py`, and `apply-netpanel.sh`. The sampler maps Docker processes to isolated network namespaces, measures byte deltas, samples host processes separately, associates current connections with display labels, and atomically replaces a cached Conky fragment. The Conky config adds native interface-rate graphs and reads that cache.

**Boundary:** the source itself distinguishes host-networked containers from isolated namespaces. The separate homelab network study already establishes the larger limit: this host cannot observe arbitrary peer traffic that never reaches it. No peer labels or addresses belong in the public portfolio.

## `realm-runtime-observability`

**State:** Observed running.

**Evidence:** `realm-live.sh`, `realm-live.conf`, `realmlog.conf`, and `logfit.sh`. The first pair formats aggregate application statistics. The log panel reads container output and request activity. `logfit.sh` uses current window geometry to choose wrapping width and visible history, while keeping complete wrapped lines rather than hard truncating them.

**Boundary:** live logs and aggregate counters are operational data. The portfolio can describe the mechanism and the fact that both panel families were observed running, but it should not publish captured values or screenshots containing real activity.

## `codex-usage-freshness`

**State:** Observed running.

**Evidence:** `README.md`, `collect.cjs`, `render.py`, `codex.conf`, `collect.test.cjs`, and `test_render.py` from the Codex usage widget. The collector emits an allowlisted schema, clamps percentages, preserves missing percentages as unknown, and replaces snapshots atomically. The renderer sanitizes labels, distinguishes unavailable from zero, derives window labels from returned durations, and marks old snapshots stale. Tests cover those behaviors.

**Boundary:** private snapshots and logs were not read for this review. No actual quota percentage, reset time, account information, transport credential, or deployment endpoint is part of the portfolio. The widget reports a specific subscription usage surface, not general API billing.

## `clock-weather-utility`

**State:** Observed running.

**Evidence:** `clock.conf`, `weather.sh`, and `weather.conf`. Conky supplies time, date, uptime, and the persistent panel surface. The weather helper consumes structured wttr.in data and has both full and compact modes, with an explicit unavailable output when retrieval fails.

**Boundary:** network-address readouts in the local clock configuration are deployment details and are excluded. Weather remains an external-data dependency rather than a sensor measurement made by the homelab.

## `media-operations-panel`

**State:** Observed running.

**Evidence:** the current live `media-panel.sh` and active `media.conf`. The helper combines aggregate series/movie statistics from the media-management APIs with filesystem capacity in one Conky snapshot. The current live helper contains no transfer-client adapter.

**Boundary:** title names, request history, library history, and private configuration are excluded. An older repository copy contained transfer-client display code, but the live current helper does not and the live inventory did not show a corresponding client. The helper also catches several upstream request failures by returning no data, so empty-looking sections do not always prove that the real value is zero.

## `resource-ring-gauges`

**State:** Source study.

**Evidence:** `rings.lua` and `rings.conf`. The Lua draw hook reads real CPU, memory, filesystem, graphics-utilization, and graphics-temperature measurements, then draws animated Cairo gauges whose arc lengths follow those measurements.

**Boundary:** breathing opacity, glow points, and orbiting dots are presentation. They are not extra sensors. The temperature normalization is a visual mapping rather than a declared hardware limit. This configuration was not in the observed active panel set.

## `training-telemetry-console`

**State:** Source study.

**Evidence:** `llm-panel.sh` and `llmforge.conf`. Both implementations read a training status snapshot, present phase/progress/loss/throughput timing, sample graphics utilization separately, and include explicit stale handling based on the producer timestamp.

**Boundary:** freshness is not model-quality evidence. The panel source can show what a training process reports, but the public portfolio should keep any learning or quality claim tied to the underlying experiment and evaluation. The live inventory did not show this panel active.

## `game-server-operations`

**State:** Configured, stopped.

**Evidence:** `gameservers.conf`, `mc-panel.sh`, `palworld.conf`, `palworld-panel.sh`, `pw-log.sh`, and the shared `logfit.sh`. These sources combine service/container state, game-native status information, resource/runtime measurements, and recent logs. The live inventory found the stored game configs but not active Conky processes for them.

**Boundary:** those panels can expose player identities, join information, and live log text. Those details are deliberately omitted. “Configured, stopped” describes the observed desktop panel state, not the availability of every underlying game service.

## `cairo-ambient-visuals`

**State:** Source study.

**Evidence:** `radar.lua`, `radar.conf`, `matrix.lua`, and `matrix.conf`. The radar code explicitly defines a fixed set of decorative blips and animates their brightness around a rotating sweep. The Matrix effect creates randomized glyph columns with variable speed, length, and alpha trails. Both use Cairo through Conky Lua hooks.

**Boundary:** these are visual effects. The radar does not discover machines or traffic, and the Matrix field is not generated from system events. Neither configuration was present in the observed active panel set.

## Other reviewed sources

`docker-grid.sh` / `docker-grid.conf` implement a compact container-state grid and are consistent with the broader system/service-monitoring theme, but were not observed in the active config set. `bt-tripwire.sh` is a separate guard/monitoring script rather than a current display study; its potentially sensitive operational checks are not promoted into the public widget catalog. `discord-notify.sh` is event-notification plumbing, not a desktop widget, and is likewise omitted. Interactive console helpers and boot-service definitions were reviewed for lifecycle context without publishing control details.

The active desktop observed by the release review is KDE Plasma on X11. The portfolio should describe the widgets as Conky panels in that desktop session and should not infer a different window manager from older source or notes.
