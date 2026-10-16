const fs = require('fs');
const path = require('path');
const https = require('https');

let rootDir = process.cwd();
if (!fs.existsSync(path.join(rootDir, 'images'))) {
    rootDir = path.resolve(__dirname, '../../');
}

const dataJsonPath = path.join(rootDir, 'assets/json/data.json');
const cmsFilePath = path.join(rootDir, 'assets/json/cms.json');

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

async function generateAllData() {
    if (!fs.existsSync(cmsFilePath)) {
        console.error("Error: assets/json/cms.json not found!");
        return;
    }

    try {
        const rawData = fs.readFileSync(cmsFilePath, 'utf8').replace(/^\uFEFF/, '');
        const cmsData = JSON.parse(rawData);
        const lectures = cmsData.lectures || [];
        let cmsUpdated = false;

        for (let i = 0; i < lectures.length; i++) {
            const l = lectures[i];
            if (!l.id) l.id = `proj_cms_${i + 1}`;
            if (l.videoUrl && (!l.date || !l.duration)) {
                const meta = await fetchYoutubeMeta(l.videoUrl);
                l.date = meta.date;
                l.duration = meta.duration;
                console.log(`Auto-filled YouTube Meta [${l.title}]: ${l.date} • ${l.duration}`);
                cmsUpdated = true;
            }
        }

        if (cmsUpdated) {
            fs.writeFileSync(cmsFilePath, JSON.stringify(cmsData, null, 2));
        }

        fs.writeFileSync(dataJsonPath, JSON.stringify(cmsData, null, 2));
        console.log(`[${new Date().toLocaleTimeString()}] ✓ data.json compiled from cms.json (${(cmsData.projects || []).length} projects, ${lectures.length} lectures, ${(cmsData.stack || []).length} stack items).`);
    } catch (err) {
        console.error("Error parsing cms.json:", err);
    }
}

generateAllData();

let debounceTimer;
if (fs.existsSync(cmsFilePath)) {
    fs.watch(cmsFilePath, () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generateAllData, 200);
    });
    console.log("Watching cms.json for live changes...");
}