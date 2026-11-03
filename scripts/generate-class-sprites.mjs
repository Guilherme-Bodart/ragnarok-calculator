import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const classesDir = path.join(rootDir, "public", "sprites", "classes");

const endpoint =
  "https://api.costume.irowiki.org/render?downloadimage&accesstoken=3iznpprsozjn3nh6rvdvqn2fl89mo1jd";

// Official rAthena Job IDs for all selectable 3rd, 4th, and Expanded classes
const CLASS_JOB_SPECS = [
  // 4th Classes
  { id: "Dragon_Knight", jobId: "4252", gender: 1, head: 15 },
  { id: "Imperial_Guard", jobId: "4255", gender: 1, head: 14 },
  { id: "Arch_Mage", jobId: "4254", gender: 1, head: 16 },
  { id: "Elemental_Master", jobId: "4261", gender: 0, head: 15 },
  { id: "Windhawk", jobId: "4257", gender: 1, head: 17 },
  { id: "Troubadour", jobId: "4263", gender: 1, head: 18 },
  { id: "Trouvere", jobId: "4264", gender: 0, head: 16 },
  { id: "Cardinal", jobId: "4256", gender: 0, head: 14 },
  { id: "Inquisitor", jobId: "4262", gender: 1, head: 15 },
  { id: "Meister", jobId: "4253", gender: 1, head: 12 },
  { id: "Biolo", jobId: "4260", gender: 0, head: 17 },
  { id: "Shadow_Cross", jobId: "4258", gender: 1, head: 19 },
  { id: "Abyss_Chaser", jobId: "4259", gender: 1, head: 20 },
  { id: "Hyper_Novice", jobId: "4302", gender: 1, head: 1 },
  { id: "Spirit_Handler", jobId: "4303", gender: 1, head: 1 },
  { id: "Sky_Emperor", jobId: "4304", gender: 1, head: 15 },
  { id: "Soul_Ascetic", jobId: "4305", gender: 0, head: 15 },
  { id: "Shinkiro", jobId: "4306", gender: 1, head: 16 },
  { id: "Shiranui", jobId: "4307", gender: 0, head: 16 },
  { id: "Night_Watch", jobId: "4308", gender: 1, head: 18 },

  // 3rd & Expanded Classes
  { id: "Rune_Knight", jobId: "4054", gender: 1, head: 15 },
  { id: "Royal_Guard", jobId: "4066", gender: 1, head: 14 },
  { id: "Warlock", jobId: "4055", gender: 1, head: 16 },
  { id: "Sorcerer", jobId: "4067", gender: 0, head: 15 },
  { id: "Ranger", jobId: "4056", gender: 1, head: 17 },
  { id: "Minstrel", jobId: "4068", gender: 1, head: 18 },
  { id: "Wanderer", jobId: "4069", gender: 0, head: 16 },
  { id: "Arch_Bishop", jobId: "4057", gender: 0, head: 14 },
  { id: "Sura", jobId: "4070", gender: 1, head: 15 },
  { id: "Mechanic", jobId: "4058", gender: 1, head: 12 },
  { id: "Genetic", jobId: "4071", gender: 0, head: 17 },
  { id: "Guillotine_Cross", jobId: "4059", gender: 1, head: 19 },
  { id: "Shadow_Chaser", jobId: "4072", gender: 1, head: 20 },
  { id: "Star_Emperor", jobId: "4239", gender: 1, head: 15 },
  { id: "Soul_Reaper", jobId: "4240", gender: 0, head: 15 },
  { id: "Rebellion", jobId: "4215", gender: 1, head: 18 },
  { id: "Kagerou", jobId: "4211", gender: 1, head: 16 },
  { id: "Oboro", jobId: "4212", gender: 0, head: 16 },
  { id: "Death_Knight", jobId: "4047", gender: 1, head: 1 },
  { id: "Dark_Collector", jobId: "4049", gender: 1, head: 1 },
];

async function renderClassSprite(spec) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      gender: spec.gender,
      job: [spec.jobId],
      head: spec.head,
      headPalette: 1,
      headdir: 0,
      headgear: [0, 0, 0],
      garment: 0,
      bodyPalette: -1,
      madogearType: 0,
      action: 0,
      canvas: "160x200+80+165",
      outfit: 0,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${spec.id} (${spec.jobId})`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  await mkdir(classesDir, { recursive: true });
  let okCount = 0;

  for (const spec of CLASS_JOB_SPECS) {
    const outPath = path.join(classesDir, `${spec.id}.png`);
    if (existsSync(outPath)) {
      okCount++;
      continue;
    }
    try {
      const buffer = await renderClassSprite(spec);
      await writeFile(outPath, buffer);
      okCount++;
      console.log(`[OK] ${spec.id} (${buffer.byteLength} bytes)`);
    } catch (error) {
      console.error(`[ERR] ${spec.id}:`, error.message);
    }
  }

  console.log(`Done! ${okCount}/${CLASS_JOB_SPECS.length} class sprites ready.`);
}

main();
