"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ClipboardList, MapPin, Phone, DollarSign, FileText, Tag, Send, Loader2, Navigation, ArrowLeft, Wrench, Zap, Hammer, Paintbrush, KeyRound, BrickWall, Wind, Sparkles, UtensilsCrossed, TreePine, Car } from "lucide-react"
import { getIssuesForCategory } from "@/lib/categories-map"

// Centre par défaut : Cotonou (utilisé si la géolocalisation du navigateur échoue ou est refusée)
const COTONOU_COORDS = { latitude: 6.3703, longitude: 2.3912 }

const CATEGORIES = [
  { name: "Plomberie", icon: Wrench },
  { name: "Électricité", icon: Zap },
  { name: "Menuiserie", icon: Hammer },
  { name: "Peinture", icon: Paintbrush },
  { name: "Serrurerie", icon: KeyRound },
  { name: "Maçonnerie", icon: BrickWall },
  { name: "Climatisation", icon: Wind },
  { name: "Nettoyage", icon: Sparkles },
  { name: "Cuisine", icon: UtensilsCrossed },
  { name: "Jardinage", icon: TreePine },
  { name: "Réparation auto", icon: Car },
  { name: "Autre", icon: ClipboardList },
]

export default function CreateMissionPage() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [step, setStep] = useState<"category" | "details">("category")
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState("")
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    location: "",
    phone: "",
  })

  const handleSelectCategory = (categoryName: string) => {
    setForm({ ...form, category: categoryName })
    setSelectedIssue("")
    setStep("details")
  }

  const handleBackToCategory = () => {
    setStep("category")
  }

  const handleSelectIssue = (issue: string) => {
    setSelectedIssue(issue)
    // Préremplit le titre avec le sous-problème choisi (reste modifiable ensuite)
    setForm((f) => ({ ...f, title: issue === "Autre" ? "" : `${issue} — ${f.category}` }))
  }

  const handleUseMyLocation = () => {
    setLocating(true)
    if (!navigator.geolocation) {
      setCoords(COTONOU_COORDS)
      setLocating(false)
      alert("La géolocalisation n'est pas disponible sur votre appareil. Merci de saisir votre adresse manuellement.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ latitude, longitude })
        try {
          const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`)
          const data = await res.json()
          if (data.success && data.formattedAddress) {
            setForm((f) => ({ ...f, location: data.formattedAddress }))
          }
        } catch {
          // Si le géocodage inverse échoue, on garde quand même les coordonnées
        } finally {
          setLocating(false)
        }
      },
      () => {
        // Refus ou échec : on retombe sur le centre de Cotonou par défaut
        setCoords(COTONOU_COORDS)
        setLocating(false)
        alert("Localisation refusée ou indisponible. Vous pouvez saisir votre adresse manuellement.")
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

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
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
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

  const selectedCategoryData = CATEGORIES.find((c) => c.name === form.category)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Publier une mission
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {step === "category"
                ? "Quel type de travail recherchez-vous ?"
                : "Décrivez votre problème pour trouver un artisan qualifié"}
            </p>
          </div>
        </div>

        {/* ─── ÉTAPE 1 : choix du métier / service recherché ─── */}
        {step === "category" && (
          <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              <Tag className="w-4 h-4 text-brand-500" />
              Choisissez le service recherché
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleSelectCategory(cat.name)}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-br hover:from-brand-500 hover:to-brand-600 hover:text-white transition-all hover:scale-[1.03] hover:shadow-md"
                >
                  <span className="text-2xl">
                    {(() => {
                      const Icon = cat.icon as any
                      return <Icon className="w-7 h-7" />
                    })()}
                  </span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── ÉTAPE 2 : formulaire dédié au métier choisi ─── */}
        {step === "details" && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Rappel du métier choisi + bouton retour */}
            <div className="flex items-center justify-between bg-brand-50 dark:bg-brand-950 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 font-medium text-brand-700 dark:text-brand-300">
                <span className="text-xl">{selectedCategoryData?.icon && (() => { const Icon = selectedCategoryData.icon as any; return <Icon className="w-5 h-5" /> })()}</span>
                <span>{form.category}</span>
              </div>
              <button
                type="button"
                onClick={handleBackToCategory}
                className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Changer de métier
              </button>
            </div>

            {/* Sous-problème dynamique selon le métier choisi */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Tag className="w-4 h-4 text-brand-500" />
                Précisez le problème
              </label>
              <div className="flex flex-wrap gap-2">
                {getIssuesForCategory(form.category).map((issue) => (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => handleSelectIssue(issue)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedIssue === issue
                        ? "bg-brand-500 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>

            {/* Titre */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <FileText className="w-4 h-4 text-brand-500" />
                Titre de la mission
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Fuite d'eau sous l'évier de la cuisine"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <FileText className="w-4 h-4 text-brand-500" />
                Description du problème
              </label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Décrivez votre problème en détail : ce qui se passe, depuis quand, ce que vous avez essayé..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none transition-all"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <DollarSign className="w-4 h-4 text-brand-500" />
                Budget estimé <span className="text-gray-400 font-normal">(FCFA)</span>
              </label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="Ex: 15000"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>

            {/* Localisation */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <MapPin className="w-4 h-4 text-brand-500" />
                Votre localisation
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Ex: Cotonou, Akpakpa, Bénin"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={locating}
                  title="Utiliser ma position actuelle"
                  className="shrink-0 px-3.5 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
                {coords ? "Position détectée — utilisée pour trouver les artisans les plus proches de vous." : "Astuce : utilisez le bouton pour partager votre position et trouver plus vite un artisan proche."}
              </p>
            </div>

            {/* Téléphone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Phone className="w-4 h-4 text-brand-500" />
                Votre numéro de téléphone
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Ex: +229 90 00 00 00"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
                Ce numéro sera visible par l'artisan qui accepte votre mission
              </p>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading || !form.category}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-lg hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
        )}
      </div>
    </div>
  )
}
