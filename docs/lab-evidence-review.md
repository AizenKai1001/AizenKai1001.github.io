# Lab evidence review

This note records the public-safe evidence boundary for the dedicated homelab and hardware portfolio records. It intentionally omits private topology, addresses, hostnames, interface names, hardware identifiers, exact hardware inventory, service counts, storage layout, account information, and operational paths.

## `homelab-platform`

**Public claim:** an active Ubuntu/Docker self-hosting platform used for media, automation, monitoring, browser tooling, game services, and technical experiments, with reboot persistence and an ambient desktop operations surface.

**Evidence:** “Homelab — Overview” documents the Linux/Docker platform, Compose-stack management, restart behavior, system/user service persistence, the physical Conky dashboard, browser automation integration, and monitoring. “Homelab — Media Stack” documents the media-service integration and shared-filesystem reasoning. “Homelab — Virtualization Readiness” records the VM survey.

**Boundary:** the virtualization work is a readiness study. The note explicitly says no hypervisor was installed. Incus was considered as a future addition beside the existing platform; Proxmox was evaluated as an operating-system migration and was not deployed. The portfolio must not turn that survey into a completed virtualization project.

**Connected records already in the catalog:** `homelab-widgets`, `homelab-mcp`, `n8n-browser`, and `media-library-automation`. The platform record supplies the infrastructure story around them rather than duplicating those tool implementations.

## `pico-audio-lab`

**Public claim:** an implemented Raspberry Pi Pico microcontroller audio experiment with a MicroPython differential-PWM speaker driver, diagnostics and melody playback, plus desktop tools for MIDI reduction and optional audio-to-melody transcription.

**Evidence:** `speaker.py` implements the PWM driver, output shutdown, note conversion, melody playback, sweeps, beeps, and LED diagnostics. `demo.py` exercises the driver. `beethoven.py` emits a public-domain melody representation; `midi2song.py` parses MIDI and selects the highest active voice while preserving the tempo map; `playsong.py` plays generated notes; `transcribe.py` uses NumPy/SciPy signal processing and a Viterbi-style candidate path to produce a monophonic approximation.

**Boundary:** no attached hardware was run during this portfolio pass, so the record claims the source implementation rather than a newly reproduced acoustic result. The transcription code itself describes its output as a chiptune-style dominant-pitch approximation and should not be marketed as general audio reproduction.

## Raspberry Pi scope check

The vault search found a dedicated note titled “Raspberry Pi Pico W — Capability Map + Project Ideas”, but it is a research/ideas note and explicitly distinguishes the Pico W microcontroller from a Linux Raspberry Pi single-board computer. No substantive, implemented Linux Raspberry Pi project was found in the reviewed vault material. The proposed status beacon, hardware mixer, remote power control, sensor node, and similar ideas therefore remain ideas rather than portfolio projects.

This distinction matters for presentation: `pico-audio-lab` is real Raspberry Pi-branded hardware work, but it is Pico microcontroller work and should not be described as a Raspberry Pi Linux/server project.

## `homelab-network-observability`

**Public claim:** an implemented ntopng host-telemetry deployment used to inspect traffic that reaches the homelab host and to understand the visibility limits imposed by ordinary switched Ethernet.

**Evidence:** “Homelab — Network Visibility” records the use of host networking for packet visibility, the service-level usefulness of seeing the homelab’s own flows, and the verified limitation that unrelated peer-to-peer LAN traffic is not present at that host.

**Boundary:** the note lists port mirroring, router-side capture, or a gateway role as ways to widen visibility, then states that none was implemented. Calling the current deployment whole-LAN monitoring would overstate the evidence; “host telemetry” is the accurate phrase.

## Attribution used in the public records

The homelab platform credits Ubuntu Server, Docker, Dockge, and Conky because those components are explicitly present in the reviewed evidence. The network record separately credits ntopng. The Pico record credits MicroPython for the on-device runtime and NumPy/SciPy for the optional desktop transcription path. No Portainer credit was added because the reviewed homelab evidence names Dockge for stack management.

The existing media and browser records retain their own upstream credits. These lab stories describe how those pieces were integrated and what was learned from operating them; they do not claim authorship of the upstream applications.
