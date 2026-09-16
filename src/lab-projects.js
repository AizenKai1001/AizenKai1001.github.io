// Public-safe homelab and hardware stories backed by local source/vault evidence.
// Keep operational inventory, private topology, host identifiers, storage details,
// and exact hardware out of this file.
export const labProjects = [
  {
    id: 'homelab-platform',
    name: 'Homelab Platform',
    category: 'systems',
    area: 'Self-hosted infrastructure',
    status: 'Active self-hosted lab',
    kind: 'Original lab integration',
    summary: 'A long-running Ubuntu and Docker homelab I built to host media, automation, monitoring, browser tooling, game services, and experiments behind one operational surface. The work is in composing services, boot persistence, desktop observability, and learning where containers stop being the right boundary.',
    question: 'How can I turn one Linux host into a dependable experimental platform while keeping service boundaries and operational state understandable?',
    tech: ['Ubuntu Server', 'Docker', 'Dockge', 'systemd', 'Conky', 'Jellyfin', 'n8n'],
    sections: [
      {
        title: 'I built an operating surface around the services',
        text: 'The lab runs containerized applications alongside system and user services with restart behavior designed to survive reboots. A physical desktop dashboard turns service health and experiment state into ambient information instead of requiring a separate monitoring page for every task.'
      },
      {
        title: 'Media and automation became integration work',
        text: 'The same platform connects a personal media stack, workflow automation, browser tooling, and monitoring. The interesting engineering is in handoffs, shared storage semantics, lifecycle behavior, and failure visibility; the individual upstream applications retain their own authorship and are credited separately.'
      },
      {
        title: 'Virtual machines are still a surveyed next step',
        text: 'The virtualization review established that the host can support VMs, but no hypervisor was installed. Incus was considered because it could coexist with the current Ubuntu and Docker setup; Proxmox was evaluated as a migration that would replace the host OS, not as a deployed part of this lab.'
      }
    ],
    credits: [
      { label: 'Ubuntu Server', href: 'https://ubuntu.com/server', note: 'Linux server distribution used as the homelab host platform.' },
      { label: 'Docker', href: 'https://github.com/docker', note: 'Container runtime and packaging foundation for the self-hosted application stacks.' },
      { label: 'Dockge — louislam and contributors', href: 'https://github.com/louislam/dockge', note: 'Compose-stack management interface recorded in the homelab inventory.' },
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Desktop system-monitor surface used for the lab’s ambient operations dashboard.' }
    ],
    links: [],
    evidence: 'Vault notes “Homelab — Overview”, “Homelab — Media Stack”, and “Homelab — Virtualization Readiness” were reviewed. Operational counts, addresses, hardware identities, storage details, and service-specific private configuration are intentionally excluded.',
    related: ['homelab-widgets', 'homelab-mcp', 'n8n-browser', 'media-library-automation']
  },
  {
    id: 'pico-audio-lab',
    name: 'Pico Audio Lab',
    category: 'tools',
    area: 'Microcontroller audio experiments',
    status: 'Implemented hardware prototype',
    kind: 'Original hardware experiment',
    summary: 'A MicroPython audio lab for a Raspberry Pi Pico microcontroller: dual-pin differential PWM drives a tiny speaker, while companion tools generate public-domain melodies, reduce MIDI to a monophonic top voice, and optionally transcribe audio into a note sequence shaped for the speaker’s limits.',
    question: 'How much useful music and signal experimentation can I extract from a tiny microcontroller speaker when the software is designed around its electrical and acoustic limits?',
    tech: ['Raspberry Pi Pico', 'MicroPython', 'PWM audio', 'Python', 'MIDI', 'NumPy', 'SciPy'],
    sections: [
      {
        title: 'The speaker driver owns the low-level behavior',
        text: 'The MicroPython driver creates an inverted two-channel PWM pair for differential drive, exposes note-to-frequency conversion, melody playback, sweeps, beeps, coarse volume control, and startup/audio LED diagnostics, and explicitly releases the outputs when playback ends.'
      },
      {
        title: 'The music tools reduce richer sources honestly',
        text: 'One path writes a public-domain Beethoven theme directly as notes; another parses MIDI and keeps the highest active voice while preserving the file’s tempo map. Playback adds short articulation gaps so repeated notes remain distinct on the single-tone speaker.'
      },
      {
        title: 'Audio transcription is an experiment, not a recorder',
        text: 'The optional desktop transcription tool band-limits a source, proposes spectral pitch candidates, uses a Viterbi-style path to suppress octave flicker, folds obvious register errors, and emits a monophonic melody. Its own comments describe the output as a chiptune approximation rather than faithful mixed-audio reproduction.'
      }
    ],
    credits: [
      { label: 'MicroPython', href: 'https://github.com/micropython/micropython', note: 'Firmware/runtime providing the machine.Pin and PWM interfaces used by the on-device speaker code.' },
      { label: 'Raspberry Pi — Pico documentation', href: 'https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html', note: 'Microcontroller platform targeted by the speaker experiment; this is Pico-class hardware, not a Linux single-board computer.' },
      { label: 'NumPy', href: 'https://github.com/numpy/numpy', note: 'Array and FFT support used by the optional desktop audio transcription tool.' },
      { label: 'SciPy', href: 'https://github.com/scipy/scipy', note: 'WAV loading and filtering support used by the optional desktop audio transcription tool.' }
    ],
    links: [],
    evidence: 'Source review covered speaker.py, demo.py, beethoven.py, midi2song.py, playsong.py, and transcribe.py. “Raspberry Pi Pico W — Capability Map + Project Ideas” was used only to confirm Pico-versus-Pi scope; its proposed project ideas are not claimed as built.',
    related: ['homelab-platform']
  },
  {
    id: 'homelab-network-observability',
    name: 'Homelab Network Observability',
    category: 'systems',
    area: 'Host traffic visibility',
    status: 'Implemented host telemetry',
    kind: 'Original lab integration',
    summary: 'An ntopng-based host telemetry setup I used to inspect the homelab’s own traffic and test the boundary between host visibility and whole-LAN monitoring. The useful result was as much the limit as the dashboard: switched Ethernet does not grant one host visibility into unrelated peer traffic.',
    question: 'What can a self-hosted traffic monitor actually observe from one machine, and where does the network topology set a hard boundary?',
    tech: ['ntopng', 'Docker', 'Linux host networking', 'Packet capture', 'Switched Ethernet'],
    sections: [
      {
        title: 'Host networking makes the capture useful',
        text: 'The ntopng container uses the host network so it can observe traffic reaching the machine’s real network interface. That makes it useful for understanding the homelab’s own flows and attributing activity back to services running on the host.'
      },
      {
        title: 'The switch defines the visibility ceiling',
        text: 'The experiment documented the important negative result: an ordinary switched network forwards unrelated unicast traffic only where it needs to go, so this deployment cannot see arbitrary conversations between other devices. No ntopng setting can manufacture packets the host never receives.'
      },
      {
        title: 'Whole-LAN monitoring remains a topology change',
        text: 'The research note identifies port mirroring, router-side capture, or making a gateway observe the traffic as ways to widen visibility. None was implemented. The portfolio therefore calls this host telemetry and keeps broader network-monitoring capability as an unbuilt option.'
      }
    ],
    credits: [
      { label: 'ntopng — ntop contributors', href: 'https://github.com/ntop/ntopng', note: 'Network-traffic analysis application used by the host telemetry deployment.' },
      { label: 'Docker', href: 'https://github.com/docker', note: 'Container runtime used to deploy the telemetry service with host networking.' }
    ],
    links: [],
    evidence: 'Vault note “Homelab — Network Visibility” documents the implemented host-network capture, its switched-Ethernet limitation, and the unimplemented options for wider visibility. Private addresses, interface names, remote peers, and service inventory are excluded.',
    related: ['homelab-platform', 'homelab-widgets']
  }
];
