# Publication privacy review

Review target: the current portfolio working tree, a fresh production `dist/` build, and every outgoing commit between `origin/main` and the current revamp branch. The audit is local-only and does not contact the homelab, project services, or private hosts.

## Resolved findings from the initial review

The initial review found absolute local development paths in the following tracked files. The matched values are omitted. The public files have now been rewritten: evidence and inventory documents contain only public-safe provenance, and the exporter requires explicitly supplied inputs. Detailed originals are retained only in an ignored local folder.

| File | Lines | Category | Recommendation |
| --- | --- | --- | --- |
| `docs/project-evidence.md` | 31, 36-37, 69-70, 104-105, 108, 138-140, 170-171, 202-203, 207-210, 231-233 | Absolute local workspace path | Replace with repository-relative paths or public-safe evidence labels before publication. |
| `docs/project-inventory.md` | 30, 38-42, 48, 52, 64-67, 177-181 | Absolute local workspace path | Replace with repository-relative paths or public-safe evidence labels before publication. |
| `scripts/export-evidence.mjs` | 5-7 | Absolute local workspace path | Resolve inputs relative to the repository or accept them through an explicit local-only argument/environment setting that is not committed. |

The table's line numbers refer to the pre-sanitization snapshot. The final release must pass `scripts/check-publication.mjs` against its actual source, built output and newly outgoing commit history.

## Current public output

A fresh `npm run build` completed successfully with the current lab additions included. The resulting `dist/` contained 89 files at the reviewed snapshot: 80 text files and 9 binary assets. No publication-rule findings were present in `dist/`.

The current source tree was also scanned in full, including tracked files and non-ignored untracked release files. Outside the three files listed above, the audit found no verified private network address, MAC address, credential/token/key, credentialed URL, tunnel or internal-host endpoint, device/account UUID, or private-key material.

Generic loopback development URLs and explicit example/placeholder values are allowed by the checker. Existing public contact/source identity references are treated as intentional public content rather than credentials.

## Media review

The 9 tracked publication images and their 9 freshly built copies were inspected with the locally available media parser. No embedded tag fields were reported. The publication checker also scans printable ASCII/UTF-16 strings in binary assets for the same sensitive patterns used on text files; no verified binary findings remain.

That automated check cannot read pixels. Prime's subsequent visual review excluded the Realm library capture because it shows personal viewing/progress information. Realm now uses an original conceptual interface illustration. The new server and Pico illustrations contain no actual infrastructure inventory, network map or device identifiers. Existing safe engine/prototype images and the decorative scenes were visually inspected.

## Outgoing history

Five revamp commits are currently outgoing relative to `origin/main`. Their text and binary blobs were audited without printing matched values.

- `docs/project-evidence.md` contains the absolute-workspace-path findings throughout the outgoing revamp sequence.
- `scripts/export-evidence.mjs` contains its three absolute-workspace-path findings throughout the outgoing revamp sequence.
- `docs/project-inventory.md` introduces its absolute-workspace-path findings in the latest outgoing commit.
- No additional verified credential, network-address, device-ID, or binary-media leak was found in the outgoing commit snapshots.

Publishing the current revamp commit chain would therefore add local-machine paths to public Git history even if the final files were later sanitized. The safer publication shape is the planned new squash release commit rooted at `origin/main`, created only after the current-tree blockers above are removed. This preserves the revamp branch locally while keeping those intermediate snapshots out of newly published history.

The release is prepared as a single clean commit based on the existing public main branch; intermediate local revamp history is retained locally. This review does not rewrite history that is already present on the public base branch.

## Lab validation

The homelab/hardware addition contains three project records and a dedicated lab hub. The production build and 64-page / 1,926-link static checks passed after the private Realm capture was removed. The targeted lab suite passed six checks and eleven accessibility scans, including light/dark desktop and phone layouts, automatic decorative motion, Pause, reduced motion, no-JavaScript reading, project search and contextual credits. A heading-order finding in the first pass was corrected before the final run. Fresh browser captures were visually reviewed.

## Reproducible gate

Run the gate after building the exact tree that will be published:

```powershell
npm run build
node scripts/check-publication.mjs
npm run check
```

`scripts/check-publication.mjs` audits:

- tracked and non-ignored working-tree files;
- the generated `dist/` publication output;
- every outgoing commit relative to `origin/main` (or `PUBLICATION_BASE_REF` when explicitly set);
- text files plus printable strings in binary assets.

It reports only scope, file, line (or `binary`), category, and outgoing commit IDs. It never prints the matched secret/path/address value. Missing `dist/`, unsupported/unknown historical file types, submodules, symlinks, or scan failures are reported as scope issues and make the command fail rather than producing a false pass.
