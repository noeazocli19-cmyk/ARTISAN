'use client'

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  MapPin,
  Star,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Navigation,
  Users,
  Filter,
} from "lucide-react"

// ─── Mock Data ────────────────────────────────────────────────────────────────

const artisanLocations = [
  { id: "1", name: "Amadou Diallo", skill: "Plombier certifié", location: "Dakar, Sénégal", lat: 14.7167, lng: -17.4677, rating: 4.9, reviews: 127, badge: "Élite", price: "8 000 FCFA/h", avatar: "AD", avatarColor: "bg-amber-500" },
  { id: "2", name: "Fatou Ndiaye", skill: "Électricienne", location: "Abidjan, Côte d'Ivoire", lat: 5.3600, lng: -4.0083, rating: 4.8, reviews: 98, badge: "Top", price: "7 500 FCFA/h", avatar: "FN", avatarColor: "bg-emerald-500" },
  { id: "3", name: "Kofi Mensah", skill: "Menuisier artisan", location: "Accra, Ghana", lat: 5.6037, lng: -0.1870, rating: 4.9, reviews: 156, badge: "Élite", price: "9 000 FCFA/h", avatar: "KM", avatarColor: "bg-orange-500" },
  { id: "4", name: "Aïcha Bello", skill: "Peintre décoratrice", location: "Lomé, Togo", lat: 6.1319, lng: 1.2228, rating: 4.7, reviews: 73, badge: "Vérifié", price: "6 500 FCFA/h", avatar: "AB", avatarColor: "bg-teal-500" },
  { id: "5", name: "Moussa Traoré", skill: "Climaticien expert", location: "Bamako, Mali", lat: 12.6392, lng: -8.0029, rating: 4.8, reviews: 112, badge: "Top", price: "8 500 FCFA/h", avatar: "MT", avatarColor: "bg-cyan-500" },
  { id: "6", name: "Mariama Sow", skill: "Spécialiste nettoyage", location: "Conakry, Guinée", lat: 9.5092, lng: -13.7122, rating: 4.9, reviews: 201, badge: "Élite", price: "5 000 FCFA/h", avatar: "MS", avatarColor: "bg-violet-500" },
  { id: "7", name: "Issouf Ouédraogo", skill: "Maçon expert", location: "Ouagadougou, Burkina Faso", lat: 12.3723, lng: -1.5197, rating: 4.6, reviews: 89, badge: "Vérifié", price: "6 000 FCFA/h", avatar: "IO", avatarColor: "bg-rose-500" },
  { id: "8", name: "Adama Koné", skill: "Serrurier", location: "Bamako, Mali", lat: 12.6500, lng: -7.9833, rating: 4.7, reviews: 65, badge: "Vérifié", price: "5 500 FCFA/h", avatar: "AK", avatarColor: "bg-indigo-500" },
  { id: "9", name: "Kadiatou Bah", skill: "Nettoyeuse pro", location: "Conakry, Guinée", lat: 9.5350, lng: -13.6877, rating: 4.8, reviews: 143, badge: "Top", price: "4 500 FCFA/h", avatar: "KB", avatarColor: "bg-pink-500" },
  { id: "10", name: "Ousmane Camara", skill: "Électricien bâtiment", location: "Dakar, Sénégal", lat: 14.6937, lng: -17.4441, rating: 4.9, reviews: 178, badge: "Élite", price: "9 500 FCFA/h", avatar: "OC", avatarColor: "bg-amber-600" },
]

const categories = [
  "Toutes",
  "Plomberie",
  "Électricité",
  "Menuiserie",
  "Peinture",
  "Climatisation",
  "Nettoyage",
  "Maçonnerie",
  "Serrurerie",
]

const badgeColorMap: Record<string, string> = {
  "Élite": "bg-amber-500 text-white",
  "Top": "bg-emerald-500 text-white",
  "Vérifié": "bg-teal-500 text-white",
}

// ─── Component Props ──────────────────────────────────────────────────────────

interface ArtisanMapProps {
  onViewArtisan: (id: string) => void
  onBack: () => void
}

// ─── Artisan Map Component ────────────────────────────────────────────────────

export function ArtisanMap({ onViewArtisan, onBack }: ArtisanMapProps) {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Toutes")
  const [radius, setRadius] = useState([500])
  const [availableOnly, setAvailableOnly] = useState(false)
  const [selectedArtisanId, setSelectedArtisanId] = useState<string | null>(null)

  // Leaflet imports (dynamic, client-only)
  const [leafletComponents, setLeafletComponents] = useState<{
    MapContainer: any
    TileLayer: any
    Marker: any
    Popup: any
    L: any
  } | null>(null)

  useEffect(() => {
    setMounted(true)

    // Import leaflet CSS
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    link.crossOrigin = ""
    document.head.appendChild(link)

    // Dynamic import of react-leaflet + leaflet
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([rl, L]) => {
      // Fix default marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "",
        iconUrl: "",
        shadowUrl: "",
      })

      setLeafletComponents({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        Marker: rl.Marker,
        Popup: rl.Popup,
        L: L,
      })
    })
  }, [])

  // Filter artisans
  const filteredArtisans = useMemo(() => {
    let result = artisanLocations

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.skill.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
      )
    }

    if (selectedCategory !== "Toutes") {
      result = result.filter((a) =>
        a.skill.toLowerCase().includes(selectedCategory.toLowerCase().slice(0, -3)) ||
        a.skill.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    }

    if (availableOnly) {
      // Mock: filter to only "Élite" and "Top" artisans as "available"
      result = result.filter((a) => a.badge === "Élite" || a.badge === "Top")
    }

    return result
  }, [searchQuery, selectedCategory, availableOnly])

  // Create custom marker icon for an artisan
  const createMarkerIcon = (artisan: typeof artisanLocations[0], L: any) => {
    const isSelected = selectedArtisanId === artisan.id
    const size = isSelected ? 44 : 36
    const borderWidth = isSelected ? 3 : 2

    return L.divIcon({
      className: "custom-artisan-marker",
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: ${isSelected ? 14 : 12}px;
          color: white;
          border: ${borderWidth}px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 ${isSelected ? 2 : 0}px ${isSelected ? '#f59e0b' : 'transparent'};
          cursor: pointer;
          transition: all 0.2s ease;
          background: ${getAvatarBgColor(artisan.avatarColor)};
        ">
          ${artisan.avatar}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -(size / 2 + 4)],
    })
  }

  const handleMarkerClick = (id: string) => {
    setSelectedArtisanId(id)
  }

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      {/* ─── Retour Button ─── */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Button
          onClick={onBack}
          variant="outline"
          className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-border/50 shadow-lg hover:bg-white dark:hover:bg-neutral-900 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* ─── Toggle Sidebar Button (Mobile) ─── */}
      <div className="absolute top-4 right-4 z-[1000] md:hidden">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          variant="outline"
          className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-border/50 shadow-lg"
          size="icon"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* ─── Sidebar ─── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 z-[999] w-full md:w-[380px] h-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md shadow-2xl border-r border-border/30 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 pb-3 border-b border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <Navigation className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-base">Carte des artisans</h2>
                  <p className="text-xs text-muted-foreground">Trouvez un artisan près de vous</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un artisan..."
                  className="pl-9 h-9 bg-muted/50 border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 pb-3 border-b border-border/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                Filtres
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Category */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-8 text-xs border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Availability Toggle */}
                <div className="flex items-center gap-2 h-8 px-3 rounded-md border border-border/50 bg-background">
                  <Switch
                    checked={availableOnly}
                    onCheckedChange={setAvailableOnly}
                    className="scale-75"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Disponible</span>
                </div>
              </div>

              {/* Radius Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Rayon de recherche</span>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{radius[0]} km</span>
                </div>
                <Slider
                  value={radius}
                  onValueChange={setRadius}
                  min={50}
                  max={2000}
                  step={50}
                  className="w-full [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-amber-500 [&_[data-slot=slider-range]]:to-orange-500 [&_[data-slot=slider-thumb]]:border-amber-500"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-border/20">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium">{filteredArtisans.length} artisan{filteredArtisans.length !== 1 ? 's' : ''} trouvé{filteredArtisans.length !== 1 ? 's' : ''}</span>
              </div>
              {(searchQuery || selectedCategory !== "Toutes" || availableOnly) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-amber-600 hover:text-amber-700 px-2"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("Toutes")
                    setAvailableOnly(false)
                  }}
                >
                  Réinitialiser
                </Button>
              )}
            </div>

            {/* Artisan List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700">
              {filteredArtisans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 mb-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Aucun artisan trouvé</p>
                  <p className="text-xs text-muted-foreground mt-1">Essayez de modifier vos filtres</p>
                </div>
              ) : (
                filteredArtisans.map((artisan) => (
                  <motion.div
                    key={artisan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`cursor-pointer border-border/40 transition-all hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 ${
                        selectedArtisanId === artisan.id ? "ring-2 ring-amber-500/50 border-amber-400" : ""
                      }`}
                      onClick={() => {
                        setSelectedArtisanId(artisan.id)
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${artisan.avatarColor}`}>
                            {artisan.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-semibold text-sm truncate">{artisan.name}</h3>
                              <Badge className={`text-[9px] px-1 py-0 ${badgeColorMap[artisan.badge] || "bg-neutral-500 text-white"} border-0`}>
                                {artisan.badge}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{artisan.skill}</p>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{artisan.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-xs">{artisan.rating}</span>
                            <span className="text-[10px] text-muted-foreground">({artisan.reviews})</span>
                          </div>
                          <span className="font-semibold text-xs text-amber-600 dark:text-amber-400">{artisan.price}</span>
                        </div>
                        <Button
                          className="w-full mt-2 h-7 text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewArtisan(artisan.id)
                          }}
                        >
                          Voir le profil
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Toggle Sidebar Button (Desktop) ─── */}
      {!sidebarOpen && (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-20 left-4 z-[1000] hidden md:block"
        >
          <Button
            onClick={() => setSidebarOpen(true)}
            variant="outline"
            className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-border/50 shadow-lg h-10 w-10 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* ─── Map ─── */}
      <div className="w-full h-full">
        {mounted && leafletComponents ? (
          <leafletComponents.MapContainer
            center={[6.5, -2.5]}
            zoom={5}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
            style={{ background: "#f5f0e8" }}
          >
            <leafletComponents.TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredArtisans.map((artisan) => (
              <leafletComponents.Marker
                key={artisan.id}
                position={[artisan.lat, artisan.lng]}
                icon={createMarkerIcon(artisan, leafletComponents.L)}
                eventHandlers={{
                  click: () => handleMarkerClick(artisan.id),
                }}
              >
                <leafletComponents.Popup maxWidth={260} minWidth={200}>
                  <div className="p-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${artisan.avatarColor}`}>
                        {artisan.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-semibold text-sm truncate">{artisan.name}</h3>
                          <Badge className={`text-[9px] px-1 py-0 ${badgeColorMap[artisan.badge] || "bg-neutral-500 text-white"} border-0`}>
                            {artisan.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{artisan.skill}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{artisan.location}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-xs">{artisan.rating}</span>
                        <span className="text-[10px] text-muted-foreground">({artisan.reviews} avis)</span>
                      </div>
                      <span className="font-semibold text-xs text-amber-600">{artisan.price}</span>
                    </div>
                    <button
                      onClick={() => onViewArtisan(artisan.id)}
                      className="w-full h-8 rounded-md text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-colors flex items-center justify-center gap-1"
                    >
                      Voir le profil
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </leafletComponents.Popup>
              </leafletComponents.Marker>
            ))}
          </leafletComponents.MapContainer>
        ) : (
          /* Loading skeleton */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-neutral-900 dark:to-neutral-800">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg animate-pulse">
                  <Navigation className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Chargement de la carte...</p>
                <p className="text-xs text-muted-foreground mt-1">Géolocalisation des artisans en Afrique de l&apos;Ouest</p>
              </div>
              <div className="h-1 w-32 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 animate-[shimmer_1.5s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Map Overlay Stats ─── */}
      {mounted && leafletComponents && (
        <div className="absolute bottom-4 right-4 z-[1000] hidden md:flex flex-col gap-2">
          <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-border/30 shadow-lg">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold">{filteredArtisans.length} artisans</p>
                <p className="text-[10px] text-muted-foreground">Afrique de l&apos;Ouest</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ─── Helper: Get CSS bg color from tailwind class ─────────────────────────────

function getAvatarBgColor(twClass: string): string {
  const colorMap: Record<string, string> = {
    "bg-amber-500": "#f59e0b",
    "bg-amber-600": "#d97706",
    "bg-emerald-500": "#10b981",
    "bg-orange-500": "#f97316",
    "bg-teal-500": "#14b8a6",
    "bg-cyan-500": "#06b6d4",
    "bg-violet-500": "#8b5cf6",
    "bg-rose-500": "#f43f5e",
    "bg-indigo-500": "#6366f1",
    "bg-pink-500": "#ec4899",
  }
  return colorMap[twClass] || "#f59e0b"
}
