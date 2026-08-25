const fs = require('fs');
const p = require('path');
const f = p.join(__dirname, 'src', 'components', 'navbar.tsx');
let c = fs.readFileSync(f, 'utf8');

// Remplacer tous les onOpenAuth('register') par navigation directe
c = c.replace(/onOpenAuth\('register'\)/g, "window.location.href='/register'");
c = c.replace(/onOpenAuth\('login'\)/g, "window.location.href='/login'");

fs.writeFileSync(f, c, 'utf8');
console.log("SUCCES: Navbar corrige");
