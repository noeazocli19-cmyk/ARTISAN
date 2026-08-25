const fs = require('fs');
const p = require('path');
const f = p.join(__dirname, 'src', 'app', 'register', 'page.tsx');
let c = fs.readFileSync(f, 'utf8');

// Ajouter text-gray-900 et placeholder:text-gray-400 aux inputs
c = c.replace(
  'const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"',
  'const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-gray-900 placeholder:text-gray-400 bg-white"'
);

fs.writeFileSync(f, c, 'utf8');
console.log("SUCCES: Texte des champs corrige");
