const fs = require("fs");
fs.mkdirSync("src/components", { recursive: true });
fs.mkdirSync("src/app/register", { recursive: true });
fs.mkdirSync("src/app/login", { recursive: true });

// Fichier 1: ArtisanAnimation
fs.writeFileSync("src/components/ArtisanAnimation.tsx", `"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function ArtisanAnimation({ showForm, onBagDropped }: { showForm: boolean; onBagDropped: () => void }) {
  const [phase, setPhase] = useState<"walk"|"drop"|"stand">("walk");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("drop"), 800);
    const t2 = setTimeout(() => { setPhase("stand"); onBagDropped(); }, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onBagDropped]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <motion.div className="absolute w-64 h-64 rounded-full bg-amber-100/30 dark:bg-amber-900/20" animate={{ scale:[1,1.1,1], rotate:[0,5,0] }} transition={{ duration:6, repeat:Infinity, ease:"easeInOut" }} style={{ top:"10%", left:"-10%" }} />
      <motion.div className="absolute w-48 h-48 rounded-full bg-orange-100/30 dark:bg-orange-900/20" animate={{ scale:[1,1.15,1], rotate:[0,-8,0] }} transition={{ duration:8, repeat:Infinity, ease:"easeInOut" }} style={{ bottom:"5%", right:"-5%" }} />
      <motion.svg viewBox="0 0 300 400" className="w-64 h-80 sm:w-72 sm:h-96" initial={{ x:-200, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ duration:0.8, ease:"easeOut" }}>
        <motion.ellipse cx="150" cy="385" rx="50" ry="8" fill="rgba(0,0,0,0.1)" animate={{ rx: phase==="stand"?55:50 }} transition={{ duration:0.3 }} />
        <motion.g animate={{ rotate: phase==="walk"?[0,10,0,-10,0]:0 }} transition={{ duration:0.6, repeat: phase==="walk"?Infinity:0, ease:"easeInOut" }} style={{ originX:"150px", originY:"280px" }}>
          <rect x="130" y="280" width="16" height="80" rx="8" fill="#8B6914" />
          <rect x="154" y="280" width="16" height="80" rx="8" fill="#8B6914" />
        </motion.g>
        <ellipse cx="138" cy="362" rx="14" ry="8" fill="#5C4033" />
        <ellipse cx="162" cy="362" rx="14" ry="8" fill="#5C4033" />
        <rect x="115" y="180" width="70" height="110" rx="12" fill="#D97706" />
        <rect x="125" y="175" width="8" height="30" rx="4" fill="#B45309" />
        <rect x="167" y="175" width="8" height="30" rx="4" fill="#B45309" />
        <rect x="135" y="240" width="30" height="20" rx="4" fill="#B45309" opacity="0.6" />
        <rect x="120" y="165" width="60" height="25" rx="8" fill="#FEF3C7" />
        <motion.g animate={{ rotate: phase==="drop"?[0,-20,0]:phase==="walk"?[0,-5,0,5,0]:0 }} transition={{ duration:0.5, ease:"easeInOut" }} style={{ originX:"120px", originY:"190px" }}>
          <rect x="95" y="185" width="25" height="60" rx="10" fill="#FEF3C7" />
          <circle cx="107" cy="248" r="8" fill="#D4A574" />
        </motion.g>
        <motion.g animate={{ rotate: phase==="drop"?[0,30,0]:phase==="walk"?[0,5,0,-5,0]:0 }} transition={{ duration:0.5, ease:"easeInOut" }} style={{ originX:"180px", originY:"190px" }}>
          <rect x="180" y="185" width="25" height="60" rx="10" fill="#FEF3C7" />
          <circle cx="193" cy="248" r="8" fill="#D4A574" />
        </motion.g>
        <circle cx="150" cy="140" r="35" fill="#D4A574" />
        <path d="M115 135 Q150 100 185 135" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
        <rect x="118" y="130" width="64" height="8" rx="4" fill="#D97706" />
        <rect x="110" y="132" width="80" height="6" rx="3" fill="#F59E0B" />
        <circle cx="140" cy="138" r="3" fill="#1C1917" />
        <circle cx="160" cy="138" r="3" fill="#1C1917" />
        <line x1="135" y1="132" x2="145" y2="133" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
        <line x1="155" y1="133" x2="165" y2="132" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
        <motion.path d="M140 148 Q150 155 160 148" fill="none" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" animate={{ d: phase==="stand"?"M140 150 Q150 160 160 150":"M140 148 Q150 155 160 148" }} transition={{ duration:0.3 }} />
        <AnimatePresence>
          {phase!=="walk" && (
            <motion.g initial={{ y:-50, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.5, ease:"easeOut" }}>
              <rect x="200" y="260" width="45" height="35" rx="5" fill="#92400E" />
              <path d="M200 260 L245 260 L240 248 L205 248 Z" fill="#B45309" />
              <path d="M210 248 Q222 235 235 248" fill="none" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
              <rect x="230" y="235" width="4" height="30" rx="2" fill="#78716C" />
              <rect x="218" y="270" width="10" height="8" rx="2" fill="#F59E0B" />
            </motion.g>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {phase==="stand" && (
            <>
              <motion.circle cx="225" cy="255" r="3" fill="#F59E0B" initial={{ opacity:0, scale:0 }} animate={{ opacity:[0,1,0], scale:[0,1.5,0] }} transition={{ duration:0.6 }} />
              <motion.circle cx="240" cy="260" r="2" fill="#D97706" initial={{ opacity:0, scale:0 }} animate={{ opacity:[0,1,0], scale:[0,1.2,0] }} transition={{ duration:0.5, delay:0.1 }} />
              <motion.circle cx="215" cy="250" r="2.5" fill="#FBBF24" initial={{ opacity:0, scale:0 }} animate={{ opacity:[0,1,0], scale:[0,1.3,0] }} transition={{ duration:0.55, delay:0.15 }} />
            </>
          )}
        </AnimatePresence>
      </motion.svg>
      <AnimatePresence>
        {phase==="stand" && !showForm && (
          <motion.div className="absolute top-4 right-2 sm:right-8 bg-white dark:bg-stone-800 rounded-2xl px-4 py-2 shadow-lg border border-amber-200 dark:border-amber-800" initial={{ opacity:0, y:10, scale:0.8 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, scale:0.8 }} transition={{ duration:0.3 }}>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Bienvenue artisan !</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
`, "utf8");
console.log("1/3 ArtisanAnimation.tsx OK");

// Fichier 2: Register page
fs.writeFileSync("src/app/register/page.tsx", `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArtisanAnimation } from "@/components/ArtisanAnimation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wrench, MapPin, Phone, Globe, Briefcase, Clock, User, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

const COUNTRIES = ["Benin","Senegal","Cote d'Ivoire","Cameroun","Mali","Burkina Faso","Togo","Niger","Guinee","Congo","Gabon","Madagascar"];
const PROFESSIONS = ["Plomberie","Electricite","Menuiserie","Peinture","Serrurerie","Maconnerie","Climatisation","Nettoyage","Soudure","Carrelage","Couture","Cuisine"];

export default function RegisterPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "artisan" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Erreur inscription"); setLoading(false); return; }
      const userId = data.user?.id;
      if (userId) {
        await fetch("/api/artisans/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId, specialties: profession ? [profession] : [],
            skills: skills.split(",").map(s=>s.trim()).filter(Boolean),
            experience: parseInt(experience)||0, location, country, bio,
          }),
        });
        if (phone) {
          await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, phone, location, country, bio }),
          });
        }
      }
      router.push("/dashboard");
    } catch (err:any) { setError(err.message || "Erreur reseau"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <button onClick={() => router.push("/")} className="absolute top-4 left-4 z-50 p-2 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors">
        <ArrowLeft className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </button>
      <div className="flex flex-col lg:flex-row min-h-screen">
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <ArtisanAnimation showForm={showForm} onBagDropped={() => setShowForm(true)} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <AnimatePresence>
            {showForm && (
              <motion.div className="w-full max-w-lg" initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5, ease:"easeOut" }}>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Devenir Artisan</h1>
                  <p className="text-muted-foreground mt-1">Creez votre compte et commencez a recevoir des missions</p>
                </div>
                {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Votre compte</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label htmlFor="name" className="flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Nom complet</Label><Input id="name" placeholder="Amadou Diallo" value={name} onChange={e=>setName(e.target.value)} required/></div>
                      <div className="space-y-1.5"><Label htmlFor="phone" className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> Telephone</Label><Input id="phone" type="tel" placeholder="+229 90 00 00 00" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
                    </div>
                    <div className="space-y-1.5"><Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> Email</Label><Input id="email" type="email" placeholder="amadou@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
                    <div className="space-y-1.5"><Label htmlFor="pw" className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5"/> Mot de passe</Label><div className="relative"><Input id="pw" type={showPw?"text":"password"} placeholder="Min. 8 caracteres" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
                  </div>
                  <div className="border-t border-amber-200 dark:border-amber-800"/>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Votre metier</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label htmlFor="prof" className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5"/> Metier principal</Label><select id="prof" value={profession} onChange={e=>setProfession(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" required><option value="">Choisir...</option>{PROFESSIONS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                      <div className="space-y-1.5"><Label htmlFor="exp" className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Annees d'experience</Label><Input id="exp" type="number" min="0" placeholder="5" value={experience} onChange={e=>setExperience(e.target.value)}/></div>
                    </div>
                    <div className="space-y-1.5"><Label htmlFor="skills" className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5"/> Competences (virgules)</Label><Input id="skills" placeholder="Soudure, Lecture de plans" value={skills} onChange={e=>setSkills(e.target.value)}/></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label htmlFor="loc" className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Quartier / Ville</Label><Input id="loc" placeholder="Agla, Cotonou" value={location} onChange={e=>setLocation(e.target.value)} required/></div>
                      <div className="space-y-1.5"><Label htmlFor="country" className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5"/> Pays</Label><select id="country" value={country} onChange={e=>setCountry(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" required><option value="">Choisir...</option>{COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                    </div>
                    <div className="space-y-1.5"><Label htmlFor="bio">Description</Label><Textarea id="bio" placeholder="Decrivez votre experience..." value={bio} onChange={e=>setBio(e.target.value)} rows={3}/></div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-base">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Creation en cours...</> : "Creer mon compte artisan"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">Deja un compte ? <a href="/login" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">Se connecter</a></p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          {!showForm && <motion.div className="text-center" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}><p className="text-lg text-amber-700 dark:text-amber-300 font-medium animate-pulse">L'artisan arrive...</p></motion.div>}
        </div>
      </div>
    </div>
  );
}
`, "utf8");
console.log("2/3 register/page.tsx OK");

// Fichier 3: Login page
fs.writeFileSync("src/app/login/page.tsx", `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, Wrench } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Email ou mot de passe incorrect"); setLoading(false); return; }
      const role = data.user?.role || "client";
      router.push(role === "artisan" ? "/dashboard" : "/");
    } catch (err:any) { setError(err.message || "Erreur reseau"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 flex items-center justify-center p-6">
      <button onClick={() => router.push("/")} className="absolute top-4 left-4 z-50 p-2 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors">
        <ArrowLeft className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </button>
      <motion.div className="w-full max-w-md" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="text-muted-foreground mt-1">Accedez a votre espace artisan</p>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> Email</Label><Input id="email" type="email" placeholder="amadou@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div className="space-y-1.5"><Label htmlFor="pw" className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5"/> Mot de passe</Label><div className="relative"><Input id="pw" type={showPw?"text":"password"} placeholder="Votre mot de passe" value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
          <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-base">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Connexion...</> : "Se connecter"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">Pas encore de compte ? <a href="/register" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">Creer un compte artisan</a></p>
      </motion.div>
    </div>
  );
}
`, "utf8");
console.log("3/3 login/page.tsx OK");
console.log("Tous les fichiers sont crees !");
