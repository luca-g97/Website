const fs = require('fs');
const path = require('path');

// 1. Smart Root Detection
// Checks if the script is running from the root, or from inside assets/js/
let rootDir = process.cwd();
if (!fs.existsSync(path.join(rootDir, 'images'))) {
    rootDir = path.resolve(__dirname, '../../');
}

const dataJsonPath = path.join(rootDir, 'data.json');

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

function generateData() {
    let projects = [];
    let idCounter = 1;
    let foundAnyImages = false;

    console.log(`\nSearching for images inside: ${rootDir}`);

    for (const [category, folders] of Object.entries(directories)) {
        for (const folder of folders) {
            if (fs.existsSync(folder)) {
                const files = fs.readdirSync(folder).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));

                if (files.length > 0) {
                    foundAnyImages = true;
                    console.log(`Found ${files.length} images in: ${path.basename(folder)}`);
                }

                for (const file of files) {
                    // Extract the clean relative path for the HTML (e.g., "images/InteractiveMedia/PartyTime.png")
                    const relativePath = path.relative(rootDir, path.join(folder, file)).replace(/\\/g, '/');
                    projects.push({
                        id: `proj_${idCounter++}`,
                        category: category,
                        imageUrl: relativePath
                    });
                }
            } else {
                console.log(`Warning: Folder does not exist: ${folder}`);
            }
        }
    }

    if (!foundAnyImages) {
        console.log("\n⚠️ ERROR: No images were found! Please check that the script is running in the correct project folder.");
        return;
    }

    const finalData = { ...staticData, projects };
    fs.writeFileSync(dataJsonPath, JSON.stringify(finalData, null, 2));
    console.log(`\n[${new Date().toLocaleTimeString()}] data.json successfully generated with ${projects.length} projects!`);
}

// Run the generation
generateData();

// Watch the folders for live drag-and-drop changes
for (const folders of Object.values(directories)) {
    for (const folder of folders) {
        if (fs.existsSync(folder)) {
            fs.watch(folder, (eventType, filename) => {
                if (filename && /\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) {
                    setTimeout(generateData, 150); // Slight delay to ensure file copying completes
                }
            });
        }
    }
}
console.log("\nWatching image folders for live changes...");