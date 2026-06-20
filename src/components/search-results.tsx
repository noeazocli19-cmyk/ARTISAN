'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import {
  Search,
  MapPin,
  Star,
  ChevronRight,
  SlidersHorizontal,
  X,
  Loader2,
  Heart,
} from 'lucide-react'

const CATEGORY_FILTERS = [
  'Plomberie', 'Électricité', 'Menuiserie', 'Peinture',
  'Serrurerie', 'Maçonnerie', 'Climatisation', 'Nettoyage',
]

const BADGE_STYLES: Record<string, string> = {
  'Élite': 'bg-amber-500 text-white',
  'Top': 'bg-emerald-500 text-white',
  'Vérifié': 'bg-teal-500 text-white',
  'Nouveau': 'bg-neutral-500 text-white',
}

const AVATAR_COLORS = [
  'bg-amber-500', 'bg-emerald-500', 'bg-orange-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-violet-500',
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface SearchResultsProps {
  onViewArtisan: (id: string) => void
}

export function SearchResults({ onViewArtisan }: SearchResultsProps) {
  const { searchResults, searchQuery, isLoading, search, fetchArtisans, searchFilters, favoriteIds, toggleFavorite } = useAppStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [localLocation, setLocalLocation] = useState(searchFilters.location || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [showFilters, setShowFilters] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(6)
  const [hasInitialFetch, setHasInitialFetch] = useState(false)

  // Fetch initial uniquement au montage du composant (une seule fois)
  useEffect(() => {
    if (!hasInitialFetch) {
      fetchArtisans(searchFilters)
      setHasInitialFetch(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const filters: Record<string, unknown> = {}
    if (selectedCategories.length > 0) filters.category = selectedCategories[0]
    if (localLocation) filters.location = localLocation
    if (priceMin) filters.priceMin = parseInt(priceMin)
    if (priceMax) filters.priceMax = parseInt(priceMax)
    if (minRating) filters.rating = parseInt(minRating)

    if (localQuery.trim()) {
      search(localQuery.trim(), filters)
    } else {
      fetchArtisans(filters)
    }
    setDisplayedCount(6)
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceMin('')
    setPriceMax('')
    setMinRating('')
    setLocalLocation('')
  }

  const hasActiveFilters = selectedCategories.length > 0 || priceMin || priceMax || minRating || localLocation

  // Sort results
  const sortedResults = [...searchResults].sort((a, b) => {
    switch (sortBy) {
      case 'rating': return b.rating - a.rating
      case 'price_low': return a.hourlyRate - b.hourlyRate
      case 'price_high': return b.hourlyRate - a.hourlyRate
      default: return b.rating - a.rating
    }
  })

  const displayedResults = sortedResults.slice(0, displayedCount)
  const hasMore = displayedCount < sortedResults.length

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">
          {searchQuery ? (
            <>Résultats pour &laquo; <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">{searchQuery}</span> &raquo;</>
          ) : (
            <>Trouvez votre <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">artisan</span></>
          )}
        </h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Quel service recherchez-vous ?"
              value={localQuery}
              onChange={e => setLocalQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Localisation"
              value={localLocation}
              onChange={e => setLocalLocation(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button type="submit" className="h-11 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Rechercher
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 px-4 lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar - Desktop */}
        <aside className={`w-64 shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filtres
              </h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" />
                  Effacer
                </Button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Catégories</h4>
              <div className="space-y-2">
                {CATEGORY_FILTERS.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedCategories.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Prix (FCFA/h)</h4>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={priceMin}
                  onChange={e => setPriceMin(e.target.value)}
                  className="h-9 text-sm"
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={priceMax}
                  onChange={e => setPriceMax(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Note minimum</h4>
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Toutes les notes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4+ étoiles</SelectItem>
                  <SelectItem value="3">3+ étoiles</SelectItem>
                  <SelectItem value="2">2+ étoiles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSearch} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0">
              Appliquer
            </Button>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Sort & count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Recherche en cours...' : `${searchResults.length} artisan${searchResults.length !== 1 ? 's' : ''} trouvé${searchResults.length !== 1 ? 's' : ''}`}
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Par note</SelectItem>
                <SelectItem value="price_low">Par prix ↑</SelectItem>
                <SelectItem value="price_high">Par prix ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading skeletons */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-9 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center text-muted-foreground">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Aucun artisan trouvé</p>
                <p className="text-sm mt-1">Essayez de modifier vos critères de recherche</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {displayedResults.map((artisan, idx) => {
                  const user = artisan.user
                  const name = user?.name || 'Artisan'
                  const location = user?.location || ''
                  const badgeStyle = BADGE_STYLES[artisan.badge] || BADGE_STYLES['Nouveau']
                  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]

                  // Parse specialties (peut être un string JSON ou un tableau)
                  let specialtiesDisplay = ''
                  if (Array.isArray(artisan.specialties)) {
                    specialtiesDisplay = artisan.specialties.join(', ')
                  } else if (typeof artisan.specialties === 'string') {
                    try {
                      const parsed = JSON.parse(artisan.specialties)
                      specialtiesDisplay = Array.isArray(parsed) ? parsed.join(', ') : artisan.specialties
                    } catch {
                      specialtiesDisplay = artisan.specialties
                    }
                  }

                  return (
                    <motion.div key={artisan.id} variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: idx * 0.05 }}>
                      <Card className="group hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:shadow-lg overflow-hidden h-full">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex items-start gap-4">
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white font-bold text-lg ${avatarColor}`}>
                              {getInitials(name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-base truncate">{name}</h3>
                                <Badge className={`text-[10px] px-1.5 py-0 ${badgeStyle} border-0`}>
                                  {artisan.badge}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                {specialtiesDisplay}
                              </p>
                              {location && (
                                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{location}</span>
                                </div>
                              )}
                            </div>
                            <button
                              className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(artisan.id) }}
                              aria-label={favoriteIds.includes(artisan.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            >
                              <Heart className={`h-4 w-4 transition-colors ${favoriteIds.includes(artisan.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-400'}`} />
                            </button>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-sm">{artisan.rating.toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground">
                                ({artisan.reviewCount} avis)
                              </span>
                            </div>
                            <span className="font-semibold text-sm text-amber-600 dark:text-amber-400">
                              {artisan.hourlyRate.toLocaleString()} FCFA/h
                            </span>
                          </div>

                          <Button
                            className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 mt-auto"
                            size="sm"
                            onClick={() => onViewArtisan(artisan.id)}
                          >
                            Voir le profil
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setDisplayedCount(prev => prev + 6)}
                    className="px-8"
                  >
                    Voir plus d&apos;artisans
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}