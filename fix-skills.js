const fs = require("fs");
let c = fs.readFileSync("src/components/artisan-dashboard.tsx", "utf8");

const parseArr = (field) =>
  `(Array.isArray(${field}) ? ${field} : JSON.parse(${field} || "[]"))`;

c = c.replace(
  /data\.artisan\.skills\?\.join\([^)]+\)/g,
  parseArr("data.artisan.skills") + "?.join(', ')"
);
c = c.replace(
  /data\.artisan\.specialties\?\.join\([^)]+\)/g,
  parseArr("data.artisan.specialties") + "?.join(', ')"
);
c = c.replace(
  /data\.artisan\.certifications\?\.join\([^)]+\)/g,
  parseArr("data.artisan.certifications") + "?.join(', ')"
);

fs.writeFileSync("src/components/artisan-dashboard.tsx", c, "utf8");
console.log("OK fix applique !");
