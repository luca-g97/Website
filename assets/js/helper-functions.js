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

// 2. Define the exact folder paths
const directories = {
    interactive: [path.join(rootDir, 'images/InteractiveMedia'), path.join(rootDir, 'images/MediaEngineering')],
    academic: [path.join(rootDir, 'images/ScientificContributions'), path.join(rootDir, 'images/Lectures')]
};

const staticData = {
    profile: {
        name: "Luca Geiger",
        title: "M.Sc. B.Eng.",
        image: "images/Portrait.jpg"
    },
    featuredProject: {
        id: "proj_ludaviz",
        title: "LudaViz",
        imageUrl: "images/LudaViz.png"
    },
    stack: [
        { name: "Slack", icon: "ph-slack-logo", color: "text-black", link: "#" },
        { name: "Figma", icon: "ph-figma-logo", color: "text-black", link: "#" },
        { name: "Framer", icon: "ph-framer-logo", color: "text-black", link: "#" },
        { name: "React", icon: "ph-atom", color: "text-purple-600", link: "#" },
        { name: "Google", icon: "ph-google-logo", color: "text-blue-500", link: "#" }
    ]
};

// YouTube Scraper (No API Key Required)
function fetchYoutubeMeta(url) {
    return new Promise((resolve) => {
        if (!url || !url.includes('youtube.com')) return resolve({ date: "Unknown Date", duration: "0:00" });

        https.get(url, (res) => {
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => {
                const dateMatch = html.match(/itemprop="datePublished" content="(.*?)"/);
                const durationMatch = html.match(/"approxDurationMs":"(\d+)"/);

                let date = dateMatch ? new Date(dateMatch[1]).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "Unknown Date";
                let duration = "0:00";

                if (durationMatch) {
                    const totalSeconds = Math.floor(parseInt(durationMatch[1]) / 1000);
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const seconds = totalSeconds % 60;
                    duration = hours > 0
                        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                        : `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
                resolve({ date, duration });
            });
        }).on('error', () => resolve({ date: "Unknown", duration: "0:00" }));
    });
}

// Master function that combines both CMS Data and Local Images
async function generateAllData() {
    let allProjects = [];
    let idCounter = 1;

    console.log(`\nScanning images and parsing CMS...`);

    // --- STEP 1: Process CMS Data (Lectures) ---
    if (fs.existsSync(cmsFilePath)) {
        try {
            // Read the file and strip the invisible BOM character (\uFEFF) to prevent JSON parse errors
            let rawData = fs.readFileSync(cmsFilePath, 'utf8').replace(/^\uFEFF/, '');
            let cmsProjects = JSON.parse(rawData);
            let cmsUpdated = false;

            for (let p of cmsProjects) {
                // Ensure they have a unique ID for modal tracking later
                if (!p.id) p.id = `proj_cms_${idCounter++}`;

                if (p.videoUrl && (!p.date || !p.duration)) {
                    const meta = await fetchYoutubeMeta(p.videoUrl);
                    p.date = meta.date;
                    p.duration = meta.duration;
                    console.log(`Auto-filled YouTube Meta [${p.title}]: ${p.date} • ${p.duration}`);
                    cmsUpdated = true;
                }
            }

            // Save the scraped data back to cms.json so we don't spam YouTube requests
            if (cmsUpdated) fs.writeFileSync(cmsFilePath, JSON.stringify(cmsProjects, null, 2));

            // Add them to our master list
            allProjects.push(...cmsProjects);

        } catch (err) {
            console.error("Error parsing cms.json. Check for missing commas or quotes!", err);
        }
    }

    // --- STEP 2: Process Local Images (Marquees) ---
    let foundAnyImages = false;
    for (const [category, folders] of Object.entries(directories)) {
        for (const folder of folders) {
            if (fs.existsSync(folder)) {
                const files = fs.readdirSync(folder).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
                if (files.length > 0) foundAnyImages = true;

                for (const file of files) {
                    const relativePath = path.relative(rootDir, path.join(folder, file)).replace(/\\/g, '/');
                    allProjects.push({
                        id: `proj_img_${idCounter++}`,
                        category: category,
                        imageUrl: relativePath
                    });
                }
            }
        }
    }

    if (!foundAnyImages) console.log("⚠️ Warning: No local images were found in the specified folders.");

    // --- STEP 3: Write Master Data ---
    const finalData = { ...staticData, projects: allProjects };
    fs.writeFileSync(dataJsonPath, JSON.stringify(finalData, null, 2));
    console.log(`[${new Date().toLocaleTimeString()}] ♻ data.json successfully updated with ${allProjects.length} total projects!`);
}

// Run the generation
generateAllData();

// Debounce timer to prevent rapid duplicate builds when saving
let debounceTimer;
const triggerUpdate = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(generateAllData, 200);
};

// Watch image folders for drag-and-drop changes
for (const folders of Object.values(directories)) {
    for (const folder of folders) {
        if (fs.existsSync(folder)) {
            fs.watch(folder, (eventType, filename) => {
                if (filename && /\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) {
                    triggerUpdate();
                }
            });
        }
    }
}

// Watch CMS file for manual saves
if (fs.existsSync(cmsFilePath)) {
    fs.watch(cmsFilePath, (eventType, filename) => {
        triggerUpdate();
    });
}

console.log("Watching image folders and cms.json for live changes...");