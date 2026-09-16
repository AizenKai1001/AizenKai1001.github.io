export const researchTopics = [
  {
    id: 'developmental-non-neural-ai',
    title: 'Developmental Intelligence Without Neural Networks',
    category: 'learning',
    summary: 'A research program around executable distinctions, bounded program induction, counterexamples, and reusable symbolic structure. The aim is to study developmental learning mechanisms without treating neural networks or language-model priors as the default substrate, while keeping novelty claims separate from implemented evidence.',
    question: 'Can a learner build and revise reusable executable concepts without beginning from a neural representation?',
    status: 'Research program',
    sections: [
      {
        title: 'The proposed unit is an executable distinction',
        text: 'The research notes explore a learner whose internal hypotheses are small executable tests rather than opaque embedding vectors. A candidate distinction can be split by counterexamples, composed with other distinctions, named, and reused. That is a design program, not a claim that symbolic programs are generally superior to neural models. Distinction AI implements only a bounded Boolean subset over supplied measurements; the broader developmental architecture remains unbuilt.',
      },
      {
        title: 'Program induction already has deep prior art',
        text: 'This direction sits beside decades of work on probabilistic program induction, inductive synthesis, library learning, version spaces, and equality saturation. Lake, Salakhutdinov, and Tenenbaum showed how compositional programs can support very data-efficient concept learning; DreamCoder learns reusable abstractions across synthesis tasks. Those works are credited as intellectual neighbors, not relabeled as original mechanisms.',
      },
      {
        title: 'The research gate is representation discovery',
        text: 'The strongest current limitation is that useful observables can still be supplied by the programmer. A small learner that discovers a rule over an engineered contact measurement has not discovered perception itself. The next meaningful gate is therefore not more concepts in the library; it is whether a bounded search can invent a useful discriminator from lower-level observations and outperform matched supplied-feature and missing-feature controls.',
      },
    ],
    references: [
      {
        label: 'Lake, Salakhutdinov & Tenenbaum — Human-level concept learning through probabilistic program induction',
        href: 'https://www.cs.princeton.edu/~bl8144/papers/LakeEtAl2015Science.pdf',
        note: 'Primary author-hosted paper; prior art for compositional concept learning from few examples.',
      },
      {
        label: 'Ellis et al. — DreamCoder',
        href: 'https://arxiv.org/abs/2006.08381',
        note: 'Primary paper on learning reusable program libraries while solving synthesis tasks.',
      },
      {
        label: 'egg project — equality saturation tutorials',
        href: 'https://egraphs-good.github.io/egg/egg/tutorials/index.html',
        note: 'Primary project documentation for e-graphs and equality saturation, studied as a representation/search reference rather than a component of the current learner.',
      },
    ],
    related: ['distinction'],
    evidence: 'Vault notes: “Non-Neural Developmental Intelligence — Research Program”, “Non-Neural AI — Prior Art and Novelty Map”, and “Distinction AI — Build Log”. The bounded Distinction results and perception limitation were cross-checked against its recorded release review.',
  },
  {
    id: 'predictive-states-causal-abstraction',
    title: 'Predictive States, Causal States & Discovering Structure',
    category: 'learning',
    summary: 'A study of predictive state representations, computational mechanics, and active automata learning as alternatives to storing a hidden-state vector whose meaning is implicit. The common theme is to define state by what it predicts about future observations and interventions.',
    question: 'Can useful state be discovered from predictive equivalence instead of chosen in advance?',
    status: 'Research notes',
    sections: [
      {
        title: 'State can be operational rather than latent',
        text: 'Predictive State Representations describe a partially observed process through predictions about future action-observation tests. Computational mechanics makes a related move: histories belong to the same causal state when they induce the same distribution over futures. Both approaches replace an arbitrary hidden variable with an operational equivalence relation tied to prediction.',
      },
      {
        title: 'The hard part is discovering the tests',
        text: 'A finite predictive state model is only as useful as the tests or suffixes it knows to ask about. The vault therefore treats test discovery as the central problem: start from coarse observational equivalence, search for an intervention or suffix that separates two histories, then refine the state partition. This links the literature to counterexample-driven non-neural experiments without claiming the algorithms are identical.',
      },
      {
        title: 'A falsifiable route to developmental memory',
        text: 'A practical experiment would compare explicit history windows, learned predictive partitions, and a recurrent baseline on small controlled environments with hidden state. Success would require generalization to held-out trajectories and demonstrable state splits caused by informative counterexamples. Naming a state or compressing history is not evidence of causal understanding by itself.',
      },
    ],
    references: [
      {
        label: 'Littman, Sutton & Singh — Predictive Representations of State',
        href: 'https://proceedings.neurips.cc/paper/2001/file/1e4d36177d71bbb3558e43af9577d70e-Paper.pdf',
        note: 'Primary NeurIPS paper introducing predictive state representations in controlled dynamical systems.',
      },
      {
        label: 'Shalizi & Crutchfield — Computational Mechanics',
        href: 'https://arxiv.org/abs/cond-mat/9907176',
        note: 'Primary paper on causal states defined by equivalence of predictive distributions.',
      },
      {
        label: 'Shalizi & Shalizi — CSSR',
        href: 'https://arxiv.org/abs/cs/0406011',
        note: 'Primary source on reconstructing predictive state structure from observed sequences.',
      },
    ],
    related: ['distinction'],
    evidence: 'Vault notes: “Predictive State Representations and Computational Mechanics”, “Non-Neural Developmental Intelligence — Research Program”, and the experimental-roadmap notes for non-neural AI.',
  },
  {
    id: 'continual-plasticity',
    title: 'Continual Learning, Plasticity & a Negative Result',
    category: 'learning',
    summary: 'Research into why networks can lose the ability to learn new tasks, paired with a controlled local benchmark that did not reproduce the headline performance decline at its tested scale. Internal degradation appeared under Adam, but it did not translate into worse task learning.',
    question: 'When does damage to a representation actually become loss of learning ability?',
    status: 'Measured study',
    sections: [
      {
        title: 'The literature separates forgetting from plasticity',
        text: 'Dohare and collaborators study a different failure from catastrophic forgetting: a continually trained network can become progressively worse at acquiring new tasks. Their continual-backpropagation intervention replaces low-utility features to preserve adaptability. The vault tracks this as a mechanistic claim with measurable behavioral consequences, not as a generic argument for resets.',
      },
      {
        title: 'The small benchmark did not reproduce the behavioral effect',
        text: 'In the measured Plasticity Bench, ordinary backpropagation learned later regression tasks better rather than worse. Under a 400-task Adam condition, inactive units rose to about 18% and effective rank fell from roughly 54 to 36; continual backpropagation prevented those changes. Yet the condition with those internal changes still improved on later tasks, so mechanism and harm came apart.',
      },
      {
        title: 'The negative result narrows the next experiment',
        text: 'This does not refute the Nature result: the local network, optimizer mix, task family, scale, and number of tasks are different. It does establish that the effect is not automatic in a small regression stream and that perfect freshness can sacrifice useful transfer. Planned follow-ups remove more transfer, use classification, extend task count, and measure retention separately from plasticity.',
      },
    ],
    references: [
      {
        label: 'Dohare et al. — Loss of plasticity in deep continual learning',
        href: 'https://www.nature.com/articles/s41586-024-07711-7',
        note: 'Primary Nature paper motivating the local continual-plasticity study and continual backpropagation comparison.',
      },
      {
        label: 'Kong & Sutton — Growing Elastic Networks',
        href: 'https://arxiv.org/abs/2608.01475',
        note: 'Primary 2026 work studied as a structural-plasticity follow-up rather than evidence for the local benchmark.',
      },
      {
        label: 'Kirkpatrick et al. — Overcoming catastrophic forgetting with EWC',
        href: 'https://www.pnas.org/doi/10.1073/pnas.1611835114',
        note: 'Primary consolidation baseline; related to continual learning but aimed at retention, a distinct axis from loss of plasticity.',
      },
    ],
    related: ['plasticity'],
    evidence: 'Vault notes: “Continual Learning and Plasticity” and “Plasticity Bench — Measured Result 2026-09-09”. The measured note records matched-seed controls, optimizer effects, dead-unit/rank statistics, and limits on interpretation.',
  },
  {
    id: 'connectome-embodied-learning',
    title: 'Connectomes, Embodied Agents & What Wiring Does Not Prove',
    category: 'simulation',
    summary: 'A literature-and-experiment thread around fruit-fly connectomes, visual circuits, embodied simulation, and plasticity. The research treats a connectome as anatomical structure rather than a learned policy, and asks which additional physiology, learning rules, sensors, and validation tasks are required for behavior.',
    question: 'What must be added to a connectome before behavior can count as learned rather than merely propagated?',
    status: 'Research notes',
    sections: [
      {
        title: 'A wiring diagram is not a functioning brain',
        text: 'Modern fly connectomes provide extraordinary anatomical structure, but synapse counts do not specify all signs, gains, neuromodulatory state, membrane dynamics, or an animal’s learned history. The vault uses this distinction as a standing claims boundary: simulating activity through a retained graph can be technically meaningful without demonstrating cognition or learning.',
      },
      {
        title: 'Circuit models show what becomes possible with constraints',
        text: 'Shiu and colleagues built a large connectome-based activity model; FlyVis reconstructs a visual system with circuit-specific dynamics; FlyGym supplies a body and sensorimotor environment. Mushroom-body conditioning models add targeted learning rules. These systems are credited as distinct works with different scopes rather than collapsed into a single “whole-brain AI” story.',
      },
      {
        title: 'The local experiments keep negative gates visible',
        text: 'The DOOMFLY extension work uses the connectome as an experimental substrate for real game frames, controller mappings, and plasticity tests. Its documented learning candidate failed visual, conditioning, and survival gates, so changed weights or longer survival are not presented as demonstrated learning. The research value is the inspectable embodied loop and the controls that expose failed assumptions.',
      },
    ],
    references: [
      {
        label: 'Shiu et al. — A Drosophila computational brain model reveals sensorimotor processing',
        href: 'https://www.nature.com/articles/s41586-024-07763-9',
        note: 'Primary Nature paper for large-scale connectome-constrained activity modeling.',
      },
      {
        label: 'Turaga Lab — FlyVis',
        href: 'https://github.com/TuragaLab/flyvis',
        note: 'Official implementation of the connectome-constrained fly visual-system model.',
      },
      {
        label: 'Bennett et al. — Learning in the Drosophila mushroom body',
        href: 'https://www.nature.com/articles/s41467-021-22592-4',
        note: 'Primary study of conditioning and plasticity in a specific fly learning circuit.',
      },
      {
        label: 'Jiang & Litwin-Kumar — Models of heterogeneous dopamine signaling in an insect learning and memory center',
        href: 'https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1009205',
        note: 'Primary PLOS Computational Biology work on learning-rule structure in the mushroom body.',
      },
    ],
    related: ['doomfly'],
    evidence: 'Vault notes: “Fruit Fly Connectomes — Practical AI Experiments”, “Fly-Inspired AI — Creative Applications and Game Experiments”, and the DOOMFLY research/build records. Attribution boundaries are explicit in the portfolio evidence review.',
  },
  {
    id: 'memory-retrieval-adaptation',
    title: 'Memory Beyond the Context Window',
    category: 'systems',
    summary: 'A broad study of retrieval-augmented generation, persistent agent memory, test-time adaptation, fast weights, and context management. The through-line is to distinguish external retrieval from learned state and to measure whether any memory mechanism improves answers rather than merely increasing available context.',
    question: 'Which information should stay in context, which should be retrieved, and which should become learned state?',
    status: 'Research notes',
    sections: [
      {
        title: 'External retrieval and internal adaptation solve different problems',
        text: 'RAG retrieves explicit source material and conditions generation on it; it can remain inspectable and independently updatable. Test-time learning changes fast state inside or alongside a model during inference. The notes keep prompt history, KV cache, recurrent state, retrieval, and fast weights separate because calling all of them “memory” hides different failure modes and evaluation needs.',
      },
      {
        title: 'Small high-signal context beats indiscriminate recall',
        text: 'The harness research repeatedly found that retrieval can hurt when near-miss memories crowd the prompt. Its working design principles are therefore conservative: keep verbatim source backing, retrieve on expanded keys but return original evidence, cap the final shortlist, preserve superseded history without injecting stale facts, and benchmark retrieval against both no-memory and fuller-context controls.',
      },
      {
        title: 'The frontier is fast adaptation without silent drift',
        text: 'Titans/MIRAS, TTT-E2E, and related work explore learned memory or adaptation at test time. The vault treats these as research directions, not installed capabilities of the portfolio’s local models. A useful local experiment would need held-out task changes, explicit reset conditions, and baselines that separate adaptation from simply carrying more context or retrieving a better example.',
      },
    ],
    references: [
      {
        label: 'Lewis et al. — Retrieval-Augmented Generation',
        href: 'https://arxiv.org/abs/2005.11401',
        note: 'Canonical primary RAG paper by Meta AI researchers.',
      },
      {
        label: 'Google Research — Titans and MIRAS long-term neural memory',
        href: 'https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/',
        note: 'Primary creator write-up for test-time neural memory work; treated as research, not as a local implementation.',
      },
      {
        label: 'Tandon et al. — End-to-End Test-Time Training for Long Context',
        href: 'https://arxiv.org/abs/2512.23675',
        note: 'Primary paper on end-to-end test-time training and learned adaptation during inference.',
      },
      {
        label: 'Anthropic — Contextual Retrieval',
        href: 'https://www.anthropic.com/engineering/contextual-retrieval',
        note: 'Primary engineering study on adding document context to embedding and lexical retrieval.',
      },
    ],
    related: [],
    evidence: 'Vault notes: “Retrieval-Augmented Generation”, “Test-Time Learning and Neural Memory”, “AI Harness Architecture”, and “AI Harnesses — Memory Systems”. Vendor benchmark claims in the survey are marked as vendor-reported and are not promoted as portfolio results.',
  },
  {
    id: 'agents-tools-runtime',
    title: 'Agent Loops, Tool Use & Progressive Disclosure',
    category: 'systems',
    summary: 'Research on the engineering around language models: ReAct-style loops, tool selection, Agent Skills, Model Context Protocol, validation, approval boundaries, and context budgets. The focus is less on “autonomy” as a label and more on where control, state, permissions, and stopping conditions actually live.',
    question: 'How do you give a model useful tools without turning every tool definition and result into permanent context?',
    status: 'Research notes',
    sections: [
      {
        title: 'The loop belongs to the harness',
        text: 'A language model can request actions, but iteration limits, error handling, dependency ordering, approval, persistence, and stop conditions are software responsibilities. ReAct demonstrates interleaved reasoning and acting; later harnesses add durable state and richer orchestration. The research avoids treating function-calling syntax as an agent architecture by itself.',
      },
      {
        title: 'Progressive disclosure is the recurring design pattern',
        text: 'Agent Skills keep small descriptions resident and load instructions only when selected. Tool-search systems defer full schemas until needed. MCP standardizes tool/resource plumbing but intentionally does not define memory or an agent loop. Across these systems, the practical theme is to keep the always-loaded surface small and move details behind explicit discovery.',
      },
      {
        title: 'Validation and permissions have to be outside the model',
        text: 'Schema-constrained output guarantees shape, not correct identifiers or safe intent. Tool descriptions and server-returned content are untrusted inputs; destructive actions need explicit application-level gates. The vault’s preferred evaluation records executable-call rate, retry rate, loop detection, and outcome correctness rather than assuming a syntactically valid call was the right action.',
      },
    ],
    references: [
      {
        label: 'Yao et al. — ReAct',
        href: 'https://arxiv.org/abs/2210.03629',
        note: 'Primary paper on interleaving reasoning traces and actions in language-model agents.',
      },
      {
        label: 'Shinn et al. — Reflexion',
        href: 'https://arxiv.org/abs/2303.11366',
        note: 'Primary work on verbal feedback and episodic self-reflection in agents.',
      },
      {
        label: 'Anthropic and MCP maintainers — Model Context Protocol official specification',
        href: 'https://modelcontextprotocol.io/',
        note: 'Primary protocol source; MCP standardizes connectivity and capabilities, not memory or agent behavior.',
      },
      {
        label: 'Anthropic and Agent Skills contributors — Agent Skills open specification',
        href: 'https://agentskills.io/',
        note: 'Primary specification for progressively disclosed filesystem-based procedural instructions.',
      },
    ],
    related: [],
    evidence: 'Vault notes: “AI Agents and Tool Use”, “AI Harness Architecture”, “AI Harnesses — Protocols and Standards”, and “AI Harnesses — Coding Agents”. The survey records confidence levels where primary-source access was incomplete.',
  },
  {
    id: 'evaluation-fixed-yardsticks',
    title: 'Evaluation That Can Survive a Better Explanation',
    category: 'systems',
    summary: 'A methodology thread built from benchmark literature and several local failures: use fixed yardsticks, negative controls, frozen evaluation, independent baselines, and re-runnable measurements. Two local simulations produced apparently positive results that disappeared when the measurement or physics assumptions were tightened.',
    question: 'What evidence would still be convincing if the implementation found a shortcut you did not anticipate?',
    status: 'Measured methodology',
    sections: [
      {
        title: 'A benchmark is an instrument, not a scoreboard',
        text: 'The evaluation notes emphasize distribution, baselines, confidence intervals, leakage, judge bias, and task contamination. A high number is only interpretable if the test measures the intended capability and the controls would fail when the mechanism is absent. This is why the portfolio keeps negative results beside successful implementations rather than treating them as failed marketing assets.',
      },
      {
        title: 'ForgeLab changed the conclusion when the physics audit changed',
        text: 'ForgeLab’s evolutionary search exploited a rigid-body position correction that injected potential energy while an earlier audit subtracted that same term away. A zero-motor strict-energy test exposed the leak. Re-measuring champions on the corrected solver reduced the “walking” count from two to zero; a fresh single-seed run stopped farming solver error but still barely exceeded a motionless-body baseline.',
      },
      {
        title: 'Plasticity and artificial-life controls told the same lesson',
        text: 'Plasticity Bench found internal deterioration without the predicted task-performance loss. EvoForge’s later 14-run sweep found no fitness separation between plasticity enabled and disabled, and an older-versus-younger “learning” ratio was larger in the no-learning control, exposing survivorship bias. These are measured examples of why the causal control matters more than a rising metric.',
      },
    ],
    references: [
      {
        label: 'Liang et al. — HELM',
        href: 'https://arxiv.org/abs/2211.09110',
        note: 'Primary work on broad, transparent model evaluation across scenarios and metrics.',
      },
      {
        label: 'Chen et al. — Evaluating Large Language Models Trained on Code',
        href: 'https://arxiv.org/abs/2107.03374',
        note: 'Primary HumanEval paper; useful for executable evaluation and pass@k framing.',
      },
      {
        label: 'Anthropic — Demystifying evals for AI agents',
        href: 'https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents',
        note: 'Primary practitioner guidance on stochastic agent evaluation, trials, and outcome-based grading.',
      },
    ],
    related: ['forgelab', 'plasticity', 'evoforge'],
    evidence: 'Vault notes: “Model Evaluation and Metrics”, “ForgeLab — Build Log”, “Plasticity Bench — Measured Result 2026-09-09”, “EvoForge — Build Log”, and “Ironforge — Blueprint”. The portfolio copy excludes private operational details and keeps the n=1 ForgeLab re-evolution limit explicit.',
  },
  {
    id: 'world-models-predictive-video',
    title: 'World Models & Predictive Representation Learning',
    category: 'simulation',
    summary: 'A literature study of agents that learn compact predictive representations and use imagined rollouts for planning. Recent video-prediction systems make the visual world itself part of the learned dynamics, raising the question of what an agent must predict to support action rather than merely realistic frames.',
    question: 'What should a learned world model predict so that imagined futures become useful for action?',
    status: 'Research notes',
    sections: [
      {
        title: 'Prediction can be learned in latent space',
        text: 'Predictive-representation methods try to discard details that are hard to predict or irrelevant to action while preserving the structure needed for future inference. This differs from reconstructing every pixel. The notes compare explicit latent dynamics, representation-prediction objectives, and video models as different answers to the question of what a useful internal world should retain.',
      },
      {
        title: 'Planning by imagination is the stronger test',
        text: 'Dreamer-style agents learn a latent dynamics model and optimize behavior through imagined trajectories. That gives world models a behavioral criterion: the model is useful if its rollouts help choose actions. Video-generation quality alone does not establish controllability, calibration, or policy improvement, so the research keeps generative fidelity and agent competence as separate axes.',
      },
      {
        title: 'This portfolio currently treats the topic as literature, not a built result',
        text: 'The vault tracks V-JEPA-style predictive representations and Dreamer-style latent planning, but the six featured experiments do not implement a comparable general world model. A future experiment would need action-conditioned prediction, held-out dynamics, and a planning baseline that can reveal whether imagination improves decisions rather than merely producing plausible trajectories.',
      },
    ],
    references: [
      {
        label: 'Mur-Labadia et al. / Meta FAIR — V-JEPA 2.1',
        href: 'https://arxiv.org/abs/2603.14482',
        note: 'Primary paper on predictive visual representations studied as a current reference, not a local implementation.',
      },
      {
        label: 'Meta FAIR — V-JEPA 2 official repository',
        href: 'https://github.com/facebookresearch/vjepa2',
        note: 'Official creator repository for the V-JEPA 2 family.',
      },
      {
        label: 'Hafner et al. — Dreamer 4',
        href: 'https://arxiv.org/abs/2509.24527',
        note: 'Primary world-model reinforcement-learning paper studied for imagination-based planning.',
      },
    ],
    related: [],
    evidence: 'Vault note: “World Models and Predictive Representation Learning”, supported by the AI research map and current-methods survey. No local implementation claim is attached to this dossier.',
  },
  {
    id: 'low-bit-inference-quantization',
    title: 'Low-Bit Inference, Quantization & What Accuracy Costs',
    category: 'systems',
    summary: 'Research into post-training quantization, activation-aware weight scaling, second-order weight reconstruction, GGUF deployment, and KV-cache compression. The practical question is not simply “how many bits?” but which tensors can lose precision while preserving task behavior on constrained local hardware.',
    question: 'Which parts of a model can be compressed aggressively before the errors become behavioral rather than numerical?',
    status: 'Research notes',
    sections: [
      {
        title: 'Quantization is a family of tradeoffs',
        text: 'Weight-only PTQ, activation-aware methods, calibration-heavy reconstruction, quantization-aware training, and cache compression attack different memory and bandwidth costs. AWQ protects salient weights using activation statistics; GPTQ uses approximate second-order information to reconstruct quantized layers. GGUF/llama.cpp makes these choices operational for local inference but does not erase model-specific quality differences.',
      },
      {
        title: 'Memory saved is not automatically useful speed',
        text: 'On consumer hardware, compression can reduce VRAM pressure and memory traffic while adding dequantization work or changing kernel efficiency. KV-cache precision matters increasingly at long context because cache storage grows with sequence length. The notes therefore pair model-quality checks with throughput, first-token latency, memory use, and prompt-length sweeps rather than comparing file size alone.',
      },
      {
        title: 'The portfolio treats this as engineering research, not a new codec',
        text: 'No dossier claims a novel quantization algorithm. The useful contribution is the experimental framework: choose a real workload, hold prompt and sampling conditions fixed, compare several bit-widths against an uncompressed or higher-precision baseline, and report the failure cases that appear first. Recent low-bit methods are references to test, not evidence that a local model already inherits their results.',
      },
    ],
    references: [
      {
        label: 'Lin et al. — AWQ',
        href: 'https://arxiv.org/abs/2306.00978',
        note: 'Primary Activation-aware Weight Quantization paper.',
      },
      {
        label: 'Frantar et al. — GPTQ',
        href: 'https://arxiv.org/abs/2210.17323',
        note: 'Primary post-training quantization paper using approximate second-order reconstruction.',
      },
      {
        label: 'ggml-org — llama.cpp quantization documentation',
        href: 'https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md',
        note: 'Official deployment-tool documentation for GGUF quantization workflows.',
      },
      {
        label: 'Liu et al. — KIVI',
        href: 'https://arxiv.org/abs/2402.02750',
        note: 'Primary work on low-bit KV-cache quantization for long-context inference.',
      },
    ],
    related: [],
    evidence: 'Vault notes: “Quantization and Model Compression”, “Low-Precision Training and Discrete Weight Optimization”, and the performance/optimization map. The notes distinguish vendor or paper benchmark results from measurements not yet repeated locally.',
  },
  {
    id: 'gpu-execution-memory-wall',
    title: 'GPU Execution, Memory Bandwidth & Kernel Reality',
    category: 'systems',
    summary: 'A systems-level study of SIMT execution, warps, occupancy, memory coalescing, shared memory, cache behavior, divergence, and roofline thinking. It connects model inference and rendering performance to the hardware’s actual scheduling and memory hierarchy rather than treating advertised FLOPs as the whole machine.',
    question: 'When is a workload limited by arithmetic, and when is it really waiting on data?',
    status: 'Research notes',
    sections: [
      {
        title: 'GPUs hide latency with parallel work',
        text: 'GPU cores are organized for throughput: many resident warps give the scheduler other work while one warp waits on memory. Occupancy matters only until enough independent work exists to hide latency. That is why maximizing occupancy blindly can lose to a lower-occupancy kernel with better register use or instruction-level parallelism.',
      },
      {
        title: 'The memory path often dominates',
        text: 'Coalesced accesses, cache residency, shared-memory tiling, and data layout decide whether a wide memory interface delivers useful bytes or wasted transactions. Divergent control flow serializes paths inside a warp. The vault uses roofline-style reasoning to ask whether an optimization should reduce bytes moved, improve locality, expose more independent work, or actually reduce arithmetic.',
      },
      {
        title: 'Profiling is the evidence layer',
        text: 'The notes emphasize Nsight/PIX/RenderDoc-style counters rather than optimization folklore: achieved occupancy, sectors per request, stall reasons, memory throughput, and frame time. This dossier is a knowledge foundation for future kernels, render passes, and local inference work; it is not a claim that every optimization described has been implemented in the portfolio projects.',
      },
    ],
    references: [
      {
        label: 'NVIDIA — Ada GPU Architecture Whitepaper',
        href: 'https://images.nvidia.com/aem-dam/Solutions/Data-Center/l4/nvidia-ada-gpu-architecture-whitepaper-V2.02.pdf',
        note: 'Primary hardware architecture reference from NVIDIA.',
      },
      {
        label: 'NVIDIA — Ada Tuning Guide',
        href: 'https://docs.nvidia.com/cuda/ada-tuning-guide/index.html',
        note: 'Official architecture-specific CUDA optimization guidance.',
      },
      {
        label: 'NVIDIA — CUDA Programming Guide',
        href: 'https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html',
        note: 'Primary CUDA execution/programming-model documentation.',
      },
      {
        label: 'NVIDIA — CUDA Best Practices Guide',
        href: 'https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html',
        note: 'Official guidance for memory access, occupancy, profiling, and performance measurement.',
      },
    ],
    related: [],
    evidence: 'Vault notes: “GPU Architecture and Execution Model”, “GPGPU and Compute Shaders”, “Cache and Memory Hierarchy Optimization”, and the Performance and Optimization map.',
  },
  {
    id: 'from-scratch-learning-systems',
    title: 'Learning Systems From First Principles',
    category: 'learning',
    summary: 'A code-reading and implementation track around automatic differentiation, optimizers, transformer internals, recurrent-depth language models, and small educational frameworks. ForgeGrad implements a compact autograd stack; LLM Forge implements a tokenizer, looped model, and training pipeline while its broader research goals remain open.',
    question: 'What do you learn when the framework stops hiding the backward pass and training loop?',
    status: 'Implementation + research',
    sections: [
      {
        title: 'The reference implementations are intentionally small',
        text: 'micrograd, MiniTorch, tinygrad, and nanoGPT are valuable because the core mechanics remain inspectable: graph construction, reverse-mode differentiation, tensor operations, optimization, attention, and sampling can be traced end to end. The vault compares these projects as teaching and systems references, crediting their creators rather than presenting their designs as local inventions.',
      },
      {
        title: 'ForgeGrad is the implemented subset',
        text: 'ForgeGrad rebuilds tensor/autograd machinery and a small neural training stack, including reverse-mode differentiation, common operations, layers, optimizers, embeddings, normalization, and a looped transformer experiment. Its recorded checks compare operation gradients against PyTorch and demonstrate a small memorization path. That verifies implementation correctness on bounded tests, not production-framework parity or broad language ability.',
      },
      {
        title: 'Recurrent depth is a research question, not a free reasoning multiplier',
        text: 'LLM Forge implements a byte-level tokenizer, weight-tied recurrent-depth GPT, training pipeline, sampling, and loop ablations. Its notes also study adaptive recurrence alongside conventional transformers. Reusing a block changes compute allocation, but more loops do not automatically mean better reasoning. A proper comparison keeps parameter count, training tokens, compute, and evaluation budget visible.',
      },
    ],
    references: [
      {
        label: 'Andrej Karpathy — micrograd',
        href: 'https://github.com/karpathy/micrograd',
        note: 'Original compact reverse-mode autodiff teaching implementation.',
      },
      {
        label: 'tinygrad project — George Hotz and contributors',
        href: 'https://github.com/tinygrad/tinygrad',
        note: 'Primary repository for a small tensor/autograd/compiler stack studied as a systems reference.',
      },
      {
        label: 'Sasha Rush and contributors — MiniTorch',
        href: 'https://minitorch.github.io/',
        note: 'Primary educational framework/site for building tensor and autodiff machinery from first principles.',
      },
      {
        label: 'Andrej Karpathy — nanoGPT',
        href: 'https://github.com/karpathy/nanoGPT',
        note: 'Primary compact GPT training implementation used as a readable language-model baseline.',
      },
      {
        label: 'Erik Steiger (rkstgr) — LoopLM reimplementation',
        href: 'https://github.com/rkstgr/LoopLM',
        note: 'Independent reimplementation of Ouro / Scaling Latent Reasoning via Looped Language Models. Steiger’s repository is credited separately from the original paper authors.',
      },
    ],
    related: ['forgegrad', 'llm-forge'],
    evidence: 'Vault notes: “LLM Forge — Blueprint”, “Research — PyTorch alternatives & best code to learn from”, and “ForgeGrad — how it works”, checked alongside the LLM Forge README and source inventory. Implemented pipeline components remain separate from the broader research roadmap.',
  },
  {
    id: 'image-to-3d-reconstruction',
    title: 'Image-to-3D Reconstruction on Local Hardware',
    category: 'graphics',
    summary: 'A deferred research plan for reconstructing 3D objects from one or a few images on constrained local hardware. The plan starts by benchmarking pretrained reconstruction methods and data/evaluation pipelines before training anything, then isolates a single trainable component only if the baseline exposes a clear gap.',
    question: 'What is the smallest trainable component that would actually improve a measured image-to-3D baseline?',
    status: 'Experiment planning',
    sections: [
      {
        title: 'A baseline before training',
        text: 'The vault records this as a research plan rather than an active training run. The first milestone is reproducible inference with public pretrained methods, a fixed image set, consistent camera assumptions, and a scored output format. Only after that baseline is measured would local fine-tuning or from-scratch training become an evidence-based choice.',
      },
      {
        title: 'Representation changes the task',
        text: 'Occupancy Networks learn an implicit surface, Splatter Image predicts 3D Gaussians from images, and TripoSR follows the feed-forward large-reconstruction-model family. These approaches trade mesh explicitness, rendering speed, pose assumptions, training cost, and editability differently. The plan therefore avoids calling all image-to-3D systems equivalent just because they produce a viewable asset.',
      },
      {
        title: 'Evaluation has to catch memorization and view inconsistency',
        text: 'A useful local study would separate seen-category reconstruction from held-out objects, inspect novel views rather than only the input camera, and record runtime and memory use alongside geometric or rendering metrics. Any training run would need documented data provenance and checks for train/test leakage. This record establishes the proposed experiment; it does not yet contain a trained original generator.',
      },
    ],
    references: [
      {
        label: 'Mescheder et al. — Occupancy Networks',
        href: 'https://github.com/autonomousvision/occupancy_networks',
        note: 'Official implementation from the authors of the CVPR 2019 implicit-occupancy reconstruction paper.',
      },
      {
        label: 'Tripo AI & Stability AI — TripoSR',
        href: 'https://github.com/VAST-AI-Research/TripoSR',
        note: 'Official open-source repository for fast feed-forward single-image 3D reconstruction.',
      },
      {
        label: 'Szymanowicz, Rupprecht & Vedaldi — Splatter Image',
        href: 'https://openaccess.thecvf.com/content/CVPR2024/html/Szymanowicz_Splatter_Image_Ultra-Fast_Single-View_3D_Reconstruction_CVPR_2024_paper.html',
        note: 'Primary CVPR 2024 paper on predicting a Gaussian-splat representation from a single image.',
      },
      {
        label: 'Splatter Image — official code',
        href: 'https://github.com/szymanowiczs/splatter-image',
        note: 'Official implementation released by the paper authors.',
      },
    ],
    related: [],
    evidence: 'Vault note: “Homelab Image-to-3D — Deferred Research Plan”. The note explicitly records no training as completed and frames pretrained baselines, data provenance, and leakage checks as prerequisites.',
  },
  {
    id: 'immersive-web-graphics',
    title: 'Immersive Web Graphics Without Losing the Web',
    category: 'graphics',
    summary: 'A teardown-and-build thread around single-canvas WebGL, scroll synchronization, animation staging, physical materials, performance budgets, and progressive enhancement. The portfolio’s Three.js work draws from these references while preserving native scrolling and original models instead of copying any creator’s scene or assets.',
    question: 'How can a WebGL scene feel cinematic without turning the page into a fragile demo reel?',
    status: 'Research + implementation',
    sections: [
      {
        title: 'One scene should have a reason to exist',
        text: 'The strongest reference sites use 3D as a continuous spatial system rather than as decorative widgets. Bruno Simon’s folio exposes a real game/world loop; Lusion’s engineering material explains the synchronization cost of binding WebGL visuals to DOM scroll. The portfolio borrows principles—persistent state, deliberate motion, one renderer—not scene geometry or assets.',
      },
      {
        title: 'Native scrolling is a constraint worth keeping',
        text: 'Lusion’s WebGL Scroll Sync repository documents why native scrolling and requestAnimationFrame can desynchronize and why many immersive sites resort to scroll-jacking. The portfolio keeps touch scrolling native and uses bounded scroll progress plus scene choreography instead. That makes the motion system a progressive enhancement rather than a replacement for document navigation.',
      },
      {
        title: 'Material craft and performance are coupled',
        text: 'The build playbook tracks lighting, physical material response, draw calls, instancing, device-pixel-ratio caps, offscreen pausing, reduced motion, and fallback content as one system. The current observatory sculptures are original procedural work informed by these practices. Creator references are credited because the value of the research is understanding their engineering decisions, not reproducing their visual identity.',
      },
    ],
    references: [
      {
        label: 'Bruno Simon — Folio 2025 source',
        href: 'https://github.com/brunosimon/folio-2025',
        note: 'Original creator repository; studied for continuous-world structure, game loop, weather/time systems, and interaction design.',
      },
      {
        label: 'Lusion — WebGL Scroll Sync',
        href: 'https://github.com/lusionltd/WebGL-Scroll-Sync',
        note: 'Original Lusion engineering demo explaining single-canvas DOM/WebGL synchronization while retaining native scroll.',
      },
      {
        label: 'Lusion — creator engineering journal',
        href: 'https://blog.lusion.co/',
        note: 'Primary studio source for WebGL production techniques referenced in the vault teardowns.',
      },
      {
        label: 'Three.js contributors — official documentation',
        href: 'https://threejs.org/docs/',
        note: 'Primary library documentation used for renderer, material, geometry, controls, and lifecycle implementation details.',
      },
    ],
    related: [],
    evidence: 'Vault notes: “Immersive Web Graphics — Build Playbook”, “Immersive Web Graphics — Reference Sites”, and “Cork and Oryzo — Web Graphics Teardown”. Credits are kept separate from the portfolio’s original Three.js scene implementation.',
  },
  {
    id: 'biological-computation-memory',
    title: 'Dendrites, Memory & Biological Computation',
    category: 'foundations',
    summary: 'A neuroscience study of multi-compartment dendrites, memory systems, replay, neuromodulated plasticity, and sparse distributed representations. The portfolio uses this material to generate engineering questions, while keeping biological mechanisms, computational models, and artificial neural-network analogies explicitly separate.',
    question: 'Which biological mechanisms are useful computational abstractions, and which details stop surviving the translation to AI?',
    status: 'Research notes',
    sections: [
      {
        title: 'A biological neuron is more than a scalar activation',
        text: 'Dendritic branches can integrate signals nonlinearly, retain local state, and couple different compartments before spike generation. Recent models such as Dendritic LIF and DendriCL explore whether richer within-neuron dynamics can provide useful computation or adaptation. Those are artificial models inspired by physiology, not evidence that one biological neuron learns arbitrary tasks autonomously.',
      },
      {
        title: 'Memory spans fast and slow systems',
        text: 'The neuroscience notes synthesize working memory, hippocampal episodic encoding, slower cortical consolidation, replay, sparse engrams, and reconstructive recall. These mechanisms motivate questions about fast external memory and slower parameter learning, but the correspondence is an analogy with testable consequences, not proof that an AI harness should duplicate brain anatomy.',
      },
      {
        title: 'Credit assignment is local and modulated in brains',
        text: 'STDP and three-factor learning rules combine local activity with timing and neuromodulatory signals, contrasting with exact global backpropagation. The research tracks this as a source of alternative learning hypotheses—especially delayed reward and online adaptation—while also recording that surrogate-trained neuron models and engineered sensory encoders can contribute much of a reported capability.',
      },
    ],
    references: [
      {
        label: 'Ma, Liu, Li & Zhou — Dendritic LIF',
        href: 'https://proceedings.iclr.cc/paper_files/paper/2026/hash/7d1fe4f9eecba80469c7434d1c725ec2-Abstract-Conference.html',
        note: 'Primary ICLR 2026 paper on bilinear dendritic integration in spiking neural networks.',
      },
      {
        label: 'Aizenbud, Beniaguev, Pnueli, Segev & London — What can a neuron compute (TwinProp)',
        href: 'https://www.biorxiv.org/content/10.64898/2026.06.08.730984v1',
        note: 'Primary preprint optimizing synaptic strengths and locations in a detailed pyramidal-cell model through a differentiable surrogate.',
      },
      {
        label: 'Shen, Wu & Chen — DendriCL',
        href: 'https://arxiv.org/abs/2607.02283',
        note: 'Primary preprint on compartment dynamics as an online estimator with frozen inference-time synapses.',
      },
      {
        label: 'Liu et al. — Optogenetic activation of a hippocampal engram',
        href: 'https://www.nature.com/articles/nature11028',
        note: 'Primary Nature experiment demonstrating recall from reactivation of tagged memory-ensemble cells.',
      },
    ],
    related: ['doomfly'],
    evidence: 'Vault notes: “How the Human Brain Works — Processing, Memory, Creativity” and “Dendritic and Multi-Compartment Neural Computation”. Both notes explicitly distinguish biological evidence, artificial neuron models, and proposed AI analogies.',
  },
  {
    id: 'time-entropy-information',
    title: 'Time, Entropy & Information',
    category: 'foundations',
    summary: 'A foundations-of-physics synthesis connecting statistical mechanics, the thermodynamic arrow of time, low-entropy boundary conditions, information, and the physical cost of irreversible computation. The note also marks the unresolved step: why the early universe occupied such an unusually low-entropy state.',
    question: 'Why do reversible microscopic laws produce a macroscopic world with a direction of time?',
    status: 'Research notes',
    sections: [
      {
        title: 'The arrow is statistical',
        text: 'Microscopic equations are largely compatible with reversing time, while macroscopic processes overwhelmingly move toward higher-entropy macrostates. Boltzmann’s statistical picture explains why high-entropy configurations dominate phase space, but by itself is time-symmetric. To explain why entropy was lower in the past rather than both directions from the present, the account needs a special low-entropy boundary condition.',
      },
      {
        title: 'Information is physical, but not merely a metaphor for entropy',
        text: 'Shannon information and thermodynamic entropy share mathematical structure, while Landauer’s principle gives the connection operational force: logically irreversible erasure has a minimum heat cost. The vault uses this carefully—information theory does not make every computation thermodynamics, and fine-grained entropy can remain conserved while coarse-grained descriptions become effectively irreversible.',
      },
      {
        title: 'The deepest premise remains unexplained',
        text: 'The Past Hypothesis packages the observed arrow into a low-entropy initial condition; it does not explain why that condition obtained. Gravitational entropy complicates the intuition because an early smooth universe is low entropy for a self-gravitating system. The portfolio presents this as an open foundations question, not a personal theory of time.',
      },
    ],
    references: [
      {
        label: 'Claude Shannon — A Mathematical Theory of Communication',
        href: 'https://onlinelibrary.wiley.com/doi/10.1002/j.1538-7305.1948.tb01338.x',
        note: 'Primary 1948 paper establishing the modern mathematical theory of information.',
      },
      {
        label: 'Rolf Landauer — Irreversibility and Heat Generation in the Computing Process',
        href: 'https://doi.org/10.1147/rd.53.0183',
        note: 'Primary paper connecting logically irreversible information erasure to a thermodynamic cost.',
      },
      {
        label: 'Bérut et al. — Experimental verification of Landauer’s principle',
        href: 'https://www.nature.com/articles/nature10872',
        note: 'Primary experimental study measuring the heat cost associated with single-bit erasure.',
      },
    ],
    related: [],
    evidence: 'Vault notes: “Time, Entropy and Information”, “Arrow of Time”, “Entropy”, “Past Hypothesis”, and the Thermodynamics & Information map. The synthesis explicitly marks the low-entropy initial condition as unresolved.',
  },
  {
    id: 'spacetime-gravity-problem-time',
    title: 'Spacetime, Gravity & the Problem of Time',
    category: 'foundations',
    summary: 'A study of general relativity as dynamical spacetime geometry, experimental tests of equivalence and gravitational waves, and the conceptual problem that canonical quantum gravity has no ordinary external time parameter. It is a map of established theory and open questions, not a proposed replacement for GR.',
    question: 'If time is part of the dynamical geometry, what becomes of ordinary evolution when spacetime itself is quantized?',
    status: 'Research notes',
    sections: [
      {
        title: 'Gravity is geometry in the tested classical theory',
        text: 'General relativity replaces a universal gravitational force field on fixed space with a dynamical metric: energy and momentum curve spacetime, and freely falling objects follow geodesics. Tidal relative acceleration reveals genuine curvature. The Newtonian inverse-square law reappears as an excellent weak-field, slow-motion approximation rather than the foundational description.',
      },
      {
        title: 'The theory survives many independent tests',
        text: 'Precision tests include universality of free fall, gravitational redshift, light deflection, orbital precession, gravitational-wave observations, and black-hole imaging. These observations constrain modifications strongly while leaving cosmological dark matter/dark energy and the quantum regime unresolved. The dossier separates those open problems from the very well tested classical domain.',
      },
      {
        title: 'Canonical quantum gravity exposes a problem with time itself',
        text: 'In ordinary quantum mechanics, time is an external parameter. In canonical general relativity the Hamiltonian is constrained, and quantization leads schematically to the timeless Wheeler–DeWitt equation. Relational clocks, semiclassical time, and Page–Wootters-style mechanisms are candidate resolutions, none established as the tested theory of quantum gravity.',
      },
    ],
    references: [
      {
        label: 'MICROSCOPE Collaboration — final equivalence-principle result',
        href: 'https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.129.121102',
        note: 'Primary precision test of universality of free fall.',
      },
      {
        label: 'LIGO/Virgo Collaboration — GW150914',
        href: 'https://doi.org/10.1103/PhysRevLett.116.061102',
        note: 'Primary report of the first direct gravitational-wave detection.',
      },
      {
        label: 'Event Horizon Telescope Collaboration — M87* image I',
        href: 'https://doi.org/10.3847/2041-8213/AB0EC7',
        note: 'Primary 2019 EHT paper introducing the M87* black-hole shadow observations.',
      },
      {
        label: 'Page & Wootters — Evolution without evolution',
        href: 'https://journals.aps.org/prd/abstract/10.1103/PhysRevD.27.2885',
        note: 'Primary paper on relational/emergent time from correlations with an internal clock.',
      },
    ],
    related: [],
    evidence: 'Vault notes: “Gravity”, “General Relativity”, “Spacetime”, “Time”, “Problem of Time”, and the Spacetime & Gravity map. Established tests and speculative quantum-gravity resolutions are labeled separately.',
  },
];
