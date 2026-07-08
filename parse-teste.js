const fs = require('fs');
const html = fs.readFileSync('teste.html', 'utf8');
const lines = html.split('\n');
let indent = 0;
let result = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<ul')) indent++;
  if (lines[i].includes('</ul')) indent--;
  
  if (lines[i].includes('class="p-cascadeselect-item-text')) {
     let text = lines[i].match(/>([^<]+)</);
     if (text) {
         result.push('  '.repeat(indent) + '- ' + text[1].trim());
     } else {
         let nextLine = lines[i+1];
         if (nextLine && !nextLine.includes('<')) {
             result.push('  '.repeat(indent) + '- ' + nextLine.replace('</span', '').replace('>', '').trim());
         } else if (nextLine && nextLine.includes('</span')) {
             result.push('  '.repeat(indent) + '- ' + nextLine.replace('</span', '').replace('>', '').trim());
         }
     }
  }
}
console.log(result.join('\n'));
