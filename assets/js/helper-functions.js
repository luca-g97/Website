const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Smart Root Detection
let rootDir = process.cwd();
if (!fs.existsSync(path.join(rootDir, 'images'))) {
    rootDir = path.resolve(__dirname, '../../');
}

const dataJsonPath = path.join(rootDir, 'assets/json/data.json');
const cmsFilePath = path.join(rootDir, 'assets/json/cms.json');

// 2. Local Image Folders to Auto-Scan
const directories = {
    interactive: [
        path.join(rootDir, 'images/InteractiveMedia'),
        path.join(rootDir, 'images/MediaEngineering')
    ],
    academic: [
        path.join(rootDir, 'images/ScientificContributions'),
        path.join(rootDir, 'images/Lectures')
    ]
};

// Helper: Convert "BlackTideProtocol.png" -> "Black Tide Protocol"
function humanizeFilename(filename) {
    const name = path.parse(filename).name;
    return name
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]+/g, ' ')
        .trim();
}

// Helper: Convert folder name "InteractiveMedia" -> "Interactive Media"
function humanizeFolder(folderPath) {
    return path.basename(folderPath).replace(/([a-z])([A-Z])/g, '$1 $2');
}

// 3. YouTube Metadata Scraper (No API Key Required)
function fetchYoutubeMeta(url) {
    return new Promise((resolve) => {
        if (!url || !url.includes('youtube.com')) return resolve({ date: "Unknown Date", duration: "0:00" });
        https.get(url, (res) => {
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => {
                const dateMatch = html.match(/itemprop="datePublished" content="(.*?)"/);
                const durationMatch = html.match(/"approxDurationMs":"(\d+)"/);
                const date = dateMatch
                    ? new Date(dateMatch[1]).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                    : "Unknown Date";
                let duration = "0:00";
                if (durationMatch) {
                    const totalSeconds = Math.floor(parseInt(durationMatch[1], 10) / 1000);
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;
                    duration = hours > 0
                        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                        : `${minutes}:${String(seconds).padStart(2, '0')}`;
                }
                resolve({ date, duration });
            });
        }).on('error', () => resolve({ date: "Unknown", duration: "0:00" }));
    });
}

// 4. Master Compiler: cms.json + Local Images -> data.json
async function generateAllData() {
    if (!fs.existsSync(cmsFilePath)) {
        console.error("Error: assets/json/cms.json not found!");
        return;
    }

    try {
        const rawData = fs.readFileSync(cmsFilePath, 'utf8').replace(/^\uFEFF/, '');
        const cmsData = JSON.parse(rawData);

        // Support cms.json having either "projects" or "lectures" array
        const manualProjects = cmsData.projects || cmsData.lectures || [];
        let idCounter = 1;
        let cmsUpdated = false;

        for (const p of manualProjects) {
            if (!p.id) p.id = `proj_cms_${idCounter++}`;
            if (p.videoUrl && (!p.date || !p.duration)) {
                const meta = await fetchYoutubeMeta(p.videoUrl);
                p.date = meta.date;
                p.duration = meta.duration;
                console.log(`Auto-filled YouTube Meta [${p.title}]: ${p.date} • ${p.duration}`);
                cmsUpdated = true;
            }
        }

        // Persist scraped YouTube dates/durations back into cms.json
        if (cmsUpdated) {
            fs.writeFileSync(cmsFilePath, JSON.stringify(cmsData, null, 2));
        }

        // Track existing image URLs in cms.json so we don't duplicate them
        const existingImages = new Set(
            manualProjects.map(p => (p.imageUrl || '').replace(/\\/g, '/'))
        );

        const scannedProjects = [];
        for (const [category, folders] of Object.entries(directories)) {
            for (const folder of folders) {
                if (fs.existsSync(folder)) {
                    const files = fs.readdirSync(folder).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
                    for (const file of files) {
                        const relativePath = path.relative(rootDir, path.join(folder, file)).replace(/\\/g, '/');
                        if (!existingImages.has(relativePath)) {
                            scannedProjects.push({
                                id: `proj_img_${idCounter++}`,
                                title: humanizeFilename(file),
                                domain: humanizeFolder(folder),
                                category,
                                imageUrl: relativePath
                            });
                        }
                    }
                }
            }
        }

        const finalData = {
            ...cmsData,
            projects: [...manualProjects, ...scannedProjects]
        };

        fs.writeFileSync(dataJsonPath, JSON.stringify(finalData, null, 2));
        console.log(`[${new Date().toLocaleTimeString()}] ✓ data.json compiled (${finalData.projects.length} projects, ${(finalData.cvEntries || []).length} CV milestones).`);
    } catch (err) {
        console.error("Error parsing cms.json:", err);
    }
}

generateAllData();

let debounceTimer;
const triggerUpdate = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(generateAllData, 200);
};

for (const folders of Object.values(directories)) {
    for (const folder of folders) {
        if (fs.existsSync(folder)) {
            fs.watch(folder, (eventType, filename) => {
                if (filename && /\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) triggerUpdate();
            });
        }
    }
}

if (fs.existsSync(cmsFilePath)) {
    fs.watch(cmsFilePath, () => triggerUpdate());
}
console.log("Watching image folders and cms.json for live changes...");