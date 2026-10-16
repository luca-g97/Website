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
    if (p.endsWith('interactive.html')) return 'interactive';
    if (p.endsWith('academic.html')) return 'academic';
    if (p.endsWith('stack.html')) return 'stack';
    if (p.endsWith('projects.html')) return 'projects';
    if (p.endsWith('contact.html')) return 'contact';
    if (p.endsWith('ast.html') || p.endsWith('lecture.html')) return 'ast';
    return 'home';
}

async function fetchSiteData() {
    const cacheBuster = `?t=${Date.now()}`;
    for (const file of ['assets/json/cms.json', 'assets/json/data.json']) {
        try {
            const res = await fetch(`${BASE_PATH}${file}${cacheBuster}`);
            if (res.ok) return await res.json();
        } catch {}
    }
    throw new Error('Could not load assets/json/cms.json or assets/json/data.json');
}

// ============================================================================
// 2. PROCEDURAL SHELL & OVERLAYING MODAL INJECTION
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

    // 2. Global Overlaying Zoom & Details Modal
    if (!document.getElementById('project-detail-modal')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="project-detail-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 opacity-0 invisible pointer-events-none transition-all duration-300">
                <div class="bento-card max-w-3xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto no-scrollbar border-[#3a3a3a] shadow-2xl">
                    <button id="project-modal-close" type="button" aria-label="Close Modal" class="w-9 h-9 rounded-full bg-white text-black hover:opacity-85 flex items-center justify-center absolute top-4 right-4 z-30 transition-all interactive shadow-lg">
                        <i class="ph-bold ph-x text-sm"></i>
                    </button>
                    <div id="project-modal-body"></div>
                </div>
            </div>
        `);
    }

    // 3. Header & Navigation
    const navItems = [
        { id: 'home', label: 'Home', href: `${BASE_PATH}index.html` },
        { id: 'about', label: 'About Me', href: `${BASE_PATH}pages/about.html` },
        { id: 'interactive', label: 'Interactive Media', href: `${BASE_PATH}pages/interactive.html` },
        { id: 'academic', label: 'Research & Teaching', href: `${BASE_PATH}pages/academic.html` },
        { id: 'projects', label: 'All Projects', href: `${BASE_PATH}pages/projects.html` },
        { id: 'stack', label: 'Stack', href: `${BASE_PATH}pages/stack.html` },
        { id: 'contact', label: 'Contact', href: `${BASE_PATH}pages/contact.html` },
    ];

    const navHtml = navItems.map(item => {
        const isActive = item.id === activeRoute;
        if (isActive) {
            return `<a href="${item.href}" class="px-4 py-2.5 text-white bg-white/10 rounded-xl transition-all interactive flex items-center justify-between">${item.label} <i class="ph ph-arrow-right"></i></a>`;
        }
        return `<a href="${item.href}" class="px-4 py-2.5 text-textMuted hover:text-white hover:bg-white/5 rounded-xl transition-all hover:translate-x-1 interactive">${item.label}</a>`;
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
                <div id="dropdown-menu" class="absolute top-14 md:top-16 right-0 w-56 bg-card border border-border rounded-2xl p-2 opacity-0 invisible -translate-y-4 z-40 shadow-2xl">
                    <nav class="flex flex-col text-xs md:text-sm font-medium gap-0.5">${navHtml}</nav>
                </div>
            </div>
        `;
    }

    // 4. Left Sidebar
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
            <h1 class="text-2xl md:text-[24px] xl:text-[28px] font-bold mb-4 md:mb-6 tracking-tight fade-in-up delay-100">
                Hey, I'm Luca <img class="inline-block origin-bottom-right ml-1" src="${resolveAsset('images/RockOnAndNamaste.png')}" height="32" width="32" alt="Rock On & Namaste">
            </h1>
            <p class="text-sm md:text-[16px] text-textMuted leading-[1.8] mb-6 md:mb-8 fade-in-up delay-200">
                And as you will find out, <br class="hidden lg:block"> I am quite an <span class="hidden lg:inline">experienced</span><br>
                <span class="text-white font-bold">Interactive Media Allrounder</span><br>
                who's fascinated by gaining and sharing <br class="block md:hidden lg:hidden"> knowledge about <br class="hidden md:block"> complex topics,
                especially <br class="block md:hidden lg:block"> if they are related to the <br>
                <span class="text-white font-bold">Combination of Sustainability <br class="block md:hidden lg:hidden"> and New Technologies</span>
            </p>
            <div class="flex flex-row flex-wrap lg:flex-col justify-between items-center lg:items-start gap-4 lg:gap-8 mb-8 lg:mb-16 w-full">
                <div class="flex gap-2 md:gap-4 fade-in-up delay-300">
                    ${primaryBtn}
                    <a href="${cvUrl}" target="_blank" rel="noopener" class="w-max px-4 py-2.5 rounded-xl border border-border bg-card text-white text-sm font-bold hover:bg-white/10 hover:border-gray-500 transition-all duration-500 interactive">
                        Download CV
                    </a>
                </div>
                <div class="flex gap-2 md:gap-4 fade-in-up delay-400">
                    ${socialBtns}
                </div>
            </div>
            <div class="hidden lg:flex mt-auto flex-col gap-3 text-[11px] text-textMuted font-bold tracking-widest uppercase fade-in-up delay-500">
                <p class="text-white mb-1 tracking-normal capitalize">Inspired by <a href="https://www.framer.com/marketplace/templates/bentovibe/" target="_blank" rel="noopener" class="underline interactive hover:text-gray-300">BentoVibe-Template on Framer</a></p>
                <a href="#" class="hover:text-white transition-colors duration-300 interactive w-max">Licensing</a>
                <a href="#" class="hover:text-white transition-colors duration-300 interactive w-max">Privacy Policy</a>
            </div>
        `;
    }

    // 5. Mobile & Tablet Footer
    const mobileFooterEl = document.getElementById('site-mobile-footer');
    if (mobileFooterEl) {
        mobileFooterEl.className = "flex lg:hidden flex-col gap-2 md:gap-3 text-[10px] md:text-[11px] text-textMuted font-bold tracking-widest uppercase mt-8 md:mt-10 pb-6 items-center text-center fade-in-up delay-650";
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
// 3. SHARED HELPERS & OVERLAYING MODAL CONTROLLER
// ============================================================================
function highlightMatch(text, query) {
    if (!query || !text) return text || '';
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return String(text).replace(
        new RegExp(`(${escaped})`, 'gi'),
        '<span class="search-highlight">$1</span>'
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
    if (p.title) return p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

function renderStackIconGraphic(item, sizeClass = 'w-5 h-5 md:w-6 md:h-6', textClass = 'text-lg md:text-xl') {
    if (item.logoUrl) {
        return `
            <img src="${item.logoUrl}" alt="${item.name}" class="${sizeClass} object-contain group-hover/icon:rotate-12 transition-transform duration-300" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block'">
            <i class="ph-fill ${item.icon || 'ph-cube'} ${item.color || 'text-black'} ${textClass} hidden"></i>
        `;
    }
    return `<i class="ph-fill ${item.icon || 'ph-cube'} ${item.color || 'text-black'} ${textClass} group-hover/icon:rotate-12 transition-transform duration-300"></i>`;
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

// Overlaying Zoom & Details Modal
function openProjectOverlayModal(proj) {
    const modal = document.getElementById('project-detail-modal');
    const modalBody = document.getElementById('project-modal-body');
    if (!modal || !modalBody || !proj) return;

    const catBadgeStyle = {
        interactive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        academic: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        teaching: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };
    const badgeKey = proj.subCategory === 'teaching' ? 'teaching' : proj.category;
    const badgeStyle = catBadgeStyle[badgeKey] || 'bg-white/10 text-gray-300 border-white/20';

    const imagesHtml = proj.secondaryImageUrl
        ? `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-black p-3">
                <img src="${resolveAsset(proj.imageUrl)}" alt="${proj.title}" class="w-full max-h-[340px] object-contain rounded-xl mx-auto">
                <img src="${resolveAsset(proj.secondaryImageUrl)}" alt="${proj.title}" class="w-full max-h-[340px] object-contain rounded-xl mx-auto">
            </div>
        `
        : `<img src="${resolveAsset(proj.imageUrl)}" alt="${proj.title}" class="w-full max-h-[420px] object-contain mx-auto">`;

    modalBody.innerHTML = `
        <div class="relative w-full rounded-2xl overflow-hidden bg-black border border-border mb-6">
            ${imagesHtml}
            <div class="absolute top-3 left-3 flex flex-wrap gap-2">
                <span class="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md ${badgeStyle}">
                    ${proj.domain}
                </span>
                ${proj.year ? `<span class="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white">${proj.year}</span>` : ''}
            </div>
            ${proj.duration || proj.badge ? `
                <div class="absolute bottom-3 left-3">
                    <span class="px-3 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-white/15 text-[11px] font-bold font-mono text-white">
                        ${proj.duration || proj.badge}
                    </span>
                </div>
            ` : ''}
        </div>

        <div class="mb-4">
            <h2 class="text-xl md:text-2xl font-bold text-white leading-snug">${proj.title}</h2>
            <p class="text-xs md:text-sm font-bold text-gray-400 mt-1">${proj.subtitle || proj.domain}</p>
        </div>

        <p class="text-xs md:text-sm text-gray-300 leading-relaxed mb-5">${proj.overview}</p>

        ${(proj.details && proj.details.length > 0) ? `
            <div class="p-4 md:p-5 rounded-2xl bg-base/80 border border-border mb-5">
                <p class="text-[10px] uppercase tracking-widest text-textMuted font-bold mb-2.5">Key Points & Technical Breakdown</p>
                <ul class="list-disc pl-5 space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed">
                    ${proj.details.map(d => `<li>${d}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        ${proj.ultimateGoal ? `
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs md:text-sm text-gray-200 mb-5">
                <span class="font-bold text-white uppercase tracking-wider text-[10px] block mb-1">Ultimate Goal</span>
                ${proj.ultimateGoal}
            </div>
        ` : ''}

        <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/80">
            <div class="flex flex-wrap gap-1.5">
                ${(proj.tags || []).map(t => `<span class="px-2.5 py-1 rounded-lg bg-base border border-border text-[11px] text-gray-300">${t}</span>`).join('')}
            </div>

            ${(proj.links && proj.links.length > 0) ? `
                <div class="flex flex-wrap gap-2">
                    ${proj.links.map((lnk, idx) => {
        const href = lnk.internal ? resolveAsset(lnk.url) : lnk.url;
        return `
                        <a href="${href}" ${lnk.internal ? '' : 'target="_blank" rel="noopener"'} class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl ${idx === 0 ? 'bg-white text-black hover:opacity-90' : 'bg-base border border-border text-white hover:bg-white/10'} text-xs font-bold transition-all interactive">
                            <i class="ph-bold ${lnk.icon || 'ph-arrow-up-right'}"></i>
                            <span>${lnk.label}</span>
                        </a>`;
    }).join('')}
                </div>
            ` : ''}
        </div>
    `;

    modal.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
    modal.classList.add('opacity-100', 'visible');
}

function initGlobalModalListeners() {
    const modal = document.getElementById('project-detail-modal');
    const closeBtn = document.getElementById('project-modal-close');
    if (!modal) return;

    const closeModal = () => {
        modal.classList.add('opacity-0', 'invisible', 'pointer-events-none');
        modal.classList.remove('opacity-100', 'visible');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// ============================================================================
// 4. UNIFIED SHOWCASE ENGINE (projects.html, interactive.html, academic.html)
//    - Consolidated ASTLecture.png + ASTLogo.png into 1 Teaching Card
//    - Clicking a Card Opens the Overlaying Zoom & Details Modal
// ============================================================================
function initShowcasePage(allData) {
    const projectsGrid = document.getElementById('projects-bento-grid');
    if (!projectsGrid) return;

    const scope = projectsGrid.getAttribute('data-showcase-scope') || 'all';
    const rawProjects = allData.projects || [];
    const lectures = allData.lectures || [];
    const videoCount = lectures.length;
    const totalDuration = sumLectureDurations(lectures);

    // Consolidate ASTLecture.png & ASTLogo.png into one unified Teaching card inside Academic
    const consolidatedProjects = [];
    let teachingMerged = false;

    for (const p of rawProjects) {
        const isTeachingItem = p.category === 'teaching' || p.subCategory === 'teaching' || p.id === 'proj_ast_course_bundle' || p.id === 'proj_igp_course' || p.id === 'proj_teaching_ast_igp';
        if (isTeachingItem) {
            if (!teachingMerged) {
                teachingMerged = true;
                consolidatedProjects.push({
                    ...p,
                    id: 'proj_teaching_ast_igp',
                    title: 'University Teaching: Applied Software Techniques & Game Programming',
                    subtitle: `Prerecorded Video Courseware • AST (WS • 72h) & Interaction & Game Programming (SS • 21h)`,
                    domain: 'University Teaching (FH OÖ)',
                    category: 'academic',
                    subCategory: 'teaching',
                    year: '2024 – 2025',
                    imageUrl: 'images/Lectures/ASTLecture.png',
                    secondaryImageUrl: 'images/Lectures/ASTLogo.png',
                    duration: `${videoCount} Videos${totalDuration ? ` • ${totalDuration}` : ''}`,
                    badge: `${videoCount} Videos Included`,
                    overview: 'I prerecord every lesson to ensure the highest quality. Covers Applied Software Techniques (WS: 12 lessons/group, 72h total) and Interaction & Game Programming (SS: 7 lessons, 21h total) at FH Hagenberg.',
                    tags: [`${videoCount} Video Lectures`, 'Plain C++', 'Unreal Engine 5', 'Blueprints', 'Stockfish AI', 'Game Creation'],
                    ultimateGoal: 'Empowering students to master both low-level C++ systems architecture and visual node-based Unreal Engine 5 Blueprints through prerecorded, high-density video courseware.',
                    details: [
                        `Applied Software Techniques (WS): 12 lessons for each group (72 hours in total) accompanied by ${videoCount} prerecorded HD video lectures (${totalDuration || '11h 44m'}).`,
                        'AST Projects: Using Stockfish AI as Chess Engine for Console-Chess and 3D Chess-Party, plus Physics-based and Projectile-based Darts.',
                        'Interaction & Game Programming (SS): 7 lessons (21 hours in total) covering state-of-the-art Game Engines and guiding students through the entire Game Creation Process together.'
                    ],
                    links: [
                        { label: `Open All ${videoCount} AST Video Lectures`, url: 'pages/ast.html', icon: 'ph-play-circle', internal: true },
                        { label: 'View Teaching CV Dossier', url: 'pages/about.html?cat=work', icon: 'ph-user-focus', internal: true }
                    ]
                });
            }
            continue;
        }
        consolidatedProjects.push(p);
    }

    let itemsForScope = [];
    let categories = [];

    if (scope === 'interactive') {
        itemsForScope = consolidatedProjects.filter(p => p.category === 'interactive');
        categories = [
            { id: 'all', label: 'All Interactive' },
            { id: 'msc', label: 'M.Sc. Interactive Media' },
            { id: 'beng', label: 'B.Eng. Media Engineering' }
        ];
    } else if (scope === 'academic') {
        itemsForScope = consolidatedProjects.filter(p => p.category === 'academic');
        categories = [
            { id: 'all', label: 'All Research & Teaching' },
            { id: 'publications', label: 'PhD & Publications' },
            { id: 'xai', label: 'Explainable AI & CV' },
            { id: 'hci-vis', label: 'HCI & InfoVis' },
            { id: 'teaching', label: `Teaching` }
        ];
    } else {
        itemsForScope = consolidatedProjects;
        categories = [
            { id: 'all', label: 'All Works' },
            { id: 'interactive', label: 'Interactive Media & Eng.' },
            { id: 'academic', label: 'Academic Research' },
            { id: 'teaching', label: 'Teaching' }
        ];
    }

    const urlParams = new URLSearchParams(window.location.search);
    const initialCat = urlParams.get('cat');

    let activeCategory = initialCat && categories.some(c => c.id === initialCat) ? initialCat : 'all';
    let searchQuery = '';
    let allExpanded = false;
    const expandedIds = new Set(); // 100% collapsed on start

    const filterGroup = document.getElementById('projects-filter-group');
    const searchInput = document.getElementById('projects-search');
    const kpiTriggers = document.querySelectorAll('[data-proj-filter]');
    const toggleAllBtn = document.getElementById('toggle-all-projects');
    const toggleAllText = document.getElementById('toggle-all-proj-text');
    const toggleAllIcon = document.getElementById('toggle-all-proj-icon');

    const matchesCategory = (item, catId) => {
        if (catId === 'all') return true;
        if (catId === 'academic' && scope === 'all') return item.category === 'academic' && item.subCategory !== 'teaching';
        return item.category === catId || item.subCategory === catId;
    };

    const countByCat = (catId) => itemsForScope.filter(p => matchesCategory(p, catId)).length;
    const setElText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setElText('kpi-total-count', `${countByCat('all')} Showcases`);
    setElText('kpi-interactive-count', `${consolidatedProjects.filter(p => p.category === 'interactive').length} Projects`);
    setElText('kpi-academic-count', `${consolidatedProjects.filter(p => p.category === 'academic').length} Works`);
    setElText('kpi-lecture-count', `1 Showcase (${videoCount} Videos)`);
    setElText('kpi-msc-count', `${countByCat('msc')} M.Sc. Works`);
    setElText('kpi-beng-count', `${countByCat('beng')} B.Eng. Works`);
    setElText('kpi-xai-count', `${countByCat('xai')} AI Studies`);
    setElText('kpi-hcivis-count', `${countByCat('hci-vis')} Studies`);

    function renderFilterButtons() {
        if (!filterGroup) return;
        filterGroup.innerHTML = categories.map(cat => {
            const countLabel = cat.id === 'teaching'
                ? `${countByCat(cat.id)} • ${videoCount} Videos`
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
        const filtered = itemsForScope.filter(p => {
            if (!matchesCategory(p, activeCategory)) return false;
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
                    <h3 class="font-bold text-white mb-1">No matching works found</h3>
                    <p class="text-xs text-textMuted">Try clearing your search filter or switching categories.</p>
                </div>`;
            return;
        }

        const catBadgeStyle = {
            interactive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            academic: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            teaching: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };

        projectsGrid.innerHTML = filtered.map((p) => {
            const isExpanded = expandedIds.has(p.id) || q.length > 0 || allExpanded;
            const badgeKey = p.subCategory === 'teaching' ? 'teaching' : p.category;
            const badgeStyle = catBadgeStyle[badgeKey] || 'bg-white/10 text-gray-300 border-white/20';

            return `
            <article data-proj-id="${p.id}" class="project-card bento-card p-5 flex flex-col justify-between group cursor-pointer interactive ${isExpanded ? 'expanded' : ''}">
                <div>
                    <!-- Top Thumbnail Banner -->
                    <div class="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-border mb-4">
                        <img src="${resolveAsset(p.imageUrl)}" alt="${p.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"></div>

                        <!-- Top Overlay Badges: Domain & Year -->
                        <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${badgeStyle}">
                                ${highlightMatch(p.domain, searchQuery)}
                            </span>
                            <span class="px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white">
                                ${highlightMatch(p.year, searchQuery)}
                            </span>
                        </div>

                        <!-- Bottom Overlay Badge -->
                        <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
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

                    <!-- Title, Subtitle & Open Details Indicator -->
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

                    <!-- Inline Details Drawer (Used when "Expand All" or Search is active) -->
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
                                        ${p.links.map((lnk, idx) => {
                const href = lnk.internal ? resolveAsset(lnk.url) : lnk.url;
                return `
                                            <a href="${href}" ${lnk.internal ? '' : 'target="_blank" rel="noopener"'} onclick="event.stopPropagation()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${idx === 0 ? 'bg-white text-black hover:opacity-90' : 'bg-base border border-border text-white hover:bg-white/10'} text-xs font-bold transition-colors interactive">
                                                <i class="ph-bold ${lnk.icon || 'ph-arrow-up-right'}"></i>
                                                <span>${lnk.label}</span>
                                            </a>`;
            }).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </article>`;
        }).join('');

        // Clicking any project card opens the overlaying zoom & details modal
        projectsGrid.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-proj-id');
                const target = itemsForScope.find(item => item.id === id);
                if (target) openProjectOverlayModal(target);
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
                itemsForScope.forEach(p => expandedIds.add(p.id));
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
// 5. PAGE CONTROLLER: ABOUT ME (pages/about.html - Collapsed on Start)
// ============================================================================
function initAboutPage(allData) {
    const timelineFeed = document.getElementById('cv-timeline-feed');
    if (!timelineFeed) return;

    const cvEntries = allData.cvEntries || [];
    const cvCategories = allData.cvCategories || [];

    const urlCat = new URLSearchParams(window.location.search).get('cat');
    let activeCategory = urlCat && cvCategories.some(c => c.id === urlCat) ? urlCat : 'all';
    let searchQuery = '';
    let allExpanded = false;
    const expandedIds = new Set(); // Always collapsed on start

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
                                    <a href="${item.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:opacity-90 transition-colors interactive">
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
// 6. PAGE CONTROLLER: AST LECTURE SERIES (pages/ast.html - Collapsed on Start)
// ============================================================================
function initAstPage(lectures) {
    const lectureContainer = document.getElementById('lecture-feed');
    if (!lectureContainer) return;

    const searchInput = document.getElementById('lecture-search');
    const filterGroup = document.getElementById('ast-filter-group');
    const kpiTriggers = document.querySelectorAll('[data-ast-filter]');
    const toggleAllBtn = document.getElementById('toggle-all-lectures');
    const toggleAllText = document.getElementById('toggle-all-ast-text');
    const toggleAllIcon = document.getElementById('toggle-all-ast-icon');

    const categories = [
        { id: 'all', label: 'All Lectures' },
        { id: 'cpp', label: 'Plain C++ & Stockfish' },
        { id: 'chess3d', label: 'UE5 3D Chess-Party' },
        { id: 'darts', label: 'UE5 Darts' }
    ];

    let activePhase = 'all';
    let searchQuery = '';
    let allExpanded = false;
    const expandedIds = new Set(); // Always collapsed on start

    const countByPhase = (phaseId) => phaseId === 'all' ? lectures.length : lectures.filter(l => l.phase === phaseId).length;
    const totalRuntime = sumLectureDurations(lectures);
    const totalRuntimeEl = document.getElementById('ast-kpi-total');
    if (totalRuntimeEl) totalRuntimeEl.textContent = `${lectures.length} Videos (${totalRuntime || '11h 44m'})`;

    function renderPhaseButtons() {
        if (!filterGroup) return;
        filterGroup.innerHTML = categories.map(cat => {
            const count = countByPhase(cat.id);
            const isActive = cat.id === activePhase;
            const cls = isActive
                ? 'ast-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-black transition-all interactive'
                : 'ast-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold text-textMuted hover:text-white hover:bg-white/5 transition-all interactive';
            return `<button data-phase="${cat.id}" class="${cls}">${cat.label} (${count})</button>`;
        }).join('');

        filterGroup.querySelectorAll('.ast-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activePhase = btn.getAttribute('data-phase');
                renderPhaseButtons();
                renderLectures();
            });
        });
    }

    function renderLectures() {
        const q = searchQuery.toLowerCase().trim();
        const filtered = lectures.filter(p => {
            if (activePhase !== 'all' && p.phase !== activePhase) return false;
            if (!q) return true;
            const hay = [p.title, p.summary, p.date, p.duration, p.content].join(' ').toLowerCase();
            return hay.includes(q);
        });

        if (filtered.length === 0) {
            lectureContainer.innerHTML = `
                <div class="bento-card p-12 text-center border-dashed">
                    <i class="ph ph-magnifying-glass text-4xl text-textMuted mb-3"></i>
                    <h3 class="text-lg font-bold text-white mb-1">No lectures found</h3>
                    <p class="text-sm text-textMuted">Try clearing your search filter or selecting "All Lectures".</p>
                </div>`;
            return;
        }

        const phaseLabels = {
            intro: { text: 'Introduction • Unreal Engine 5', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
            cpp: { text: 'Phase 1 • Plain C++ & Stockfish', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
            chess3d: { text: 'Phase 2 • UE5 3D Chess-Party', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
            darts: { text: 'Phase 3 • UE5 Darts Systems', cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
        };

        lectureContainer.innerHTML = filtered.map((p) => {
            const isExpanded = expandedIds.has(p.id) || q.length > 0 || allExpanded;
            const slug = getProjectSlug(p);
            const targetUrl = `${BASE_PATH}pages/lecture.html?slug=${encodeURIComponent(slug)}`;
            const badge = phaseLabels[p.phase] || phaseLabels.chess3d;

            return `
            <article data-lec-id="${p.id}" class="lecture-card bento-card p-4 md:p-5 group block cursor-pointer interactive ${isExpanded ? 'expanded' : ''}">
                <a href="${targetUrl}" onclick="event.stopPropagation()" class="relative w-full aspect-[21/9] md:aspect-[16/7] rounded-xl overflow-hidden mb-4 bg-border block group/vid">
                    <img src="${resolveAsset(p.imageUrl)}" alt="${p.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover/vid:scale-105">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
                    <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${badge.cls}">
                        ${badge.text}
                    </span>
                    <span class="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-bold font-mono text-white flex items-center gap-1.5">
                        <i class="ph-fill ph-clock text-emerald-400"></i> ${p.duration || '0:00'}
                    </span>
                </a>

                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h3 class="text-lg md:text-xl font-bold text-white mb-1.5 group-hover:text-gray-200 transition-colors">${highlightMatch(p.title, searchQuery)}</h3>
                        <p class="text-xs md:text-sm text-gray-400 leading-relaxed">${highlightMatch(p.summary, searchQuery)}</p>
                    </div>
                    <div class="w-8 h-8 rounded-full border border-border bg-base flex items-center justify-center shrink-0 mt-0.5 group-hover:border-gray-400 transition-colors" title="Toggle Lecture Syllabus">
                        <i class="ph ph-caret-down text-sm text-white chevron-icon transition-transform duration-300"></i>
                    </div>
                </div>

                <div class="details-grid">
                    <div class="overflow-hidden">
                        <div class="pt-4 mt-4 border-t border-border/80 flex flex-col gap-3 text-xs leading-relaxed">
                            <p class="text-[10px] uppercase tracking-widest text-textMuted font-bold">Lecture Syllabus & Topics Covered</p>
                            <div class="space-y-2.5 text-textMuted">
                                ${formatLectureContent(p.content)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-center mt-5 pt-3 border-t border-border/60">
                    <div class="text-[10px] md:text-xs text-textMuted font-mono flex items-center gap-3">
                        <span>Added: <strong class="text-white">${highlightMatch(p.date || 'Unknown', searchQuery)}</strong></span>
                        <span class="hidden sm:inline">•</span>
                        <span class="hidden sm:inline text-gray-400">Click card for syllabus</span>
                    </div>

                    <a href="${targetUrl}" onclick="event.stopPropagation()" class="h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-10 group-hover:w-[104px] overflow-hidden relative z-20 interactive">
                        <div class="w-9 h-9 bg-white rounded-full flex shrink-0 items-center justify-center shadow-lg absolute">
                            <i class="ph-fill ph-play text-black text-lg ml-0.5"></i>
                        </div>
                        <span class="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap absolute right-3.5">Watch</span>
                    </a>
                </div>
            </article>`;
        }).join('');

        lectureContainer.querySelectorAll('.lecture-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-lec-id');
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
            activePhase = btn.getAttribute('data-ast-filter');
            renderPhaseButtons();
            renderLectures();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderLectures();
        });
    }

    if (toggleAllBtn) {
        toggleAllBtn.addEventListener('click', () => {
            allExpanded = !allExpanded;
            if (allExpanded) {
                lectures.forEach(l => expandedIds.add(l.id));
                toggleAllText.textContent = 'Collapse All';
                toggleAllIcon.className = 'ph ph-arrows-in-line-vertical';
            } else {
                expandedIds.clear();
                toggleAllText.textContent = 'Expand All';
                toggleAllIcon.className = 'ph ph-arrows-out-line-vertical';
            }
            renderLectures();
        });
    }

    renderPhaseButtons();
    renderLectures();
}

// ============================================================================
// 7. PAGE CONTROLLER: TECH STACK ARSENAL (pages/stack.html)
// ============================================================================
function initStackPage(allData) {
    const stackGrid = document.getElementById('stack-bento-grid');
    if (!stackGrid) return;

    const combinedStack = allData.stack || [];

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
// 8. PAGE CONTROLLER: CONTACT (pages/contact.html)
// ============================================================================
function initContactPage(allData) {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const copyBtn = document.getElementById('copy-email-btn');
    const copyText = document.getElementById('copy-email-text');
    const copyIcon = document.getElementById('copy-email-icon');
    const emailEl = document.getElementById('email-address');
    const emailAddress = (allData.profile && allData.profile.email) || (emailEl ? emailEl.textContent.trim() : '');

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

        // 1. Render Shared Shell & Global Overlaying Modal
        renderSiteShell(allData);
        initGlobalModalListeners();
        initClockAndMenu();

        const updateEl = (id, prop, val) => {
            const el = document.getElementById(id);
            if (el && val !== undefined) el[prop] = val;
        };

        const projects = allData.projects || [];
        const lectures = allData.lectures || [];

        // 2. Initialize AST Page (pages/ast.html)
        initAstPage(lectures);

        // 3. Single Lecture Detail Page (pages/lecture.html)
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
                        <a href="${BASE_PATH}pages/lecture.html?slug=${encodeURIComponent(getProjectSlug(p))}" class="bento-card p-4 group block interactive">
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

        // 4. Home Page Marquees (Academic Marquee uses ONLY Academic & ASTLecture.png / ASTLogo.png, NOT individual AST01..10 lectures)
        const buildMarqueeBlock = (imageUrls) => {
            if (!imageUrls || imageUrls.length === 0) return '';
            const half = Math.ceil(imageUrls.length / 2);
            const renderCol = (slice) => slice.map((imgUrl, i) =>
                `<div><img src="${resolveAsset(imgUrl)}" alt="" class="w-full h-32 md:h-36 lg:h-44 object-cover rounded-[14px] bg-border ${i > 0 ? 'mt-2' : ''}"></div>`
            ).join('');
            return `
                <div class="w-full p-1.5 md:p-2">
                    <div class="grid grid-cols-2 gap-1.5 md:gap-2">
                        <div class="flex flex-col gap-1.5 md:gap-2">${renderCol(imageUrls.slice(0, half))}</div>
                        <div class="flex flex-col gap-1.5 md:gap-2 mt-4 md:mt-8">${renderCol(imageUrls.slice(half))}</div>
                    </div>
                </div>`;
        };

        const intMarquee = document.getElementById('interactive-marquee');
        if (intMarquee) {
            const interactiveImages = projects
                .filter(p => p.category === 'interactive' && p.imageUrl)
                .map(p => p.imageUrl);
            intMarquee.innerHTML = buildMarqueeBlock(interactiveImages).repeat(2);
        }

        const acadMarquee = document.getElementById('academic-marquee');
        if (acadMarquee) {
            const academicImages = projects
                .filter(p => (p.category === 'academic' || p.category === 'teaching') && p.imageUrl)
                .flatMap(p => p.secondaryImageUrl ? [p.imageUrl, p.secondaryImageUrl] : [p.imageUrl]);
            acadMarquee.innerHTML = buildMarqueeBlock(academicImages).repeat(2);
        }

        // 5. Slow Animated Horizontal Marquee for Stack Widget (#stack-container on index.html & pages/ast.html)
        const stackContainer = document.getElementById('stack-container');
        if (stackContainer && allData.stack) {
            const fullStack = allData.stack;
            const renderStackItem = (s) => `
                <span class="group/icon relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-[14px] bg-white flex items-center justify-center shadow-xl border-2 border-card transition-all duration-300 hover:-translate-y-2 hover:scale-110 hover:z-50 interactive flex-shrink-0 p-2">
                    ${renderStackIconGraphic(s, 'w-full h-full', 'text-lg md:text-xl')}
                    <span class="absolute -bottom-8 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg whitespace-nowrap z-50">${s.name}</span>
                </span>
            `;
            const trackItems = fullStack.map(renderStackItem).join('');
            stackContainer.className = "w-full overflow-hidden marquee-mask-x relative z-10 mt-5";
            stackContainer.innerHTML = `
                <div class="stack-marquee-track py-8">
                    ${trackItems}
                    ${trackItems}
                </div>
            `;
        }

        // 6. Featured Project Card
        if (allData.featuredProject) {
            updateEl('featured-img', 'src', resolveAsset(allData.featuredProject.imageUrl));
            updateEl('featured-title', 'textContent', allData.featuredProject.title);
            const featLink = document.getElementById('featured-link');
            if (featLink && allData.featuredProject.link) {
                featLink.setAttribute('href', resolveAsset(allData.featuredProject.link));
            }
        }

        // 7. Initialize Subpage Controllers
        initAboutPage(allData);
        initShowcasePage(allData);
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