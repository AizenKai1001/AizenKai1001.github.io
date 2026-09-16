// Editorial snapshot, never a live connection to the private infrastructure.
// Captured through read-only container, systemd, process and workflow-metadata inspection.
export const labObservation = { date: '2026-09-16', label: '16 September 2026' };

export const systemGroups = [
  {
    id: 'research', title: 'Research runtimes', description: 'Keeping the experiment and its observer understandable as separate pieces.',
    services: [
      { name: 'Distinction AI', role: 'A running prototype service and read-only experiment viewer.', state: 'running', type: 'Local experiment' },
      { name: 'DOOMFLY', role: 'Separate brain/runtime and viewer processes around the upstream simulation.', state: 'running', type: 'Upstream experiments' }
    ],
    lesson: 'A running experiment service is not proof that learning is still active, or that a candidate passed its evaluation gates.',
    related: ['distinction', 'doomfly'],
    credits: [{ label: 'nftechie — DOOMFLY', href: 'https://github.com/nftechie/doomfly', note: 'Upstream simulation used by the local runtime and viewer experiments.' }]
  },
  {
    id: 'automation', title: 'Automation & execution', description: 'Workflows, browser state, and job execution have different lifecycles.',
    services: [
      { name: 'n8n', role: 'Workflow engine; the media download and library-import workflows were enabled at inspection.', state: 'running', type: 'Upstream platform' },
      { name: 'Browser service', role: 'Custom browser automation with named sessions and a watchable browser.', state: 'running', type: 'Local integration' },
      { name: 'Job API & runner', role: 'A separate API and execution-runner deployment used by the automation stack.', state: 'running', type: 'Local integration' }
    ],
    lesson: 'Long-running work needs a completion handoff. The media pipeline keeps partial output separate and closes its browser after the finished-file transition.',
    related: ['n8n-browser', 'media-library-automation'],
    credits: [
      { label: 'n8n contributors', href: 'https://github.com/n8n-io/n8n', note: 'Workflow engine supporting the custom browser and media integrations.' },
      { label: 'Microsoft — Playwright', href: 'https://github.com/microsoft/playwright', note: 'Browser-automation engine used by the custom service.' },
      { label: 'Docker contributors', href: 'https://github.com/docker', note: 'Container execution platform. Separate containers alone do not establish a security guarantee.' }
    ]
  },
  {
    id: 'media', title: 'Media services', description: 'Requests, organization, subtitles, processing, and playback are connected through explicit handoffs.',
    services: [
      { name: 'Jellyfin', role: 'Playback and library indexing for completed media.', state: 'running', type: 'Upstream application' },
      { name: 'Jellyseerr', role: 'Media request interface.', state: 'running', type: 'Upstream application' },
      { name: 'Radarr · Sonarr · Prowlarr', role: 'Movie/series organization and indexer management.', state: 'running', type: 'Upstream applications' },
      { name: 'Bazarr', role: 'Subtitle-management service.', state: 'running', type: 'Upstream application' },
      { name: 'Tdarr', role: 'Media-processing service present; active transcoding jobs were not established by the process check.', state: 'running', type: 'Upstream application' }
    ],
    lesson: 'A service being up is different from a complete working download path. The import workflow and file-completion rules are documented separately.',
    related: ['media-library-automation'],
    credits: [
      { label: 'Jellyfin contributors', href: 'https://jellyfin.org/', note: 'Media-library and playback server.' },
      { label: 'Jellyseerr / Seerr contributors', href: 'https://github.com/seerr-team/seerr', note: 'Request-management project lineage. The inspected deployment uses the Jellyseerr application; its upstream repository now redirects to Seerr.' },
      { label: 'Radarr contributors', href: 'https://github.com/Radarr/Radarr', note: 'Movie-management application integrated into the media tooling.' },
      { label: 'Sonarr contributors', href: 'https://github.com/Sonarr/Sonarr', note: 'Series-management application integrated into the media tooling.' },
      { label: 'Prowlarr contributors', href: 'https://github.com/Prowlarr/Prowlarr', note: 'Indexer-management application.' },
      { label: 'Bazarr contributors', href: 'https://github.com/morpheus65535/bazarr', note: 'Subtitle-management application.' },
      { label: 'HaveAGitGat — Tdarr', href: 'https://github.com/HaveAGitGat/Tdarr', note: 'Media-processing application; no throughput or completed-job claim is made here.' }
    ]
  },
  {
    id: 'operations', title: 'Operations & visibility', description: 'A portal, health checks, stack management, and host traffic each answer a different question.',
    services: [
      { name: 'Dockge', role: 'Compose-stack management.', state: 'running', type: 'Upstream application' },
      { name: 'Homepage', role: 'Self-hosted application portal.', state: 'running', type: 'Upstream application' },
      { name: 'Uptime Kuma', role: 'Monitoring application; the monitored target list remains private.', state: 'running', type: 'Upstream application' },
      { name: 'ntopng · Redis', role: 'Host traffic analysis and its supporting store.', state: 'running', type: 'Upstream applications' },
      { name: 'Network collector', role: 'A native sampler supporting the desktop traffic panels.', state: 'running', type: 'Local integration' }
    ],
    lesson: 'Process state, a health check, and the freshness of a displayed measurement are separate signals. The widget design makes some of those differences explicit.',
    related: ['homelab-network-observability', 'homelab-widgets'],
    credits: [
      { label: 'louislam — Dockge', href: 'https://github.com/louislam/dockge', note: 'Compose-stack management UI.' },
      { label: 'Homepage contributors', href: 'https://github.com/gethomepage/homepage', note: 'Application portal and service-widget framework.' },
      { label: 'louislam — Uptime Kuma', href: 'https://github.com/louislam/uptime-kuma', note: 'Self-hosted monitoring application.' },
      { label: 'ntop — ntopng', href: 'https://github.com/ntop/ntopng', note: 'Host traffic-analysis application.' },
      { label: 'Redis contributors', href: 'https://github.com/redis/redis', note: 'Supporting store used by the traffic-analysis deployment.' }
    ]
  },
  {
    id: 'applications', title: 'Hosted applications', description: 'Personal software, discovery tools, and a game-server control surface share the lab.',
    services: [
      { name: 'Realm backend', role: 'Backend service for the personal media application.', state: 'running', type: 'Local application' },
      { name: 'SearXNG', role: 'Self-hosted metasearch service.', state: 'running', type: 'Upstream application' },
      { name: 'Pelican · Wings', role: 'Game-server panel and native control service; this does not imply every game instance is running.', state: 'running', type: 'Upstream applications' },
      { name: 'Personal agent service', role: 'A user-level agent process was active; this inventory does not benchmark its capabilities.', state: 'running', type: 'Local runtime' }
    ],
    lesson: 'An application and the service manager around it are different layers. Hosting work includes startup, persistence, monitoring, and stopping behavior.',
    related: ['realm', 'homelab-platform'],
    credits: [
      { label: 'SearXNG contributors', href: 'https://github.com/searxng/searxng', note: 'Self-hosted metasearch application.' },
      { label: 'Pelican contributors — Panel', href: 'https://github.com/pelican/panel', note: 'Game-server management interface.' },
      { label: 'Pelican contributors — Wings', href: 'https://github.com/pelican/wings', note: 'Native service supporting the game-server management plane.' }
    ]
  },
  {
    id: 'desktop', title: 'Desktop & host services', description: 'The physical display is an operating surface, not just a background terminal.',
    services: [
      { name: 'KDE Plasma / X11', role: 'The graphical desktop session observed at inspection.', state: 'running', type: 'Upstream desktop' },
      { name: 'Conky panels', role: 'System, services, network, media, clock, quota, and application views.', state: 'running', type: 'Custom panel collection' },
      { name: 'Experiment monitor', role: 'A user service displaying the DOOMFLY observer.', state: 'running', type: 'Local integration' },
      { name: 'Host maintenance', role: 'Service supervision, scheduled maintenance, monitoring, and protection tooling.', state: 'running', type: 'System integration' }
    ],
    lesson: 'Desktop autostart, a sampler, and a renderer can fail independently. A running collector does not guarantee that its panel is visible or its data is fresh.',
    related: ['homelab-widgets', 'codex-usage-widget'],
    credits: [
      { label: 'KDE — Plasma', href: 'https://kde.org/plasma-desktop/', note: 'Desktop environment hosting the current panel workspace.' },
      { label: 'Conky contributors', href: 'https://github.com/brndnmtthws/conky', note: 'Desktop rendering framework extended by the custom panel scripts.' },
      { label: 'systemd contributors', href: 'https://systemd.io/', note: 'System and user service supervision and timers.' },
      { label: 'CrowdSec contributors', href: 'https://github.com/crowdsecurity/crowdsec', note: 'Host-protection tooling observed as an active service; rule sets and deployment details are not published.' }
    ]
  }
];

export const stoppedSystems = [
  { name: 'Craftax training, spectator & viewer', href: '/projects/craftax-live/' },
  { name: 'EvoForge and supporting model service', href: '/experiments/evoforge/' },
  { name: 'LM Studio and standalone model serving', href: '/research/low-bit-inference-quantization/' },
  { name: 'Whisper transcription deployment', href: '/projects/homelab-platform/' },
  { name: 'Minecraft / Palworld configurations', href: '/lab/widgets/#game-server-operations' },
  { name: 'Vane deployment', href: '/projects/homelab-platform/' }
];

export const operationPatterns = [
  { title: 'Startup is a dependency problem.', text: 'Container restart policies, system services, and desktop autostart cover different parts of the lab. The observed desktop runs KDE Plasma on X11, and Conky is launched within that graphical session.' },
  { title: 'A snapshot should arrive whole.', text: 'The network and quota tooling separate collection from presentation and replace their output atomically. A renderer reads a complete snapshot rather than a file partway through a write.' },
  { title: 'Unknown should stay unknown.', text: 'The quota renderer distinguishes missing values, zero usage, and stale data. Other panels still have adapters that can fall back to an empty section, which remains a documented limitation.' },
  { title: 'Completion deserves its own event.', text: 'The enabled media workflows distinguish in-progress files from finished output, then hand off to library organization and browser cleanup. Enabled workflow metadata is not the same as rerunning a full download.' }
];
