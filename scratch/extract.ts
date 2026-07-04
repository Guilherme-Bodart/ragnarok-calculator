import * as fs from 'fs';
import { EnchantTable } from './nas-calc/src/app/constants/enchant_item/_enchant_table';

fs.writeFileSync('./scratch/enchant-raw.json', JSON.stringify(EnchantTable, null, 2));
console.log('Raw enchant table extracted to scratch/enchant-raw.json');
