const fs = require('fs');
const path = require('path');
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
if (!fs.existsSync(pagePath)) { console.log("ERREUR: page.tsx introuvable"); process.exit(1); }
let content = fs.readFileSync(pagePath, 'utf8');
let modified = false;
if (!content.includes("import Link from") && !content.includes("import { Link }")) {
  content = "import Link from 'next/link';\n" + content;
  modified = true;
  console.log("Ajoute import Link");
}
const r1 = /<button([^>]*?)onClick=\{([^}]*?)\}([^>]*?)>\s*S['\u2019&#x27;]inscrire\s*<\/button>/g;
if (r1.test(content)) {
  content = content.replace(r1, function(m, b, o, a) {
    var c = (b+a).match(/className="([^"]*)"/);
    return '<Link href="/register"' + (c ? ' className="'+c[1]+'"' : '') + '>S\u2019inscrire</Link>';
  });
  modified = true;
  console.log("Remplace S'inscrire par Link");
}
const r2 = /<button([^>]*?)onClick=\{([^}]*?)\}([^>]*?)>\s*Se connecter\s*<\/button>/g;
if (r2.test(content)) {
  content = content.replace(r2, function(m, b, o, a) {
    var c = (b+a).match(/className="([^"]*)"/);
    return '<Link href="/login"' + (c ? ' className="'+c[1]+'"' : '') + '>Se connecter</Link>';
  });
  modified = true;
  console.log("Remplace Se connecter par Link");
}
if (content.includes('{/* <Hero3DBackground') || content.includes('{/*<Hero3DBackground')) {
  content = content.replace(/\{\/\*\s*<Hero3DBackground[^>]*\/>\s*\*\/\}/g, '<Hero3DBackground />');
  modified = true;
  console.log("De-commente Hero3DBackground");
}
if (modified) {
  fs.writeFileSync(pagePath, content, 'utf8');
  console.log("SUCCES: page.tsx modifie !");
} else {
  console.log("Aucune modification auto possible. Modification manuelle necessaire.");
}
