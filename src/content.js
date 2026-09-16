// Public editorial copy only. Private infrastructure details stay in the vault.
// Evidence and attribution are recorded in docs/project-evidence.md.
export const identity = {
  name: 'Jancarlos Espinal',
  email: 'Jancarlos.espinal.gonzalez@gmail.com',
  github: 'https://github.com/AizenKai1001',
  site: 'https://aizenkai1001.github.io',
  reviewed: 'September 15, 2026'
};

export const experiments = [
  {
    id: 'distinction', number: '01', name: 'Distinction AI',
    area: 'Non-neural learning', status: 'Working prototype', tag: 'learning',
    question: 'Can a system learn a rule, then change its mind?',
    summary: 'A small program-learning system that predicts outcomes, encounters counterexamples, and revises its explanation.',
    image: '/media/distinction.webp', alt: 'Distinction AI dashboard showing its pixel world, predictions, and learned program.',
    tech: ['Python', 'Program synthesis', 'Custom runtime'],
    fact: '480 / 480', factLabel: 'held-out actions in a small synthetic benchmark',
    scope: 'Five training seeds · engineered visual measurements',
    intro: 'Distinction explores learning without a neural network or pretrained model. Its hypotheses are small executable Boolean programs. A prediction is recorded before an action happens, and a wrong prediction can change the program selected by the learner.',
    sections: [
      { title: 'The experiment', text: 'In a controlled 16 × 16 RGB world, an agent observes an object and a neutral mark, chooses to wait or push, then observes motion. Touching and disconnected marks have the same pixel count, so the task calls for a spatial measurement. Training and frozen evaluation use different body shapes and color palettes.' },
      { title: 'What I built', text: 'A bounded hypothesis search, expression interpreter, counterexample-driven revision, named definitions, and a read-only visual dashboard. The runtime saves its random state and learned programs in integrity-checked checkpoints, allowing continuation to be compared with an uninterrupted run.' },
      { title: 'What the first run showed', text: 'The recorded five-seed benchmark predicted 480 of 480 held-out visual actions correctly. An always-no-motion baseline scored 347 of 480. In a separate cue-memory task, supplying one earlier observation produced 320 of 320 correct predictions, compared with 160 of 320 without it. The release also passed 98 software tests on Windows and Linux.' },
      { title: 'The important limit', text: 'Segmentation, contact measurements, the expression grammar, and the motion target are engineered. Removing the contact measurement reduced matched-scene accuracy to 75%. These results establish learning over supplied features inside a tiny generator; they do not establish autonomous perception or general intelligence.' },
      { title: 'The next question', text: 'Can the learner discover a useful perceptual test rather than receive it? That is a research direction, separate from the capabilities already implemented.' }
    ],
    evidence: 'Local README, recorded benchmark and controls, checkpoint-continuation verification; release reviewed September 15, 2026.',
    links: [
      { label: 'Recorded benchmark & controls (JSON)', href: '/evidence/distinction.json' },
      { label: 'Full recorded dashboard', href: '/media/distinction-full.webp' },
      { label: 'Read the related research note', href: '/notes/learning-through-counterexamples/' }
    ]
  },
  {
    id: 'doomfly', number: '02', name: 'DOOMFLY experiments',
    area: 'Embodied intelligence', status: 'Experimental', tag: 'simulation',
    question: 'Does changing a brain actually change what it learns?',
    summary: 'Connectome-based simulation, visual inputs, and plasticity experiments inside a ViZDoom environment.',
    image: '/media/doomfly.webp', alt: 'A recorded ViZDoom game frame used in the upstream DOOMFLY project.',
    tech: ['Python', 'ViZDoom', 'C++'],
    fact: 'Behavior ≠ learning', factLabel: 'controls before capability claims',
    scope: 'Experiments built on the open-source DOOMFLY project',
    intro: 'This work investigates an embodied neural simulation: visual input from a game enters a retained fruit-fly connectome model, activity propagates through the graph, and selected outputs become game controls. My portfolio presents the experiments and engineering around that system, with credit to the upstream project.',
    sections: [
      { title: 'A visible experimental loop', text: 'The system connects real ViZDoom frames, modeled neural activity, a fixed output-to-button mapping, and a spectator interface. This makes it possible to inspect input, activity, and behavior together rather than judge the experiment from a game score alone.' },
      { title: 'The research focus', text: 'The local work covers sensory inputs, runtime and viewer improvements, plasticity experiments, and validation controls. A dopamine-gated candidate changes an existing subset of connections during play. That mechanism can be implemented correctly without producing a useful learned behavior.' },
      { title: 'What remains unresolved', text: 'The documented v6 learning candidate failed its visual, conditioning, and survival validation gates. Changing weights or surviving longer is not presented as demonstrated learning. The value of this experiment is the testable loop and the ability to locate failed assumptions.' },
      { title: 'Attribution', text: 'DOOMFLY is an upstream open-source project published under nftechie/doomfly. This page describes a local experimental implementation and research work around it; it does not claim sole authorship of the upstream code, connectome datasets, or ViZDoom.' }
    ],
    evidence: 'Local DOOMFLY README and sensory/improvement experiment records. Scientific status reviewed September 15, 2026.',
    links: [{ label: 'Upstream DOOMFLY repository', href: 'https://github.com/nftechie/doomfly' }]
  },
  {
    id: 'forgelab', number: '03', name: 'ForgeLab',
    area: 'Neuroevolution', status: 'Research prototype', tag: 'simulation',
    question: 'Did evolution learn to walk—or find a physics bug?',
    summary: 'Evolving bodies and controllers together, then testing whether apparent progress survives a stricter simulator.',
    image: null, alt: '',
    tech: ['TypeScript', 'NEAT', 'Rigid-body physics'],
    fact: 'Negative controls', factLabel: 'a motionless body is part of the benchmark',
    scope: 'The solver study has one fresh re-evolution seed',
    intro: 'ForgeLab combines a custom NEAT implementation with a 2D rigid-body simulator. It evolves creature bodies and controllers together. The most useful result so far came from questioning what the fitness score was actually measuring.',
    sections: [
      { title: 'When the metric looked too good', text: 'A position-correction pass added gravitational potential energy without a matching energy input. The original audit subtracted that added energy, hiding the defect. Evolved candidates could exploit the simulator rather than produce meaningful locomotion.' },
      { title: 'Building a better test', text: 'A stricter test set motor torque to zero and tracked kinetic plus potential energy directly. Speculative contacts and a two-sided position bias were then evaluated against disabled-fix controls. Previously selected creatures were remeasured on the corrected solver.' },
      { title: 'What survived the correction', text: 'The earlier claim of two walking candidates fell to zero under the revised checks. One new 100-generation run kept the selected-versus-refined solver ratio near 1.00, but its final candidate beat its motionless-body baseline by only about 1.03×. Fixing the exploit did not establish walking.' },
      { title: 'Where this goes next', text: 'Re-evolving more seeds and redesigning the fitness objective remain open work. The result is a simulator and evaluation lesson, with the single-seed scope kept explicit.' }
    ],
    evidence: 'ForgeLab build log, September 5–6, 2026; speculative-contacts branch and strict-energy/control measurements.',
    links: [{ label: 'Read the evaluation note', href: '/notes/when-the-benchmark-lies/' }]
  },
  {
    id: 'plasticity', number: '04', name: 'Plasticity Bench',
    area: 'Continual learning', status: 'Measured experiment', tag: 'learning',
    question: 'When does a network lose the ability to keep learning?',
    summary: 'A NumPy test bench for learning across changing tasks, including a three-condition, 400-task comparison and a useful negative result.',
    image: null, alt: '',
    tech: ['Python', 'NumPy', 'Controlled benchmarks'],
    fact: '400 tasks', factLabel: 'three conditions with matched sequences',
    scope: 'Small regression tasks · not a replication at paper scale',
    intro: 'Plasticity Bench tests how a network adapts to a sequence of tasks. Backpropagation is implemented directly so the update rule is visible, and all comparison arms receive matched task sequences and seeds.',
    sections: [
      { title: 'The comparison', text: 'Smaller experiments compare ordinary backpropagation, full reinitialization, weight decay, continual backpropagation, and a frozen-feature control. The featured 400-task Adam run uses three conditions: backpropagation, reinitialization, and continual backpropagation. Each receives the same seeded sequence of permuted tasks.' },
      { title: 'The negative result', text: 'Loss of plasticity did not appear in the tested configurations: ordinary backpropagation learned later tasks better. In the 400-task Adam/permuted run, the late-to-early loss ratio was 0.62×. Lower means the last ten tasks had lower final loss than the first ten.' },
      { title: 'The distinction that matters', text: 'That same run developed roughly 18% inactive units and a lower effective representation rank. Those internal changes did not translate into worse task performance in this setting. The observation separates an apparent mechanism from the behavioral claim it is supposed to explain.' },
      { title: 'Limits of this result', text: 'This is a small regression benchmark, not a refutation of the published loss-of-plasticity result. Hundreds rather than thousands of tasks, task-family transfer, and implementation differences limit the comparison. Fresh teachers, classification tasks, and separate retention tests are proposed next steps.' }
    ],
    evidence: 'Plasticity Bench measured result, September 9, 2026; seeded NumPy experiment records in the local project.',
    links: [
      { label: 'Recorded 400-task run (JSON)', href: '/evidence/plasticity.json' },
      { label: 'Read the negative-result note', href: '/notes/negative-results/' },
      { label: 'Related paper: Loss of plasticity', href: 'https://www.nature.com/articles/s41586-024-07711-7' }
    ]
  },
  {
    id: 'evoforge', number: '05', compact: true, name: 'EvoForge',
    area: 'Artificial life', status: 'Research prototype', tag: 'simulation',
    question: 'What changes when a population can learn and evolve?',
    summary: 'A persistent artificial-life world with evolving neural policies, population dynamics, and controls for within-lifetime learning.',
    image: null, alt: '', tech: ['TypeScript', 'Neuroevolution', 'Canvas'],
    fact: '14 runs', factLabel: 'plasticity-on versus plasticity-off controls',
    scope: 'No demonstrated fitness benefit from lifetime plasticity',
    intro: 'EvoForge is a persistent simulation of populations that sense, act, consume resources, reproduce, and mutate. Neural policies are inherited across generations, while the world and its population can be saved and resumed.',
    sections: [
      { title: 'The working system', text: 'The TypeScript runtime steps the artificial-life world, records its state, and streams a browser visualization. The local work includes egocentric sensing, ecology and lineage mechanics, two-timescale plasticity, and instrumentation for long-running comparisons.' },
      { title: 'Testing the learning claim', text: 'The recorded 14-run, 18,000-tick sweep did not establish a fitness separation between plasticity enabled and disabled. A promising older-versus-younger comparison was also confounded by survivorship: the plasticity-off control produced an even larger ratio.' },
      { title: 'What I take from it', text: 'Persistence, population growth, and a changing neural policy are implemented behaviors. They do not by themselves measure intelligence. The next useful test needs a within-lifetime change in the correct action, so learning can be separated from inherited policy and survival bias.' }
    ],
    evidence: 'EvoForge build log, v0.10/v0.11 instrumentation and controlled-sweep results, reviewed September 15, 2026.',
    links: [{ label: 'Related evaluation note', href: '/notes/when-the-benchmark-lies/' }]
  },
  {
    id: 'forgegrad', number: '06', compact: true, name: 'ForgeGrad',
    area: 'Deep-learning internals', status: 'Verified implementation', tag: 'learning',
    question: 'What does it take to build the machinery of learning?',
    summary: 'A compact autograd engine, neural-network layers, optimizers, and a looped GPT built to make the internals inspectable.',
    image: null, alt: '', tech: ['Python', 'NumPy', 'Autograd'],
    fact: '20 operations', factLabel: 'gradients checked against a PyTorch reference',
    scope: 'An educational framework and small memorization test',
    intro: 'ForgeGrad rebuilds the essential mechanics of a deep-learning framework in a small codebase: tensors, a computation graph, reverse-mode differentiation, layers, optimizers, and a weight-tied looped transformer.',
    sections: [
      { title: 'An inspectable backward pass', text: 'The engine implements broadcasting-aware gradients, a topological backward pass, activations, cross-entropy, embeddings, and normalization. NumPy is the default array backend; a CuPy backend is included as an optional path.' },
      { title: 'What was verified', text: 'The project records checks for 20 operations and an end-to-end multilayer perceptron against PyTorch gradients, with maximum error around 1e-7. A small looped GPT lowers loss from 3.47 to 0.008 on a fixed memorization batch. This verifies a training path, not general language ability.' },
      { title: 'Keep the scope small', text: 'The framework is for understanding and experimentation. It does not claim the breadth, performance, distributed training, or compiler infrastructure of a production framework. The repeated transformer core is a depth experiment, not evidence that more loops always improve reasoning.' },
      { title: 'Design references', text: 'The project acknowledges micrograd for its autograd design, tinygrad for a compact operation set, and recurrent-depth language-model work for the looped core. PyTorch acts as a verification reference rather than the implementation of the engine.' }
    ],
    evidence: 'ForgeGrad README, autograd/training/GPT verification records, and the associated implementation note in the research vault.',
    links: [{ label: 'Back to the research notebook', href: '/#notebook' }]
  }
];

export const notes = [
  {
    id: 'learning-through-counterexamples', number: '01', area: 'Learning & representation', date: '15 Sep 2026',
    title: 'Learning by being wrong',
    summary: 'What an executable hypothesis buys you—and what it still assumes.',
    intro: 'An incorrect prediction is useful evidence. In Distinction AI, it can eliminate a candidate program or make a more specific explanation preferable. Because the hypotheses are executable and small, the revision is directly inspectable.',
    sections: [
      { title: 'Start with a prediction', text: 'The experiment records an answer before applying the action and measuring the outcome. Training accuracy and frozen evaluation remain separate. This prevents a corrected answer from being reported as if it had been predicted correctly the first time.' },
      { title: 'Make the assumptions visible', text: 'The initial visual adapter supplies segmentation and contact measurements. The learner discovers a rule over those measurements, not the whole perceptual system. Removing a helpful measurement is therefore a necessary control, not an optional footnote.' },
      { title: 'Keep the next step separate', text: 'Discovering its own useful measurements is the next research question. Checkpointing, program naming, and successful small-task prediction are implemented steps, but none alone answers that question.' }
    ],
    related: 'distinction'
  },
  {
    id: 'when-the-benchmark-lies', number: '02', area: 'Evaluation & simulation', date: '06 Sep 2026',
    title: 'When the benchmark rewards the bug',
    summary: 'An evolved creature can expose the evaluator’s assumptions.',
    intro: 'In ForgeLab, greater displacement initially looked like better locomotion. Removing motor power and checking energy directly revealed a different explanation: the physics solver was adding energy.',
    sections: [
      { title: 'A stronger control', text: 'A motor-disabled body tests how much movement comes from geometry and gravity. A refined simulator checks whether the measured distance depends on numerical error. Both controls are needed before interpreting displacement as learned walking.' },
      { title: 'Correct the story with the implementation', text: 'Remeasuring old candidates after the solver fix changed the conclusion. The earlier walking result did not survive. The corrected measurements and the implementation belong together, so future readers do not inherit a claim about an obsolete simulator.' },
      { title: 'What remains worth investigating', text: 'One re-evolved seed reduced the selected-versus-refined solver discrepancy, while the candidate still barely exceeded its motionless baseline. More seeds and a better objective are needed before making a locomotion claim.' }
    ],
    related: 'forgelab'
  },
  {
    id: 'negative-results', number: '03', area: 'Continual learning', date: '09 Sep 2026',
    title: 'A negative result is still a result',
    summary: 'Inactive neurons appeared. The expected performance loss did not.',
    intro: 'Plasticity Bench did not reproduce a loss of learning ability at its tested scale. Keeping that outcome visible is more useful than treating every change in an internal statistic as support for the expected theory.',
    sections: [
      { title: 'Measure the claim itself', text: 'The intended effect was worse performance on later tasks. In the tested small regression settings, the network improved instead. The internal measurements—unit inactivity and representation rank—were informative, but were not substitutes for task performance.' },
      { title: 'A limit, not a refutation', text: 'Task family, optimizer, scale, and remaining transfer opportunities matter. A result from hundreds of small regression tasks does not overturn a result from a different experimental regime. It identifies where this implementation has and has not reproduced an effect.' },
      { title: 'A useful next experiment', text: 'The proposed follow-up removes more transfer between tasks and evaluates classification and retention separately. This is planned research; it is not folded into the reported measurements.' }
    ],
    related: 'plasticity'
  }
];
