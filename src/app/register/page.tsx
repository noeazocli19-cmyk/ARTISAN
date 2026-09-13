"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        <h1 className="text-lg font-bold text-brand-600">Artisan Connect</h1>
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
                      <input name="neighborhood" value={form.neighborhood} onChange={handleChange} className={inputCls} placeholder="Cocody, Plateau, etc." />
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold rounded-lg transition-all shadow-md">
                      {loading ? "Creation en cours..." : "Creer mon compte"}
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