'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'
import type { Mission } from '@/lib/types'
import { PhotoUploader } from '@/components/photo-uploader'
import {
  CheckCircle2,
  Star,
  DollarSign,
  Bell,
  MapPin,
  Clock,
  Wrench,
  Award,
  Loader2,
  Briefcase,
} from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ouverte: { label: 'Ouverte', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  assignee: { label: 'Assignée', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  en_cours: { label: 'En cours', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  terminee: { label: 'Terminée', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  annulee: { label: 'Annulée', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
}

const CATEGORY_OPTIONS = [
  'Plomberie', 'Électricité', 'Menuiserie', 'Peinture',
  'Serrurerie', 'Maçonnerie', 'Climatisation', 'Nettoyage',
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface ArtisanData {
  id: string
  specialties: string
  skills: string
  hourlyRate: number
  experience: number
  badge: string
  rating: number
  reviewCount: number
  missionCount: number
  isAvailable: boolean
  certifications: string
  user?: {
    name: string
    bio?: string
    location?: string
  }
}

export function ArtisanDashboard() {
  const { user, token } = useAppStore()
  const [missions, setMissions] = useState<Mission[]>([])
  const [artisanProfile, setArtisanProfile] = useState<ArtisanData | null>(null)
  const [availableMissions, setAvailableMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile edit state
  const [specialties, setSpecialties] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState('')
  const [experience, setExperience] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [bio, setBio] = useState('')

  const fetchArtisanData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // Fetch artisan profile
      const artisanRes = await fetch('/api/artisans')
      const artisanData = await artisanRes.json()
      const myProfile = artisanData.artisans?.find(
        (a: ArtisanData & { user?: { id?: string } }) => a.user && 'id' in a.user && (a.user as { id?: string }).id === user.id
      )
      if (myProfile) {
        setArtisanProfile(myProfile)
        const specs = typeof myProfile.specialties === 'string'
          ? JSON.parse(myProfile.specialties || '[]')
          : myProfile.specialties
        setSpecialties(Array.isArray(specs) ? specs : [])
        setHourlyRate(String(myProfile.hourlyRate || ''))
        setExperience(String(myProfile.experience || ''))
        setIsAvailable(myProfile.isAvailable)
        if (myProfile.user?.bio) setBio(myProfile.user.bio)
      }

      // Fetch available missions
      const missionRes = await fetch('/api/missions?status=ouverte')
      const missionData = await missionRes.json()
      if (missionData.missions) {
        setAvailableMissions(missionData.missions)
      }

      // Fetch my assigned missions
      if (myProfile) {
        const myMissionsRes = await fetch(`/api/missions?artisanId=${myProfile.id}`)
        const myMissionsData = await myMissionsRes.json()
        if (myMissionsData.missions) setMissions(myMissionsData.missions)
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchArtisanData()
  }, [fetchArtisanData])

  const handleSaveProfile = async () => {
    if (!artisanProfile) return
    setSaving(true)
    try {
      // In a real app, this would PUT to /api/artisans/[id]
      // For now, just simulate
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaving(false)
    } catch {
      setSaving(false)
    }
  }

  const toggleSpecialty = (spec: string) => {
    setSpecialties(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    )
  }

  const completedMissions = missions.filter(m => (m.status as string) === 'terminee' || m.status === 'completed')
  const avgRating = artisanProfile?.rating || 0
  const totalRevenue = completedMissions.reduce((sum, m) => sum + (m.budget || 0), 0)
  const openRequests = availableMissions.length

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Bonjour, <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Bienvenue sur votre espace artisan</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-11 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="text-sm">Aperçu</TabsTrigger>
          <TabsTrigger value="missions" className="text-sm">Missions</TabsTrigger>
          <TabsTrigger value="profile" className="text-sm">Profil</TabsTrigger>
          <TabsTrigger value="reviews" className="text-sm">Avis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{completedMissions.length}</p>
                      <p className="text-xs text-muted-foreground">Terminées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/50">
                      <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{avgRating.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Note moyenne</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/50">
                      <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Revenus (FCFA)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
                      <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{openRequests}</p>
                      <p className="text-xs text-muted-foreground">Demandes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent mission requests */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                Demandes récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : availableMissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune demande pour le moment</p>
                  <p className="text-sm mt-1">Les nouvelles demandes apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableMissions.slice(0, 5).map((mission) => (
                    <div key={mission.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{mission.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{mission.category}</span>
                          {mission.budget && <span>{mission.budget.toLocaleString()} FCFA</span>}
                          {mission.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {mission.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 h-8 text-xs">
                          Accepter
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          Décliner
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Missions Tab */}
        <TabsContent value="missions" className="space-y-4">
          <h2 className="text-lg font-semibold">Mes missions</h2>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : missions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucune mission assignée</p>
                <p className="text-sm mt-1">Acceptez des demandes pour commencer</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {missions.map((mission) => {
                const statusInfo = STATUS_MAP[mission.status] || STATUS_MAP.ouverte
                return (
                  <motion.div key={mission.id} variants={fadeInUp} initial="hidden" animate="visible">
                    <Card className="border-border/50 hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-semibold text-sm leading-tight">{mission.title}</h3>
                          <Badge className={`text-[10px] shrink-0 border-0 ${statusInfo.color}`}>{statusInfo.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{mission.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span className="capitalize">{mission.category}</span>
                          </div>
                          {mission.budget && (
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              {mission.budget.toLocaleString()} FCFA
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Available missions */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Missions disponibles
            </h2>
            {availableMissions.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune mission disponible pour le moment</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {availableMissions.map((mission) => (
                  <Card key={mission.id} className="border-border/50 border-dashed hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-sm mb-2">{mission.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{mission.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{mission.category}</span>
                          {mission.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {mission.location}
                            </span>
                          )}
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 h-8 text-xs">
                          Postuler
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-500" />
                Mon profil artisan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo de profil */}
              <div className="flex flex-col items-center py-2">
                <PhotoUploader
                  currentAvatar={user?.avatar || null}
                  userName={user?.name || undefined}
                  size="xl"
                  type="avatars"
                />
              </div>

              {/* Badge */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                <Award className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="font-semibold">{artisanProfile?.badge || 'Nouveau'}</p>
                  <p className="text-sm text-muted-foreground">Votre badge actuel</p>
                </div>
              </div>

              {/* Specialties */}
              <div className="space-y-2">
                <Label>Spécialités</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map(spec => (
                    <Badge
                      key={spec}
                      variant={specialties.includes(spec) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${
                        specialties.includes(spec)
                          ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                          : 'hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                      }`}
                      onClick={() => toggleSpecialty(spec)}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Hourly Rate & Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly-rate">Tarif horaire (FCFA)</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(e.target.value)}
                    placeholder="5 000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp-years">Expérience (années)</Label>
                  <Input
                    id="exp-years"
                    type="number"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="artisan-bio">Biographie</Label>
                <Textarea
                  id="artisan-bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Décrivez votre parcours et vos compétences..."
                  rows={4}
                />
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                <div>
                  <p className="font-medium text-sm">Disponibilité</p>
                  <p className="text-xs text-muted-foreground">
                    {isAvailable ? 'Vous recevez des demandes' : 'Vous ne recevez plus de demandes'}
                  </p>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Average rating card */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
                  <div className="flex items-center gap-0.5 mt-1 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(avgRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {artisanProfile?.reviewCount || 0} avis
                  </p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map(stars => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs w-4">{stars}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: stars === 5 ? '70%' : stars === 4 ? '20%' : stars === 3 ? '7%' : stars === 2 ? '2%' : '1%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews list */}
          {artisanProfile?.reviewCount === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun avis pour le moment</p>
                <p className="text-sm mt-1">Les avis apparaîtront après vos premières missions complétées</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Sample reviews for demo */}
              {[
                { name: 'Ousmane Ba', rating: 5, comment: 'Travail excellent et rapide ! Je recommande vivement.', date: '15 Jan 2025' },
                { name: 'Aminata Koné', rating: 4, comment: 'Bon travail dans l\'ensemble. Très professionnel.', date: '10 Jan 2025' },
                { name: 'Jean-Pierre Aka', rating: 5, comment: 'Artisan très compétent et ponctuel. Parfait !', date: '5 Jan 2025' },
              ].map((review, idx) => (
                <Card key={idx} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                          {review.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-sm">{review.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
