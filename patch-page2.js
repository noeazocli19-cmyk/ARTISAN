const fs = require('fs');
const path = require('path');
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');
let modified = false;

// Remplacer onOpenAuth('register') par navigation vers /register
if (content.includes("onOpenAuth('register')")) {
  content = content.replace(/onOpenAuth\('register'\)/g, "window.location.href='/register'");
  modified = true;
  console.log("Remplace onOpenAuth('register') par navigation /register");
}

// Remplacer onOpenAuth('login') par navigation vers /login
if (content.includes("onOpenAuth('login')")) {
  content = content.replace(/onOpenAuth\('login'\)/g, "window.location.href='/login'");
  modified = true;
  console.log("Remplace onOpenAuth('login') par navigation /login");
}

// De-commenter Hero3DBackground si commente
if (content.includes('{/* <Hero3DBackground') || content.includes('{/*<Hero3DBackground')) {
  content = content.replace(/\{\/\*\s*<Hero3DBackground[^>]*\/>\s*\*\/\}/g, '<Hero3DBackground />');
  modified = true;
  console.log("De-commente Hero3DBackground");
}

if (modified) {
  fs.writeFileSync(pagePath, content, 'utf8');
  console.log("SUCCES: page.tsx modifie !");
} else {
  console.log("Aucune modification faite.");
}
