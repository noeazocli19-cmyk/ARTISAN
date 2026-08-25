const fs = require('fs');
const path = require('path');
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Enlever le import Link mal place au debut
content = content.replace(/^import Link from 'next\/link';\n/, '');

// Ajouter import Link apres 'use client' et les imports existants
if (!content.includes("import Link from")) {
  // Trouver la ligne 'use client' et ajouter apres
  content = content.replace(/('use client'|"use client")\n/, "$1\n\nimport Link from 'next/link';\n");
}

fs.writeFileSync(pagePath, content, 'utf8');
console.log("SUCCES: import Link replace apres use client");
