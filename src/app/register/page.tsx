"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import ArtisanAnimation from "@/components/ArtisanAnimation";

const PROFESSIONS = [
  "Plombier", "Electricien", "Menuisier", "Peintre", "Macon", "Carreleur",
  "Couturier", "Coiffeur", "Mechanicien", "Soudeur", "Ferronnier", "Cuisiniste",
  "Tailleur", "Tolerantier", "Refrigerateur", "Autre"
];

const CATEGORIES = [
  "BTP", "Bois", "Metal", "Textile", "Beaute", "Alimentation", "Electromenager", "Autre"
];

const COUNTRIES = ["Benin"];

const NEIGHBORHOODS: Record<string, string[]> = {
  "Cotonou": ["Cadjehoun", "Fidjrosse", "Akpakpa", "Gbegamey", "Zogbo", "Sainte-Rita", "Jericho", "Ganhi", "Vossa", "Missebo", "Dantokpa", "Agla", "Godomey", "Wologuede", "Menontin", "Saint Michel", "Houeyiho", "Aidjedo"],
}

const CITIES: Record<string, string[]> = {
  "Benin": ["Cotonou", "Porto-Novo", "Abomey-Calavi", "Parakou", "Abomey", "Natitingou", "Bohicon", "Ouidah"],
};

export default function RegisterPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", confirmPassword: "",
    country: "Benin", city: "Cotonou", neighborhood: "",
    profession: "", category: "", experience: "", skills: "", bio: "",
  });

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const availableCities = CITIES[form.country] || [];
  const availableNeighborhoods = NEIGHBORHOODS[form.city] || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "country") next.city = "";
      return next;
    });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas."); return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres."); return;
    }
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError("Veuillez remplir tous les champs obligatoires."); return;
    }

    setLoading(true);
    try {
      const signUpRes = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.firstName + " " + form.lastName,
        }),
      });

      if (!signUpRes.ok) {
        const errData = await signUpRes.json().catch(() => ({}));
        throw new Error(errData.message || "Erreur lors de la creation du compte.");
      }

      setSuccess("Compte cree avec succes ! Redirection...");
      setTimeout(() => router.push("/choose-role"), 1200);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Email ou mot de passe incorrect.");
      }
      router.push("/dashboard/client");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition text-gray-900 placeholder:text-gray-400 bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50">
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-brand-100 px-6 py-3 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-brand-600 hover:text-brand-700 transition">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          <span className="font-medium">Retour</span>
        </button>
        <h1 className="text-lg font-bold text-brand-600">Finda</h1>
        <div className="w-20" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-xl border border-brand-100 overflow-hidden"
            >
              <div className="border-b border-brand-100 py-4 text-center">
                <h2 className="font-semibold text-brand-600">Créer un compte</h2>
              </div>

              <div className="p-6 sm:p-8">
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

                {!isLogin && (
                  <form onSubmit={handleRegister} className="space-y-5">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Prenom *</label>
                        <input name="firstName" value={form.firstName} onChange={handleChange} required className={inputCls} placeholder="Amadou" />
                      </div>
                      <div>
                        <label className={labelCls}>Nom *</label>
                        <input name="lastName" value={form.lastName} onChange={handleChange} required className={inputCls} placeholder="Diallo" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Email *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputCls} placeholder="amadou@email.com" />
                      </div>
                      <div>
                        <label className={labelCls}>Telephone *</label>
                        <input name="phone" type="tel" value={form.phone} onChange={handleChange} required className={inputCls} placeholder="+229 90 00 00 00" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Mot de passe *</label>
                        <div className="relative">
                          <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required minLength={8} className={`${inputCls} pr-10`} placeholder="Min. 8 caracteres" />
                          <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Confirmer *</label>
                        <div className="relative">
                          <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={handleChange} required className={`${inputCls} pr-10`} placeholder="Repetez le mot de passe" />
                          <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Pays *</label>
                        <select name="country" value={form.country} onChange={handleChange} required className={inputCls + " bg-white"}>
                          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Ville *</label>
                        {availableCities.length > 0 ? (
                          <select name="city" value={form.city} onChange={handleChange} required className={inputCls + " bg-white"}>
                            <option value="">-- Choisir --</option>
                            {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <input name="city" value={form.city} onChange={handleChange} required className={inputCls} placeholder="Votre ville" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Quartier</label>
                      {availableNeighborhoods.length > 0 ? (
                        <select name="neighborhood" value={form.neighborhood} onChange={handleChange} className={inputCls + " bg-white"}>
                          <option value="">-- Choisir --</option>
                          {availableNeighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      ) : (
                        <input name="neighborhood" value={form.neighborhood} onChange={handleChange} className={inputCls} placeholder="Cocody, Plateau, etc." />
                      )}
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold rounded-lg transition-all shadow-md">
                      {loading ? "Creation en cours..." : "Creer mon compte"}
                    </button>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                      <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-400">ou</span></div>
                    </div>
                    <button type="button" onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })} className="w-full h-11 flex items-center justify-center gap-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Continuer avec Google
                    </button>
                  </form>
                )}

                {isLogin && null}

                <p className="text-center text-sm text-gray-500 mt-6">
                  Vous avez déjà un compte ?{" "}
                  <button type="button" onClick={() => router.push("/login")} className="text-brand-600 font-semibold hover:underline">
                    Se connecter
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}