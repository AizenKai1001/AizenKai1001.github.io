# Public source-link review

Review date: 2026-09-16. Generated availability evidence is written to the ignored `test-results/source-links.json` by `node scripts/check-source-links.mjs`.

Final source edits applied: Manrope now links to its official Google Fonts page; the unconfirmed Realm public button is withheld; Jiang/Litwin-Kumar and TwinProp labels use the paper titles; Clay's WebGL/frontend collaborators and the specific type designers are named. LoopLM is explicitly labeled Erik Steiger's reimplementation. The late archive additions also credit Epic's Game Animation Sample, Mixamo, raylib, FFmpeg and Jellyfin; the associated primary URLs were checked separately. The initial availability count below describes the first 115-URL review, not an assertion that every final source was refetched in a single pass.

This review distinguishes four different outcomes that should not be collapsed into “broken link”: a reachable source, an anti-bot/rate-limit block, a network/server failure that leaves identity indeterminate, and a source that resolves successfully but is semantically the wrong paper/project for the portfolio label.

The checker performs bounded HTTPS `GET` requests with redirects enabled, four concurrent requests, and an eight-second timeout by default. It records HTTP status, final URL, content type, elapsed time, and an HTML/citation title where one is exposed. PDF and other non-HTML primary sources can be reachable without an extractable title. `403` and `429` are recorded as blocked rather than broken, and availability failures never set a failing exit status for the website build.

## Run summary

The first pass collected references from `research.js`, `credits.js`, and the now-present optional `catalog.js`. There were **115 distinct HTTPS URLs**: **110 reachable**, **2 HTTP 404**, **2 HTTP 403**, and **1 timeout**. Availability alone is not the semantic review; reachable titles were compared against their labels separately.

### Publicly unavailable / stale URLs

| Source | Result | Review |
| --- | --- | --- |
| `https://github.com/sharanda/manrope` | 404 | **Stale source URL.** The original Manrope repository has been deleted. Google Fonts’ current source investigation identifies a maintained fork/source, and the Google Fonts family page remains public. Recommended public credit target: `https://fonts.google.com/specimen/Manrope` or the current Google Fonts source repository. |
| `https://github.com/AizenKai1001/Realm` | 404 | **Not publicly reachable.** GitHub also returns 404 for private repositories, so this result does not prove deletion. The public portfolio should not expose this link until repository visibility/location is re-confirmed. |

### Blocked or indeterminate, not broken

| Source | Result | Review |
| --- | --- | --- |
| Shannon, *A Mathematical Theory of Communication* (Wiley) | 403 | Publisher automation block. DOI/title/author identity was independently confirmed; no source correction required. |
| Kirkpatrick et al., *Overcoming catastrophic forgetting in neural networks* (PNAS) | 403 | Publisher automation block. DOI/title/author identity was independently confirmed; no source correction required. |
| Unity home page | timeout | One bounded network timeout only. This is not evidence that the URL is wrong. No retry was made in this review. |

## Semantic identity and attribution corrections

These are content corrections even when the URL itself is reachable.

1. **Jiang & Litwin-Kumar paper label.** The PLOS URL in the connectome dossier resolves to **“Models of heterogeneous dopamine signaling in an insect learning and memory center.”** The current label “Models of flexible learning in the mushroom body” is not the source title. Use the actual title (or clearly mark the existing wording as a descriptive shorthand).

2. **TwinProp paper label.** The bioRxiv source is **“What can a neuron compute”** by Ido Aizenbud, David Beniaguev, Noam Pnueli, Idan Segev, and Michael London. TwinProp is the algorithm introduced in that paper. The current URL is correct; using the paper title in the label makes the source identity unambiguous.

3. **Clay Boan case-study credit.** The Codrops article is authored by Clay Boan, but its technical WebGL section explicitly credits **Thomas Van Glabeke**, and the frontend section credits **Rob Smittenaar**; the collaboration also names Théo Favereau, Anoukia Perrey, and Ruud Luijten. Because the portfolio note specifically cites the single-canvas/Three.js implementation, the credit should name Thomas Van Glabeke rather than making that engineering detail appear to be Clay Boan’s implementation alone.

4. **Manrope source and attribution.** The current 404 source link should be replaced. Google Fonts records **Mikhail Sharanda** as the original designer and **Mirko Velimirovic with Sharanda** for the 2019 variable-font conversion. The existing “Mikhail Sharanda & collaborators” label is directionally correct but can be made precise.

5. **Instrument Serif attribution.** The source project credits **Rodrigo Fuenzalida** as designer, with direction from **Jordan Egstad, JD Hooge, and Jack De Caluwé** on behalf of Instrument. “Instrument & collaborators” is too vague for an explicit creator-credit section.

6. **DM Mono attribution.** Primary font metadata describes DM Mono as commissioned for DeepMind, with type design/font development by the **Colophon Foundry Design Team and Jonny Pinhorn**, with creative direction from the DeepMind team. “Colophon Foundry” is not false, but it omits a named designer and the commissioning context.

### Useful title normalizations (not wrong-source defects)

These URLs point to the intended work, but exact titles would make the research bibliography more rigorous:

- Bennett et al. → *Learning with reinforcement prediction errors in a model of the Drosophila mushroom body*.
- Ma, Liu, Li & Zhou → *Beyond Linear Processing: Dendritic Bilinear Integration in Spiking Neural Networks*; “Dendritic LIF” is the model name inside the paper.
- Bowers et al. → *Top-Down Synthesis for Library Learning*; Stitch is the implementation/method introduced by the paper.
- Hafner, Yan & Lillicrap → *Training Agents Inside of Scalable World Models*; Dreamer 4 is the agent introduced by the paper.

## Priority recent-source checks

The requested recent references all resolve to the intended semantic identity:

| Portfolio reference | Verified identity |
| --- | --- |
| arXiv `2608.01475` | *Plasticity of Growing and Elastic Neural Networks in Online Continual Learning* — Jeong Min Kong & Richard S. Sutton. |
| arXiv `2603.14482` | *V-JEPA 2.1: Unlocking Dense Features in Video Self-Supervised Learning* — Lorenzo Mur-Labadia et al. The `facebookresearch/vjepa2` repository also lists this 2.1 paper in its citation section. |
| arXiv `2509.24527` | *Training Agents Inside of Scalable World Models* — Danijar Hafner, Wilson Yan & Timothy Lillicrap; the paper introduces Dreamer 4. |
| arXiv `2512.23675` | *End-to-End Test-Time Training for Long Context* — Arnuv Tandon et al. |
| arXiv `2607.02283` | *Dendritic In-Context Learning in a Single-Layer Spiking Neural Network* — Juwei Shen, Yujie Wu & Changwen Chen; DendriCL is the proposed architecture. |
| `github.com/rkstgr/LoopLM` | Public **reimplementation** maintained by Erik Steiger (`rkstgr`) of *Scaling Latent Reasoning via Looped Language Models* / Ouro (`arXiv:2510.25741`). The current portfolio label correctly names the repository owner, but the note should continue to say it is a reimplementation rather than the original authors’ code. |

The ICLR 2026 proceedings URL for *Beyond Linear Processing: Dendritic Bilinear Integration in Spiking Neural Networks* also resolves correctly and lists Jingyang Ma, Chongming Liu, Songting Li, and Douglas Zhou.

## Design-reference checks

The two September 9, 2026 Codrops references resolve with the expected bylines: **Ming Jyun Hung** for *Still: From Akira to Ink Wash, Building a Generative Garden in WebGPU*, and **Serhii Polyvanyi** for *Turning Names Into Digital Architecture with Three.js*. Their source identities are correct.

Lusion’s Oryzo project page, Bruno Simon’s portfolio/source, Three.js documentation, and the Lusion Scroll Sync repository all resolved to the expected projects. These are inspiration/engineering references and should remain described as such rather than as code or asset dependencies.

## Checker behavior and interpretation

`scripts/check-source-links.mjs` intentionally exits successfully even when public sources are blocked, time out, or return HTTP errors. It is a review instrument, not a production-build gate. A 403/429 may say more about publisher bot policy than link health; a 404 on GitHub can mean private or removed; and a 200 only establishes availability, not semantic correctness. The manual review above is therefore the source of attribution/title corrections.
