import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const srcFile = 'packages/calculator-core/src/skills/static-skill-formulas.ts';
const content = readFileSync(srcFile, 'utf8');

const regex = /\/\/\s*==========================================\n\s*\/\/\s*([^\n]+)\n\s*\/\/\s*==========================================\n([\s\S]*?)(?=\/\/\s*==========================================|$)/g;

let match;
const blocks = [];

while ((match = regex.exec(content)) !== null) {
  let title = match[1].trim();
  let code = match[2].trim();
  
  // Example title: "WARLOCK (3rd Class)"
  let classNameRaw = title.split('(')[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // if code ends with a comma from the last property, remove it for the final file
  if (code.endsWith(',')) {
     code = code.slice(0, -1);
  }

  // Remove the trailing `SU_CN_METEOR: ... }` ending that might have caught the end of the object
  if (code.includes('};\n\nfunction calculateBoltSkill')) {
      code = code.split('};')[0].trim();
  }

  blocks.push({
    className: classNameRaw,
    title: title,
    code: code
  });
}

mkdirSync('packages/calculator-core/src/skills/classes', { recursive: true });

const registryImports = [];
const registryAdapters = [];
const indexExports = [];

for (const block of blocks) {
  // e.g. warlock, sorcerer, wizard-high-wizard
  let fileName = block.className;
  let classNameCamel = fileName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  let adapterName = `${classNameCamel}SkillFormula`;
  
  let newFileContent = `import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  ${block.code}
};

export class ${adapterName} implements SkillFormulaAdapter {
  readonly id = "${fileName}";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
`;
  
  writeFileSync(join('packages/calculator-core/src/skills/classes', `${fileName}.ts`), newFileContent, 'utf8');
  registryImports.push(`import { ${adapterName} } from "./classes/${fileName}";`);
  registryAdapters.push(`      new ${adapterName}(),`);
  indexExports.push(`export * from "./${fileName}";`);
}

// Generate the new registry text
const registryText = `import { GenericSkillFormula } from "./generic-skill";
import { ArchMageSkillFormula } from "./classes/arch-mage";
import { GuillotineCrossSkillFormula } from "./classes/guillotine-cross";
// Auto-generated imports
${registryImports.join('\n')}

import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "./skill-formula.types";

export class SkillFormulaRegistry {
  constructor(
    private readonly adapters: SkillFormulaAdapter[] = [
      new GuillotineCrossSkillFormula(),
      new ArchMageSkillFormula(),
${registryAdapters.join('\n')}
      new GenericSkillFormula(),
    ],
  ) {}

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    const adapter = this.adapters.find((candidate) =>
      candidate.supports(input.skill),
    );

    return (adapter ?? new GenericSkillFormula()).calculate(input);
  }
}
`;
writeFileSync('packages/calculator-core/src/skills/skill-formula-registry.ts', registryText, 'utf8');

const classIndexText = `export * from "./guillotine-cross";
export * from "./arch-mage";
${indexExports.join('\n')}
`;
writeFileSync('packages/calculator-core/src/skills/classes/index.ts', classIndexText, 'utf8');

console.log('Extraction complete. Blocks generated:', blocks.length);
