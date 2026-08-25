"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ClipboardList, MapPin, Phone, DollarSign, FileText, Tag, Send, Loader2 } from "lucide-react"

const CATEGORIES = [
  { name: "Plomberie", icon: "🔧" },
  { name: "Électricité", icon: "⚡" },
  { name: "Menuiserie", icon: "🪚" },
  { name: "Peinture", icon: "🎨" },
  { name: "Serrurerie", icon: "🔐" },
  { name: "Maçonnerie", icon: "🧱" },
  { name: "Climatisation", icon: "❄️" },
  { name: "Nettoyage", icon: "🧹" },
  { name: "Cuisine", icon: "🍳" },
  { name: "Jardinage", icon: "🌿" },
  { name: "Réparation auto", icon: "🚗" },
  { name: "Autre", icon: "📦" },
]

export default function CreateMissionPage() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    location: "",
    phone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          budget: parseInt(form.budget) || 0,
          location: form.location,
          phone: form.phone,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Erreur lors de la création")
        return
      }

      alert("Mission publiée avec succès !")
      router.push("/missions")
    } catch {
      alert("Erreur réseau")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Publier une mission
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Décrivez votre problème pour trouver un artisan qualifié
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Catégorie */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Tag className="w-4 h-4 text-amber-500" />
              Catégorie <span className="text-gray-400 font-normal">(votre type de problème)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.name })}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    form.category === cat.name
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md scale-[1.02]"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <FileText className="w-4 h-4 text-amber-500" />
              Titre de la mission
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Fuite d'eau sous l'évier de la cuisine"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <FileText className="w-4 h-4 text-amber-500" />
              Description du problème
            </label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Décrivez votre problème en détail : ce qui se passe, depuis quand, ce que vous avez essayé..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none transition-all"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <DollarSign className="w-4 h-4 text-amber-500" />
              Budget estimé <span className="text-gray-400 font-normal">(FCFA)</span>
            </label>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="Ex: 15000"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          {/* Localisation */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              Votre localisation
            </label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ex: Cotonou, Akpakpa, Bénin"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Phone className="w-4 h-4 text-amber-500" />
              Votre numéro de téléphone
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Ex: +229 90 00 00 00"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
              Ce numéro sera visible par l'artisan qui accepte votre mission
            </p>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading || !form.category}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-lg hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publication en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Publier la mission
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}