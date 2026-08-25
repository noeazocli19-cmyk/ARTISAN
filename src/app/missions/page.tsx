"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Search, MapPin, User, DollarSign, Plus, Tag, Clock, Loader2, Inbox } from "lucide-react"

const CATEGORIES = [
  "Plomberie", "Électricité", "Menuiserie", "Peinture",
  "Serrurerie", "Maçonnerie", "Climatisation", "Nettoyage",
  "Cuisine", "Jardinage", "Réparation auto", "Autre"
]

const STATUS_COLORS: Record<string, string> = {
  ouverte: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  assignee: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  en_cours: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  terminee: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  annulee: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

export default function MissionsPage() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [missions, setMissions] = useState<any[]>([])
  const [artisanCategories, setArtisanCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/artisans/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.artisan) {
            const specs = JSON.parse(data.artisan.specialties || "[]")
            const merged = data.artisan.profession
              ? [...new Set([data.artisan.profession, ...specs])]
              : specs
            setArtisanCategories(merged)
          }
        })
        .catch(() => {})
    }
  }, [session?.user?.id])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("status", "ouverte")
    if (selectedCategory !== "all") params.set("category", selectedCategory)

    fetch(`/api/missions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setMissions(data.missions || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedCategory])

  const isArtisan = session?.user?.role === "artisan"
  const displayCategories = isArtisan && artisanCategories.length > 0 ? artisanCategories : CATEGORIES

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Missions disponibles
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {isArtisan ? "Missions correspondant à votre métier" : "Toutes les missions publiées"}
              </p>
            </div>
          </div>
          {session?.user?.role === "client" && (
            <button
              onClick={() => router.push("/missions/create")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Publier
            </button>
          )}
        </div>

        {/* Filtres catégorie */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Toutes
          </button>
          {displayCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Liste missions */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement...
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-lg mb-1">Aucune mission disponible</p>
            <p className="text-sm">Revenez plus tard ou changez de catégorie</p>
          </div>
        ) : (
          <div className="space-y-4">
            {missions.map((mission: any) => (
              <div
                key={mission.id}
                onClick={() => router.push(`/missions/${mission.id}`)}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-800 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {mission.title}
                  </h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[mission.status] || "bg-gray-100 text-gray-600"}`}>
                    {mission.status}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {mission.description}
                </p>

                <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs font-medium">
                    <Tag className="w-3 h-3" />
                    {mission.category}
                  </span>
                  {mission.budget > 0 && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {mission.budget.toLocaleString()} FCFA
                    </span>
                  )}
                  {mission.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {mission.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {mission.client?.name || "Client"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(mission.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}