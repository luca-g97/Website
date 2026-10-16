// Function to bind cursor hover states (reusable for dynamically injected content)
function bindCursorEvents() {
    const handleMouseEnter = () => document.body.classList.add('hovering-interactive');
    const handleMouseLeave = () => document.body.classList.remove('hovering-interactive');

    document.querySelectorAll('a, button, .interactive').forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
    });
}

// Helper: Extract YouTube ID from URL
function getYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
}

// Helper: Guarantees a valid slug (checks lowercase, uppercase, or generates from title)
function getProjectSlug(p) {
    if (!p) return '';
    if (p.slug) return p.slug.trim();
    if (p.Slug) return p.Slug.trim();
    if (p.title || p.Title) {
        return (p.title || p.Title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    return p.id || '';
}

// Helper: Format CMS plain-text/Markdown content into styled HTML blocks
function formatLectureContent(rawContent) {
    if (!rawContent) return '<p class="text-textMuted">No content available for this lecture yet.</p>';

    const lines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
    let html = '';
    let inList = false;
    let sectionIndex = 1;
    let justOpenedHeading = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 1. Bullet Points (- ...)
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

        // 2. Explicit Markdown Headings (### ...) or "Introduction" / "Conclusion..."
        if (line.startsWith('### ') || /^Introduction$/i.test(line) || /^Conclusion/i.test(line)) {
            const cleanTitle = line.replace(/^###\s*/, '');
            html += `<h2 class="text-lg md:text-xl font-bold text-white mt-4 first:mt-0">${cleanTitle}</h2>`;
            justOpenedHeading = true;
            continue;
        }

        // 3. Numbered Headings (e.g. "1. Navigating the Epic Games Launcher")
        if (/^\d+\.\s+/.test(line)) {
            const cleanTitle = line.replace(/^\d+\.\s+/, '');
            html += `<h2 class="text-lg md:text-xl font-bold text-white mt-4 first:mt-0">${sectionIndex++}. ${cleanTitle}</h2>`;
            justOpenedHeading = true;
            continue;
        }

        // 4. Subtitle line immediately following a numbered/section heading (if next line is a bullet)
        const nextLine = lines[i + 1] || '';
        if (justOpenedHeading && nextLine.startsWith('')) {
            html += `<p class="text-xs md:text-sm font-bold text-gray-300 -mt-3">${line}</p>`;
            justOpenedHeading = false;
            continue;
        }

        // 5. Standard Paragraph
        html += `<p class="text-xs md:text-sm text-textMuted leading-[1.8]">${line}</p>`;
        justOpenedHeading = false;
    }

    if (inList) html += '</ul>';
    return html;
}

// 1. Procedural CMS Injection
async function loadAndRenderPortfolio() {
    try {
        // Automatically detect if current page is inside /pages/ subfolder
        const basePath = window.location.pathname.includes('/pages/') ? '../' : '';

        let allData;
        try {
            const response = await fetch(`${basePath}assets/json/data.json?t=${Date.now()}`);
            allData = await response.json();
        } catch (e) {
            const initialDataEl = document.getElementById('initial-data');
            if (initialDataEl) allData = JSON.parse(initialDataEl.textContent);
        }

        if (!allData) return;

        // Profile (Safe updates with basePath prefix for relative images)
        const updateEl = (id, prop, val) => { const el = document.getElementById(id); if (el) el[prop] = val; };
        updateEl('profile-name', 'textContent', allData.profile.name);
        updateEl('profile-title', 'textContent', allData.profile.title);
        if (allData.profile.image) {
            const imgPath = allData.profile.image.startsWith('../') ? allData.profile.image : `${basePath}${allData.profile.image}`;
            updateEl('profile-img', 'src', imgPath);
        }

        // Render AST Lecture Cards
        const lectures = allData.projects.filter(p => p.category && p.category.toLowerCase() === 'lecture');

        // --- A. AST LECTURE FEED & SEARCH ENGINE (ast.html) ---
        const lectureContainer = document.getElementById('lecture-feed');
        const searchInput = document.getElementById('lecture-search');

        if (lectureContainer) {
            const lectures = allData.projects.filter(p => p.category === 'lecture');

            // Dynamic Highlighting Tool
            const highlightText = (text, query) => {
                if (!query || !text) return text;
                // Escape special characters to prevent regex breaking
                const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedQuery})`, 'gi');
                // Wraps matched text in a premium, subtle highlight
                return text.replace(regex, '<span class="bg-white/20 text-white px-1 rounded-sm" style="background: rgb(217 128 38)">$1</span>');
            };

            const renderLectures = (items, isSearching = false, query = '') => {
                // Empty State Handling
                if (items.length === 0) {
                    lectureContainer.innerHTML = `
                        <div class="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#2a2a2a] rounded-xl bg-[#121212]/50 fade-in-up">
                            <i class="ph ph-magnifying-glass text-4xl text-textMuted mb-3"></i>
                            <h3 class="text-lg font-bold text-white mb-1">No lectures found</h3>
                            <p class="text-sm text-textMuted">Try adjusting your search terms.</p>
                        </div>`;
                    return;
                }

                // Render Cards
                lectureContainer.innerHTML = items.map((p, i) => `
                    <a href="${`lecture.html?slug=${encodeURIComponent(p.slug)}`}" target="_blank" class="bento-card p-4 md:p-5 group block interactive ${isSearching ? 'animate-none opacity-100 transform-none' : 'fade-in-up'}" ${!isSearching ? `style="animation-delay: ${250 + (i * 100)}ms;"` : ''}>
                        <div class="relative w-full aspect-[21/9] md:aspect-[16/7] rounded-xl overflow-hidden mb-4 bg-border">
                            <img src="${p.imageUrl}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                        </div>
                        <h3 class="text-lg md:text-xl font-bold text-white mb-2">${highlightText(p.title, query)}</h3>
                        <p class="text-xs md:text-sm text-gray-400 mb-6 leading-relaxed max-w-[90%]">${highlightText(p.summary, query)}</p>
                        
                        <div class="flex justify-between items-end mt-auto">
                            <div class="text-[10px] md:text-xs text-textMuted font-mono">
                                <p>${highlightText(p.date || 'Unknown', query)}</p>
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

                // Re-bind cursor to new dynamically injected cards
                if (isSearching) bindCursorEvents();
            };

            // Initial Render (No highlights)
            renderLectures(lectures);

            // Real-time Search Listener
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.trim();
                    const lowerQuery = query.toLowerCase();
                    const filtered = lectures.filter(p =>
                        (p.title && p.title.toLowerCase().includes(lowerQuery)) ||
                        (p.summary && p.summary.toLowerCase().includes(lowerQuery)) ||
                        (p.date && p.date.toLowerCase().includes(lowerQuery))
                    );
                    // Pass the exact query text to the render engine
                    renderLectures(filtered, query.length > 0, query);
                });
            }
        }

        // --- B. SINGLE LECTURE DETAIL PAGE (lecture.html) ---
        const detailVideoContainer = document.getElementById('detail-video-container');
        if (detailVideoContainer) {
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('slug');

            // Find matching lecture by slug, or default to the first lecture
            const currentLecture = lectures.find(p => p.slug === slug) || lectures[0];

            if (currentLecture) {
                document.title = `${currentLecture.title} | Luca G.`;
                updateEl('detail-title', 'textContent', currentLecture.title);
                updateEl('detail-date', 'textContent', currentLecture.date || 'Unknown Date');
                updateEl('detail-duration', 'textContent', currentLecture.duration || '0:00');

                // Render Custom Video Thumbnail with Play Trigger
                const videoId = getYouTubeId(currentLecture.videoUrl);
                detailVideoContainer.innerHTML = `
                    <img src="${currentLecture.imageUrl}" alt="${currentLecture.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]">
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

                // Render Formatted Content
                const contentEl = document.getElementById('detail-content');
                if (contentEl) {
                    contentEl.innerHTML = formatLectureContent(currentLecture.content);
                }

                // Render "Other Tutorials" Sidebar
                const otherFeed = document.getElementById('other-tutorials-feed');
                if (otherFeed) {
                    const otherLectures = lectures.filter(p => p.slug !== currentLecture.slug);
                    const listToRender = otherLectures.length > 0 ? otherLectures : lectures;

                    otherFeed.innerHTML = listToRender.map(p => {
                        const slug = getProjectSlug(p);
                        const targetUrl = `lecture.html?slug=${encodeURIComponent(slug)}`;
                        return `
                        <a href="${targetUrl}" class="bento-card p-4 group block interactive">
                            <div class="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-border">
                                <img src="${p.imageUrl}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                            </div>
                            <h3 class="text-base font-bold text-white mb-1 leading-snug">${p.title}</h3>
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
                        </a>`;
                    }).join('');
                }
            }
        }

        // Marquee Builder
        const buildMarqueeBlock = (projects) => {
            if (!projects || projects.length === 0) return '';
            const half = Math.ceil(projects.length / 2);

            const col1 = projects.slice(0, half).map((p, i) =>
                `<div data-open="projects" data-id="${p.id}" class="interactive cursor-none"><img src="${p.imageUrl}" class="w-full h-32 md:h-36 lg:h-44 object-cover rounded-[14px] bg-border transition-transform duration-500 hover:scale-[1.02] ${i > 0 ? 'mt-2' : ''}"></div>`
            ).join('');

            const col2 = projects.slice(half).map((p, i) =>
                `<div data-open="projects" data-id="${p.id}" class="interactive cursor-none"><img src="${p.imageUrl}" class="w-full h-32 md:h-36 lg:h-44 object-cover rounded-[14px] bg-border transition-transform duration-500 hover:scale-[1.02] ${i > 0 ? 'mt-2' : ''}"></div>`
            ).join('');

            return `
                <div class="w-full p-1.5 md:p-2">
                    <div class="grid grid-cols-2 gap-1.5 md:gap-2">
                        <div class="flex flex-col gap-1.5 md:gap-2">${col1}</div>
                        <div class="flex flex-col gap-1.5 md:gap-2 mt-4 md:mt-8">${col2}</div>
                    </div>
                </div>`;
        };

        const intMarquee = document.getElementById('interactive-marquee');
        if (intMarquee) intMarquee.innerHTML = buildMarqueeBlock(allData.projects.filter(p => p.category === 'interactive')).repeat(2);

        const acadMarquee = document.getElementById('academic-marquee');
        if (acadMarquee) acadMarquee.innerHTML = buildMarqueeBlock(allData.projects.filter(p => p.category === 'academic')).repeat(2);

        // Stack
        const stackContainer = document.getElementById('stack-container');
        if (stackContainer && allData.stack) {
            stackContainer.innerHTML = allData.stack.map((s, i) => `
                <a href="${s.link}" target="_blank" class="group/icon relative w-10 h-10 sm:w-11 sm:h-11 md:w-[48px] md:h-[48px] lg:w-[52px] lg:h-[52px] rounded-[14px] bg-white flex items-center justify-center shadow-xl border-2 md:border-4 border-card transition-all duration-300 hover:-translate-y-2 hover:scale-110 interactive flex-shrink-0" style="z-index: ${50 - i}; margin-left: ${i > 0 ? '-12px' : '0'};">
                    <i class="ph-fill ${s.icon} ${s.color} text-xl md:text-2xl group-hover/icon:rotate-12 transition-transform duration-300"></i>
                    <span class="absolute -top-10 bg-white text-black text-[10px] font-bold px-2.5 py-1 rounded opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg whitespace-nowrap">${s.name}</span>
                </a>
            `).join('');
        }

        // Featured Project
        updateEl('featured-img', 'src', allData.featuredProject?.imageUrl);
        updateEl('featured-title', 'textContent', allData.featuredProject?.title);

        const featLink = document.getElementById('featured-link');
        if (featLink) featLink.setAttribute('data-id', allData.featuredProject?.id);

        // Bind Cursor Events AFTER DOM injection
        document.querySelectorAll('a, button, .interactive').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering-interactive'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering-interactive'));
        });

    } catch (error) {
        console.error('Failed to load project data:', error);
    }
}
loadAndRenderPortfolio();

// 2. Clock Logic
function updateClock() {
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    clockEl.textContent = `${hours}:${minutes} ${monthNames[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}, ${now.getFullYear()}`;
}
setInterval(updateClock, 1000); updateClock();

// 3. Cursor Movement
const cursorWrapper = document.getElementById('cursor-wrapper');
if (cursorWrapper) {
    window.addEventListener('mousemove', (e) => {
        cursorWrapper.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
}

// 4. Menu Toggle
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