// ============================================================================
// 1. ENVIRONMENT & PATH RESOLUTION
// ============================================================================
const IN_PAGES_DIR = window.location.pathname.includes('/pages/');
const BASE_PATH = IN_PAGES_DIR ? '../' : '';

function resolveAsset(relPath) {
    if (!relPath) return '';
    if (/^(https?:|mailto:|#|data:)/i.test(relPath)) return relPath;
    const clean = relPath.replace(/^(\.\.\/)+/, '');
    return `${BASE_PATH}${clean}`;
}

function getActiveRoute() {
    const p = window.location.pathname.toLowerCase();
    if (p.endsWith('about.html')) return 'about';
    if (p.endsWith('stack.html')) return 'stack';
    if (p.endsWith('projects.html')) return 'projects';
    if (p.endsWith('contact.html')) return 'contact';
    if (p.endsWith('ast.html') || p.endsWith('lecture.html')) return 'ast';
    return 'home';
}

async function fetchSiteData() {
    const cacheBuster = `?t=${Date.now()}`;
    for (const file of ['assets/json/data.json', 'assets/json/cms.json']) {
        try {
            const res = await fetch(`${BASE_PATH}${file}${cacheBuster}`);
            if (res.ok) return await res.json();
        } catch {}
    }
    throw new Error('Could not load assets/json/data.json or assets/json/cms.json');
}

// ============================================================================
// 2. OFFICIAL BRAND LOGOS & STACK CATALOG (From Portfolio PDFs)
// ============================================================================
const PDF_STACK_CATALOG = [
    {
        name: "Unreal Engine 5",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/unrealengine/unrealengine-original.svg",
        icon: "ph-cube",
        color: "text-black",
        category: "engines",
        role: "3D Game Engine • C++ & Blueprints",
        level: "Expert / Lecturer",
        description: "Used for naturace VR, AST 3D Chess-Party & Darts, Fishing Simulator, Party Time, and The Untold Truth of the Grinch.",
        link: "pages/ast.html"
    },
    {
        name: "Unity",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/unity/unity-original.svg",
        icon: "ph-game-controller",
        color: "text-black",
        category: "engines",
        role: "Multiplayer Games & RL Agents",
        level: "Advanced",
        description: "Used for Viewergames Racing/Arcade (Spaceflower UG), Amico Farkle, and Hill-Climb-Racing Reinforcement Learning.",
        link: "pages/projects.html?cat=interactive"
    },
    {
        name: "C++",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg",
        icon: "ph-code",
        color: "text-blue-600",
        category: "code",
        role: "Systems, Engine Plugins & Algorithms",
        level: "Expert",
        description: "Plain C++ Console-Chess, Stockfish UCI pipe integration, custom UE4/UE5 spherical coordinate plugins, and Android NDK.",
        link: "pages/ast.html"
    },
    {
        name: "Python",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
        icon: "ph-terminal-window",
        color: "text-amber-500",
        category: "ai",
        role: "Explainable AI & Computer Vision",
        level: "Expert",
        description: "Primary language for M.Sc. Thesis on White-Box LLM Explainability (kNN activation analysis) and BAMBI thermal object detection.",
        link: "pages/projects.html?cat=academic"
    },
    {
        name: "PyTorch",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg",
        icon: "ph-fire",
        color: "text-orange-600",
        category: "ai",
        role: "Deep Learning & Activation Tracing",
        level: "M.Sc. Specialization",
        description: "Retracing AI-generated text and MNIST predictions (~95% accuracy with 42/10,000 sources) via compressed neural activations.",
        link: "pages/projects.html?cat=academic"
    },
    {
        name: "C#",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg",
        icon: "ph-brackets-curly",
        color: "text-purple-600",
        category: "code",
        role: "Unity Gameplay & ML-Agents Scripting",
        level: "Advanced",
        description: "Architected AI car waypoint systems, 12 real-time viewer items, ghost mode, and RL agent reward loops in Unity.",
        link: "pages/projects.html?cat=interactive"
    },
    {
        name: "Blender",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/blender/blender-original.svg",
        icon: "ph-polygon",
        color: "text-orange-500",
        category: "engines",
        role: "3D Modelling, Modifiers & Animation",
        level: "Advanced",
        description: "NASA-textured 3D Earth & 9 animated animal species (naturace), procedural city houses (Grinch), and Party Time assets.",
        link: "pages/projects.html?cat=interactive"
    },
    {
        name: "Java",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg",
        icon: "ph-coffee",
        color: "text-red-600",
        category: "code",
        role: "Android/iOS Apps & Custom Tooling",
        level: "Advanced",
        description: "Cross-platform mobile app development, custom Twitch map-implementation tooling, and foldable device HCI evaluation.",
        link: "pages/projects.html?cat=interactive"
    },
    {
        name: "JavaScript",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
        icon: "ph-file-js",
        color: "text-yellow-500",
        category: "code",
        role: "Interactive Web, D3.js & Twitch Extensions",
        level: "Advanced",
        description: "Real-time Twitch viewer extensions, cybersecurity training web apps, D3.js climate visualizations, and this procedural portfolio.",
        link: "index.html"
    },
    {
        name: "HTML5 & CSS3",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
        icon: "ph-file-html",
        color: "text-orange-600",
        category: "code",
        role: "Frontend Architecture & UI Styling",
        level: "Advanced",
        description: "Responsive Bento interfaces, ~80 simulated web environments for cybersecurity training, and HCI experiment interfaces.",
        link: "index.html"
    },
    {
        name: "D3.js & Observable",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/d3js/d3js-original.svg",
        icon: "ph-chart-line-up",
        color: "text-amber-600",
        category: "ai",
        role: "Information & Scientific Visualization",
        level: "PhD / M.Sc. Focus",
        description: "Interactive data visualizations for the Climate Change & Catastrophes report and LudaViz player behavior analytics.",
        link: "pages/projects.html?cat=academic"
    },
    {
        name: "Google Colab",
        logoUrl: "https://cdn.simpleicons.org/googlecolab/F9AB00",
        icon: "ph-cloud",
        color: "text-amber-500",
        category: "ai",
        role: "Cloud GPU Notebooks & AI Benchmarks",
        level: "Daily Driver",
        description: "Rapid experimentation for activation-based LLM explainability and benchmarking 13 object detection models (BAMBI).",
        link: "pages/projects.html?cat=academic"
    },
    {
        name: "TensorBoard & ML-Agents",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg",
        icon: "ph-chart-bar",
        color: "text-orange-500",
        category: "ai",
        role: "Reinforcement Learning Telemetry",
        level: "Proficient",
        description: "Training and evaluating autonomous driving agents in Hill-Climb-Racing across 8,750m procedural maps.",
        link: "pages/projects.html?cat=interactive"
    },
    {
        name: "Docker",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
        icon: "ph-shipping-container",
        color: "text-sky-500",
        category: "workflow",
        role: "Containerized Sandboxes & Deployment",
        level: "Proficient",
        description: "Containerized ~80 vulnerable web applications for safe hands-on hacking in the B.Eng. Cybersecurity Thesis.",
        link: "pages/projects.html?cat=interactive"
    },
    {
        name: "PHP & SQL",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg",
        icon: "ph-database",
        color: "text-indigo-500",
        category: "code",
        role: "Backend & Security Lab Scripting",
        level: "Proficient",
        description: "Server-side logic and vulnerability/patch demonstrations for the Try-It-Yourself Cybersecurity application.",
        link: "pages/projects.html?cat=interactive"
    },
    {
        name: "Go (Golang)",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg",
        icon: "ph-hard-drives",
        color: "text-cyan-500",
        category: "code",
        role: "Real-Time Multiplayer Backend",
        level: "Working Knowledge",
        description: "High-concurrency backend services connecting Twitch extension viewer actions with Unity in Viewergames Racing.",
        link: "pages/projects.html?cat=interactive"
    },
    {
        name: "Arduino IDE & Hardware",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/arduino/arduino-original.svg",
        icon: "ph-cpu",
        color: "text-teal-500",
        category: "workflow",
        role: "Physical Computing & Simulators",
        level: "Expert / Lab Tutor",
        description: "Microcontroller integration for the immersive Fishing Simulator, Physical Computing lab tutoring, and Siemens VDE test racks.",
        link: "pages/projects.html?cat=interactive"
    },
    {
        name: "Git & GitHub",
        logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
        icon: "ph-github-logo",
        color: "text-black",
        category: "workflow",
        role: "Version Control & Team Management",
        level: "Daily Driver",
        description: "Lead repository manager for naturace VR, Spaceflower sprints, XAI research codebases, and AST teaching repositories.",
        link: "https://github.com/luca-g97"
    },
    {
        name: "DaVinci Resolve",
        logoUrl: "https://cdn.simpleicons.org/davinciresolve/E0244E",
        icon: "ph-film-strip",
        color: "text-rose-500",
        category: "design",
        role: "Video Editing, Trailers & Courseware",
        level: "Advanced",
        description: "Post-production and sound design for the naturace VR trailer, project demo videos, and 11 prerecorded AST lectures.",
        link: "pages/ast.html"
    }
];

const EXTRA_LOGO_MAP = {
    'slack': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/slack/slack-original.svg',
    'figma': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',
    'framer': 'https://cdn.simpleicons.org/framer/0055FF',
    'react': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
    'google': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg'
};

function getUnifiedStack(allData) {
    const rawStack = allData.stack || [];
    const catalogByName = new Map(PDF_STACK_CATALOG.map(item => [item.name.toLowerCase(), item]));

    // If cms.json has already been updated with the full stack, enrich any missing logoUrls
    const merged = [];
    const seen = new Set();

    // First include all PDF_STACK_CATALOG items (the authoritative stack from the Portfolio PDF)
    for (const item of PDF_STACK_CATALOG) {
        merged.push(item);
        seen.add(item.name.toLowerCase());
    }

    // Also preserve any additional custom items in cms.json (e.g., Figma, Framer, React, Slack)
    for (const s of rawStack) {
        const key = (s.name || '').toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        merged.push({
            category: s.category || 'design',
            role: s.role || 'Design & Workflow Tool',
            level: s.level || 'Proficient',
            description: s.description || 'Integrated into design, prototyping, and research workflows.',
            logoUrl: s.logoUrl || EXTRA_LOGO_MAP[key] || null,
            ...s
        });
    }

    return merged;
}

function renderStackIconGraphic(item, sizeClass = 'w-5 h-5 md:w-6 md:h-6', textClass = 'text-lg md:text-xl') {
    if (item.logoUrl) {
        return `
            <img src="${item.logoUrl}" alt="${item.name}" class="${sizeClass} object-contain group-hover/icon:rotate-12 transition-transform duration-300" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block'">
            <i class="ph-fill ${item.icon || 'ph-cube'} ${item.color || 'text-black'} ${textClass} hidden"></i>
        `;
    }
    return `<i class="ph-fill ${item.icon || 'ph-cube'} ${item.color || 'text-black'} ${textClass} group-hover/icon:rotate-12 transition-transform duration-300"></i>`;
}

// ============================================================================
// 3. RICH PROJECT DETAILS ON DEMAND (Extracted from Portfolio PDFs)
// ============================================================================
const PDF_PROJECT_DETAILS = {
    'MasterThesis.png': {
        title: 'Explainable AI: Retracing AI-Generated Text to Influential Training Data',
        subtitle: 'M.Sc. Master Thesis • Universal Activation-Based LLM Explainability',
        domain: 'Explainable AI (M.Sc.)',
        category: 'academic',
        year: '2024 – 2025',
        badge: '~95% Accuracy (42/10k Sources)',
        overview: 'White-box activation-based approach to scalable AI explainability, retracing predictions and LLM text to the most influential training data via high-fidelity kNN analysis.',
        tags: ['Google Colab', 'Python', 'PyTorch', 'GitHub', 'LLMs & MNIST'],
        ultimateGoal: 'Exploring new methods to explain AI behaviour solely focused on the model\'s internal activations.',
        details: [
            'Built an interactive Google Colab & PyTorch application to rapidly evaluate a self-created white-box explainability method across different datasets and models on consumer hardware.',
            'Demonstrated ~95% similarity/accuracy on the MNIST dataset (50,000 training images; Cosine Similarity: 0.9599, Pearson Correlation: 0.9581, Kendall\'s Tau: 0.88) using only the 42 / 10,000 most influential training sources.',
            'Culminated in the M.Sc. Master\'s Thesis: "A White-Box Approach to Scalable AI-Explainability: High-Fidelity kNN-Analysis via Compressed LLM-Activations" (Final Grade: 1.49).'
        ]
    },
    'FishingSimulator.jpg': {
        title: 'Real-Time Simulation: Fishing Simulator',
        subtitle: 'Immersive Hardware-in-the-Loop & 3D Water Simulation',
        domain: 'Interactive Media (M.Sc.)',
        category: 'interactive',
        year: '2025',
        badge: 'UE5 + Arduino Hardware',
        overview: 'Full-scale physical boat seat, tactile fishing rig, and multi-screen/projection setup synchronized in real time with Unreal Engine and Arduino microcontrollers.',
        tags: ['Unreal Engine', 'Arduino IDE', 'C++', 'Physical Computing'],
        details: [
            'Designed and engineered an immersive real-time fishing simulator combining a physical boat cockpit and custom sensor-equipped fishing rod with a 3D water environment.',
            'Programmed the real-time hardware-software telemetry bridge between Arduino microcontrollers and Unreal Engine gameplay physics.'
        ]
    },
    'HillClimbRacing.png': {
        title: 'Reinforcement Learning: Hill-Climb-Racing',
        subtitle: 'Autonomous Agent Development Across 8,750m Ground Maps',
        domain: 'Interactive Media (M.Sc.)',
        category: 'interactive',
        year: '2024',
        badge: 'Unity ML-Agents',
        overview: 'Autonomous Reinforcement Learning agent trained in Unity using ML-Agents and TensorBoard to master 2D vehicle physics, fuel limits, and steep hills.',
        tags: ['Unity', 'ML-Agents', 'TensorBoard', 'C#', 'Reinforcement Learning'],
        details: [
            'Developed and trained Reinforcement Learning agents in Unity to autonomously balance gas, brake, angular momentum, and fuel collection across an ~8,750m ground map.',
            'Configured custom reward shaping and parallel training environments (22x AI-Gas speedups) while tracking policy convergence in TensorBoard.'
        ]
    },
    'PartyTime.png': {
        title: 'Multiplayer-Game: Party Time',
        subtitle: '4-Player Local Multiplayer Arena Party Game',
        domain: 'Interactive Media (M.Sc.)',
        category: 'interactive',
        year: '2023',
        badge: '4-Player Multiplayer',
        overview: 'Fast-paced 4-player local multiplayer party game built in Unreal Engine featuring dynamic tilting arena platforms and custom Blender 3D assets.',
        tags: ['Unreal Engine', 'Blender', 'Local Multiplayer', 'Game Design'],
        details: [
            'Engineered local 4-player split/shared-camera multiplayer gameplay on a dynamic tilting arena platform surrounded by a stylized medieval village.',
            'Modelled, textured, and animated custom 3D character and environment assets in Blender and integrated them into Unreal Engine.'
        ]
    },
    'BlackTideProtocol.png': {
        title: 'Black Tide Protocol',
        subtitle: 'Interactive Media Game & Environment Prototype',
        domain: 'Interactive Media (M.Sc.)',
        category: 'interactive',
        year: '2024',
        badge: 'Interactive Media',
        overview: 'Atmospheric interactive media and game engineering project developed during the Master of Science program at FH Hagenberg.',
        tags: ['Unreal Engine', '3D Environment', 'Game Engineering'],
        details: [
            'Designed atmospheric lighting, shaders, and interactive gameplay systems as part of the M.Sc. Interactive Media curriculum at FH OÖ.'
        ]
    },
    'MotionCapturing.png': {
        title: 'Full-Body Motion Capturing & Character Pipeline',
        subtitle: 'Optical MoCap Recording, Retargeting & Real-Time 3D Animation',
        domain: 'Interactive Media (M.Sc.)',
        category: 'interactive',
        year: '2024',
        badge: 'MoCap Studio',
        overview: 'End-to-end motion capture production pipeline translating live actor performances onto rigged 3D characters inside real-time game engines.',
        tags: ['Motion Capturing', 'Unreal Engine', 'Blender', 'Skeletal Rigging'],
        details: [
            'Recorded, cleaned, and retargeted full-body optical motion capture data onto custom 3D skeletal meshes for real-time interactive scenes.'
        ]
    },
    'InformationVisualization.png': {
        title: 'Information Visualization: Climate Change Report',
        subtitle: 'Interactive Data Storytelling on Global Climate Change & Catastrophes',
        domain: 'Scientific Work (M.Sc.)',
        category: 'academic',
        year: '2024',
        badge: 'D3.js & Observable',
        overview: 'Interactive scientific visualization report analyzing global climate change indicators and natural catastrophes using D3.js and Markdown in Observable.',
        tags: ['D3.js (Observable)', 'Markdown', 'JavaScript', 'Information Visualization'],
        details: [
            'Co-authored "Climate Report (Final Submission)" with Hanna Rodler and Lukas Schmalzer for FH OÖ Information Visualization (May 2024).',
            'Designed and programmed interactive D3.js charts and scrollytelling visualizations to communicate complex climate and catastrophe datasets clearly.'
        ]
    },
    'AnimalDetection.png': {
        title: 'Research: Object Detection (BAMBI)',
        subtitle: 'Benchmarking 13 AI Models for Aerial & Thermal Wildlife Detection',
        domain: 'Scientific Work (M.Sc.)',
        category: 'academic',
        year: '2023',
        badge: '13 Test-AIs Benchmarked',
        overview: 'Empirical computer vision study evaluating 13 AI detection architectures in Python and Google Colab to spot deer and fawns in thermal aerial imagery.',
        tags: ['Python', 'Google Colab', '13 Test-AIs', 'Computer Vision'],
        details: [
            'Investigated and benchmarked 13 different state-of-the-art AI object detection models (including zero-shot text queries such as "deer shape") on thermal imagery.',
            'Built the automated evaluation pipeline in Python and Google Colab to compare precision, recall, and inference speed for wildlife rescue applications.'
        ]
    },
    'HumanComputerInteraction.png': {
        title: 'Pictorial: Line Accuracy on Foldable Devices',
        subtitle: 'Evaluating Across-Hinge Dragging with Pen on Analog Curved & Foldable Devices',
        domain: 'Scientific Work (M.Sc.)',
        category: 'academic',
        year: '2023',
        badge: 'HCI Pictorial Study',
        overview: 'HCI replication and extension study analyzing how hinge radii (2mm, 6mm, 12mm, 24mm) and dragging angles impact pen accuracy and movement variability on foldable displays.',
        tags: ['Java', 'HTML/CSS', 'Jamovi', 'NASA-TLX', 'HCI Research'],
        details: [
            'Co-authored with Larissa Schäfer, Philipp Thayer, and Tobias Kothbauer at FH Hagenberg.',
            'Constructed an analog "booklet" prototype with paper drawing surfaces across 4 hinge radii (2mm, 6mm, 12mm, 24mm) to programmatically measure Drag Time and Movement Variability (MV).',
            'Evaluated quantitative pen trajectories and NASA-TLX workload scores using Java, HTML/CSS, and Jamovi, proving that hinge radius significantly impacts movement variability.'
        ]
    },
    'BachelorThesis.png': {
        title: 'Bachelor-Thesis: Bridging Cybersecurity Awareness',
        subtitle: 'Try-It-Yourself Docker Hacking Lab for Media Engineers & Regular Users',
        domain: 'Media Engineering (B.Eng.)',
        category: 'interactive',
        year: '2023',
        badge: '~80 Faked Websites • Grade 1.4',
        overview: 'Dockerized hands-on cybersecurity application covering the 80% most common web hacks across ~80 simulated websites, showing the exact lines of code that cause and fix each vulnerability.',
        tags: ['Docker', 'JavaScript', 'HTML/CSS', 'PHP', 'Cybersecurity'],
        ultimateGoal: 'Sharing knowledge to make the internet a safer place by raising consciousness between developers and users.',
        details: [
            'Covers the 80% most common web hacks step-by-step for every knowledge level hands-on, complete with progressive hints ("Tipp 1–3") and guided solutions.',
            'Contains ~80 faked websites (such as streaming and login portals) inside a safe, self-contained Docker container environment to practice exploiting vulnerabilities.',
            'Displays the exact line of source code that causes or prevents each security gap to bridge understanding between software developers and everyday users.'
        ]
    },
    'Naturace.png': {
        title: 'naturace – Scientific VR Climate Change Simulation',
        subtitle: 'Real-Time VR Simulation of Everyday Lifestyle Consequences (6th Semester)',
        domain: 'Media Engineering (B.Eng.)',
        category: 'interactive',
        year: '2022',
        badge: 'Pro-Noris Prize Nominee',
        overview: 'World\'s first scientific VR future simulator in Unreal Engine where player household actions are remapped to 8 billion people in real time across a NASA-textured spherical Earth.',
        tags: ['Unreal Engine', 'C++', 'Blender', 'GitHub', 'DaVinci Resolve', 'Oculus VR'],
        ultimateGoal: 'Raising consciousness for our everyday behaviour and showing possible adjustments towards a more sustainable lifestyle without sacrificing comfort.',
        details: [
            'Scientific 7-Pillar Model: Remaps player actions onto all 8 billion humans across 7 interconnected pillars (energy, CO₂, plastic, water, global warming, pollution, living beings) with an 8-minute tipping-point timer.',
            'House Level (Everyday Life): Features 13 interactive sustainability tasks, live TV pillar monitors, contextual player hints, a custom wall-safe VR teleportation system, and a live presentation debug tool.',
            'Earth Level & Custom C++ Plugins: Created a NASA-textured 3D Earth in Blender with atmospheric fog, clouds, and day-night cycle; engineered custom C++ polar-coordinate placement plugins and a custom spherical animal AI heuristic for 9 animated species, plus continental disasters.',
            'Served as Chief Developer, Project Manager, and Git lead for a 4-person team; produced the Sequencer trailer in DaVinci Resolve and earned a Pro-Noris Prize nomination.'
        ],
        links: [
            { label: 'Watch Trailer', url: 'https://youtu.be/qLzKraWttAE', icon: 'ph-play-circle' },
            { label: 'Demo Video (Timestamps)', url: 'https://youtu.be/rZ67wXNqQ80', icon: 'ph-video' }
        ]
    },
    'Grinch.png': {
        title: 'Game: The Untold Truth of the Grinch',
        subtitle: 'Round-Based Active Tower-Defense Game with Procedural Labyrinth (7th Semester)',
        domain: 'Media Engineering (B.Eng.)',
        category: 'interactive',
        year: '2023',
        badge: 'Procedural Labyrinth • 10-Day Solo Build',
        overview: 'Solo-developed active tower-defense game in Unreal Engine featuring a recursive-backtracking procedural city labyrinth that players can regenerate on the fly to outsmart the Grinch.',
        tags: ['Unreal Engine', 'Blender', 'Procedural Generation', 'AI Pathfinding'],
        details: [
            'Built solo within 10 days in Unreal Engine for the "Game Design" course; each won round unlocks a new chapter of a self-written story revealing the untold truth of the Grinch.',
            'Constructed the city from 5 Blender-modified house models arranged via a recursive backtracking algorithm that generates a procedural labyrinth with one entrance and exit on opposite sides.',
            'Players can regenerate the entire city labyrinth at the press of a button during gameplay to gain or lose tactical advantage, backed by custom AI pathfinding error-correction and player unstuck mechanics.',
            'Features a randomly generated snow-covered forest, custom-linked locomotion animations, sound design, and configurable game menu settings.'
        ],
        links: [
            { label: 'Demo Video (Timestamps)', url: 'https://youtu.be/AffxLK9GBuw', icon: 'ph-video' },
            { label: 'Download Game (Drive)', url: 'https://drive.google.com/drive/folders/1pkKpWEqrqR5ncUmX9B_ZtU-WBpZLA500', icon: 'ph-download-simple' }
        ]
    },
    'Java.png': {
        title: 'App-Development for Android and iOS',
        subtitle: 'Cross-Platform Mobile Simulation & Telemetry App',
        domain: 'Media Engineering (B.Eng.)',
        category: 'interactive',
        year: '2022',
        badge: 'Android & iOS • 60 FPS',
        overview: 'Mobile application engineered for Android and iOS featuring real-time interactive 2D flocking entities and live telemetry (FPS, Speed, Direction, Crab counter).',
        tags: ['Java', 'Android Debug Bridge', 'C++', 'Mobile Development'],
        details: [
            'Programmed cross-platform mobile application logic and rendering using Java, native C++, and the Android Debug Bridge (ADB).',
            'Implemented real-time entity movement, collision detection, and live diagnostic HUD metrics running smoothly at ~60 FPS on mobile devices.'
        ]
    },
    'Viewergames.png': {
        title: 'Game: Viewergames Racing (Practice Semester)',
        subtitle: 'Real-Time Multiplayer Twitch Streamer-Viewer Racing Game (4th Semester)',
        domain: 'Media Engineering (B.Eng.)',
        category: 'interactive',
        year: '2021',
        badge: 'Released on Steam • Twitch API',
        overview: 'Real-time Unity racing game where Twitch viewers join live races via a JavaScript extension, trigger 12 interactive items, activate channel-point obstacles, and deploy bit-powered airplane bombers.',
        tags: ['Unity', 'C#', 'Twitch-API', 'Go-Backend', 'JavaScript', 'Java'],
        details: [
            'Became main responsible developer for Viewergames Racing within one month during the practice semester at Spaceflower UG (and fixed bugs on Intellivision\'s "Amico Farkle").',
            'Improved the AI car waypoint system, expanded usable real-time viewer items from 3 to 12, and added custom item cooldowns plus a collision-free "Ghost Mode".',
            'Completely overhauled the race HUD, leaderboard, killfeed, and tip ticker, and programmed a custom Java map-implementation tool for the JavaScript Twitch extension and Go backend.',
            'Tracked down and solved a critical game-breaking bug that occurred roughly once every 1,000th round; continued volunteering as Community Manager for Spaceflower.'
        ],
        links: [
            { label: 'Steam Store Page', url: 'https://store.steampowered.com/app/1440090/Viewergames_Racing', icon: 'ph-steam-logo' },
            { label: 'Debug Demo Video', url: 'https://youtu.be/eVwQtH2dIXo', icon: 'ph-video' },
            { label: '1-in-1000 Bug Debug View', url: 'https://youtu.be/JhzRDU6Xyf8', icon: 'ph-bug' }
        ]
    }
};

// ============================================================================
// 4. PROCEDURAL SHELL INJECTION (Cursor, Header, Sidebar, Mobile Footer)
// ============================================================================
function renderSiteShell(siteData) {
    const activeRoute = getActiveRoute();
    const profile = siteData.profile || {};
    const socials = profile.socials || [
        { name: "FH", url: "https://pure.fh-ooe.at/de/persons/luca-geiger/", image: "images/Icons/FHIcon.png" },
        { name: "ORCID", url: "https://orcid.org/0009-0007-5752-2204", image: "images/Icons/OrcidIcon.png" },
        { name: "LinkedIn", url: "https://www.linkedin.com/in/luca-geiger/", icon: "ph-linkedin-logo" },
        { name: "GitHub", url: "https://github.com/luca-g97", icon: "ph-github-logo" }
    ];
    const cvUrl = profile.cvUrl || "https://drive.google.com/file/d/1DycAck25TK2zfhSOt1q6Ir1gv6Po1ChS/view?usp=drive_link";

    if (!document.getElementById('cursor-wrapper')) {
        document.body.insertAdjacentHTML('afterbegin', `
            <div class="hidden lg:block" id="cursor-wrapper">
                <div id="cursor-halo"></div>
                <div id="cursor-dot"></div>
            </div>
        `);
    }

    const navItems = [
        { id: 'home', label: 'Home', href: `${BASE_PATH}index.html` },
        { id: 'about', label: 'About Me', href: `${BASE_PATH}pages/about.html` },
        { id: 'stack', label: 'Stack', href: `${BASE_PATH}pages/stack.html` },
        { id: 'projects', label: 'Projects', href: `${BASE_PATH}pages/projects.html` },
        { id: 'contact', label: 'Contact', href: `${BASE_PATH}pages/contact.html`, routeAttr: 'contact' },
        { id: 'ast', label: 'AST', href: `${BASE_PATH}pages/ast.html`, routeAttr: 'ast' }
    ];

    const navHtml = navItems.map(item => {
        const isActive = item.id === activeRoute;
        const routeAttrs = item.routeAttr ? `data-action="open-route" data-route="${item.routeAttr}"` : '';
        if (isActive) {
            return `<a href="${item.href}" ${routeAttrs} class="px-4 py-3 text-white bg-white/5 rounded-xl transition-all interactive flex items-center justify-between">${item.label} <i class="ph ph-arrow-right"></i></a>`;
        }
        return `<a href="${item.href}" ${routeAttrs} class="px-4 py-3 text-textMuted hover:text-white hover:bg-white/5 rounded-xl transition-all hover:translate-x-1 interactive">${item.label}</a>`;
    }).join('');

    const headerEl = document.getElementById('site-header');
    if (headerEl) {
        headerEl.className = "flex justify-between items-center shrink-0 mb-6 md:mb-8 z-50 fade-in-up";
        headerEl.innerHTML = `
            <a href="${BASE_PATH}index.html" class="flex items-center gap-4 interactive group">
                <img id="profile-img" src="${resolveAsset(profile.image || 'images/Portrait.jpg')}" alt="Profile" class="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-border group-hover:border-gray-400 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <div class="leading-tight">
                    <h2 id="profile-name" class="font-bold text-lg md:text-xl tracking-tight group-hover:text-gray-300 transition-colors duration-500">${profile.name || 'Luca Geiger'}</h2>
                    <p id="profile-title" class="text-[10px] md:text-[12px] text-textMuted uppercase tracking-widest mt-1">${profile.title || 'M.Sc. B.Eng.'}</p>
                </div>
            </a>
            <div class="hidden lg:block text-sm text-textMuted font-bold tracking-widest" id="clock">--:-- --- --, ----</div>
            <div class="relative">
                <button id="menu-toggle" aria-label="Toggle Menu" class="w-10 h-10 md:w-[50px] md:h-[50px] rounded-full border border-border flex items-center justify-center hover:bg-white/10 hover:border-gray-500 transition-all duration-500 interactive z-50 relative bg-card focus:outline-none">
                    <div class="relative w-[16px] h-[10px] md:w-[18px] md:h-[12px]">
                        <span id="menu-line-1" class="absolute left-0 top-0 w-full h-[2px] bg-white rounded-full transition-transform duration-300 ease-in-out origin-center"></span>
                        <span id="menu-line-2" class="absolute left-0 bottom-0 w-full h-[2px] bg-white rounded-full transition-transform duration-300 ease-in-out origin-center"></span>
                    </div>
                </button>
                <div id="dropdown-menu" class="absolute top-14 md:top-16 right-0 w-52 bg-card border border-border rounded-2xl p-2 opacity-0 invisible -translate-y-4 z-40 shadow-2xl">
                    <nav class="flex flex-col text-sm font-medium">${navHtml}</nav>
                </div>
            </div>
        `;
    }

    const sidebarEl = document.getElementById('site-sidebar');
    if (sidebarEl) {
        const primaryBtn = activeRoute === 'about'
            ? `<a href="${BASE_PATH}index.html" class="w-max px-4 py-2.5 rounded-xl border border-border bg-card text-white text-sm font-bold hover:bg-white/10 hover:border-gray-500 transition-all duration-500 interactive flex items-center gap-2"><i class="ph ph-arrow-left"></i> Home</a>`
            : `<a href="${BASE_PATH}pages/about.html" class="w-max px-4 py-2.5 rounded-xl border border-border bg-card text-white text-sm font-bold hover:bg-white/10 hover:border-gray-500 transition-all duration-500 interactive flex items-center gap-2">About Me <i class="ph ph-arrow-right"></i></a>`;

        const socialBtns = socials.map(s => `
            <a href="${s.url}" target="_blank" rel="noopener" class="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-white/10 hover:border-gray-500 hover:text-white text-textMuted transition-all duration-500 interactive">
                ${s.image
            ? `<img src="${resolveAsset(s.image)}" class="w-4 h-4 md:w-5 md:h-5 object-contain" alt="${s.name}">`
            : `<i class="ph ${s.icon} text-xl"></i>`}
            </a>
        `).join('');

        sidebarEl.className = "w-full lg:w-[280px] xl:w-[280px] flex flex-col shrink-0 lg:h-full lg:overflow-y-auto no-scrollbar lg:pb-0";
        sidebarEl.innerHTML = `
            <h1 class="text-2xl md:text-[24px] xl:text-[28px] font-bold mb-4 md:mb-6 tracking-tight fade-in-up" style="animation-delay: 100ms;">
                Hey, I'm Luca <img class="inline-block origin-bottom-right ml-1" src="${resolveAsset('images/RockOnAndNamaste.png')}" height="32" width="32" alt="Rock On & Namaste">
            </h1>
            <p class="text-sm md:text-[16px] text-textMuted leading-[1.8] mb-6 md:mb-8 fade-in-up" style="animation-delay: 200ms;">
                And as you will find out, <br class="hidden lg:block"> I am quite an <span class="hidden lg:inline">experienced</span><br>
                <span class="text-white font-bold">Interactive Media Allrounder</span><br>
                who's fascinated by gaining and sharing <br class="block md:hidden lg:hidden"> knowledge about <br class="hidden md:block"> complex topics,
                especially <br class="block md:hidden lg:block"> if they are related to the <br>
                <span class="text-white font-bold">Combination of Sustainability <br class="block md:hidden lg:hidden"> and New Technologies</span>
            </p>
            <div class="flex flex-row flex-wrap lg:flex-col justify-between items-center lg:items-start gap-4 lg:gap-8 mb-8 lg:mb-16 w-full">
                <div class="flex gap-2 md:gap-4 fade-in-up" style="animation-delay: 300ms;">
                    ${primaryBtn}
                    <a href="${cvUrl}" target="_blank" rel="noopener" class="w-max px-4 py-2.5 rounded-xl border border-border bg-card text-white text-sm font-bold hover:bg-white/10 hover:border-gray-500 transition-all duration-500 interactive">
                        Download CV
                    </a>
                </div>
                <div class="flex gap-2 md:gap-4 fade-in-up" style="animation-delay: 400ms;">
                    ${socialBtns}
                </div>
            </div>
            <div class="hidden lg:flex mt-auto flex-col gap-3 text-[11px] text-textMuted font-bold tracking-widest uppercase fade-in-up" style="animation-delay: 500ms;">
                <p class="text-white mb-1 tracking-normal capitalize">Inspired by <a href="https://www.framer.com/marketplace/templates/bentovibe/" target="_blank" rel="noopener" class="underline interactive hover:text-gray-300">BentoVibe-Template on Framer</a></p>
                <a href="#" class="hover:text-white transition-colors duration-300 interactive w-max">Licensing</a>
                <a href="#" class="hover:text-white transition-colors duration-300 interactive w-max">Privacy Policy</a>
            </div>
        `;
    }

    const mobileFooterEl = document.getElementById('site-mobile-footer');
    if (mobileFooterEl) {
        mobileFooterEl.className = "flex lg:hidden flex-col gap-2 md:gap-3 text-[10px] md:text-[11px] text-textMuted font-bold tracking-widest uppercase mt-8 md:mt-10 pb-6 items-center text-center fade-in-up";
        mobileFooterEl.style.animationDelay = "650ms";
        mobileFooterEl.innerHTML = `
            <p class="text-white mb-1 tracking-normal capitalize">Inspired by <a href="https://www.framer.com/marketplace/templates/bentovibe/" target="_blank" rel="noopener" class="underline interactive hover:text-gray-300">BentoVibe-Template on Framer</a></p>
            <div class="flex gap-4 md:gap-6">
                <a href="#" class="hover:text-white transition-colors duration-300 interactive">Licensing</a>
                <a href="#" class="hover:text-white transition-colors duration-300 interactive">Privacy Policy</a>
            </div>
        `;
    }
}

// ============================================================================
// 5. SHARED UTILITIES
// ============================================================================
function highlightMatch(text, query) {
    if (!query || !text) return text || '';
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return String(text).replace(
        new RegExp(`(${escaped})`, 'gi'),
        '<span class="px-1 rounded-sm text-white" style="background: rgb(217 128 38)">$1</span>'
    );
}

function getYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
}

function getProjectSlug(p) {
    if (!p) return '';
    if (p.slug) return p.slug.trim();
    if (p.Slug) return p.Slug.trim();
    if (p.title || p.Title) {
        return (p.title || p.Title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    return p.id || '';
}

function sumLectureDurations(lectures) {
    let totalSeconds = 0;
    for (const l of lectures) {
        if (!l.duration) continue;
        const parts = l.duration.split(':').map(Number);
        if (parts.length === 3) {
            totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            totalSeconds += parts[0] * 60 + parts[1];
        }
    }
    if (totalSeconds === 0) return '';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatLectureContent(rawContent) {
    if (!rawContent) return '<p class="text-textMuted">No content available for this lecture yet.</p>';
    const lines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
    let html = '';
    let inList = false;
    let sectionIndex = 1;
    let justOpenedHeading = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('- ')) {
            if (!inList) {
                html += '<ul class="list-disc pl-5 space-y-2 text-textMuted text-xs md:text-sm leading-[1.8]">';
                inList = true;
            }
            html += `<li>${line.substring(2).trim()}</li>`;
            justOpenedHeading = false;
            continue;
        } else if (inList) {
            html += '</ul>';
            inList = false;
        }

        if (line.startsWith('### ') || /^Introduction$/i.test(line) || /^Conclusion/i.test(line)) {
            const cleanTitle = line.replace(/^###\s*/, '');
            html += `<h2 class="text-lg md:text-xl font-bold text-white mt-4 first:mt-0">${cleanTitle}</h2>`;
            justOpenedHeading = true;
            continue;
        }

        if (/^\d+\.\s+/.test(line)) {
            const cleanTitle = line.replace(/^\d+\.\s+/, '');
            html += `<h2 class="text-lg md:text-xl font-bold text-white mt-4 first:mt-0">${sectionIndex++}. ${cleanTitle}</h2>`;
            justOpenedHeading = true;
            continue;
        }

        const nextLine = lines[i + 1] || '';
        if (justOpenedHeading && nextLine !== undefined) {
            html += `<p class="text-xs md:text-sm font-bold text-gray-300 -mt-3">${line}</p>`;
            justOpenedHeading = false;
            continue;
        }

        html += `<p class="text-xs md:text-sm text-textMuted leading-[1.8]">${line}</p>`;
        justOpenedHeading = false;
    }

    if (inList) html += '</ul>';
    return html;
}

// ============================================================================
// 6. PAGE CONTROLLER: ABOUT ME (pages/about.html)
// ============================================================================
function initAboutPage(allData) {
    const timelineFeed = document.getElementById('cv-timeline-feed');
    if (!timelineFeed) return;

    const cvEntries = allData.cvEntries || [];
    const cvCategories = allData.cvCategories || [
        { id: "all", label: "All" },
        { id: "work", label: "Work" },
        { id: "education", label: "Education" },
        { id: "publications", label: "Publications" },
        { id: "projects", label: "Projects & Awards" },
        { id: "leadership", label: "Service & Teaching" }
    ];

    const urlCat = new URLSearchParams(window.location.search).get('cat');
    let activeCategory = urlCat && cvCategories.some(c => c.id === urlCat) ? urlCat : 'all';
    let searchQuery = '';
    let allExpanded = false;
    const expandedIds = new Set(['work-phd-ludaviz']);

    const filterGroup = document.getElementById('cv-filter-Group');
    const searchInput = document.getElementById('cv-search');
    const kpiTriggers = document.querySelectorAll('[data-filter-trigger]');
    const toggleAllBtn = document.getElementById('toggle-all-details');
    const toggleAllText = document.getElementById('toggle-all-text');
    const toggleAllIcon = document.getElementById('toggle-all-icon');

    function renderCategoryButtons() {
        if (!filterGroup) return;
        filterGroup.innerHTML = cvCategories.map(cat => {
            const count = cat.id === 'all'
                ? cvEntries.length
                : cvEntries.filter(e => e.category === cat.id).length;
            const isActive = cat.id === activeCategory;
            const cls = isActive
                ? 'cv-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-black transition-all interactive'
                : 'cv-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold text-textMuted hover:text-white hover:bg-white/5 transition-all interactive';
            return `<button data-cat="${cat.id}" class="${cls}">${cat.label} (${count})</button>`;
        }).join('');

        filterGroup.querySelectorAll('.cv-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeCategory = btn.getAttribute('data-cat');
                renderCategoryButtons();
                renderTimeline();
            });
        });
    }

    function renderTimeline() {
        const q = searchQuery.toLowerCase().trim();
        const filtered = cvEntries.filter(item => {
            if (activeCategory !== 'all' && item.category !== activeCategory) return false;
            if (!q) return true;
            const haystack = [
                item.title, item.organization, item.location, item.period,
                item.badge, item.overview, ...(item.tags || []), ...(item.details || [])
            ].join(' ').toLowerCase();
            return haystack.includes(q);
        });

        if (filtered.length === 0) {
            timelineFeed.innerHTML = `
                <div class="bento-card p-10 text-center border-dashed">
                    <i class="ph ph-magnifying-glass text-3xl text-textMuted mb-2"></i>
                    <h3 class="font-bold text-white mb-1">No matching milestones found</h3>
                    <p class="text-xs text-textMuted">Try clearing your search filter or selecting "All".</p>
                </div>`;
            return;
        }

        timelineFeed.innerHTML = filtered.map(item => {
            const isExpanded = expandedIds.has(item.id) || q.length > 0 || allExpanded;
            const cleanBadge = String(item.badge || '').replace(/<[^>]+>/g, '');
            const badgeHtml = item.link
                ? `<a class="interactive" href="${item.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${highlightMatch(cleanBadge, searchQuery)}</a>`
                : highlightMatch(cleanBadge, searchQuery);

            return `
            <article data-id="${item.id}" class="timeline-card bento-card p-5 md:p-6 cursor-pointer interactive relative group ${isExpanded ? 'expanded' : ''}">
                <span class="w-3.5 h-3.5 rounded-full ${item.dotColor} border-[3px] border-base absolute -left-[28px] top-7 z-10 shadow-[0_0_10px_rgba(255,255,255,0.3)]"></span>

                <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.accent}">
                            <i class="ph ${item.icon || 'ph-circle'}"></i> ${item.categoryLabel}
                        </span>
                        <span class="text-xs font-bold text-white">${highlightMatch(item.period, searchQuery)}</span>
                        <span class="text-xs text-textMuted">• ${highlightMatch(item.location, searchQuery)}</span>
                    </div>
                    ${cleanBadge ? `<span class="px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/10 text-[11px] font-bold text-white">${badgeHtml}</span>` : ''}
                </div>

                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h2 class="md:text-lg font-bold text-white leading-snug group-hover:text-gray-200 transition-colors">
                            ${highlightMatch(item.title, searchQuery)}
                        </h2>
                        <p class="text-xs md:text-sm text-gray-300 font-bold mt-0.5">
                            ${highlightMatch(item.organization, searchQuery)}
                        </p>
                    </div>
                    <div class="w-8 h-8 rounded-full border border-border bg-base flex items-center justify-center shrink-0 mt-0.5 group-hover:border-gray-400 transition-colors">
                        <i class="ph ph-caret-down text-sm text-white chevron-icon transition-transform duration-300"></i>
                    </div>
                </div>

                <p class="text-xs md:text-sm text-textMuted leading-relaxed mt-3">
                    ${highlightMatch(item.overview, searchQuery)}
                </p>

                <div class="flex flex-wrap gap-1.5 mt-3.5">
                    ${(item.tags || []).map(t => `<span class="px-2 py-0.5 rounded-md bg-base border border-border text-[10px] text-gray-300">${highlightMatch(t, searchQuery)}</span>`).join('')}
                </div>

                <div class="details-grid">
                    <div class="overflow-hidden">
                        <div class="pt-4 mt-4 border-t border-border/80 flex flex-col gap-2.5">
                            <p class="text-[10px] uppercase tracking-widest text-textMuted font-bold">Detailed Responsibilities & Achievements</p>
                            <ul class="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-gray-300 leading-relaxed">
                                ${(item.details || []).map(d => `<li>${highlightMatch(d, searchQuery)}</li>`).join('')}
                            </ul>
                            ${item.link ? `
                                <div class="mt-2">
                                    <a href="${item.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors interactive">
                                        View Publication (DOI) <i class="ph ph-arrow-up-right"></i>
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </article>`;
        }).join('');

        timelineFeed.querySelectorAll('.timeline-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                if (card.classList.contains('expanded')) {
                    card.classList.remove('expanded');
                    expandedIds.delete(id);
                } else {
                    card.classList.add('expanded');
                    expandedIds.add(id);
                }
            });
        });
    }

    kpiTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            activeCategory = trigger.getAttribute('data-filter-trigger');
            renderCategoryButtons();
            renderTimeline();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderTimeline();
        });
    }

    if (toggleAllBtn) {
        toggleAllBtn.addEventListener('click', () => {
            allExpanded = !allExpanded;
            if (allExpanded) {
                cvEntries.forEach(e => expandedIds.add(e.id));
                toggleAllText.textContent = 'Collapse All';
                toggleAllIcon.className = 'ph ph-arrows-in-line-vertical';
            } else {
                expandedIds.clear();
                toggleAllText.textContent = 'Expand All';
                toggleAllIcon.className = 'ph ph-arrows-out-line-vertical';
            }
            renderTimeline();
        });
    }

    renderCategoryButtons();
    renderTimeline();
}

// ============================================================================
// 7. PAGE CONTROLLER: PROJECTS SHOWCASE (pages/projects.html - Details on Demand)
// ============================================================================
function initProjectsPage(allData) {
    const projectsGrid = document.getElementById('projects-bento-grid');
    if (!projectsGrid) return;

    const rawProjects = allData.projects || [];
    const customDetailsMap = { ...PDF_PROJECT_DETAILS, ...(allData.projectDetails || {}) };
    const lectureItems = rawProjects.filter(p => (p.category || '').toLowerCase() === 'lecture');

    // 1. Build the SINGLE aggregated AST Lecture card with video count & course details from PDF
    const videoCount = lectureItems.length || 11;
    const totalDuration = sumLectureDurations(lectureItems);
    const singleAstCard = {
        id: 'proj_ast_course_bundle',
        title: 'Teaching: Applied Software Techniques & Game Programming',
        subtitle: `${videoCount} Prerecorded Video Lectures • WS (72h) & SS (21h)`,
        domain: 'University Teaching (FH OÖ)',
        category: 'lecture',
        year: '2024 – 2025',
        imageUrl: 'images/Lectures/ASTLecture.png',
        duration: `${videoCount} Videos${totalDuration ? ` • ${totalDuration}` : ''}`,
        badge: `${videoCount} Videos Included`,
        overview: `Prerecorded every lesson to ensure the highest quality. Covers Plain C++, Stockfish AI, Unreal Engine 5 C++, and Blueprints across Console-Chess, 3D Chess-Party, and Physics/Projectile Darts.`,
        tags: [`${videoCount} Video Lectures`, 'Plain C++', 'Unreal Engine 5', 'Blueprints', 'Stockfish AI'],
        details: [
            'Applied Software Techniques (WS): 12 lessons for each group (72 hours in total) covering Plain C++, Unreal Engine C++, and Blueprints.',
            'Engineered 3 teaching projects: Console-Chess & 3D Chess-Party powered by the Stockfish AI engine via local pipe, plus Physics-based and Projectile-based Darts.',
            'Interaction & Game Programming (SS): 7 lessons (21 hours in total) guiding students through state-of-the-art Game Engines and the entire Game Creation lifecycle together.'
        ],
        links: [
            { label: `Explore All ${videoCount} AST Lectures`, url: `${BASE_PATH}pages/ast.html`, icon: 'ph-play-circle', internal: true }
        ]
    };

    // 2. Build Flagship LudaViz PhD Research Card
    const ludavizCard = {
        id: 'proj_ludaviz_phd',
        title: 'LudaViz – Ludic & Diegetic Visualizations',
        subtitle: 'FWF Pioneer PhD Research • FH Hagenberg & University of Regensburg',
        domain: 'PhD Research (LudaViz)',
        category: 'academic',
        year: '2025 – Present',
        imageUrl: (allData.featuredProject && allData.featuredProject.imageUrl) || 'images/LudaViz.png',
        badge: 'CHI \'26 & FDG \'26',
        overview: 'FWF-funded pioneer PhD project investigating Ludic and Diegetic Visualizations in video games and player behavior analytics at FH Hagenberg and the University of Regensburg.',
        tags: ['Ludic Visualization', 'Diegetic UI', 'CHI \'26', 'FDG \'26', 'Player Behavior'],
        details: [
            'PhD researcher in the FWF-funded LudaViz pioneer project at FH Hagenberg and the University of Regensburg.',
            'Published "How Players Recognize and Interpret Diegetic Visualizations – The Case of Fortnite\'s Swarm Visualization" at ACM CHI \'26 (Barcelona, Spain).',
            'Published "Transient Gear, Persistent Impact: A Mixed-Methods Study with Design Implications for Transient Game Systems" at FDG \'26 (Copenhagen, Denmark).'
        ],
        links: [
            { label: 'CHI \'26 Publication (DOI)', url: 'https://doi.org/10.1145/3772363.3799313', icon: 'ph-article' },
            { label: 'FDG \'26 Publication (DOI)', url: 'https://doi.org/10.1145/3815598.3815601', icon: 'ph-article' }
        ]
    };

    // 3. Map Non-Lecture Projects with PDF Details on Demand
    const nonLectureProjects = rawProjects
        .filter(p => {
            const cat = (p.category || '').toLowerCase();
            if (cat === 'lecture') return false;
            const filename = (p.imageUrl || '').split('/').pop();
            // Exclude loose AST thumbnails and duplicate ClimateChange banner (consolidated into InformationVisualization.png)
            if (['ASTLecture.png', 'ASTLogo.png', 'ClimateChange.png'].includes(filename)) return false;
            return true;
        })
        .map((p, idx) => {
            const filename = (p.imageUrl || '').split('/').pop();
            const pdfMeta = customDetailsMap[filename] || {};
            return {
                ...p,
                ...pdfMeta,
                id: p.id || `proj_${idx}`,
                imageUrl: p.imageUrl,
                title: pdfMeta.title || p.title || filename.replace(/\.[^.]+$/, ''),
                subtitle: pdfMeta.subtitle || p.domain || 'Portfolio Project',
                domain: pdfMeta.domain || p.domain || 'Interactive Media',
                category: (pdfMeta.category || p.category || 'interactive').toLowerCase(),
                year: pdfMeta.year || p.date || '2024',
                badge: pdfMeta.badge || 'Showcase',
                overview: pdfMeta.overview || p.summary || '',
                tags: pdfMeta.tags || p.tags || [],
                ultimateGoal: pdfMeta.ultimateGoal || null,
                details: pdfMeta.details || [],
                links: pdfMeta.links || []
            };
        });

    // Sort chronologically (newest year first)
    const normalizedProjects = [ludavizCard, singleAstCard, ...nonLectureProjects];

    const categories = [
        { id: 'all', label: 'All Works' },
        { id: 'interactive', label: 'Interactive Media & Eng.' },
        { id: 'academic', label: 'Scientific Work' },
        { id: 'lecture', label: 'Teaching' }
    ];

    const urlParams = new URLSearchParams(window.location.search);
    const initialCat = urlParams.get('cat');
    let activeCategory = initialCat && categories.some(c => c.id === initialCat) ? initialCat : 'all';
    let searchQuery = '';
    let allExpanded = false;
    const expandedIds = new Set(['proj_ast_course_bundle', 'proj_ludaviz_phd']);

    const filterGroup = document.getElementById('projects-filter-group');
    const searchInput = document.getElementById('projects-search');
    const kpiTriggers = document.querySelectorAll('[data-proj-filter]');
    const toggleAllBtn = document.getElementById('toggle-all-projects');
    const toggleAllText = document.getElementById('toggle-all-proj-text');
    const toggleAllIcon = document.getElementById('toggle-all-proj-icon');

    const countByCat = (cat) => cat === 'all' ? normalizedProjects.length : normalizedProjects.filter(p => p.category === cat).length;
    const setElText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setElText('kpi-total-count', `${countByCat('all')} Showcases`);
    setElText('kpi-interactive-count', `${countByCat('interactive')} Projects`);
    setElText('kpi-academic-count', `${countByCat('academic')} Research Works`);
    setElText('kpi-lecture-count', `1 Course (${videoCount} Videos)`);

    function renderFilterButtons() {
        if (!filterGroup) return;
        filterGroup.innerHTML = categories.map(cat => {
            const countLabel = cat.id === 'lecture'
                ? `1 • ${videoCount} Videos`
                : countByCat(cat.id);
            const isActive = cat.id === activeCategory;
            const cls = isActive
                ? 'proj-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-black transition-all interactive'
                : 'proj-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold text-textMuted hover:text-white hover:bg-white/5 transition-all interactive';
            return `<button data-cat="${cat.id}" class="${cls}">${cat.label} (${countLabel})</button>`;
        }).join('');

        filterGroup.querySelectorAll('.proj-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeCategory = btn.getAttribute('data-cat');
                renderFilterButtons();
                renderProjects();
            });
        });
    }

    function renderProjects() {
        const q = searchQuery.toLowerCase().trim();
        const filtered = normalizedProjects.filter(p => {
            if (activeCategory !== 'all' && p.category !== activeCategory) return false;
            if (!q) return true;
            const hay = [
                p.title, p.subtitle, p.domain, p.year, p.overview, p.badge, p.ultimateGoal,
                ...(p.tags || []), ...(p.details || [])
            ].join(' ').toLowerCase();
            return hay.includes(q);
        });

        if (filtered.length === 0) {
            projectsGrid.innerHTML = `
                <div class="bento-card p-12 text-center border-dashed col-span-full">
                    <i class="ph ph-magnifying-glass text-3xl text-textMuted mb-2"></i>
                    <h3 class="font-bold text-white mb-1">No matching projects found</h3>
                    <p class="text-xs text-textMuted">Try clearing your search filter or switching categories.</p>
                </div>`;
            return;
        }

        const catBadgeStyle = {
            interactive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            academic: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            lecture: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };

        projectsGrid.innerHTML = filtered.map((p) => {
            const isExpanded = expandedIds.has(p.id) || q.length > 0 || allExpanded;
            const badgeStyle = catBadgeStyle[p.category] || 'bg-white/10 text-gray-300 border-white/20';

            return `
            <article data-proj-id="${p.id}" class="project-card bento-card p-5 flex flex-col justify-between group cursor-pointer interactive ${isExpanded ? 'expanded' : ''}">
                <div>
                    <!-- Top Thumbnail Banner -->
                    <div class="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-border mb-4">
                        <img src="${resolveAsset(p.imageUrl)}" alt="${p.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"></div>

                        <!-- Top Overlay Badges: Domain & Year -->
                        <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${badgeStyle}">
                                ${highlightMatch(p.domain, searchQuery)}
                            </span>
                            <span class="px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white">
                                ${highlightMatch(p.year, searchQuery)}
                            </span>
                        </div>

                        <!-- Bottom Overlay Badge: Video Count / Highlight Badge -->
                        <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2">
                            ${p.duration ? `
                                <span class="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-white/15 text-[10px] font-bold font-mono text-white flex items-center gap-1.5">
                                    <i class="ph-fill ph-video text-blue-400 text-xs"></i> ${highlightMatch(p.duration, searchQuery)}
                                </span>
                            ` : `
                                <span class="px-2.5 py-0.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-bold text-gray-200">
                                    ${highlightMatch(p.badge, searchQuery)}
                                </span>
                            `}
                        </div>
                    </div>

                    <!-- Title, Subtitle & Expand/Collapse Chevron -->
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <h2 class="md:text-[17px] font-bold text-white group-hover:text-gray-200 transition-colors leading-snug">
                                ${highlightMatch(p.title, searchQuery)}
                            </h2>
                            <p class="text-[11px] font-bold text-gray-400 mt-0.5">
                                ${highlightMatch(p.subtitle, searchQuery)}
                            </p>
                        </div>
                        <div class="w-8 h-8 rounded-full border border-border bg-base flex items-center justify-center shrink-0 mt-0.5 group-hover:border-gray-400 transition-colors">
                            <i class="ph ph-caret-down text-sm text-white chevron-icon transition-transform duration-300"></i>
                        </div>
                    </div>

                    <!-- Overview First Summary -->
                    <p class="text-xs text-textMuted leading-relaxed mt-3">
                        ${highlightMatch(p.overview, searchQuery)}
                    </p>

                    <!-- Used Tech Stack Tags -->
                    <div class="flex flex-wrap gap-1.5 mt-3.5">
                        ${(p.tags || []).map(t => `<span class="px-2 py-0.5 rounded-md bg-base border border-border text-[10px] text-gray-300">${highlightMatch(t, searchQuery)}</span>`).join('')}
                    </div>

                    <!-- Details on Demand Drawer -->
                    <div class="details-grid">
                        <div class="overflow-hidden">
                            <div class="pt-4 mt-4 border-t border-border/80 flex flex-col gap-3">
                                <p class="text-[10px] uppercase tracking-widest text-textMuted font-bold">Key Points & Technical Breakdown</p>
                                <ul class="list-disc pl-5 space-y-1.5 text-xs text-gray-300 leading-relaxed">
                                    ${(p.details || []).map(d => `<li>${highlightMatch(d, searchQuery)}</li>`).join('')}
                                </ul>

                                ${p.ultimateGoal ? `
                                    <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200">
                                        <span class="font-bold text-white uppercase tracking-wider text-[10px] block mb-0.5">Ultimate Goal</span>
                                        ${highlightMatch(p.ultimateGoal, searchQuery)}
                                    </div>
                                ` : ''}

                                ${(p.links && p.links.length > 0) ? `
                                    <div class="flex flex-wrap gap-2 pt-1">
                                        ${p.links.map((lnk, idx) => `
                                            <a href="${lnk.url}" ${lnk.internal ? '' : 'target="_blank" rel="noopener"'} onclick="event.stopPropagation()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${idx === 0 ? 'bg-white text-black hover:bg-gray-200' : 'bg-base border border-border text-white hover:bg-white/10'} text-xs font-bold transition-colors interactive">
                                                <i class="ph-bold ${lnk.icon || 'ph-arrow-up-right'}"></i>
                                                <span>${lnk.label}</span>
                                            </a>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </article>`;
        }).join('');

        projectsGrid.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-proj-id');
                if (card.classList.contains('expanded')) {
                    card.classList.remove('expanded');
                    expandedIds.delete(id);
                } else {
                    card.classList.add('expanded');
                    expandedIds.add(id);
                }
            });
        });
    }

    kpiTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            activeCategory = btn.getAttribute('data-proj-filter');
            renderFilterButtons();
            renderProjects();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderProjects();
        });
    }

    if (toggleAllBtn) {
        toggleAllBtn.addEventListener('click', () => {
            allExpanded = !allExpanded;
            if (allExpanded) {
                normalizedProjects.forEach(p => expandedIds.add(p.id));
                toggleAllText.textContent = 'Collapse All';
                toggleAllIcon.className = 'ph ph-arrows-in-line-vertical';
            } else {
                expandedIds.clear();
                toggleAllText.textContent = 'Expand All';
                toggleAllIcon.className = 'ph ph-arrows-out-line-vertical';
            }
            renderProjects();
        });
    }

    renderFilterButtons();
    renderProjects();
}

// ============================================================================
// 8. PAGE CONTROLLER: TECH STACK ARSENAL (pages/stack.html)
// ============================================================================
function initStackPage(allData) {
    const stackGrid = document.getElementById('stack-bento-grid');
    if (!stackGrid) return;

    const combinedStack = getUnifiedStack(allData);

    const categories = [
        { id: 'all', label: 'All Tools' },
        { id: 'engines', label: 'Engines & 3D' },
        { id: 'ai', label: 'AI & Visualization' },
        { id: 'code', label: 'Languages & Web' },
        { id: 'design', label: 'Media & Design' },
        { id: 'workflow', label: 'DevOps & Hardware' }
    ];

    let activeCategory = 'all';
    let searchQuery = '';

    const filterGroup = document.getElementById('stack-filter-group');
    const searchInput = document.getElementById('stack-search');
    const kpiTriggers = document.querySelectorAll('[data-stack-filter]');

    const countByCat = (cat) => cat === 'all' ? combinedStack.length : combinedStack.filter(s => s.category === cat).length;

    function renderFilterButtons() {
        if (!filterGroup) return;
        filterGroup.innerHTML = categories.map(cat => {
            const count = countByCat(cat.id);
            const isActive = cat.id === activeCategory;
            const cls = isActive
                ? 'stack-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-black transition-all interactive'
                : 'stack-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold text-textMuted hover:text-white hover:bg-white/5 transition-all interactive';
            return `<button data-cat="${cat.id}" class="${cls}">${cat.label} (${count})</button>`;
        }).join('');

        filterGroup.querySelectorAll('.stack-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeCategory = btn.getAttribute('data-cat');
                renderFilterButtons();
                renderStackCards();
            });
        });
    }

    function renderStackCards() {
        const q = searchQuery.toLowerCase().trim();
        const filtered = combinedStack.filter(item => {
            if (activeCategory !== 'all' && item.category !== activeCategory) return false;
            if (!q) return true;
            const hay = [item.name, item.role, item.level, item.description, item.category].join(' ').toLowerCase();
            return hay.includes(q);
        });

        if (filtered.length === 0) {
            stackGrid.innerHTML = `
                <div class="bento-card p-12 text-center border-dashed col-span-full">
                    <i class="ph ph-magnifying-glass text-3xl text-textMuted mb-2"></i>
                    <h3 class="font-bold text-white mb-1">No matching tools found</h3>
                    <p class="text-xs text-textMuted">Try clearing your search query or selecting "All Tools".</p>
                </div>`;
            return;
        }

        stackGrid.innerHTML = filtered.map(item => {
            const href = resolveAsset(item.link || '#');
            return `
            <a href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} class="bento-card p-5 md:p-6 flex flex-col justify-between gap-4 group interactive">
                <div>
                    <div class="flex items-start justify-between gap-3 mb-4">
                        <div class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 p-2.5">
                            ${renderStackIconGraphic(item, 'w-full h-full', 'text-2xl')}
                        </div>
                        <span class="px-2.5 py-1 rounded-lg bg-white/5 border border-border text-[10px] font-bold uppercase tracking-wider text-gray-300">
                            ${highlightMatch(item.level || 'Proficient', searchQuery)}
                        </span>
                    </div>
                    <h2 class="md:text-lg font-bold text-white group-hover:text-gray-200 transition-colors">
                        ${highlightMatch(item.name, searchQuery)}
                    </h2>
                    <p class="text-xs font-bold text-gray-400 mt-0.5 mb-2.5">
                        ${highlightMatch(item.role || '', searchQuery)}
                    </p>
                    <p class="text-xs text-textMuted leading-relaxed">
                        ${highlightMatch(item.description || '', searchQuery)}
                    </p>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-border/60 text-[11px] text-textMuted group-hover:text-white transition-colors">
                    <span class="uppercase tracking-wider font-bold">${item.category}</span>
                    <i class="ph ph-arrow-up-right text-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"></i>
                </div>
            </a>`;
        }).join('');
    }

    kpiTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            activeCategory = btn.getAttribute('data-stack-filter');
            renderFilterButtons();
            renderStackCards();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderStackCards();
        });
    }

    renderFilterButtons();
    renderStackCards();
}

// ============================================================================
// 9. PAGE CONTROLLER: CONTACT (pages/contact.html)
// ============================================================================
function initContactPage(allData) {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const copyBtn = document.getElementById('copy-email-btn');
    const copyText = document.getElementById('copy-email-text');
    const copyIcon = document.getElementById('copy-email-icon');
    const emailEl = document.getElementById('email-address');
    const emailAddress = (allData.profile && allData.profile.email) || (emailEl ? emailEl.textContent.trim() : 'luca.geiger@fh-hagenberg.at');

    if (emailEl) emailEl.textContent = emailAddress;

    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(emailAddress);
                copyText.textContent = 'Copied!';
                copyIcon.className = 'ph-bold ph-check text-sm text-emerald-600';
                setTimeout(() => {
                    copyText.textContent = 'Copy Email';
                    copyIcon.className = 'ph ph-copy text-sm';
                }, 2200);
            } catch {
                window.location.href = `mailto:${emailAddress}`;
            }
        });
    }

    let selectedTopic = 'Research Collaboration';
    const topicPills = document.querySelectorAll('.topic-pill');
    topicPills.forEach(pill => {
        pill.addEventListener('click', () => {
            topicPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            selectedTopic = pill.getAttribute('data-topic');
        });
    });

    const formStatus = document.getElementById('form-status');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('sender-name').value.trim();
        const email = document.getElementById('sender-email').value.trim();
        const org = document.getElementById('sender-org').value.trim();
        const message = document.getElementById('sender-message').value.trim();

        const subject = encodeURIComponent(`[${selectedTopic}] Inquiry from ${name}${org ? ` (${org})` : ''}`);
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}${org ? `\nOrganization: ${org}` : ''}\nTopic: ${selectedTopic}\n\nMessage:\n${message}`
        );

        window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
        if (formStatus) {
            formStatus.innerHTML = '<span class="text-emerald-400 font-bold">✓ Opening your mail client with your formatted message...</span>';
        }
    });
}

// ============================================================================
// 10. MASTER PORTFOLIO INITIALIZER
// ============================================================================
async function loadAndRenderPortfolio() {
    try {
        const allData = await fetchSiteData();

        // 1. Render Shared Shell
        renderSiteShell(allData);
        initClockAndMenu();

        const updateEl = (id, prop, val) => {
            const el = document.getElementById(id);
            if (el && val !== undefined) el[prop] = val;
        };

        const projects = allData.projects || allData.lectures || [];
        const lectures = projects.filter(p => p.category && p.category.toLowerCase() === 'lecture');

        // 2. AST Lecture Feed & Search (ast.html)
        const lectureContainer = document.getElementById('lecture-feed');
        const searchInput = document.getElementById('lecture-search');

        if (lectureContainer) {
            const renderLectures = (items, isSearching = false, query = '') => {
                if (items.length === 0) {
                    lectureContainer.innerHTML = `
                        <div class="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#2a2a2a] rounded-xl bg-[#121212]/50 fade-in-up">
                            <i class="ph ph-magnifying-glass text-4xl text-textMuted mb-3"></i>
                            <h3 class="text-lg font-bold text-white mb-1">No lectures found</h3>
                            <p class="text-sm text-textMuted">Try adjusting your search terms.</p>
                        </div>`;
                    return;
                }

                lectureContainer.innerHTML = items.map((p, i) => `
                    <a href="${BASE_PATH}lecture.html?slug=${encodeURIComponent(getProjectSlug(p))}" target="_blank" class="bento-card p-4 md:p-5 group block interactive ${isSearching ? 'animate-none opacity-100 transform-none' : 'fade-in-up'}" ${!isSearching ? `style="animation-delay: ${250 + (i * 100)}ms;"` : ''}>
                        <div class="relative w-full aspect-[21/9] md:aspect-[16/7] rounded-xl overflow-hidden mb-4 bg-border">
                            <img src="${resolveAsset(p.imageUrl)}" alt="${p.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                        </div>
                        <h3 class="text-lg md:text-xl font-bold text-white mb-2">${highlightMatch(p.title, query)}</h3>
                        <p class="text-xs md:text-sm text-gray-400 mb-6 leading-relaxed max-w-[90%]">${highlightMatch(p.summary, query)}</p>
                        <div class="flex justify-between items-end mt-auto">
                            <div class="text-[10px] md:text-xs text-textMuted font-mono">
                                <p>${highlightMatch(p.date || 'Unknown', query)}</p>
                                <p class="mt-1">${p.duration || '0:00'}</p>
                            </div>
                            <div class="h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-10 group-hover:w-[96px] overflow-hidden relative z-20">
                                <div class="w-9 h-9 bg-white rounded-full flex shrink-0 items-center justify-center shadow-lg absolute">
                                    <i class="ph-fill ph-play text-black text-lg ml-0.5"></i>
                                </div>
                                <span class="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap absolute right-4">View</span>
                            </div>
                        </div>
                    </a>
                `).join('');
            };

            renderLectures(lectures);

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.trim();
                    const lowerQuery = query.toLowerCase();
                    const filtered = lectures.filter(p =>
                        (p.title && p.title.toLowerCase().includes(lowerQuery)) ||
                        (p.summary && p.summary.toLowerCase().includes(lowerQuery)) ||
                        (p.date && p.date.toLowerCase().includes(lowerQuery))
                    );
                    renderLectures(filtered, query.length > 0, query);
                });
            }
        }

        // 3. Single Lecture Detail Page (lecture.html)
        const detailVideoContainer = document.getElementById('detail-video-container');
        if (detailVideoContainer && lectures.length > 0) {
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('slug');
            const currentLecture = lectures.find(p => getProjectSlug(p) === slug) || lectures[0];

            if (currentLecture) {
                document.title = `${currentLecture.title} | Luca G.`;
                updateEl('detail-title', 'textContent', currentLecture.title);
                updateEl('detail-date', 'textContent', currentLecture.date || 'Unknown Date');
                updateEl('detail-duration', 'textContent', currentLecture.duration || '0:00');

                const videoId = getYouTubeId(currentLecture.videoUrl);
                detailVideoContainer.innerHTML = `
                    <img src="${resolveAsset(currentLecture.imageUrl)}" alt="${currentLecture.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]">
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div class="w-16 h-11 rounded-xl bg-black/75 border border-white/15 backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black text-white shadow-2xl">
                            <i class="ph-fill ph-play text-xl ml-0.5"></i>
                        </div>
                    </div>
                `;

                detailVideoContainer.addEventListener('click', () => {
                    if (videoId) {
                        detailVideoContainer.innerHTML = `
                            <iframe class="w-full h-full" src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" title="${currentLecture.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        `;
                    } else if (currentLecture.videoUrl) {
                        window.open(currentLecture.videoUrl, '_blank');
                    }
                }, { once: true });

                const contentEl = document.getElementById('detail-content');
                if (contentEl) contentEl.innerHTML = formatLectureContent(currentLecture.content);

                const otherFeed = document.getElementById('other-tutorials-feed');
                if (otherFeed) {
                    const otherLectures = lectures.filter(p => getProjectSlug(p) !== getProjectSlug(currentLecture));
                    const listToRender = otherLectures.length > 0 ? otherLectures : lectures;
                    otherFeed.innerHTML = listToRender.map(p => `
                        <a href="${BASE_PATH}lecture.html?slug=${encodeURIComponent(getProjectSlug(p))}" class="bento-card p-4 group block interactive">
                            <div class="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-border">
                                <img src="${resolveAsset(p.imageUrl)}" alt="${p.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                            </div>
                            <h3 class="font-bold text-white mb-1 leading-snug">${p.title}</h3>
                            <div class="flex justify-between items-end mt-auto">
                                <div class="text-[10px] md:text-xs text-textMuted font-mono">
                                    <p>${p.date || 'Unknown'}</p>
                                    <p class="mt-1">${p.duration || '0:00'}</p>
                                </div>
                                <div class="h-9 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-10 group-hover:w-[96px] overflow-hidden relative z-20">
                                    <div class="w-8 h-8 bg-white rounded-full flex shrink-0 items-center justify-center shadow-lg absolute">
                                        <i class="ph-fill ph-play text-black text-lg ml-0.5"></i>
                                    </div>
                                    <span class="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap absolute right-4">View</span>
                                </div>
                            </div>
                        </a>
                    `).join('');
                }
            }
        }

        // 4. Home Page Marquees, Full Stack Widget (with Official Brand Logos) & Featured Card
        const buildMarqueeBlock = (items) => {
            if (!items || items.length === 0) return '';
            const half = Math.ceil(items.length / 2);
            const renderCol = (slice) => slice.map((p, i) =>
                `<div data-open="projects" data-id="${p.id}" class="interactive cursor-none"><img src="${resolveAsset(p.imageUrl)}" alt="" class="w-full h-32 md:h-36 lg:h-44 object-cover rounded-[14px] bg-border transition-transform duration-500 hover:scale-[1.02] ${i > 0 ? 'mt-2' : ''}"></div>`
            ).join('');
            return `
                <div class="w-full p-1.5 md:p-2">
                    <div class="grid grid-cols-2 gap-1.5 md:gap-2">
                        <div class="flex flex-col gap-1.5 md:gap-2">${renderCol(items.slice(0, half))}</div>
                        <div class="flex flex-col gap-1.5 md:gap-2 mt-4 md:mt-8">${renderCol(items.slice(half))}</div>
                    </div>
                </div>`;
        };

        const intMarquee = document.getElementById('interactive-marquee');
        if (intMarquee) intMarquee.innerHTML = buildMarqueeBlock(projects.filter(p => p.category === 'interactive')).repeat(2);

        const acadMarquee = document.getElementById('academic-marquee');
        if (acadMarquee) acadMarquee.innerHTML = buildMarqueeBlock(projects.filter(p => p.category === 'academic')).repeat(2);

        // Render ALL Stack Items with Official Brand Logos in #stack-container (index.html & ast.html)
        const stackContainer = document.getElementById('stack-container');
        if (stackContainer) {
            const fullStack = getUnifiedStack(allData);
            stackContainer.className = "flex flex-wrap items-center justify-center gap-y-2 relative z-10 mt-6 px-3 w-full";
            stackContainer.innerHTML = fullStack.map((s, i) => `
                <span class="group/icon relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-[11px] bg-white flex items-center justify-center shadow-xl border-2 border-card transition-all duration-300 hover:-translate-y-2 hover:scale-110 hover:!z-50 interactive flex-shrink-0 p-1.5" style="z-index: ${50 - i}; margin-left: ${i > 0 ? '-9px' : '0'};">
                    ${renderStackIconGraphic(s, 'w-full h-full', 'md:text-lg')}
                    <span class="absolute -top-9 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg whitespace-nowrap z-50">${s.name}</span>
                </span>
            `).join('');
        }

        if (allData.featuredProject) {
            updateEl('featured-img', 'src', resolveAsset(allData.featuredProject.imageUrl));
            updateEl('featured-title', 'textContent', allData.featuredProject.title);
            const featLink = document.getElementById('featured-link');
            if (featLink) featLink.setAttribute('data-id', allData.featuredProject.id);
        }

        // 5. Initialize Subpage Controllers
        initAboutPage(allData);
        initProjectsPage(allData);
        initStackPage(allData);
        initContactPage(allData);
    } catch (error) {
        console.error('Failed to initialize portfolio:', error);
    }
}

// ============================================================================
// 11. CLOCK, DROPDOWN MENU & DELEGATED CURSOR
// ============================================================================
function updateClock() {
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    clockEl.textContent = `${hours}:${minutes} ${monthNames[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}, ${now.getFullYear()}`;
}

function initClockAndMenu() {
    updateClock();
    setInterval(updateClock, 1000);

    const menuBtn = document.getElementById('menu-toggle');
    const line1 = document.getElementById('menu-line-1');
    const line2 = document.getElementById('menu-line-2');
    const dropdownMenu = document.getElementById('dropdown-menu');
    let isMenuOpen = false;

    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isMenuOpen = !isMenuOpen;
            dropdownMenu.classList.toggle('open', isMenuOpen);
            line1.style.transform = isMenuOpen ? 'translateY(5px) rotate(45deg)' : 'translateY(0) rotate(0)';
            line2.style.transform = isMenuOpen ? 'translateY(-5px) rotate(-45deg)' : 'translateY(0) rotate(0)';
        });

        document.addEventListener('click', (e) => {
            if (isMenuOpen && !dropdownMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                isMenuOpen = false;
                dropdownMenu.classList.remove('open');
                line1.style.transform = 'translateY(0) rotate(0)';
                line2.style.transform = 'translateY(0) rotate(0)';
            }
        });
    }
}

window.addEventListener('mousemove', (e) => {
    const cursorWrapper = document.getElementById('cursor-wrapper');
    if (cursorWrapper) {
        cursorWrapper.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }
});

document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, input, textarea, .interactive')) {
        document.body.classList.add('hovering-interactive');
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, input, textarea, .interactive')) {
        document.body.classList.remove('hovering-interactive');
    }
});

loadAndRenderPortfolio();