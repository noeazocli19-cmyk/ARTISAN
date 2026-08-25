const fs = require("fs");
let c = fs.readFileSync("src/components/artisan-dashboard.tsx", "utf8");

const oldSave = c.indexOf("const handleSave = async () => {");
if (oldSave === -1) { console.log("handleSave non trouve !"); process.exit(1); }

const setSavingFalse = c.indexOf("setSaving(false);", oldSave);
const endSave = c.indexOf("  };", setSavingFalse) + 4;

const newSave = `  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        userId: user?.id,
        specialties: form.profession ? [form.profession] : [],
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experience: parseInt(form.experience) || 0,
        location: form.location,
        country: form.country,
        address: form.address,
        bio: form.bio,
      };

      let res = await fetch("/api/artisans/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        res = await fetch("/api/artisans/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (res.ok) {
        setArtisanProfile(data.artisan);
        toast.success("Profil sauvegarde !", {
          description: data.artisan?.latitude
            ? "Coordonnees GPS: " + data.artisan.latitude.toFixed(4) + ", " + (data.artisan.longitude?.toFixed(4) || "")
            : undefined,
        });
        if (form.phone) {
          await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user?.id, phone: form.phone }),
          });
        }
      } else {
        toast.error("Erreur", { description: data.error || "Probleme de sauvegarde" });
      }
    } catch (error) {
      toast.error("Erreur reseau");
    } finally {
      setSaving(false);
    }
  };`;

c = c.substring(0, oldSave) + newSave + c.substring(endSave);
fs.writeFileSync("src/components/artisan-dashboard.tsx", c, "utf8");
console.log("OK ! handleSave corrige !");
