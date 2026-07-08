import fs from 'node:fs';
import yaml from 'yaml';

const RATHENA_URL = 'https://raw.githubusercontent.com/rathena/rathena/master/db/re/job_basepoints.yml';
const OUT_FILE = 'packages/calculator-core/src/job-basepoints/job-basepoints.seed.ts';

async function run() {
  console.log('Downloading rAthena HP/SP table from ' + RATHENA_URL + '...');
  const res = await fetch(RATHENA_URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
  const text = await res.text();
  
  console.log('Parsing YAML...');
  const doc = yaml.parse(text);
  
  const entries = doc.Body || [];
  
  // Read our existing classIds to map
  const oldContent = fs.readFileSync(OUT_FILE, 'utf8');
  const classIdsSet = new Set<string>();
  const classIdRegex = /classIds:\s*\[([^\]]+)\]/g;
  let match;
  while ((match = classIdRegex.exec(oldContent)) !== null) {
    const ids = match[1].split(',').map(s => s.replace(/\"/g, '').trim()).filter(Boolean);
    ids.forEach(id => classIdsSet.add(id));
  }
  const myClassIds = Array.from(classIdsSet);
  
  const finalGroups = [];
  
  for (const entry of entries) {
    if (!entry.Job) continue;
    
    const jobNames = Array.isArray(entry.Job) ? entry.Job : [entry.Job];
    const mappedClassIds = [];
    
    for (const job of jobNames) {
        let matched = myClassIds.find(cid => cid === job || cid.replace(/_/g, '') === job);
        
        if (!matched) {
            const asBaby = 'Baby_' + job.replace('Baby', '');
            if (myClassIds.includes(asBaby)) matched = asBaby;
        }
        if (!matched) {
            const asHigh = job.replace('High', '') + '_High';
            if (myClassIds.includes(asHigh)) matched = asHigh;
        }
        
        if (!matched && job === 'SuperBabyE') matched = 'Super_Baby_E';
        if (!matched && job === 'SuperNoviceE') matched = 'Super_Novice_E';
        if (!matched && job === 'NoviceHigh') matched = 'Novice_High';
        if (!matched && job === 'BabySwordman') matched = 'Baby_Swordman';
        if (!matched && job === 'SwordmanHigh') matched = 'Swordman_High';
        
        if (!matched) {
            const underscore = job.replace(/([A-Z])/g, '_$1').replace(/^_/, '');
            if (myClassIds.includes(underscore)) matched = underscore;
        }

        if (!matched) {
            matched = job;
        }
        mappedClassIds.push(matched);
    }
    
    finalGroups.push({
        classIds: mappedClassIds,
        baseHp: entry.BaseHP || entry.HP || {},
        baseSp: entry.BaseSP || entry.SP || {}
    });
  }
  
  let finalOutput = `import type { JobBasepointsGroup } from "./job-basepoints.types";\n\nexport const jobBasepointGroups: JobBasepointsGroup[] = [\n`;
  for (const group of finalGroups) {
      finalOutput += `  {\n`;
      finalOutput += `    classIds: ${JSON.stringify(group.classIds)},\n`;
      finalOutput += `    baseHp: ${JSON.stringify(group.baseHp, null, 6).replace(/\\n/g, '\n')},\n`;
      finalOutput += `    baseSp: ${JSON.stringify(group.baseSp, null, 6).replace(/\\n/g, '\n')}\n`;
      finalOutput += `  },\n`;
  }
  finalOutput += `];\n`;
  
  fs.writeFileSync(OUT_FILE, finalOutput, 'utf8');
  console.log('Successfully generated new job-basepoints.seed.ts!');
}

run().catch(console.error);
