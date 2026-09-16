# Research inventory for the portfolio

This inventory records the evidence pass behind `src/research.js`. It is intentionally broader than the six featured project pages, but it does **not** turn every Obsidian note into a portfolio claim. Research papers, creator repositories, local experiments, hypotheses, implementation plans, and measured negative results are kept as different kinds of evidence.

No private machine paths, LAN addresses, deployment commands, credentials, account records, or internal operational logs are intended for publication. Note titles below are provenance labels only.

## How the inventory was assembled

The pass covered the vault home/index material plus the AI, systems, neuroscience, physics, graphics, and project branches. For shortlisted topics, supporting notes were read as contiguous sections rather than assembled from isolated search snippets. The Distinction release record was also cross-checked against the recorded coding session that closed its release review.

The public dataset uses five categories only: `learning`, `simulation`, `systems`, `graphics`, and `foundations`. Status labels describe evidence maturity rather than importance. In particular:

- **Research notes** means literature synthesis or a developed question; it does not imply a local implementation.
- **Research program** means a proposed experimental architecture with explicit gates; only separately documented subsets are treated as built.
- **Measured study / Measured methodology** means local experiments were actually run, including negative or confounded results.
- **Experiment planning** means the work is explicitly deferred and should not be rendered as a completed project.
- **Implementation + research** means one bounded implementation exists, while the broader research direction remains larger than that implementation.

## Dossier coverage

| id | category | status | core vault evidence | related project pages |
|---|---|---|---|---|
| `developmental-non-neural-ai` | learning | Research program | *Non-Neural Developmental Intelligence — Research Program*; *Non-Neural AI — Prior Art and Novelty Map*; *Distinction AI — Build Log* | `distinction` |
| `predictive-states-causal-abstraction` | learning | Research notes | *Predictive State Representations and Computational Mechanics*; non-neural experimental roadmap | `distinction` |
| `continual-plasticity` | learning | Measured study | *Continual Learning and Plasticity*; *Plasticity Bench — Measured Result 2026-09-09* | `plasticity` |
| `connectome-embodied-learning` | simulation | Research notes | *Fruit Fly Connectomes — Practical AI Experiments*; *Fly-Inspired AI — Creative Applications and Game Experiments*; DOOMFLY experiment records | `doomfly` |
| `memory-retrieval-adaptation` | systems | Research notes | *Retrieval-Augmented Generation*; *Test-Time Learning and Neural Memory*; *AI Harness Architecture*; *AI Harnesses — Memory Systems* | — |
| `agents-tools-runtime` | systems | Research notes | *AI Agents and Tool Use*; *AI Harness Architecture*; *AI Harnesses — Protocols and Standards*; coding-agent harness survey | — |
| `evaluation-fixed-yardsticks` | systems | Measured methodology | *Model Evaluation and Metrics*; ForgeLab, Plasticity Bench, EvoForge measured logs; *Ironforge — Blueprint* | `forgelab`, `plasticity`, `evoforge` |
| `world-models-predictive-video` | simulation | Research notes | *World Models and Predictive Representation Learning* | — |
| `low-bit-inference-quantization` | systems | Research notes | *Quantization and Model Compression*; *Low-Precision Training and Discrete Weight Optimization* | — |
| `gpu-execution-memory-wall` | systems | Research notes | *GPU Architecture and Execution Model*; *GPGPU and Compute Shaders*; cache/memory-hierarchy notes | — |
| `from-scratch-learning-systems` | learning | Implementation + research | LLM Forge blueprint/research; *ForgeGrad — how it works* | `forgegrad` |
| `image-to-3d-reconstruction` | graphics | Experiment planning | *Homelab Image-to-3D — Deferred Research Plan* | — |
| `immersive-web-graphics` | graphics | Research + implementation | *Immersive Web Graphics — Build Playbook*; reference-sites note; *Cork and Oryzo — Web Graphics Teardown* | — |
| `biological-computation-memory` | foundations | Research notes | *How the Human Brain Works — Processing, Memory, Creativity*; *Dendritic and Multi-Compartment Neural Computation* | `doomfly` |
| `time-entropy-information` | foundations | Research notes | *Time, Entropy and Information*; *Arrow of Time*; entropy/Past-Hypothesis notes | — |
| `spacetime-gravity-problem-time` | foundations | Research notes | *Gravity*; *General Relativity*; *Spacetime*; *Problem of Time*; spacetime map | — |

## Broader note inventory and how it was grouped

The point of this section is to show breadth without generating duplicate dossier pages for every adjacent note.

### Non-neural / developmental learning

Included or folded into the first two dossiers:

- *Non-Neural Developmental Intelligence — Research Program*
- *Non-Neural AI — Prior Art and Novelty Map*
- *Non-Neural AI — Experimental Roadmap and Benchmarks*
- *Non-Neural AI — Research Addendum*
- *Predictive State Representations and Computational Mechanics*
- *Predictive Distinction Learning*
- *Non-Neural Program Search and Predicate Invention*
- *Grounded Non-Neural Perception and Object Discovery*
- *Developmental Memory Metacognition and Open-Ended Learning*
- *Active Inference and Information-Seeking Agents*

These notes contain overlapping architecture, prior-art, perception, memory, and experiment-design material. Separate pages for every note would make the site look broader while actually repeating one research program, so they are consolidated around the clearest questions and evidence boundaries.

### Neural learning / plasticity / biological computation

Included or folded into `continual-plasticity` and `biological-computation-memory`:

- *Continual Learning and Plasticity*
- *Neural Developmental Programs and Structural Plasticity*
- *Dendritic and Multi-Compartment Neural Computation*
- *Predictive Coding and Local Credit Assignment*
- *Liquid and Continuous-Time Neural Networks*
- *Linear Attention and Delta-Rule Memory*
- *How the Human Brain Works — Processing, Memory, Creativity*
- *Plasticity Bench — Measured Result 2026-09-09*

The measured Plasticity Bench result stays separate from biological inspiration. Dendritic and memory papers are presented as mechanisms or computational analogies, not as evidence that a local AI system reproduces cognition.

### Embodied intelligence / connectomes / simulation

Included or folded into `connectome-embodied-learning`, `world-models-predictive-video`, and `evaluation-fixed-yardsticks`:

- *Fruit Fly Connectomes — Practical AI Experiments*
- *Fly-Inspired AI — Creative Applications and Game Experiments*
- *World Models and Predictive Representation Learning*
- *ForgeLab — Build Log*
- *EvoForge — Build Log*
- physics-engine verification material referenced by ForgeLab

The key claims boundary is that connectome structure, propagated activity, changed weights, survival time, and learning are different observations. The DOOMFLY dossier credits upstream work and retains failed learning gates. ForgeLab and EvoForge appear mainly in the evaluation dossier because their most instructive results were measurement failures and corrected interpretations.

### Memory / RAG / context engineering / tools

Included or folded into `memory-retrieval-adaptation` and `agents-tools-runtime`:

- *Retrieval-Augmented Generation*
- *Test-Time Learning and Neural Memory*
- *Conditional Memory and Scalable Lookup*
- *AI Agents and Tool Use*
- *Self-Modifying Agents and Empirical Improvement*
- *AI Harness Architecture*
- *AI Harnesses — Memory Systems*
- *AI Harnesses — Coding Agents*
- *AI Harnesses — Frameworks and Orchestration*
- *AI Harnesses — Protocols and Standards*
- *AI Harnesses — Autonomous SWE*

The harness survey contains useful creator-by-creator engineering detail, but many benchmark figures are vendor-reported or contested. The public dossiers therefore cite mechanisms and primary specifications while avoiding unsupported “best memory system” or “best agent framework” rankings.

### Evaluation and benchmark discipline

Included in `evaluation-fixed-yardsticks`:

- *Model Evaluation and Metrics*
- *Verification discipline for agent work*
- *ForgeLab — Build Log*
- *Plasticity Bench — Measured Result 2026-09-09*
- *EvoForge — Build Log*
- *Ironforge — Blueprint*
- coding-model evaluation/benchmark notes

This cluster is unusually important because the vault contains actual reversals of earlier interpretations. ForgeLab’s apparent locomotion collapsed after fixing an energy-creating solver path; Plasticity Bench reproduced internal deterioration without behavioral loss; EvoForge’s learning probe was confounded by survivorship. Those negative controls are more portfolio-worthy than polishing the original positive stories.

### Quantization / kernels / systems performance

Included in `low-bit-inference-quantization` and `gpu-execution-memory-wall`:

- *Quantization and Model Compression*
- *Low-Precision Training and Discrete Weight Optimization*
- *GPU Architecture and Execution Model*
- *GPGPU and Compute Shaders*
- *Cache and Memory Hierarchy Optimization*
- *Memory Management and Allocators*
- Performance and Optimization map

Only the GPU and low-bit material with direct relevance to ML inference/rendering is surfaced. Generic operating-system memory notes remain in the vault rather than becoming artificial portfolio dossiers.

### Local model construction

Included in `from-scratch-learning-systems`:

- *LLM Forge — Blueprint*
- *Research — PyTorch alternatives & best code to learn from*
- *ForgeGrad — how it works*
- recurrent/looped-language-model references

ForgeGrad is the bounded implemented artifact. LLM Forge and adjacent framework notes are broader design research. The dossier credits micrograd, tinygrad, MiniTorch, nanoGPT, and LoopLM rather than absorbing their designs into the user’s authorship.

### Image-to-3D / graphics

Included in `image-to-3d-reconstruction` and `immersive-web-graphics`:

- *Homelab Image-to-3D — Deferred Research Plan*
- *Immersive Web Graphics — Build Playbook*
- *Immersive Web Graphics — Reference Sites*
- *Cork and Oryzo — Web Graphics Teardown*
- real-time rendering / batching notes where relevant

Image-to-3D remains explicitly deferred: no local training result is claimed. The WebGL dossier credits Bruno Simon, Lusion, and Three.js. The portfolio’s 3D observatory/models are original procedural work informed by those engineering references, not recreations of those sites.

### Foundations: information, time, gravity

Included in the two foundations dossiers:

- *Time*
- *Time, Entropy and Information*
- *Arrow of Time*
- *Entropy*
- *Bekenstein-Hawking Entropy*
- *Gravity*
- *General Relativity*
- *Spacetime*
- *Time Dilation*
- *Problem of Time*
- *Emergent Spacetime*
- Spacetime & Gravity map
- Thermodynamics & Information map
- Quantum Gravity & Unification map (used for context, not elevated into a separate portfolio “theory”)

The site should present this as study of established physics and open problems. Nothing in the vault establishes a personal theory of quantum gravity, time, or emergent spacetime, so no such claim appears in `researchTopics`.

## Primary-source shortlist used by the public dossiers

These URLs are intentionally primary papers, official creator repositories, official specifications, or creator engineering sources rather than secondary explainers.

### Learning and simulation

- Bayesian Program Learning — Lake, Salakhutdinov & Tenenbaum: <https://www.cs.princeton.edu/~bl8144/papers/LakeEtAl2015Science.pdf>
- DreamCoder — Ellis et al.: <https://arxiv.org/abs/2006.08381>
- Predictive State Representations — Littman, Sutton & Singh: <https://proceedings.neurips.cc/paper/2001/file/1e4d36177d71bbb3558e43af9577d70e-Paper.pdf>
- Computational Mechanics — Shalizi & Crutchfield: <https://arxiv.org/abs/cond-mat/9907176>
- CSSR — Shalizi & Shalizi: <https://arxiv.org/abs/cs/0406011>
- Loss of plasticity — Dohare et al.: <https://www.nature.com/articles/s41586-024-07711-7>
- Whole-fly connectome model — Shiu et al.: <https://www.nature.com/articles/s41586-024-07763-9>
- FlyVis creator repository: <https://github.com/TuragaLab/flyvis>
- V-JEPA 2.1 — Meta FAIR: <https://arxiv.org/abs/2603.14482>
- V-JEPA 2 creator repository: <https://github.com/facebookresearch/vjepa2>
- Dreamer 4 — Hafner et al.: <https://arxiv.org/abs/2509.24527>

### Memory, agents, and evaluation

- RAG — Lewis et al.: <https://arxiv.org/abs/2005.11401>
- TTT-E2E: <https://arxiv.org/abs/2512.23675>
- ReAct — Yao et al.: <https://arxiv.org/abs/2210.03629>
- Reflexion — Shinn et al.: <https://arxiv.org/abs/2303.11366>
- Model Context Protocol official specification: <https://modelcontextprotocol.io/>
- Agent Skills official specification: <https://agentskills.io/>
- HELM — Liang et al.: <https://arxiv.org/abs/2211.09110>
- HumanEval paper — Chen et al.: <https://arxiv.org/abs/2107.03374>

### Local-model systems and graphics

- AWQ — Lin et al.: <https://arxiv.org/abs/2306.00978>
- GPTQ — Frantar et al.: <https://arxiv.org/abs/2210.17323>
- llama.cpp quantization docs — ggml-org: <https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md>
- CUDA Programming Guide — NVIDIA: <https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html>
- micrograd — Andrej Karpathy: <https://github.com/karpathy/micrograd>
- tinygrad — George Hotz and contributors: <https://github.com/tinygrad/tinygrad>
- MiniTorch — Sasha Rush and contributors: <https://minitorch.github.io/>
- nanoGPT — Andrej Karpathy: <https://github.com/karpathy/nanoGPT>
- LoopLM — rkstgr: <https://github.com/rkstgr/LoopLM>
- Occupancy Networks — Mescheder et al.: <https://github.com/autonomousvision/occupancy_networks>
- TripoSR — Tripo AI & Stability AI: <https://github.com/VAST-AI-Research/TripoSR>
- Splatter Image — Szymanowicz, Rupprecht & Vedaldi: <https://openaccess.thecvf.com/content/CVPR2024/html/Szymanowicz_Splatter_Image_Ultra-Fast_Single-View_3D_Reconstruction_CVPR_2024_paper.html>
- Bruno Simon Folio 2025 source: <https://github.com/brunosimon/folio-2025>
- Lusion WebGL Scroll Sync: <https://github.com/lusionltd/WebGL-Scroll-Sync>

### Neuroscience and physics

- Dendritic LIF — Ma, Liu, Li & Zhou: <https://proceedings.iclr.cc/paper_files/paper/2026/hash/7d1fe4f9eecba80469c7434d1c725ec2-Abstract-Conference.html>
- TwinProp / *What can a neuron compute* — Aizenbud et al.: <https://www.biorxiv.org/content/10.64898/2026.06.08.730984v1>
- DendriCL — Shen, Wu & Chen: <https://arxiv.org/abs/2607.02283>
- Shannon — *A Mathematical Theory of Communication*: <https://onlinelibrary.wiley.com/doi/10.1002/j.1538-7305.1948.tb01338.x>
- Bérut et al. — experimental Landauer test: <https://www.nature.com/articles/nature10872>
- MICROSCOPE final equivalence-principle result: <https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.129.121102>
- LIGO/Virgo GW150914: <https://doi.org/10.1103/PhysRevLett.116.061102>
- EHT M87* paper I: <https://doi.org/10.3847/2041-8213/AB0EC7>
- Page & Wootters — relational time: <https://journals.aps.org/prd/abstract/10.1103/PhysRevD.27.2885>

## Deliberate exclusions and non-claims

- **No “new scientific method” or AGI claim.** The non-neural work is a research program plus a bounded prototype over engineered observations.
- **No claim that a connectome is a learned agent.** Wiring, simulated activity, controller behavior, and learning are separate gates.
- **No claim that Plasticity Bench refutes Dohare et al.** It is a smaller negative result under different conditions.
- **No claim that EvoForge demonstrated lifetime learning.** Its 14-run sweep did not separate plasticity on/off; an apparent old/young signal was confounded by survivorship.
- **No claim that ForgeLab demonstrated walking.** The earlier positive result collapsed after a physics-solver exploit was fixed; the one fresh re-evolved seed still barely beat its motionless baseline.
- **No image-to-3D training claim.** That note is explicitly a deferred plan.
- **No production-framework replacement claim.** ForgeGrad is a small educational framework. LLM Forge has an implemented tokenizer, looped model, and training pipeline; its wider research goals remain distinct from those implemented components.
- **No personal theory of gravity/time.** Those dossiers summarize tested physics and open foundational problems.
- **No vendor-memory benchmark rankings.** The harness survey records disputed and vendor-reported numbers; the public dossier uses the architecture lessons without turning those numbers into a leaderboard.
- **No operations material.** Deployment addresses, local machine locations, service commands, backup procedures, and incident details are intentionally absent from the public research dataset.
