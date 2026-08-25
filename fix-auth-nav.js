const fs = require('fs');
const p = require('path');
const f = p.join(__dirname, 'src', 'app', 'page.tsx');
let c = fs.readFileSync(f, 'utf8');
let m = false;

// 1. Remplacer handleOpenAuth : au lieu d'ouvrir le modal, naviguer
// Ancien: setAuthModalTab(tab || 'login') + setAuthModalOpen(true)
// Nouveau: window.location.href = '/register' ou '/login'
if (c.includes("setAuthModalTab(tab || 'login')")) {
  c = c.replace(
    /setAuthModalTab\(tab \|\| 'login'\)\s*\n\s*setAuthModalOpen\(true\)/g,
    "if (tab === 'register') { window.location.href = '/register' } else { window.location.href = '/login' }"
  );
  m = true;
  console.log("1. handleOpenAuth change pour naviguer au lieu d'ouvrir modal");
}

// 2. Desactiver le AuthModal (le cacher au lieu de le rendre)
if (c.includes("<AuthModal")) {
  c = c.replace(
    /<AuthModal\s+open=\{authModalOpen\}/g,
    "<AuthModal open={false}"
  );
  m = true;
  console.log("2. AuthModal desactive (open=false)");
}

// 3. Remplacer les window.location.href sur les boutons hero aussi
// (deja fait mais verification)
if (c.includes("onOpenAuth('register')")) {
  c = c.replace(/onOpenAuth\('register'\)/g, "window.location.href='/register'");
  m = true;
  console.log("3. onOpenAuth('register') restant remplace");
}
if (c.includes("onOpenAuth('login')")) {
  c = c.replace(/onOpenAuth\('login'\)/g, "window.location.href='/login'");
  m = true;
  console.log("4. onOpenAuth('login') restant remplace");
}

if (m) {
  fs.writeFileSync(f, c, 'utf8');
  console.log("\nSUCCES: page.tsx corrige !");
} else {
  console.log("Aucun changement.");
}
