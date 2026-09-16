// Evidence-backed archive projects beyond the six featured experiments in content.js.
// Keep this file public-safe: no private hosts, local paths, credentials, account data, or logs.
import { archiveAdditions } from './archive-additions.js';
import { labProjects } from './lab-projects.js';

export const catalogProjects = [
  {
    id: '001-agent',
    name: '001 Agent Runtime',
    category: 'systems',
    area: 'Local agent architecture',
    status: 'Local prototype',
    kind: 'Original project',
    summary: 'A deliberately small local-agent runtime built around an OpenAI-compatible chat interface, inspectable memory and skills, permission-tiered tools, streaming events, and both CLI and browser front ends. The design keeps provider abstraction thin and makes mutating tool approval explicit instead of hiding behavior behind a large agent framework.',
    question: 'How small can a useful local agent runtime stay while keeping memory, tools, permissions, and streaming inspectable?',
    tech: ['Python', 'HTTP/SSE', 'OpenAI-compatible chat API', 'Local memory', 'Permission-gated tools'],
    sections: [
      { title: 'What exists', text: 'The codebase contains a provider-light LLM client, agent loop, memory, skills, tool registry, CLI, browser server, persistent chats, and browser-mediated permission prompts that deny on timeout.' },
      { title: 'Current limit', text: 'The inventory confirms the implementation shape, not model quality or autonomy claims. Its default endpoint and runtime settings are local deployment details and are intentionally excluded from the public catalog.' }
    ],
    credits: [
      { label: 'CPython', href: 'https://github.com/python/cpython', note: 'The runtime is deliberately implemented with a small Python/stdlib-oriented core rather than a large agent framework.' }
    ],
    links: [],
    evidence: 'Git repository, CLI/server modules, and core agent modules reviewed; no public origin is configured.',
    related: ['revolo', 'homelab-mcp', 'toolcall-bench']
  },
  {
    id: 'aimforge',
    name: 'AimForge',
    category: 'tools',
    area: 'Passive aim measurement',
    status: 'Capture & analysis prototype',
    kind: 'Original project',
    summary: 'A passive aim-coaching measurement stack that synchronizes raw mouse input, an overhead camera, and screen capture against one QPC-derived timebase. Its contract explicitly bans input synthesis and process inspection, owns the capture-file format and metric math, and treats integrity, timestamp provenance, and recoverable partial recordings as first-class requirements.',
    question: 'Can aim improvement be measured from synchronized physical and screen evidence without controlling the game or injecting input?',
    tech: ['Python', 'C++', 'Windows Raw Input', 'Windows Graphics Capture', 'OpenCV', 'PyArrow'],
    sections: [
      { title: 'What exists', text: 'The repository contains native and Python capture components, a CRC-checked AFLOG format, session orchestration, fsck/convert tooling, sensitivity math, tests, and an explicit coach-only guard that scans for prohibited input/process APIs.' },
      { title: 'Current limit', text: 'This inventory verifies the M0 implementation contract and source layout, not the accuracy of higher-level coaching conclusions. Captured sessions and hardware-specific calibration data remain private evidence, not portfolio content.' }
    ],
    credits: [
      { label: 'OpenCV', href: 'https://github.com/opencv/opencv', note: 'Camera/computer-vision dependency declared by the AimForge package manifest.' }
    ],
    links: [],
    evidence: 'README, package manifest, and frozen M0 contract reviewed; repository has no public origin configured.',
    related: ['sound-direction-visualizer']
  },
  {
    id: 'sound-direction-visualizer',
    name: 'Sound Direction Visualizer',
    category: 'graphics',
    area: 'Spatial audio visualization',
    status: 'Desktop prototype',
    kind: 'Original project',
    summary: 'An Electron and Three.js desktop visualizer that captures Windows audio through a native WASAPI helper and maps per-channel energy onto a 3D directional radar. True 360-degree azimuth is reserved for discrete surround input; stereo is correctly limited to a front left-right arc, while distance remains a qualitative estimate rather than meters.',
    question: 'How much directional information can be recovered from ordinary Windows audio without touching a game process?',
    tech: ['Electron', 'Three.js', 'C++', 'WASAPI', 'Web Audio'],
    sections: [
      { title: 'What exists', text: 'A native capture helper enumerates sessions and streams PCM; the Electron shell forwards format/audio data to a renderer that computes channel-vector direction and displays the result in a 3D radar.' },
      { title: 'Current limit', text: 'Stereo cannot reveal front-versus-back and ordinary 5.1/7.1 does not contain height channels. Distance is inferred from signal characteristics and is intentionally shown as qualitative near/mid/far.' }
    ],
    credits: [
      { label: 'Three.js', href: 'https://github.com/mrdoob/three.js', note: '3D rendering dependency recorded in the package manifest.' },
      { label: 'Electron', href: 'https://github.com/electron/electron', note: 'Desktop application shell recorded in the package manifest.' }
    ],
    links: [],
    evidence: 'README, package manifest, Electron source, and native helper layout reviewed; no public project origin is configured.',
    related: ['aimforge']
  },
  {
    id: 'codex-usage-widget',
    name: 'Codex Usage Widget',
    category: 'systems',
    area: 'Local usage telemetry',
    status: 'Implemented tooling',
    kind: 'Tooling',
    summary: 'A small cross-machine usage widget that reads quota metadata from an already signed-in coding client without starting a model turn, reduces it to allowlisted percentages and timestamps, and renders a stale-aware desktop panel. The project includes collector and renderer tests plus an atomic publication path, while keeping credentials on the source machine.',
    question: 'Can subscription usage be surfaced as a reliable ambient system metric without exposing credentials or consuming a model turn?',
    tech: ['Node.js', 'Python', 'Conky', 'Local RPC', 'Atomic JSON snapshots'],
    sections: [
      { title: 'What exists', text: 'Collector, renderer, scheduled-run helper, Conky configuration, tests, and stale-data handling are present. Failed refreshes retain the previous snapshot instead of replacing it with misleading zeroes.' },
      { title: 'Current limit', text: 'It depends on an installed, signed-in desktop client and reports that client’s quota semantics rather than API billing. No personal quota values or account identifiers belong in the public portfolio.' }
    ],
    credits: [
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Desktop system-monitor surface used by the rendered quota widget.' }
    ],
    links: [],
    evidence: 'README plus Node and Python test files reviewed; private quota snapshots and deployment details were excluded.',
    related: ['homelab-widgets']
  },
  {
    id: 'craftax-live',
    name: 'Craftax Live',
    category: 'learning',
    area: 'Reinforcement learning',
    status: 'Research implementation',
    kind: 'Research implementation',
    summary: 'A from-scratch training deployment around unmodified Craftax 1.6.1 using PPO, symbolic observations, durable checkpoint continuation, fixed held-out worlds, and a read-only spectator. The live renderer follows exported current policy rather than replaying a training trajectory, and the project explicitly treats its small evaluation set as an early signal rather than generalization proof.',
    question: 'Can a large baseline PPO policy be trained and observed continuously while keeping checkpoint continuation and evaluation claims honest?',
    tech: ['Python', 'JAX', 'Flax', 'Optax', 'Craftax', 'PPO'],
    sections: [
      { title: 'What exists', text: 'Trainer, model, spectator, read-only server, benchmark tooling, continuation check, unit tests, checkpoint/export paths, and an independent CPU spectator are present.' },
      { title: 'Current limit', text: 'The policy uses Craftax symbolic observations rather than rendered pixels, has no recurrent memory, and is evaluated on a small fixed set. Those measurements are not evidence of broad game mastery.' }
    ],
    credits: [
      { label: 'Craftax', href: 'https://github.com/MichaelTMatthews/Craftax', note: 'Upstream environment used unmodified by the training project.' },
      { label: 'Craftax Baselines', href: 'https://github.com/MichaelTMatthews/Craftax_Baselines', note: 'Reference PPO architecture and baseline project.' },
      { label: 'Schulman et al. — Proximal Policy Optimization Algorithms', href: 'https://arxiv.org/abs/1707.06347', note: 'Original PPO method used by the policy-optimization layer; the environment, training deployment and evaluation have separate attribution.' }
    ],
    links: [],
    evidence: 'README, requirements, trainer/server tests, and Git worktree metadata reviewed; upstream environment and baseline repositories are separately credited.',
    related: ['ironforge', 'mcsim']
  },
  {
    id: 'gpu-roofline-probe',
    name: 'GPU Roofline Probe',
    category: 'tools',
    area: 'CUDA performance measurement',
    status: 'Measurement utility',
    kind: 'Tooling',
    summary: 'A compact CUDA roofline-style probe for measuring achievable device-memory bandwidth with read-only reduction, copy, and vector-add traffic shapes. It reports device properties, theoretical bandwidth, timed kernel throughput, and percent-of-peak using CUDA events, providing a concrete hardware baseline for reasoning about memory-bound local AI and graphics workloads.',
    question: 'What memory bandwidth does the GPU actually deliver for common read and read-write kernel shapes?',
    tech: ['CUDA C++', 'CUDA Runtime', 'GPU microbenchmarking'],
    sections: [
      { title: 'What exists', text: 'The repository contains a build helper and one CUDA probe with warmups, CUDA-event timing, vectorized float4 traffic, and three memory-access shapes.' },
      { title: 'Current limit', text: 'This is intentionally a microbenchmark. One set of bandwidth kernels does not characterize compute throughput, cache behavior, tensor cores, or application-level performance.' }
    ],
    credits: [
      { label: 'NVIDIA CUDA Toolkit', href: 'https://developer.nvidia.com/cuda-toolkit', note: 'CUDA runtime and event APIs are the measurement platform used by this microbenchmark.' }
    ],
    links: [],
    evidence: 'CUDA source and local Git history reviewed; the repository has no public origin.',
    related: ['modelfit', 'llm-forge']
  },
  {
    id: 'homelab-mcp',
    name: 'Homelab MCP',
    category: 'tools',
    area: 'Human-gated computer control',
    status: 'Implemented tooling',
    kind: 'Tooling',
    summary: 'A local Windows control server built on the Model Context Protocol with a deliberately stronger permission boundary than the calling model: read-only inspection tools run directly, while mutations require a native human Yes/No dialog showing the exact command, and destructive power actions receive a stronger warning. The approval decision is enforced inside the server.',
    question: 'Can a desktop agent gain useful machine control while preserving a human approval boundary outside the model?',
    tech: ['Node.js', 'Model Context Protocol', 'PowerShell', 'Windows native dialogs'],
    sections: [
      { title: 'What exists', text: 'System/process/service/file inspection and gated mutation tools are implemented, along with an installer and local test client. The server distinguishes normal mutations from destructive power controls.' },
      { title: 'Current limit', text: 'The boundary is local and user-account scoped; approving a powerful command still grants that command. The portfolio should describe the gate, not imply sandboxing beyond the permissions of the host account.' }
    ],
    credits: [
      { label: 'Model Context Protocol TypeScript SDK', href: 'https://github.com/modelcontextprotocol/typescript-sdk', note: 'Protocol SDK dependency recorded by the installed package metadata.' }
    ],
    links: [],
    evidence: 'README and package manifest reviewed; deployment addresses and machine details were excluded.',
    related: ['001-agent', 'revolo', 'n8n-browser']
  },
  {
    id: 'homelab-widgets',
    name: 'Homelab Widgets',
    category: 'systems',
    area: 'Ambient operations dashboard',
    status: 'Tooling collection',
    kind: 'Tooling',
    summary: 'A collection of Conky panels and helper scripts that turn local services, model training, container health, network flows, media state, game servers, and machine metrics into a glanceable desktop operations surface. Several helpers do real attribution work—such as per-container network namespaces—rather than merely formatting one pre-existing monitoring endpoint.',
    question: 'How much operational context can be made ambient and legible without opening a full monitoring dashboard?',
    tech: ['Bash', 'Python', 'Lua', 'Conky', 'Docker', 'Linux network namespaces'],
    sections: [
      { title: 'What exists', text: 'The folder contains service grids, training panels, network-flow attribution, launch scripts, game/media panels, and matching Conky configurations.' },
      { title: 'Current limit', text: 'This is deployment-shaped tooling rather than a portable application. Service names and machine-specific configuration are intentionally omitted from the public catalog.' }
    ],
    credits: [
      { label: 'Conky', href: 'https://github.com/brndnmtthws/conky', note: 'Desktop monitoring platform targeted by the widget/configuration collection.' }
    ],
    links: [],
    evidence: 'Panel scripts and configurations reviewed; private service topology and host identifiers were excluded.',
    related: ['codex-usage-widget', 'llm-forge', 'realm']
  },
  {
    id: 'imagine-studio',
    name: 'Imagine',
    category: 'product',
    area: 'Local image-generation interface',
    status: 'Local application',
    kind: 'Tooling',
    summary: 'A compact authenticated web studio that turns prompt, model, aspect, sampler, step, CFG, and seed controls into ComfyUI workflow requests, polls for completion, proxies the resulting image, and keeps a lightweight in-page gallery. It is intentionally a thin local interface rather than a new diffusion model or a replacement for the upstream generation backend.',
    question: 'Can a local image backend be exposed through a minimal purpose-built interface without reproducing an entire node editor?',
    tech: ['Python', 'Flask', 'ComfyUI API', 'HTML/CSS/JavaScript', 'Docker'],
    sections: [
      { title: 'What exists', text: 'The application implements authentication, model enumeration, workflow construction, queued generation, result polling, image proxying, responsive controls, and container packaging.' },
      { title: 'Current limit', text: 'It is a front end around an upstream ComfyUI service. Model quality, checkpoint licensing, generation speed, and backend availability are not properties of this small web layer.' }
    ],
    credits: [
      { label: 'ComfyUI', href: 'https://github.com/comfyanonymous/ComfyUI', note: 'Upstream image-generation workflow backend used by the interface.' }
    ],
    links: [],
    evidence: 'Flask application and container configuration reviewed; authentication values and private backend addresses were excluded.',
    related: ['revolo']
  },
  {
    id: 'ironforge',
    name: 'Ironforge',
    category: 'learning',
    area: 'Measured voxel reinforcement learning',
    status: 'Research prototype',
    kind: 'Original project',
    summary: 'A reinforcement-learning project that combines ForgeGrad with a vectorized voxel tech-tree simulator, recurrent actor-critic policy, PPO, curricula, plasticity instrumentation, checkpointing, replay, and a sealed exam. Frozen and random controls help distinguish learning from a rising training reward.',
    question: 'Can a from-scratch learning stack climb a voxel technology tree while a sealed evaluator separates real progress from training-loop self-deception?',
    tech: ['Python', 'NumPy', 'CuPy', 'PPO', 'GRU', 'Custom autograd'],
    sections: [
      { title: 'What exists', text: 'Source modules cover curriculum, exam, model, plasticity, replay, state, simulation, vendored ForgeGrad operations, a static viewer, deployment files, and a multi-file test suite.' },
      { title: 'Current limit', text: 'The current folder is a working tree governed by a detailed contract, but this inventory did not execute its trainer or independently verify the contract’s historical measured-agent claims.' }
    ],
    credits: [
      { label: 'NumPy', href: 'https://github.com/numpy/numpy', note: 'CPU array backend used by the simulator and training stack.' },
      { label: 'CuPy', href: 'https://github.com/cupy/cupy', note: 'Optional CUDA array backend used by the same custom learning stack.' },
      { label: 'Schulman et al. — Proximal Policy Optimization Algorithms', href: 'https://arxiv.org/abs/1707.06347', note: 'Original policy-optimization method. The voxel environment, custom autograd integration and evaluation are local implementation work.' }
    ],
    links: [],
    evidence: 'Frozen project contract, source layout, and tests reviewed; no public origin or completed Git commit was established in the snapshot.',
    related: ['forgegrad', 'mcsim', 'plasticity']
  },
  {
    id: 'llm-forge',
    name: 'LLM Forge',
    category: 'learning',
    area: 'From-scratch language modeling',
    status: 'Core pipeline implemented',
    kind: 'Original project',
    summary: 'A small language-model learning project that owns its byte-level BPE tokenizer, weight-tied recurrent-depth GPT, data pipeline, training loop, sampling, retrieval experiments, and ablations instead of starting from pretrained weights. The central experiment reuses one core block for multiple passes so inference-time loop count can trade additional compute for effective depth.',
    question: 'What can be learned by owning the tokenizer, model, training loop, and recurrent-depth mechanism end to end on modest hardware?',
    tech: ['Python', 'PyTorch', 'Byte-level BPE', 'RoPE', 'RMSNorm', 'SwiGLU', 'Recurrent depth'],
    sections: [
      { title: 'What exists', text: 'Tokenizer, looped GPT, corpus builders, training and sampling scripts, structured/retrieval experiments, confidence tools, and loop ablations are present. Status heartbeats support external training visualization.' },
      { title: 'Current limit', text: 'The README explicitly calls this a learning project rather than a frontier model. The core pipeline is marked complete while the broader reasoning-data milestone remains in progress.' }
    ],
    credits: [
      { label: 'PyTorch', href: 'https://github.com/pytorch/pytorch', note: 'Tensor/GPU training dependency used by the from-scratch tokenizer/model/training project.' }
    ],
    links: [],
    evidence: 'README, model/data/training scripts, and dependency manifest reviewed; no public repository origin is configured.',
    related: ['forgegrad', 'modelfit', 'gpu-roofline-probe', 'quantization-fly-study']
  },
  {
    id: 'mcsim',
    name: 'MCSim',
    category: 'simulation',
    area: 'Vectorized voxel RL environment',
    status: 'Research prototype',
    kind: 'Research implementation',
    summary: 'A NumPy-first vectorized voxel world designed around a technology-tree reinforcement-learning task, paired with a small PyTorch recurrent actor-critic and PPO trainer. The environment documents why milestone history is part of the observation and why repeat rewards are suppressed, making simulator semantics explicit before any learning curve is interpreted.',
    question: 'Can a compact, inspectable voxel environment make technology-tree progress measurable enough to support controlled RL experiments?',
    tech: ['Python', 'NumPy', 'PyTorch', 'PPO', 'Vectorized environments', 'GRU'],
    sections: [
      { title: 'What exists', text: 'World generation, registry, vectorized environment, recurrent policy, PPO, evaluation/replay scripts, tests, and saved training checkpoints are present.' },
      { title: 'Current limit', text: 'Checkpoint presence is not itself evidence of performance. This inventory read code and artifacts but did not run evaluation, compare seeds, or promote any historical training result into a current capability claim.' }
    ],
    credits: [
      { label: 'NumPy', href: 'https://github.com/numpy/numpy', note: 'Array backend used by the vectorized voxel simulator.' },
      { label: 'PyTorch', href: 'https://github.com/pytorch/pytorch', note: 'Neural-network and optimization runtime used by the recurrent policy/PPO layer.' },
      { label: 'Schulman et al. — Proximal Policy Optimization Algorithms', href: 'https://arxiv.org/abs/1707.06347', note: 'Original PPO algorithm used to train the recurrent policy in the custom voxel environment.' }
    ],
    links: [],
    evidence: 'Simulator/model/trainer source, tests, and checkpoint directories reviewed; there is no public repository metadata.',
    related: ['ironforge', 'craftax-live']
  },
  {
    id: 'modelfit',
    name: 'ModelFit',
    category: 'tools',
    area: 'Local-model hardware fit',
    status: 'Benchmark toolkit',
    kind: 'Tooling',
    summary: 'A hardware-fit lab for local language models that estimates weight, KV-cache, activation, offload, prefill, and decode costs; measures real llama-bench throughput and memory; calibrates the predictor; and combines fit, speed, and published-quality inputs into a shortlist. The project clearly separates calculated estimates, measured results, and its heuristic “smartest” score.',
    question: 'Which model and quantization actually fit a particular GPU while preserving enough speed and quality for the intended workload?',
    tech: ['Python', 'CUDA', 'llama.cpp', 'GGUF', 'Docker', 'lm-eval optional'],
    sections: [
      { title: 'What exists', text: 'CLI modules cover hardware modeling, quantization metadata, model candidates, prediction, llama-bench parsing/calibration, quality inputs, ranking, reports, storage, and pure tests.' },
      { title: 'Current limit', text: 'The composite quality score is for screening, not ground truth. Real throughput depends on machine load and downloaded weights; the README recommends a heavier evaluation harness for finalists.' }
    ],
    credits: [
      { label: 'llama.cpp', href: 'https://github.com/ggerganov/llama.cpp', note: 'Built in the project container and used for real local benchmarking.' }
    ],
    links: [],
    evidence: 'README, package metadata, Docker build, candidate data layout, and benchmark/ranking tests reviewed.',
    related: ['llm-forge', 'gpu-roofline-probe']
  },
  {
    id: 'n8n-browser',
    name: 'n8n Browser Service',
    category: 'tools',
    area: 'Watchable browser automation',
    status: 'Implemented service',
    kind: 'Tooling',
    summary: 'A Playwright-driven Chromium service that exposes navigation, interaction, extraction, screenshots, PDFs, uploads, dialogs, downloads, sessions, profiles, popups, and multi-step flows through a JSON API plus a custom n8n node. The design emphasizes watchability and named sessions while documenting that a credentialed browser is inherently a powerful, LAN-only capability.',
    question: 'Can visual browser automation be made observable and reusable from n8n without installing execution tooling inside the n8n container?',
    tech: ['TypeScript', 'Playwright', 'Chromium', 'n8n custom node', 'Docker', 'noVNC'],
    sections: [
      { title: 'What exists', text: 'The project includes the browser API, session/profile management, a custom n8n node, Docker packaging, tests, host/virtual display modes, view-only live observation, and flow-level execution.' },
      { title: 'Current limit', text: 'A browser holding real authenticated sessions is a security boundary, not a sandbox. The project documentation explicitly restricts it to trusted local networking and treats browser credentials as sensitive.' }
    ],
    credits: [
      { label: 'Playwright', href: 'https://github.com/microsoft/playwright', note: 'Browser automation runtime used by the service.' },
      { label: 'n8n', href: 'https://github.com/n8n-io/n8n', note: 'Automation platform targeted by the custom Browser node.' }
    ],
    links: [],
    evidence: 'README, package manifest, TypeScript source, custom-node layout, and tests reviewed; private network addresses and authentication details were excluded.',
    related: ['homelab-mcp', '001-agent']
  },
  {
    id: 'realm',
    name: 'Realm',
    category: 'product',
    area: 'Media tracking and social library',
    status: 'Desktop & web application',
    kind: 'Original project',
    summary: 'A desktop media tracker spanning anime, manga, manhwa, novels, television, and movies, with library progress, release schedules, profiles, friends, rich presence, updates, and optional server sync. The repository contains Electron and web builds plus server code and a deliberately simplified public-facing README for distributing the Windows application.',
    question: 'What does a unified personal media library look like when tracking, schedule, profile, social, and desktop integration share one product?',
    tech: ['TypeScript', 'React', 'Electron', 'Vite', 'Node.js'],
    sections: [
      { title: 'What exists', text: 'The source tree contains desktop, web, server, build/release, assets, scripts, documentation, and packaged public-repository material; the package manifest identifies version 2.28.0 in this snapshot.' },
      { title: 'Current limit', text: 'This inventory validates source/product structure and the public repository, not current service uptime or every integration. Account libraries, private environment configuration, and server records are excluded.' }
    ],
    credits: [
      { label: 'Electron', href: 'https://github.com/electron/electron', note: 'Desktop application shell declared by the Realm package manifest.' },
      { label: 'React', href: 'https://github.com/facebook/react', note: 'UI framework declared by the Realm package manifest.' }
    ],
    links: [],
    evidence: 'Package manifest, distribution README, source tree, and configured Git origin reviewed. A later anonymous public-link check could not reach the repository, so no public source link is advertised here.',
    related: ['simkl-tools']
  },
  {
    id: 'realmforge',
    name: 'RealmForge',
    category: 'graphics',
    area: 'From-scratch game engine',
    status: 'Engine & editor prototype',
    kind: 'Original project',
    summary: 'A C++20 game engine and editor whose load-bearing systems—math, ECS, JSON, OpenGL loader, rendering, serialization, scene graph, scripting bindings, and physics layer—are written from first principles. It combines an HDR PBR renderer, docking editor, play mode, Lua hot reload, audio, physics, glTF/OBJ assets, and a standalone game runtime.',
    question: 'How much of a modern editor-to-runtime game-engine lifecycle can be built from first principles while keeping third parties at the platform edges?',
    tech: ['C++20', 'OpenGL 4.6', 'PBR/HDR', 'Dear ImGui', 'Lua', 'CMake'],
    sections: [
      { title: 'What exists', text: 'Editor, engine library, standalone player, human-readable scene format, PBR/HDR/shadows/post-processing, play/restore, Lua scripting, physics, audio, importers, demo scene, tests, and architecture documentation are present.' },
      { title: 'Current limit', text: 'The README reports warning-clean Debug/Release builds and 2,745 test assertions, but those historical checks were not rerun during this portfolio inventory. Animation/skinning and deeper production subsystems remain roadmap items.' }
    ],
    credits: [
      { label: 'GLFW', href: 'https://www.glfw.org/', note: 'Windowing, input, and OpenGL context edge library.' },
      { label: 'Dear ImGui', href: 'https://github.com/ocornut/imgui', note: 'Docking editor UI.' },
      { label: 'ImGuizmo', href: 'https://github.com/CedricGuillemet/ImGuizmo', note: 'Editor transform gizmos.' },
      { label: 'cgltf', href: 'https://github.com/jkuhlmann/cgltf', note: 'glTF container parser.' },
      { label: 'Lua', href: 'https://www.lua.org/', note: 'Embedded scripting VM.' },
      { label: 'miniaudio', href: 'https://miniaud.io/', note: 'Audio device and mixing edge library.' }
    ],
    links: [],
    evidence: 'README, engine/editor/runtime layout, CMake project, docs, and Git history reviewed; no public origin is configured.',
    related: ['newvox', 'veilborn']
  },
  {
    id: 'revolo',
    name: 'Revolo',
    category: 'product',
    area: 'Personal desktop agent',
    status: 'Desktop application',
    kind: 'Original project',
    summary: 'A Windows personal-agent application that combines persistent vault-backed memory and skills, sessions, streaming reasoning, attachments, local speech input/output, a visual canvas, scheduled work, subagents, a permission system, desktop/media/browser controls, and multiple model engines. Its design explicitly draws inspiration from Hermes Agent while implementing a distinct Electron product and interface.',
    question: 'What should a persistent desktop agent look like when memory, tools, permissions, sessions, voice, local models, and visual workspaces live in one application?',
    tech: ['Electron', 'TypeScript', 'Claude Agent SDK', 'MCP', 'Whisper', 'Local model APIs'],
    sections: [
      { title: 'What exists', text: 'The README documents a broad implemented surface: chat/session continuity, memory and skills, canvas, voice, system/media/browser control, scheduled tasks, subagents, tool views, local-model switching, and Windows packaging.' },
      { title: 'Current limit', text: 'Several capabilities depend on third-party subscriptions, local services, desktop applications, or separately installed models. This inventory verifies source and packaging claims, not the live availability of every external engine.' }
    ],
    credits: [
      { label: 'Hermes Agent', href: 'https://github.com/NousResearch/hermes-agent', note: 'Explicit product inspiration credited by the project README.' },
      { label: 'Claude Agent SDK', href: 'https://code.claude.com/docs/en/agent-sdk/typescript', note: 'Agent SDK used by one engine path.' },
      { label: 'LM Studio', href: 'https://lmstudio.ai', note: 'Supported local-model engine.' }
    ],
    links: [],
    evidence: 'README, package manifest, build/release layout, and application source reviewed; no public repository origin is configured.',
    related: ['001-agent', 'homelab-mcp', 'toolcall-bench']
  },
  {
    id: 'simkl-tools',
    name: 'Simkl Tools',
    category: 'tools',
    area: 'Media metadata integration',
    status: 'API client implementation',
    kind: 'Tooling',
    summary: 'A dependency-free Node client built from Simkl’s API blueprint for browsing metadata, calendars, identifier resolution, library synchronization, ratings, history, and scrobbling. It separates endpoints that work without credentials from OAuth/client-id paths and records caching and incremental-sync guardrails, with Realm import mapping as a concrete integration use case.',
    question: 'How can a media tracker integrate Simkl without scraping HTML or repeatedly pulling an entire user library?',
    tech: ['Node.js', 'Simkl API', 'OAuth', 'REST', 'Incremental sync'],
    sections: [
      { title: 'What exists', text: 'The module implements public browse calls, ID mapping, user-library deltas, history/list/rating pushes, scrobbling, image helpers, and a documented import recipe.' },
      { title: 'Current limit', text: 'Library sync and write operations require a user’s own OAuth credentials. The public portfolio documents the client design but does not expose tokens, application secrets, or personal library data.' }
    ],
    credits: [
      { label: 'Simkl developer platform', href: 'https://simkl.com/settings/developer/new/', note: 'Upstream service/API for which the client was built.' }
    ],
    links: [],
    evidence: 'README, bundled API blueprint reference, and Node client reviewed; secrets and account data were excluded.',
    related: ['realm']
  },
  {
    id: 'terragenesis',
    name: 'TerraGenesis Modpack',
    category: 'graphics',
    area: 'ML-assisted terrain and long-range rendering',
    status: 'Curated integration',
    kind: 'Upstream extension',
    summary: 'A Fabric exploration pack assembled around ML-generated Terrain Diffusion landscapes, Voxy long-distance geometry, Chunky pregeneration, shaders, and performance/QoL mods. Its value is integration and operational tuning—pinned versions, VRAM-aware settings, pregeneration/LOD workflow, compatibility rules, and a distributable Modrinth pack—not ownership of the many upstream mods it combines.',
    question: 'How can ML terrain generation, long-range LODs, pregeneration, and shaders be combined into one reproducible exploration setup?',
    tech: ['Minecraft Fabric', 'Terrain Diffusion', 'Voxy', 'Chunky', 'DirectML', 'Modrinth pack'],
    sections: [
      { title: 'What exists', text: 'Pinned mods, shader packs, configuration, optional pregen extras, an importable pack, maintenance notes, and a documented pregen-to-Voxy workflow are present.' },
      { title: 'Current limit', text: 'This is an integration project built from many third-party mods. Hardware-specific tuning and upstream compatibility can age quickly, and the pack does not claim ownership of Terrain Diffusion, Voxy, Chunky, shaders, or other included mods.' }
    ],
    credits: [
      { label: 'Terrain Diffusion — xandergos and contributors', href: 'https://github.com/xandergos/terrain-diffusion-mc/releases', note: 'Upstream ML terrain generator around which the pack is configured.' },
      { label: 'Voxy — Cortex and contributors', href: 'https://github.com/MCRcortex/voxy', note: 'Upstream distant-terrain level-of-detail renderer used in the pack.' },
      { label: 'Chunky — pop4959 and contributors', href: 'https://github.com/pop4959/Chunky', note: 'Upstream chunk-pregeneration tool used in the documented terrain workflow.' },
      { label: 'FabricMC contributors', href: 'https://fabricmc.net/', note: 'Minecraft mod-loader and API ecosystem used by the integration.' },
      { label: 'BSL — CaptTatsu', href: 'https://bitslablab.com/bslshaders/', note: 'Default shader option in the recorded pack. Shaders and the remaining bundled mods retain their original creators and licenses.' }
    ],
    links: [],
    evidence: 'README, pack/config/mod directories, and packaged mrpack artifact reviewed; private machine details were omitted.',
    related: ['newvox', 'veilborn-wildwood']
  },
  {
    id: 'newvox',
    name: 'NewVox',
    category: 'graphics',
    area: 'Voxel engine and survival sandbox',
    status: 'Voxel engine prototype',
    kind: 'Original project',
    summary: 'A from-scratch C++20/OpenGL voxel survival-sandbox engine with greedy meshing, ambient occlusion, multithreaded generation, HDR/bloom/ACES rendering, cascaded shadows, procedural atmosphere and water, biomes/caves, first-person interaction, and synthesized audio. It also includes deterministic screenshot automation and an asset-processing pipeline for generated stylized block textures.',
    question: 'How far can a custom voxel engine push atmosphere, world generation, graphics, audio, and interaction without relying on a general-purpose game engine?',
    tech: ['C++20', 'OpenGL 4.6', 'Greedy meshing', 'HDR/PBR-style post', 'Procedural generation', 'CMake'],
    sections: [
      { title: 'What exists', text: 'The README documents a full rendering pipeline, chunk jobs, world generation, player interaction, generated audio, procedural ambience, screenshot automation, and texture-processing tools backed by a C++ source tree.' },
      { title: 'Current limit', text: 'The inventory did not compile or benchmark the engine. Performance numbers and visual claims in the README remain project-reported evidence rather than freshly reproduced measurements.' }
    ],
    credits: [
      { label: 'GLFW', href: 'https://github.com/glfw/glfw', note: 'Vendored window/input/OpenGL-context dependency linked by the NewVox CMake project.' }
    ],
    links: [],
    evidence: 'README, CMake project, engine assets/source layout, and deterministic screenshot interface reviewed; no public origin is configured.',
    related: ['realmforge', 'veilborn-wildwood']
  },
  {
    id: 'toolcall-bench',
    name: 'Toolcall Bench',
    category: 'learning',
    area: 'LLM tool-use reliability',
    status: 'Focused benchmark',
    kind: 'Research implementation',
    summary: 'A stdlib-only benchmark suite for measuring whether a local chat model selects the right function, emits well-formed arguments, respects required types, avoids false-positive tool calls, and survives multi-turn variations. The cases use synthetic homelab-style tools so parsing and grading behavior can be inspected directly instead of inferred from a single agent demo.',
    question: 'How reliably does a local model choose and format tools under explicit schemas, paraphrases, and no-tool controls?',
    tech: ['Python', 'OpenAI-compatible API', 'JSON Schema', 'JSONL', 'Deterministic grading'],
    sections: [
      { title: 'What exists', text: 'Multiple benchmark phases, multi-turn scripts, an analyzer, raw/result JSONL records, type/coercion checks, false-positive detection, and deterministic expected argument checks are present.' },
      { title: 'Current limit', text: 'The checked scripts are tied to a particular local model and a small artificial tool vocabulary. Results should not be generalized to unrelated models, agents, or real-world tool distributions without rerunning the suite.' }
    ],
    credits: [
      { label: 'CPython', href: 'https://github.com/python/cpython', note: 'The benchmark is intentionally stdlib-only Python so request, parsing, and grading behavior stays directly inspectable.' }
    ],
    links: [],
    evidence: 'Benchmark source and local result-record files reviewed; model endpoint and machine-specific details were excluded.',
    related: ['001-agent', 'revolo']
  },
  {
    id: 'veilborn',
    name: 'Veilborn First Playable',
    category: 'product',
    area: 'Fantasy survival/adventure prototype',
    status: 'First-playable prototype',
    kind: 'Original project',
    summary: 'A Unity first playable for the Veilborn fantasy survival/adventure concept: switchable first/third person movement, gathering, crafting, build pieces, combat, elemental spell forms, save/load, UI, and a provisional beacon objective inside a compact original region. Verification records 56 EditMode tests, 13 PlayMode tests, a Windows build, and 17 standalone checks.',
    question: 'What is the smallest cohesive Veilborn prototype that proves movement, survival systems, combat, magic, building, persistence, and a playable objective together?',
    tech: ['Unity 6', 'C#', 'URP', 'Input System', 'Procedural prototype content'],
    sections: [
      { title: 'What exists', text: 'The integrated project contains gameplay, systems, content-generation/editor work, verification artifacts, a Windows build, screenshots, and separate worktrees used for player, systems, asset-world, and presentation development.' },
      { title: 'Current limit', text: 'The blueprint is explicit: this is an offline compact first playable, not the intended large open world, networking stack, finished art set, production animation system, or complete Veilborn game.' }
    ],
    credits: [
      { label: 'Unity', href: 'https://unity.com/', note: 'Game engine and editor platform used for the verified first-playable prototype.' }
    ],
    links: [],
    evidence: 'Blueprint and verification report reviewed: 56/56 EditMode, 13/13 PlayMode, successful Windows build, and 17/17 standalone runtime checks are recorded.',
    related: ['veilborn-wildwood', 'realmforge', 'newvox']
  },
  {
    id: 'veilborn-wildwood',
    name: 'Veilborn: Wildwood',
    category: 'product',
    area: 'Editable voxel adventure prototype',
    status: 'Specialist prototypes',
    kind: 'Original project',
    summary: 'A separate voxel-styled Veilborn experiment targeting an editable generated forest island with terrain digging, gathering, crafting, building, combat, progression, persistence, weather, and switchable camera. Three specialist worktrees contain real terrain, gameplay, and systems code, while the blueprint keeps its Valheim and Lay of the Land inspirations at the level of broad exploration and presentation—not copied assets.',
    question: 'Can Veilborn’s survival loop work as a smaller fully editable voxel world while preserving an authored atmosphere and original assets?',
    tech: ['Unity 6', 'C#', 'URP', 'Voxel meshing', 'Procedural terrain', 'Persistence'],
    sections: [
      { title: 'What exists', text: 'Terrain, gameplay, and systems worktrees contain C# implementations and tests for voxel generation/editing, player/combat/atmosphere, inventory/crafting/building/survival/save behavior, plus shared contracts.' },
      { title: 'Current limit', text: 'The available specialist working copies establish terrain, gameplay, and systems implementations. They do not establish that the complete game loop, final build, acceptance tests, or visual capture set have been integrated.' }
    ],
    credits: [
      { label: 'Lay of the Land', href: 'https://store.steampowered.com/app/2776090/Lay_of_the_Land/', note: 'Broad voxel exploration/terrain inspiration credited in the project blueprint.' },
      { label: 'Valheim', href: 'https://www.valheimgame.com/', note: 'Broad survival/adventure atmosphere inspiration credited in the project blueprint.' }
    ],
    links: [],
    evidence: 'Shared blueprint/contracts plus three Git worktrees and their terrain/gameplay/systems C# sources/tests reviewed; integration status remains deliberately unclaimed.',
    related: ['veilborn', 'newvox', 'terragenesis']
  },
  {
    id: 'vencord-userplugins',
    name: 'Vencord Userplugins',
    category: 'tools',
    area: 'Client plugin development',
    status: 'Custom client extensions',
    kind: 'Upstream extension',
    summary: 'A separate source-of-truth repository for custom Vencord plugins, with deployment, capture, rebuild, reinjection, and update scripts designed to survive upstream and Discord updates. The README distinguishes deployable plugins from an archived entry-less experiment and explains why real file copies are used instead of symlinks so Vencord’s build-time path aliases resolve correctly.',
    question: 'How can custom client plugins remain reproducible and recoverable across upstream application and mod updates?',
    tech: ['TypeScript/TSX', 'Vencord', 'PowerShell', 'pnpm/esbuild workflow'],
    sections: [
      { title: 'What exists', text: 'Versioned plugin sources plus deploy, capture, reinject, and upstream-update scripts are present. The master repository is kept separate from the Vencord checkout used for builds.' },
      { title: 'Current limit', text: 'These plugins depend on an upstream mod and a frequently changing client API. An archived bridge experiment intentionally lacks a plugin entry point and is not presented as deployed functionality.' }
    ],
    credits: [
      { label: 'Vencord', href: 'https://github.com/Vendicated/Vencord', note: 'Upstream client mod extended by these userplugins; a separate local clone retains this origin.' }
    ],
    links: [],
    evidence: 'Userplugin README, plugin directories, deployment scripts, and upstream Vencord Git origin reviewed; the project’s offsite remote is described as private and is not linked.',
    related: []
  },
  {
    id: 'webgl-reference-lab',
    name: 'WebGL Reference Lab',
    category: 'graphics',
    area: 'Immersive-web teardown research',
    status: 'Documented source study',
    kind: 'Source study',
    summary: 'A dated read-only WebGL research bundle containing public page/source snapshots, browser captures, extracted scene frames, a comparison page, inspection scripts, hashes, and a provenance manifest. It was created to study how immersive web experiences structure rendering and scenes; the copied public source remains attributable to its original site and is not portfolio-owned code.',
    question: 'What implementation and presentation patterns can be learned from a real immersive WebGL site without claiming its source or visual identity?',
    tech: ['WebGL research', 'Browser capture', 'JavaScript inspection', 'SHA-256 provenance'],
    sections: [
      { title: 'What exists', text: 'The bundle records the source URLs, retrieval hashes, desktop/mobile captures, staged scene images, inspection scripts, and a verification file distinguishing what was and was not visually retested.' },
      { title: 'Current limit', text: 'This is analysis material, not an original WebGL application. Public snapshots are retained for research provenance and must not be republished as authored portfolio source or artwork.' }
    ],
    credits: [
      { label: 'Cork WebGL study', href: 'https://cork-webgl-study.vercel.app/', note: 'Public source page recorded in the provenance manifest and studied read-only.' }
    ],
    links: [],
    evidence: 'Provenance and verification manifests plus public-source/browser evidence reviewed; source authorship remains with the referenced site.',
    related: ['realmforge', 'newvox']
  },
  {
    id: 'quantization-fly-study',
    name: 'Quantization & Fly-Conditioning Source Study',
    category: 'learning',
    area: 'Cross-domain research sources',
    status: 'Documented source study',
    kind: 'Source study',
    summary: 'A small provenance-tracked research pack pairing a modern model-preserving quantization reference with a published Drosophila mushroom-body conditioning implementation. The files were captured as source material for reasoning about efficient AI and biological learning experiments, with retrieval timestamps and hashes; they are references, not original algorithms and not evidence that either method was reproduced locally.',
    question: 'Which ideas from model-preserving quantization and biological reinforcement circuits are useful enough to carry into later experiments?',
    tech: ['Research provenance', 'Model quantization', 'Drosophila conditioning', 'MATLAB reference code'],
    sections: [
      { title: 'What was gathered', text: 'The manifest records a YAQA quantization README and a public mushroom-body conditioning script with source URLs, timestamps, SHA-256 hashes, and executed=false for both.' },
      { title: 'Current limit', text: 'This is a source study, not a local replication. No benchmark, training result, biological claim, or quantization improvement should be attributed to this portfolio from these files alone.' }
    ],
    credits: [
      { label: 'YAQA quantization', href: 'https://github.com/Cornell-RelaxML/yaqa-quantization', note: 'Upstream quantization project represented by the captured README.' },
      { label: 'Model-Preserving Adaptive Rounding', href: 'https://arxiv.org/abs/2505.22988', note: 'Paper linked by the captured YAQA README.' },
      { label: 'Brains on Board fly-conditioning code', href: 'https://github.com/BrainsOnBoard/paper_RPEs_in_drosophila_mb', note: 'Upstream repository for the captured mushroom-body conditioning script.' }
    ],
    links: [],
    evidence: 'Research source manifest records public URLs, hashes, retrieval time, and executed=false; no ownership or replication is claimed.',
    related: ['doomfly', 'llm-forge']
  },
  ...archiveAdditions,
  ...labProjects
];
