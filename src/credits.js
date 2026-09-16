// Relationship labels distinguish prior research from code used in a project.
export const featuredCredits = {
  distinction: [
    { label: 'Andrew Cropper & Rolf Morel — Learning programs by learning from failures', href: 'https://arxiv.org/abs/2005.02259', note: 'Research precedent for failure-guided program learning. Distinction is a separate bounded implementation, not Popper.' },
    { label: 'Matthew Bowers and collaborators — Stitch', href: 'https://arxiv.org/abs/2211.16605', note: 'Library-learning research reference. Naming a definition in Distinction is not a reproduction of Stitch’s library optimization.' }
  ],
  doomfly: [
    { label: 'nftechie / DOOMFLY', href: 'https://github.com/nftechie/doomfly', note: 'Upstream project and source of the game-frame image. The portfolio covers local experiments and engineering around this code.' },
    { label: 'ViZDoom authors & Farama Foundation', href: 'https://github.com/Farama-Foundation/ViZDoom', note: 'Doom-based research environment. Engine and game artwork retain their original ownership and notices.' },
    { label: 'DOOMFLY dataset and third-party attribution', href: 'https://github.com/nftechie/doomfly/blob/main/THIRD_PARTY.md', note: 'Credits for the MaleCNS reconstruction, biological modeling references, game components, and other upstream materials.' }
  ],
  forgelab: [
    { label: 'Kenneth O. Stanley & Risto Miikkulainen — NEAT', href: 'https://nn.cs.utexas.edu/?stanley:ec02', note: 'Original neuroevolution method. ForgeLab implements the algorithm and its own simulation/evaluation experiments; it does not claim to invent NEAT.' }
  ],
  plasticity: [
    { label: 'Shibhansh Dohare and collaborators — Loss of plasticity in deep continual learning', href: 'https://www.nature.com/articles/s41586-024-07711-7', note: 'Paper motivating the experiment and continual-backpropagation comparison. This smaller regression study did not reproduce the headline effect.' },
    { label: 'NumPy contributors', href: 'https://numpy.org/', note: 'Numerical array library used by the local experiment.' }
  ],
  evoforge: [
    { label: 'Node.js contributors', href: 'https://nodejs.org/', note: 'Runtime used for the persistent TypeScript simulation and browser-data service. The population mechanics and evaluation are documented as local experimental work.' }
  ],
  forgegrad: [
    { label: 'Andrej Karpathy — micrograd', href: 'https://github.com/karpathy/micrograd', note: 'Autograd design and teaching reference acknowledged by the project.' },
    { label: 'tinygrad contributors', href: 'https://github.com/tinygrad/tinygrad', note: 'Reference for a compact differentiable operation set.' },
    { label: 'PyTorch contributors', href: 'https://pytorch.org/', note: 'Gradient reference used in verification tests; distinct from the local framework implementation.' },
    { label: 'NumPy contributors', href: 'https://numpy.org/', note: 'Default array-computation backend.' }
  ]
};

export const siteCredits = [
  { label: 'Three.js — mrdoob and contributors', href: 'https://github.com/mrdoob/three.js', note: 'Rendering engine, OrbitControls, RoomEnvironment and geometry utilities. The portfolio’s three research models are original procedural scene code.', type: 'Software' },
  { label: 'Vite contributors', href: 'https://github.com/vitejs/vite', note: 'Static-site development and build tooling.', type: 'Software' },
  { label: 'Manrope — Mikhail Sharanda & collaborators', href: 'https://fonts.google.com/specimen/Manrope', note: 'Interface and body typeface. The variable-font work credits Mikhail Sharanda and Mirko Velimirovic. Served through Google Fonts.', type: 'Typography' },
  { label: 'Instrument Serif — Rodrigo Fuenzalida / Instrument', href: 'https://fonts.google.com/specimen/Instrument+Serif', note: 'Display typeface designed by Rodrigo Fuenzalida with direction from Jordan Egstad, JD Hooge and Jack De Caluwé for Instrument. Served through Google Fonts.', type: 'Typography' },
  { label: 'DM Mono — Colophon Foundry & Jonny Pinhorn', href: 'https://fonts.google.com/specimen/DM+Mono', note: 'Typeface commissioned for DeepMind, designed by the Colophon Foundry Design Team and Jonny Pinhorn. Used for labels and notation through Google Fonts.', type: 'Typography' },
  { label: 'Bruno Simon — interactive portfolio', href: 'https://bruno-simon.com/', note: 'Inspiration for continuously active 3D scenes and playful inspection. No portfolio code or models copied.', type: 'Design reference' },
  { label: 'Lusion — Oryzo AI', href: 'https://lusion.co/projects/oryzo_ai/', note: 'Reference for staged motion and tactile presentation. No branded models, textures, or artwork copied.', type: 'Design reference' },
  { label: 'Clay Boan & collaborators — Three.js portfolio', href: 'https://tympanus.net/codrops/2025/10/14/the-underdogs-crown-clay-boans-3d-playground-of-design-motion-and-gsap-magic/', note: 'Reference for coordinated canvas/page motion. The creator case study credits Thomas Van Glabeke for WebGL and Rob Smittenaar for frontend, alongside Théo Favereau, Anoukia Perrey and Ruud Luijten.', type: 'Design reference' },
  { label: 'Ming Jyun Hung — Still', href: 'https://tympanus.net/codrops/2026/09/09/still-from-akira-to-ink-wash-building-a-generative-garden-in-webgpu/', note: 'Creator breakdown studied for procedural branching and organic structure. The neuron geometry here was written for this portfolio.', type: 'Design reference' },
  { label: 'Serhii Polyvanyi — Digital Architecture with Three.js', href: 'https://tympanus.net/codrops/2026/09/09/turning-names-into-digital-architecture-with-three-js/', note: 'Creator breakdown studied for structural details and material response. No architectural assets copied.', type: 'Design reference' }
];

export const projectKind = project => project.id === 'doomfly' ? 'Upstream experiments' : project.kind || 'Research implementation';
