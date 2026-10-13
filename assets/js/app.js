// 1. Procedural CMS Injection
async function loadAndRenderPortfolio() {
    try {
        let allData;
        try {
            const response = await fetch('data.json');
            allData = await response.json();
        } catch (e) {
            const initialDataEl = document.getElementById('initial-data');
            if (initialDataEl) allData = JSON.parse(initialDataEl.textContent);
        }

        if (!allData) return;

        // Profile (Safe updates)
        const updateEl = (id, prop, val) => { const el = document.getElementById(id); if (el) el[prop] = val; };
        updateEl('profile-name', 'textContent', allData.profile.name);
        updateEl('profile-title', 'textContent', allData.profile.title);
        updateEl('profile-img', 'src', allData.profile.image);

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