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

// Fetch data.json first; fall back to cms.json if data.json hasn't been built yet
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
// 2. UNIFIED STACK BUILDER (Used across index.html, ast.html, and stack.html)
// ============================================================================
function getUnifiedStack(allData) {
    const rawStack = allData.stack || [];

    const defaultEnrichment = {
        'Slack': { category: 'workflow', role: 'Team & Research Communication', level: 'Daily Driver', description: 'Real-time academic group coordination, LudaViz research channels, and student mentoring.' },
        'Figma': { category: 'design', role: 'UI/UX & Visualization Prototyping', level: 'Advanced', description: 'Wireframing interactive dashboards, diegetic UI concepts, and scientific figure layouts.' },
        'Framer': { category: 'design', role: 'Interactive Web & Motion Systems', level: 'Advanced', description: 'Bento-grid layout architecture, rapid interactive prototyping, and micro-interactions.' },
        'React': { category: 'code', role: 'Component UI & Web Applications', level: 'Proficient', description: 'Modular front-end interfaces, interactive visualizations, and state-driven web apps.' },
        'Google': { category: 'workflow', role: 'Scholar, Cloud & Workspace Suite', level: 'Daily Driver', description: 'Literature indexing, collaborative research documentation, and academic asset hosting.' }
    };

    const coreEngineeringStack = [
        { name: 'Unreal Engine 5', icon: 'ph-cube', color: 'text-emerald-600', category: 'engines', role: '3D Game Engine & C++ / Blueprints', level: 'Expert / Lecturer', description: 'Procedural generation, Niagara particles, AI MoveTo navigation, Stockfish pipe integration, and VR.', link: 'ast.html' },
        { name: 'C / C++', icon: 'ph-code', color: 'text-blue-600', category: 'code', role: 'Systems & Engine Programming', level: 'Expert', description: 'Custom UE4/UE5 plugins, spherical coordinate math, Stockfish UCI pipelines, and console engines.', link: 'ast.html' },
        { name: 'Unity & C#', icon: 'ph-game-controller', color: 'text-purple-600', category: 'engines', role: 'Game Development & Reinforcement Learning', level: 'Advanced', description: 'Multiplayer Twitch extensions (Viewergames), ML-Agents Reinforcement Learning, and custom shaders.', link: 'pages/about.html?cat=work' },
        { name: 'PyTorch & XAI', icon: 'ph-brain', color: 'text-amber-600', category: 'ai', role: 'Explainable AI & Deep Learning', level: 'M.Sc. Specialization', description: 'White-box LLM activation compression, high-fidelity kNN analysis, and neural network diagnostics.', link: 'pages/about.html?cat=education' },
        { name: 'Blender & OpenGL', icon: 'ph-polygon', color: 'text-orange-600', category: 'engines', role: '3D Modelling, Rigging & Shaders', level: 'Advanced', description: 'Low-poly and high-poly 3D asset pipelines, skeletal animations, and real-time lighting calculations.', link: 'pages/projects.html?cat=interactive' },
        { name: 'Diegetic & Ludic Vis', icon: 'ph-chart-polar', color: 'text-cyan-600', category: 'ai', role: 'HCI & Information Visualization', level: 'PhD Research', description: 'Player behavior analytics, in-game hazard visualization (CHI \'26), and transient game systems (FDG \'26).', link: 'pages/about.html?cat=publications' },
        { name: 'JavaScript & Tailwind', icon: 'ph-browsers', color: 'text-sky-600', category: 'code', role: 'Procedural Web & Full-Stack Tools', level: 'Advanced', description: 'Zero-dependency procedural CMS pipelines, Node.js build automation, and WebGL integrations.', link: 'index.html' },
        { name: 'Hardware & VDE', icon: 'ph-circuitry', color: 'text-emerald-700', category: 'workflow', role: 'Electrical Engineering & Test Racks', level: 'Siemens Certified', description: 'Automated prototype test racks, VDE 0701 compliance, circuit diagnostics, and Physical Computing.', link: 'pages/about.html?cat=work' }
    ];

    const enrichedFromCms = rawStack.map(s => ({
        ...(defaultEnrichment[s.name] || { category: 'workflow', role: 'Core Tool', level: 'Active', description: 'Integrated into daily research and development workflows.' }),
        ...s
    }));

    const existingNames = new Set(enrichedFromCms.map(s => (s.name || '').toLowerCase()));
    return [
        ...enrichedFromCms,
        ...coreEngineeringStack.filter(d => !existingNames.has(d.name.toLowerCase()))
    ];
}

// ============================================================================
// 3. PROCEDURAL SHELL INJECTION (Cursor, Header, Sidebar, Mobile Footer)
// ============================================================================
function renderSiteShell(siteData) {
    const activeRoute = getActiveRoute();
    const profile = siteData.profile || {};
    const socials = profile.socials || [];
    const cvUrl = profile.cvUrl || '#';

    // 1. Custom Cursor
    if (!document.getElementById('cursor-wrapper')) {
        document.body.insertAdjacentHTML('afterbegin', `
            <div class="hidden lg:block" id="cursor-wrapper">
                <div id="cursor-halo"></div>
                <div id="cursor-dot"></div>
            </div>
        `);
    }

    // 2. Header & Navigation
    const navItems = [
        { id: 'home', label: 'Home', href: `${BASE_PATH}index.html` },
        { id: 'about', label: 'About Me', href: `${BASE_PATH}pages/about.html` },
        { id: 'stack', label: 'Stack', href: `${BASE_PATH}pages/stack.html` },
        { id: 'projects', label: 'Projects', href: `${BASE_PATH}pages/projects.html` },
        { id: 'contact', label: 'Contact', href: `${BASE_PATH}pages/contact.html`, routeAttr: 'contact' },
        { id: 'ast', label: 'AST', href: `${BASE_PATH}ast.html`, routeAttr: 'ast' }
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
                <img id="profile-img" src="${resolveAsset(profile.image)}" alt="Profile" class="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-border group-hover:border-gray-400 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <div class="leading-tight">
                    <h2 id="profile-name" class="font-bold text-lg md:text-xl tracking-tight group-hover:text-gray-300 transition-colors duration-500">${profile.name || ''}</h2>
                    <p id="profile-title" class="text-[10px] md:text-[12px] text-textMuted uppercase tracking-widest mt-1">${profile.title || ''}</p>
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

    // 3. Left Sidebar
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
                Hey, I'm Luca <img class="inline-block origin-bottom-right ml-1" src="${resolveAsset('images/RockOnAndNamaste.png')}" height="32" width="32" alt="👋">
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

    // 4. Mobile & Tablet Footer
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
// 4. SHARED UTILITIES
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

function deriveTitleFromPath(imageUrl) {
    if (!imageUrl) return 'Untitled Project';
    const base = imageUrl.split('/').pop().replace(/\.[^.]+$/, '');
    return base.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').trim();
}

function deriveDomainFromPath(imageUrl, category) {
    if (imageUrl && imageUrl.includes('/')) {
        const parts = imageUrl.split('/');
        const folder = parts[parts.length - 2];
        if (folder && folder.toLowerCase() !== 'images') {
            return folder.replace(/([a-z])([A-Z])/g, '$1 $2');
        }
    }
    if (category === 'interactive') return 'Interactive Media';
    if (category === 'academic') return 'Scientific Contribution';
    if (category === 'lecture') return 'AST Lecture Series';
    return 'Portfolio Project';
}

// Compute total duration across all AST lectures (e.g., "11h 44m")
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
// 5. PAGE CONTROLLER: ABOUT ME (pages/about.html)
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
// 6. PAGE CONTROLLER: PROJECTS SHOWCASE (pages/projects.html)
// ============================================================================
function initProjectsPage(allData) {
    const projectsGrid = document.getElementById('projects-bento-grid');
    if (!projectsGrid) return;

    const rawProjects = allData.projects || [];
    const lectureItems = rawProjects.filter(p => (p.category || '').toLowerCase() === 'lecture');

    // Exclude individual lectures AND loose ASTLecture/ASTLogo images from non-lecture list
    // so AST is represented by a single unified course card
    const nonLectureProjects = rawProjects
        .filter(p => {
            const cat = (p.category || '').toLowerCase();
            if (cat === 'lecture') return false;
            const img = (p.imageUrl || '').toLowerCase();
            if (img.endsWith('astlecture.png') || img.endsWith('astlogo.png')) return false;
            return true;
        })
        .map((p, idx) => {
            const title = p.title || deriveTitleFromPath(p.imageUrl);
            const domain = p.domain || deriveDomainFromPath(p.imageUrl, p.category);
            const category = (p.category || 'interactive').toLowerCase();
            const badge = p.badge || domain;
            const summary = p.summary || (
                category === 'interactive'
                    ? `Interactive Media & Engineering showcase (${domain}). Click to inspect full visual preview and details.`
                    : `Academic Research & Scientific Visualization contribution (${domain}).`
            );
            const tags = p.tags || [
                domain,
                category === 'academic' ? 'Research & HCI' : 'Interactive Media'
            ];

            return {
                ...p,
                id: p.id || `proj_${idx}`,
                title,
                domain,
                //category,
                badge,
                summary,
                tags
            };
        });

    // Build the SINGLE aggregated AST Lecture card showing the number of included videos
    const videoCount = lectureItems.length || 10;
    const totalDuration = sumLectureDurations(lectureItems);
    const singleAstCard = {
        id: 'proj_ast_course_bundle',
        title: 'Applied Software Techniques (AST)',
        domain: 'University Lecture Series',
        category: 'lecture',
        imageUrl: 'images/Lectures/ASTLecture.png',
        videoCount,
        duration: `${videoCount} Videos${totalDuration ? ` • ${totalDuration}` : ''}`,
        badge: `${videoCount} Videos Included`,
        summary: `Comprehensive ${videoCount}-video university course guiding students from plain C++ and Stockfish AI integration to a full 3D Unreal Engine 5 Chess-Party and Darts game.`,
        tags: [`${videoCount} Video Lectures`, 'Unreal Engine 5', 'C++ & Blueprints', 'Stockfish AI'],
        targetUrl: `${BASE_PATH}ast.html`
    };

    const normalizedProjects = [singleAstCard, ...nonLectureProjects];

    // Also include Featured Project (LudaViz) if not already in normalizedProjects
    if (allData.featuredProject && !normalizedProjects.some(p => p.imageUrl === allData.featuredProject.imageUrl)) {
        normalizedProjects.unshift({
            id: allData.featuredProject.id || 'proj_ludaviz',
            title: allData.featuredProject.title || 'LudaViz – Ludic Visualizations',
            domain: 'FWF Pioneer Research Project',
            category: 'academic',
            badge: 'Flagship Research',
            imageUrl: allData.featuredProject.imageUrl,
            summary: 'FWF-funded pioneer research project investigating Ludic and Diegetic Visualizations in video games and player behavior analytics at FH OÖ.',
            tags: ['PhD Research', 'Ludic Visualization', 'Player Analytics', 'FWF']
        });
    }

    const categories = [
        { id: 'all', label: 'All Works' },
        { id: 'interactive', label: 'Interactive Media' },
        { id: 'academic', label: 'Research & SciViz' },
        { id: 'lecture', label: 'AST Lecture' }
    ];

    const urlParams = new URLSearchParams(window.location.search);
    const initialCat = urlParams.get('cat');
    let activeCategory = initialCat && categories.some(c => c.id === initialCat) ? initialCat : 'all';
    let searchQuery = '';

    const filterGroup = document.getElementById('projects-filter-group');
    const searchInput = document.getElementById('projects-search');
    const kpiTriggers = document.querySelectorAll('[data-proj-filter]');

    const countByCat = (cat) => cat === 'all' ? normalizedProjects.length : normalizedProjects.filter(p => p.category === cat).length;
    const setElText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setElText('kpi-total-count', `${countByCat('all')} Showcases`);
    setElText('kpi-interactive-count', `${countByCat('interactive')} Projects`);
    setElText('kpi-academic-count', `${countByCat('academic')} Visuals`);
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

    // Modal Controller
    const modal = document.getElementById('project-detail-modal');
    const modalClose = document.getElementById('project-modal-close');
    const modalBody = document.getElementById('project-modal-body');

    function openProjectModal(proj) {
        if (!modal || !modalBody) return;
        const actionUrl = proj.targetUrl || proj.link || proj.videoUrl || null;

        modalBody.innerHTML = `
            <div class="relative w-full aspect-video rounded-2xl overflow-hidden bg-base border border-border mb-5">
                <img src="${resolveAsset(proj.imageUrl)}" alt="${proj.title}" class="w-full h-full object-cover">
                <div class="absolute top-3 left-3 flex gap-2">
                    <span class="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-wider text-white">
                        ${proj.domain}
                    </span>
                </div>
            </div>
            <div class="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                    <h2 class="text-xl md:text-2xl font-bold text-white">${proj.title}</h2>
                    <p class="text-xs text-textMuted mt-1">${proj.domain} • ${proj.badge}</p>
                </div>
                ${actionUrl ? `
                    <a href="${actionUrl}" class="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition-all interactive flex items-center gap-2">
                        <span>Open Showcase</span>
                        <i class="ph-bold ph-arrow-up-right"></i>
                    </a>
                ` : ''}
            </div>
            <p class="text-xs md:text-sm text-gray-300 leading-relaxed mb-4">${proj.summary}</p>
            <div class="flex flex-wrap gap-1.5">
                ${(proj.tags || []).map(t => `<span class="px-2.5 py-1 rounded-lg bg-base border border-border text-[11px] text-gray-300">${t}</span>`).join('')}
            </div>
        `;
        modal.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
        modal.classList.add('opacity-100', 'visible');
    }

    function closeProjectModal() {
        if (!modal) return;
        modal.classList.add('opacity-0', 'invisible', 'pointer-events-none');
        modal.classList.remove('opacity-100', 'visible');
    }

    if (modalClose) modalClose.addEventListener('click', closeProjectModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProjectModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeProjectModal();
        });
    }

    function renderProjects() {
        const q = searchQuery.toLowerCase().trim();
        const filtered = normalizedProjects.filter(p => {
            if (activeCategory !== 'all' && p.category !== activeCategory) return false;
            if (!q) return true;
            const hay = [p.title, p.domain, p.summary, p.badge, ...(p.tags || [])].join(' ').toLowerCase();
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
            const badgeStyle = catBadgeStyle[p.category] || 'bg-white/10 text-gray-300 border-white/20';
            return `
            <article data-proj-id="${p.id}" class="project-card bento-card p-4 flex flex-col justify-between group cursor-pointer interactive">
                <div>
                    <div class="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-border mb-4">
                        <img src="${resolveAsset(p.imageUrl)}" alt="${p.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                        <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${badgeStyle}">
                            ${highlightMatch(p.domain, searchQuery)}
                        </span>
                        ${p.duration ? `
                            <span class="absolute bottom-2.5 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-bold font-mono text-white flex items-center gap-1.5">
                                <i class="ph-fill ph-video text-blue-400 text-xs"></i> ${p.duration}
                            </span>
                        ` : ''}
                    </div>
                    <h2 class="font-bold text-white group-hover:text-gray-200 transition-colors leading-snug mb-1.5">
                        ${highlightMatch(p.title, searchQuery)}
                    </h2>
                    <p class="text-xs text-textMuted line-clamp-2 leading-relaxed mb-4">
                        ${highlightMatch(p.summary, searchQuery)}
                    </p>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-border/60 mt-auto">
                    <div class="flex flex-wrap gap-1">
                        ${(p.tags || []).slice(0, 2).map(t => `<span class="px-2 py-0.5 rounded bg-base border border-border text-[10px] text-gray-300">${highlightMatch(t, searchQuery)}</span>`).join('')}
                    </div>
                    <div class="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        <i class="ph-bold ph-arrow-up-right text-sm"></i>
                    </div>
                </div>
            </article>`;
        }).join('');

        projectsGrid.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-proj-id');
                const target = normalizedProjects.find(item => item.id === id);
                if (!target) return;
                if (target.targetUrl) {
                    window.location.href = target.targetUrl;
                } else {
                    openProjectModal(target);
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

    renderFilterButtons();
    renderProjects();
}

// ============================================================================
// 7. PAGE CONTROLLER: TECH STACK ARSENAL (pages/stack.html)
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
        { id: 'design', label: 'Design & UI' },
        { id: 'workflow', label: 'Hardware & Workflow' }
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
                        <div class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                            <i class="ph-fill ${item.icon || 'ph-cube'} ${item.color || 'text-black'} text-2xl"></i>
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
// 8. PAGE CONTROLLER: CONTACT (pages/contact.html)
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
// 9. MASTER PORTFOLIO INITIALIZER
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

        // 4. Home Page Marquees, Full Stack Widget & Featured Card
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

        // Render ALL Stack Items in #stack-container (on index.html and ast.html)
        const stackContainer = document.getElementById('stack-container');
        if (stackContainer) {
            const fullStack = getUnifiedStack(allData);
            stackContainer.className = "flex flex-wrap items-center justify-center gap-y-2 relative z-10 mt-6 px-2 w-full";
            stackContainer.innerHTML = fullStack.map((s, i) => `
                <span class="group/icon relative w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-[12px] bg-white flex items-center justify-center shadow-xl border-2 md:border-[3px] border-card transition-all duration-300 hover:-translate-y-2 hover:scale-110 hover:!z-50 interactive flex-shrink-0" style="z-index: ${50 - i}; margin-left: ${i > 0 ? '-10px' : '0'};">
                    <i class="ph-fill ${s.icon} ${s.color || 'text-black'} text-lg md:text-xl group-hover/icon:rotate-12 transition-transform duration-300"></i>
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
// 10. CLOCK, DROPDOWN MENU & DELEGATED CURSOR
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