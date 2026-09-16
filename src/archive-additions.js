// Historical and workflow projects documented in the vault outside the current /dev inventory.
export const archiveAdditions = [
  {
    id:'archived-physics-engine', name:'Physics Engine — Archived Study', category:'simulation', area:'Numerics, gravity & rendering', status:'Archived implementation', kind:'Archived project',
    summary:'A C++ physics and rendering study covering classical mechanics, N-body gravity, special relativity, electromagnetism, Schwarzschild geodesics, and compressible fluids. Its build log preserves analytical validation and black-hole rendering work. The implementation was later deleted at my request; the research notes remain.',
    question:'How can one numerical core support different physical systems while keeping its accuracy independently testable?',
    tech:['C++','CMake','Numerical integration','Ray tracing','raylib'],
    sections:[
      {title:'One core, several regimes',text:'The recorded implementation used a shared integration interface for pendulums, orbital dynamics, charged particles, and relativistic geodesics. Additional modules covered rigid-body rotation and a one-dimensional HLLC fluid solver, with headless renderers and an optional raylib viewer.'},
      {title:'An archived result',text:'The June 2026 build log records 36 analytic/reference checks and a backward-geodesic black-hole renderer. Those are historical project records, not freshly reproduced results. Both C++ and earlier TypeScript code trees were deliberately removed on June 25; no working download or active service is advertised.'},
      {title:'Physical theory versus implementation',text:'The equations, integration methods, and Schwarzschild solution are established scientific work. The project contribution was implementing and comparing numerical approximations. Numerical relativity and binary-merger simulations remained outside the implemented milestones.'}
    ],
    credits:[
      {label:'raylib — raysan5 and contributors',href:'https://www.raylib.com/',note:'Graphics/input library used for the optional native viewer; distinct from the custom numerical core.'},
      {label:'Sean Carroll — Lecture Notes on General Relativity',href:'https://arxiv.org/abs/gr-qc/9712019',note:'Established general-relativity reference in the associated physics research record. The project does not claim to invent the underlying theory.'}
    ],links:[],evidence:'Physics Engine Build Log and associated architecture/validation notes, retained after the explicitly recorded code deletion. Broad numerical-accuracy claims are not inferred beyond that historical record.',related:['forgelab','realmforge']
  },
  {
    id:'coop-shooter',name:'TryNum1 — Co-op Shooter',category:'product',area:'Collaborative Unreal prototype',status:'Historical prototype',kind:'Collaborative prototype',
    summary:'A six-day collaborative Unreal Engine prototype joining a third-person character, networked inventory, weapon shop, Steam host/join interface, and weapon-icon generation tools. It is preserved as a compact development sprint, with the collaborator and Epic’s animation foundation credited separately from the custom gameplay work.',
    question:'What does it take to connect inventory, economy, combat, and multiplayer sessions into one small playable loop?',
    tech:['Unreal Engine','Blueprints','Steam sessions','Replicated inventory'],
    sections:[
      {title:'Built together',text:'The source survey records a June 2025 sprint with 46 reachable commits: 39 attributed to aizenkai1001 and seven to collaborator hewneuroo. Their contribution belongs with the project; this is not presented as a solo implementation.'},
      {title:'Gameplay and tooling',text:'The documented work includes server-side inventory operations, item data assets, a weapon shop and cash state, host/join screens, and an editor utility that renders weapon meshes into transparent icons. Character locomotion uses Epic’s Game Animation Sample foundation.'},
      {title:'Prototype boundary and assets',text:'The September 2026 asset survey inspected Blueprints and repository history rather than running a new play test. A purchased interaction pack also exists in the archive, but its presence is not evidence that its implied game features were built. Its unresolved vendor details and other third-party artwork are not republished here.'}
    ],
    credits:[
      {label:'Epic Games — Unreal Engine',href:'https://www.unrealengine.com/',note:'Game engine and Blueprint development tools used by the prototype.'},
      {label:'Epic Games — Game Animation Sample',href:'https://dev.epicgames.com/documentation/en-us/unreal-engine/game-animation-sample-project-in-unreal-engine',note:'Upstream locomotion and animation foundation; custom inventory, shop, and integration work is described separately.'}
    ],links:[],evidence:'“TryNum1 — Co-op Shooter” and its September 2026 Unreal source survey record the implementation, collaborator history, and asset provenance. Current multiplayer availability is not claimed.',related:['veilborn','melee-combat-sandbox']
  },
  {
    id:'melee-combat-sandbox',name:'Weapon MM Combo',category:'graphics',area:'Animation & combat integration',status:'Historical systems prototype',kind:'Upstream extension',
    summary:'An Unreal animation sandbox that brings sword attack, block, equip, and sheath behavior into a custom character and overlay layer. Its engineering centers on integrating combat with an existing motion-matching and traversal foundation, with explicit attribution to Epic and the animation sources.',
    question:'How can combat state, equipment, and animation overlays work together without breaking locomotion and traversal?',
    tech:['Unreal Engine','Blueprints','Motion matching','Animation retargeting'],
    sections:[
      {title:'The custom layer',text:'The project adds character, weapon, attachment, overlay, and attack-state logic around sword draw, sheath, slash, and block montages. The source survey identifies these integrations as the local contribution; the sandbox was not a completed game with levels and encounters.'},
      {title:'The foundation belongs to Epic',text:'The traversal components, chooser data, and sample character are carried from Epic’s Game Animation Sample. They are not claimed as an original traversal system. Mixamo animations and other animation sets were retargeted into the combat layer.'},
      {title:'What the archive establishes',text:'The September 2026 survey checked asset relationships and Blueprint graphs without compiling or playing the project again. The katana model’s acquisition and license were unresolved, so no model, animation package, or screenshot containing that uncertain artwork is distributed by this portfolio.'}
    ],
    credits:[
      {label:'Epic Games — Game Animation Sample',href:'https://dev.epicgames.com/documentation/en-us/unreal-engine/game-animation-sample-project-in-unreal-engine',note:'Original motion-matching locomotion, sample assets, and traversal implementation carried into the sandbox.'},
      {label:'Adobe — Mixamo',href:'https://www.mixamo.com/',note:'Source of documented melee, equip/sheath, and slide animation material; these animations are not original portfolio assets.'}
    ],links:[],evidence:'“Weapon_MM_Combo — Melee Combat Sandbox”, the September 2026 asset survey, and its explicit attribution correction distinguish unchanged upstream assets from the custom integration.',related:['coop-shooter','veilborn']
  },
  {
    id:'media-library-automation',name:'Media Library Automation',category:'tools',area:'Workflow orchestration & media',status:'Verified workflow record',kind:'Tooling',
    summary:'A personal n8n workflow connecting a supplied media link, browser-based source discovery, FFmpeg processing, and a Jellyfin library. It stages unfinished files separately, hands off completed downloads, closes the browser after success, and selects available storage so routine transfers do not need manual supervision.',
    question:'How can a long-running browser and media job finish cleanly, keep partial files out of the library, and release its resources?',
    tech:['n8n','Playwright','FFmpeg','Jellyfin','Shell scripting'],
    sections:[
      {title:'From an input to a completed file',text:'The recorded workflow accepts a URL at runtime, reads metadata, follows the configured provider chain, and hands a resolved stream to a background FFmpeg helper. It builds on the custom n8n Browser service, while the existing library workflow handles completed-file organization.'},
      {title:'Completion is a distinct event',text:'Incomplete media is kept outside the watched import area. A successful final move triggers the browser-close callback and library refresh behavior. The recorded implementation also prefers a second media disk and retains a fallback when that storage is unavailable.'},
      {title:'Recorded verification and scope',text:'The September 15 build note records an end-to-end download/import, a successful browser cleanup callback, and the resulting library database entry. This is a specific personal workflow, not a universal media downloader; source websites and their integrations can change.'}
    ],
    credits:[
      {label:'n8n contributors',href:'https://github.com/n8n-io/n8n',note:'Workflow engine coordinating the custom nodes, triggers, and completion callbacks.'},
      {label:'Microsoft — Playwright',href:'https://github.com/microsoft/playwright',note:'Browser-automation engine used by the custom browser service.'},
      {label:'FFmpeg contributors',href:'https://ffmpeg.org/',note:'Media processing and stream-copy tooling used by the background helper.'},
      {label:'Jellyfin contributors',href:'https://jellyfin.org/',note:'Media-library server receiving the completed files. The workflow is an integration with Jellyfin, not an implementation of it.'}
    ],links:[],evidence:'“n8n Browser Movie Extract Verification Fix”, September 15 additions: dynamic input, server fallback, completed-file handoff, end-to-end verification, browser cleanup, and second-disk layout. Operational URLs and credentials are excluded.',related:['n8n-browser','homelab-mcp']
  }
];
