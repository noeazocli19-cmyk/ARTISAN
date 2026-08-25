const fs = require('fs');
const p = require('path');
const f = p.join(__dirname, 'src', 'app', 'page.tsx');
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/^import Link from 'next\/link';\n/, '');
fs.writeFileSync(f, c, 'utf8');
console.log("SUCCES: import Link supprime");
