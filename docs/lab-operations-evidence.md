# Homelab operations evidence

Public-safe provenance for the homelab systems and widget material added to the portfolio. The observation date is **2026-09-16**. The private raw inventory remains outside the published tree; this note records only the evidence categories and claim boundaries needed to review the public copy.

## Reviewed evidence

Local source review covered the boot and desktop lifecycle files `lms-server.sh`, `lmstudio.service`, `playit.service`, `start-conky.sh`, `apply-netpanel.sh`, `netflows.py`, the Conky panel configs, and the widget helper scripts. Supporting project notes included `Homelab — Overview.md`, `Homelab — Media Stack.md`, and `n8n Browser — Operations Manual.md`.

The release review also supplied a read-only live inventory. That inventory was used only to distinguish **observed running**, **configured but stopped**, and **source study** claims. Operational identifiers and live readings are intentionally omitted.

## Public claims supported

- The observed desktop was KDE Plasma on X11, with eight Conky panels active across system/service state, application status and logs, quota freshness, network activity, time/weather, and media operations.
- Running and stopped workloads are presented separately. A stored unit, container, workflow, or panel config is never promoted to a running claim from source presence alone.
- The reviewed source demonstrates generic resilience patterns: restart supervision, desktop autostart, atomic snapshot replacement, stale-data states, and explicit completion handoffs between workflow stages.
- The widget studies separate measurement from presentation. Decorative Cairo/Lua motion is labeled as visual treatment rather than sensor data.

## Claim boundary

A dated process/configuration snapshot is not a functional test. An enabled workflow flag, successful metadata response, or reachable management surface does not prove that a future job will complete end to end. Likewise, a running process does not prove every feature is healthy, and a configured restart policy is not a restore test.

The public copy therefore uses **observed running** only for state seen in the dated inventory, keeps source-only widgets labeled separately, and avoids turning future-facing configuration or metadata into validation claims.

## Final publication review

After the systems/widget integration, a fresh production build, the content check, the lab browser checks, and the current-tree publication privacy gate all passed. The publication scan reported **zero suspicious findings** and **zero scope issues**.

A separate manual review of the new lab output found no published private IP addresses, service ports, container identifiers, hardware-capacity figures, live quota values, media/user activity, or deployment paths. The existing portfolio contact identity remains pre-existing site content and is unrelated to the homelab snapshot.

The newly introduced external source set was checked separately from the existing credit corpus. The sources resolve to the intended upstream projects. Three GitHub links currently redirect from older organization/project locations to their current repositories (the media-request project and the two Pelican repositories); these redirects work but can be canonicalized. The Codex App Server reference remains an official OpenAI documentation surface; the current developer-facing route is the preferred canonical form.
