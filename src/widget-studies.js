// Public-safe studies of the homelab's desktop monitoring and operations widgets.
// `state` reflects the 2026-09-16 live config/process inventory supplied separately
// by the release review; source-only records are never promoted to running claims.
export const widgetStudies = [
  {
    id: 'system-service-overview',
    title: 'System & Service Overview',
    group: 'operations',
    state: 'Observed running',
    summary: 'A pair of always-visible Conky panels keeps machine load and service health in the desktop workspace: one concentrates host resource telemetry while the other reduces containers, system services, and selected processes into a compact operational view.',
    mechanism: 'The current system panel reads processor, memory, filesystem, graphics, temperature, uptime, and process information from Conky plus standard host tools. The service panel combines Docker state, systemd state, process checks, and memory information; the launcher brings both into the core desktop set after login.',
    limit: 'These panels summarize operating state rather than diagnose root causes. A green process or service check cannot prove application-level correctness, and live values remain private even though the panel mechanisms and running state are verified.',
    credits: [
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Desktop system-monitor framework used by the panel suite.' },
      { label: 'systemd', href: 'https://systemd.io/', note: 'Service manager used by the reviewed boot and restart definitions.' }
    ]
  },
  {
    id: 'network-flow-attribution',
    title: 'Per-Service Network Flow Attribution',
    group: 'network',
    state: 'Observed running',
    summary: 'The network panel goes beyond an interface throughput graph: it attributes active send and receive rates to containers and host processes, then renders a small ranked view so unusual traffic can be connected to the software producing it.',
    mechanism: 'A Python sampler reads container network-namespace byte counters, uses Docker metadata to associate namespaces with services, samples host processes separately, and writes a complete display snapshot with atomic replacement. Conky reads that cached snapshot while drawing its own interface-rate graphs.',
    limit: 'This is host telemetry, not whole-network visibility. Host-networked containers require a different attribution path, short samples can miss bursty traffic, and friendly peer labels are best-effort display hints rather than identity guarantees.',
    credits: [
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Renders the network panel and native interface-rate graphs.' },
      { label: 'Docker', href: 'https://github.com/docker', note: 'Supplies container process metadata used for namespace attribution.' },
      { label: 'Nethogs', href: 'https://github.com/raboof/nethogs', note: 'Provides host-process traffic sampling for activity outside isolated container namespaces.' }
    ]
  },
  {
    id: 'realm-runtime-observability',
    title: 'Application Runtime & Adaptive Logs',
    group: 'operations',
    state: 'Observed running',
    summary: 'The Realm desktop widgets split application observability into a compact aggregate-status panel and a larger live-log surface, making product activity and operational context visible without opening a separate dashboard or terminal.',
    mechanism: 'One renderer reads a local application statistics endpoint and formats aggregate counters and uptime. A second reads container logs, counts request activity, and passes recent output through a geometry-aware formatter that wraps full lines and changes visible history as the panel is resized.',
    limit: 'Runtime logs and live application counters can contain operational or user information, so the public portfolio describes the mechanism without publishing captured values or screenshots. A running panel also does not prove that every upstream metric is currently healthy.',
    credits: [
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Hosts both the compact status view and the resizable log surface.' },
      { label: 'Docker', href: 'https://github.com/docker', note: 'Provides the application container log stream used by the operations panel.' },
      { label: 'xdotool', href: 'https://github.com/jordansissel/xdotool', note: 'Lets the log formatter read current panel geometry so wrapping and history adapt to the window size.' }
    ]
  },
  {
    id: 'codex-usage-freshness',
    title: 'Quota Snapshot With Freshness Semantics',
    group: 'desktop',
    state: 'Observed running',
    summary: 'A small usage panel turns quota metadata from the local Codex client into an ambient desktop signal while deliberately publishing only the narrow fields needed for display. Its design treats freshness and missing data as first-class states instead of silently turning failures into zeroes.',
    mechanism: 'The collector normalizes returned windows into an allowlisted snapshot, clamps valid percentages, preserves unknown values as unknown, and replaces snapshots atomically. The renderer derives human-readable window/reset labels, marks old snapshots stale, and keeps failed refreshes from overwriting the last successful data.',
    limit: 'No quota values are part of this portfolio record. The widget depends on the local client and its source machine being available, and its subscription-window metadata is not a substitute for API billing or every ChatGPT usage limit.',
    credits: [
      { label: 'OpenAI Codex App Server', href: 'https://developers.openai.com/codex/app-server', note: 'Documented local interface from which the collector reads usage-window metadata.' },
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Desktop surface used by the sanitized snapshot renderer.' }
    ]
  },
  {
    id: 'clock-weather-utility',
    title: 'Clock, Weather & Small System Signals',
    group: 'desktop',
    state: 'Observed running',
    summary: 'The clock panel combines time and date with a compact weather view and a few low-cost host signals, turning ordinary utility information into part of the same persistent operations desktop rather than a separate widget ecosystem.',
    mechanism: 'Conky supplies time and host uptime directly. A shell/Python helper fetches structured weather data, formats current conditions and forecast summaries, and emits an explicit unavailable state when the weather source cannot be reached.',
    limit: 'Weather is third-party data and can be delayed or unavailable. The source also contains network readouts that are useful locally but intentionally excluded from the public portfolio because they reveal deployment-specific information.',
    credits: [
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Provides the clock, date, uptime, and desktop rendering primitives.' },
      { label: 'wttr.in', href: 'https://github.com/chubin/wttr.in', note: 'Structured weather source consumed by the compact forecast helper.' }
    ]
  },
  {
    id: 'media-operations-panel',
    title: 'Media Library Operations Panel',
    group: 'media',
    state: 'Observed running',
    summary: 'A single media panel reduces multiple self-hosted applications into operational signals: aggregate library inventory and storage headroom share one compact view. The useful part is the cross-service summary, not exposing any individual title, request, playback history, or user session.',
    mechanism: 'The current live helper queries the series and movie management applications for aggregate library statistics, samples filesystem capacity, and emits one Conky-formatted snapshot on each refresh. The active panel is therefore a library-and-capacity view rather than a claim about a running download client.',
    limit: 'The helper does not carry a freshness timestamp across every upstream source, and request failures can fall back to empty results. An empty-looking count can therefore mean unavailable data as well as a real zero; no transfer-client availability is claimed from this panel.',
    credits: [
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Desktop rendering surface for the combined media status.' },
      { label: 'Sonarr', href: 'https://github.com/Sonarr/Sonarr', note: 'Upstream series-management API queried for aggregate library statistics.' },
      { label: 'Radarr', href: 'https://github.com/Radarr/Radarr', note: 'Upstream movie-management API queried for aggregate library statistics.' }
    ]
  },
  {
    id: 'resource-ring-gauges',
    title: 'Measured Resource Rings',
    group: 'desktop',
    state: 'Source study',
    summary: 'A Cairo-backed ring layout experiments with making machine load feel glanceable and animated while retaining real measurements underneath: processor use, memory use, filesystem fill, graphics utilization, and graphics temperature all drive the gauge arcs.',
    mechanism: 'Lua reads Conky-native host metrics plus NVIDIA command-line telemetry, normalizes them into percentage-like values, and draws color-changing arcs with Cairo. Pulse opacity, endpoint glow, and orbiting dots are animation layered on top of those measurements.',
    limit: 'The decorative pulse and orbit motion carry no additional telemetry. The temperature ring maps a raw temperature onto a display scale for visualization; it is not a hardware safety threshold or thermal diagnosis. This configuration was not observed in the active panel set.',
    credits: [
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Supplies host metrics and the Lua draw-hook environment.' },
      { label: 'Cairo', href: 'https://www.cairographics.org/', note: '2D drawing library used for the animated gauge arcs and text.' },
      { label: 'NVIDIA System Management Interface', href: 'https://developer.nvidia.com/system-management-interface', note: 'Source of graphics utilization and temperature readings used by the gauges.' }
    ]
  },
  {
    id: 'training-telemetry-console',
    title: 'Training Telemetry Console',
    group: 'research',
    state: 'Source study',
    summary: 'The LLM training panel was built as an ambient experiment console: data preparation, active training, completion, and stopped states share one view with progress, losses, throughput, elapsed time, and graphics-resource measurements.',
    mechanism: 'The panel reads a producer-written status snapshot, derives progress and ETA from the recorded iteration/timing fields, displays train/validation/best loss, and samples graphics utilization and memory separately. A source timestamp drives an explicit stale indicator.',
    limit: 'Fresh telemetry only shows that the producer is updating; it does not prove model quality or training correctness. The panel was not present in the observed active set, so it remains a source-backed study rather than a current-running claim.',
    credits: [
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Desktop rendering and scheduled command surface for the training console.' },
      { label: 'jq', href: 'https://github.com/jqlang/jq', note: 'Parses and derives display values from the training status snapshot.' },
      { label: 'NVIDIA System Management Interface', href: 'https://developer.nvidia.com/system-management-interface', note: 'Provides graphics utilization and memory telemetry displayed beside training progress.' }
    ]
  },
  {
    id: 'game-server-operations',
    title: 'Game Server Operations Panels',
    group: 'operations',
    state: 'Configured, stopped',
    summary: 'Stored game-server panels combine service state, server-native metrics, player totals, resource use, world progress, and recent log context into a desktop operations view. They show how the widget system can become a lightweight operator console for a workload with more state than a simple up/down check.',
    mechanism: 'The helpers combine service-manager checks, Docker status, application-specific status queries, and a shared log formatter. The formatter measures the current panel geometry, wraps complete log lines to the available width, and expands or contracts visible history with window height.',
    limit: 'These configurations were present but not observed running in the live panel set. Their live versions can expose player names, connection details, and log content, so none of those values are reproduced in the public portfolio.',
    credits: [
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Desktop panel framework used by the stored game-server views.' },
      { label: 'Docker', href: 'https://github.com/docker', note: 'Provides container status and log access used by one of the server panels.' },
      { label: 'systemd', href: 'https://systemd.io/', note: 'Provides service-state information used by the stored operations helpers.' },
      { label: 'xdotool', href: 'https://github.com/jordansissel/xdotool', note: 'Used by the shared log renderer to adapt output to current panel geometry.' }
    ]
  },
  {
    id: 'cairo-ambient-visuals',
    title: 'Cairo Ambient Visual Layer',
    group: 'desktop',
    state: 'Source study',
    summary: 'The widget collection also contains a purely visual layer: an animated radar sweep and a Matrix-style glyph field built as Conky Lua draw hooks. They are useful experiments in motion, compositing, and desktop atmosphere, but they are intentionally separate from the measured operations panels.',
    mechanism: 'Both effects draw directly through Cairo. The radar advances a sweep angle and brightens a fixed set of decorative blips as the sweep passes; the Matrix field advances randomized glyph columns with independent speed, length, and fading trails.',
    limit: 'The radar blips are hard-coded visual markers and the Matrix glyphs are random animation. Neither represents discovered devices, network activity, security events, or any other sensor feed, and neither configuration was observed in the active panel set.',
    credits: [
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Provides the desktop window and Lua draw-hook lifecycle.' },
      { label: 'Cairo', href: 'https://www.cairographics.org/', note: '2D graphics library used to render the sweep, trails, glyphs, and composited animation.' }
    ]
  }
];
