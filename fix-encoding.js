const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
  ['Ã©', 'é'], ['Ã¨', 'è'], ['Ãª', 'ê'], ['Ã«', 'ë'],
  ['Ã ', 'à'], ['Ã¢', 'â'], ['Ã®', 'î'], ['Ã¯', 'ï'],
  ['Ã´', 'ô'], ['Ã¶', 'ö'], ['Ã»', 'û'], ['Ã¹', 'ù'],
  ['Ã¼', 'ü'], ['Ã§', 'ç'],
  ['Ã‰', 'É'], ['Ã€', 'À'], ['Ã‡', 'Ç'], ['ÃŠ', 'Ê'],
  ['Ã”', 'Ô'], ['Ã›', 'Û'],
  ['â€™', '\u2019'], ['â€˜', '\u2018'],
  ['â€œ', '\u201C'], ['â€\x9d', '\u201D'],
  ['â€"', '\u2013'], ['â€"', '\u2014'],
  ['â€¦', '\u2026'],
  ['Å"', 'œ'], ['Å’', 'Œ'],
  ['Â«', '«'], ['Â»', '»'],
  ['Â°', '°'], ['Â ', ' '],
];

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', '.vercel', 'dist', 'build']);

let filesScanned = 0;
let filesFixed = 0;
let totalReplacements = 0;

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      filesScanned++;
      let content;
      try {
        content = fs.readFileSync(fullPath, 'utf8');
      } catch (e) {
        continue;
      }
      let newContent = content;
      let fileReplacements = 0;
      for (const [bad, good] of REPLACEMENTS) {
        const count = newContent.split(bad).length - 1;
        if (count > 0) {
          newContent = newContent.split(bad).join(good);
          fileReplacements += count;
        }
      }
      if (fileReplacements > 0) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        filesFixed++;
        totalReplacements += fileReplacements;
        console.log(`Corrige: ${fullPath} (${fileReplacements} caracteres)`);
      }
    }
  }
}

console.log('Demarrage de la correction des caracteres mal encodes...\n');
walk(path.join(process.cwd(), 'src'));
console.log(`\n=== TERMINE ===`);
console.log(`Fichiers scannes: ${filesScanned}`);
console.log(`Fichiers corriges: ${filesFixed}`);
console.log(`Caracteres corriges au total: ${totalReplacements}`);
