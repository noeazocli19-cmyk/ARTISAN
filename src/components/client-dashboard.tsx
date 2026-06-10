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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import type { Mission, Review } from '@/lib/types'
import { PhotoUploader } from '@/components/photo-uploader'
import { ReviewDialog } from '@/components/review-dialog'
import {
  Briefcase,
  CheckCircle2,
  Users,
  Clock,
  Plus,
  MapPin,
  Star,
  MessageSquare,
  Loader2,
  AlertCircle,
  Heart,
  User,
} from 'lucide-react'

const CATEGORY_OPTIONS = [
  { value: 'plomberie', label: 'Plomberie' },
  { value: 'electrical', label: 'Électricité' },
  { value: 'carpentry', label: 'Menuiserie' },
  { value: 'painting', label: 'Peinture' },
  { value: 'masonry', label: 'Maçonnerie' },
  { value: 'welding', label: 'Soudure' },
  { value: 'tailoring', label: 'Couture' },
  { value: 'catering', label: 'Traiteur' },
  { value: 'cleaning', label: 'Nettoyage' },
  { value: 'other', label: 'Autre' },
]

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ouverte: { label: 'Ouverte', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  assignee: { label: 'Assignée', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  en_cours: { label: 'En cours', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  terminee: { label: 'Terminée', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  annulee: { label: 'Annulée', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function ClientDashboard() {
  const { user, token, favoriteIds } = useAppStore()
  const [missions, setMissions] = useState<Mission[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingMissions, setLoadingMissions] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [newMissionOpen, setNewMissionOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [missionError, setMissionError] = useState('')
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewMission, setReviewMission] = useState<Mission | null>(null)

  // New mission form
  const [mTitle, setMTitle] = useState('')
  const [mDesc, setMDesc] = useState('')
  const [mCategory, setMCategory] = useState('')
  const [mBudget, setMBudget] = useState('')
  const [mLocation, setMLocation] = useState('')

  const fetchMissions = useCallback(async () => {
    if (!user) return
    setLoadingMissions(true)
    try {
      const res = await fetch(`/api/missions?clientId=${user.id}`)
      const data = await res.json()
      if (data.missions) setMissions(data.missions)
    } catch {
      // silent fail
    } finally {
      setLoadingMissions(false)
    }
  }, [user])

  const fetchReviews = useCallback(async () => {
    if (!user) return
    setLoadingReviews(true)
    try {
      const res = await fetch(`/api/reviews?authorId=${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (data.reviews) setReviews(data.reviews)
    } catch {
      // silent fail
    } finally {
      setLoadingReviews(false)
    }
  }, [user, token])

  useEffect(() => {
    fetchMissions()
    fetchReviews()
  }, [fetchMissions, fetchReviews])

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setMissionError('')

    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: mTitle,
          description: mDesc,
          category: mCategory,
          budget: mBudget ? parseInt(mBudget) : undefined,
          location: mLocation,
          clientId: user.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMissionError(data.error || 'Erreur lors de la création')
        return
      }
      setNewMissionOpen(false)
      setMTitle('')
      setMDesc('')
      setMCategory('')
      setMBudget('')
      setMLocation('')
      fetchMissions()
    } catch {
      setMissionError('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLeaveReview = (mission: Mission) => {
    setReviewMission(mission)
    setReviewDialogOpen(true)
  }

  const handleSubmitReview = async (rating: number, comment: string) => {
    // Review submitted successfully
    fetchReviews()
  }

  const ongoingMissions = missions.filter(m =>
    ['ouverte', 'assignee', 'en_cours', 'open', 'in_progress'].includes(m.status as string)
  )
  const completedMissions = missions.filter(m => (m.status as string) === 'terminee' || m.status === 'completed')
  const uniqueArtisans = new Set(missions.filter(m => m.artisanId).map(m => m.artisanId)).size

  const messageThreads = [
    { id: '1', artisanName: 'Amadou Diallo', lastMessage: 'Je peux venir demain matin', time: 'Il y a 2h', unread: true },
    { id: '2', artisanName: 'Fatou Ndiaye', lastMessage: 'Le devis est prêt', time: 'Il y a 5h', unread: false },
    { id: '3', artisanName: 'Kofi Mensah', lastMessage: 'Merci pour votre confiance !', time: 'Hier', unread: false },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Bonjour, <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">{user?.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Bienvenue sur votre espace client</p>
        </div>
        <Dialog open={newMissionOpen} onOpenChange={setNewMissionOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Mission
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-amber-500" />
                Créer une mission
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMission} className="space-y-4 mt-4">
              {missionError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {missionError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="m-title">Titre</Label>
                <Input id="m-title" placeholder="Réparation fuite robinet" value={mTitle} onChange={e => setMTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-desc">Description</Label>
                <Textarea id="m-desc" placeholder="Décrivez votre besoin en détail..." value={mDesc} onChange={e => setMDesc(e.target.value)} rows={4} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={mCategory} onValueChange={setMCategory}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-budget">Budget (FCFA)</Label>
                  <Input id="m-budget" type="number" placeholder="50 000" value={mBudget} onChange={e => setMBudget(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-location">Localisation</Label>
                <Input id="m-location" placeholder="Dakar, Sénégal" value={mLocation} onChange={e => setMLocation(e.target.value)} />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Publier la mission
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-11 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="text-sm">Aperçu</TabsTrigger>
          <TabsTrigger value="missions" className="text-sm">Mes Missions</TabsTrigger>
          <TabsTrigger value="messages" className="text-sm">Messages</TabsTrigger>
          <TabsTrigger value="favorites" className="text-sm flex items-center gap-1"><Heart className="h-3.5 w-3.5" />Favoris</TabsTrigger>
          <TabsTrigger value="reviews" className="text-sm">Avis</TabsTrigger>
          <TabsTrigger value="profile" className="text-sm flex items-center gap-1"><User className="h-3.5 w-3.5" />Profil</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/50">
                      <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{ongoingMissions.length}</p>
                      <p className="text-sm text-muted-foreground">Missions en cours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{completedMissions.length}</p>
                      <p className="text-sm text-muted-foreground">Missions terminées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/50">
                      <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{uniqueArtisans}</p>
                      <p className="text-sm text-muted-foreground">Artisans contactés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent missions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Missions récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMissions ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : missions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune mission pour le moment</p>
                  <p className="text-sm mt-1">Créez votre première mission pour trouver un artisan</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {missions.slice(0, 5).map((mission) => {
                    const statusInfo = STATUS_MAP[mission.status] || STATUS_MAP.ouverte
                    return (
                      <div key={mission.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">{mission.title}</h4>
                            <Badge className={`text-[10px] border-0 ${statusInfo.color}`}>{statusInfo.label}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{mission.category}</span>
                            {mission.budget && <span>{mission.budget.toLocaleString()} FCFA</span>}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 ml-4">
                          {new Date(mission.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Missions Tab */}
        <TabsContent value="missions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Toutes mes missions</h2>
            <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0" onClick={() => setNewMissionOpen(true)}>
              <Plus className="h-3 w-3 mr-1" />
              Nouvelle
            </Button>
          </div>
          {loadingMissions ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : missions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucune mission créée</p>
                <Button variant="outline" className="mt-4" onClick={() => setNewMissionOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une mission
                </Button>
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
                            {mission.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {mission.location}
                              </span>
                            )}
                          </div>
                          {mission.budget && (
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              {mission.budget.toLocaleString()} FCFA
                            </span>
                          )}
                        </div>
                        {(mission.status === 'terminee' || mission.status === 'completed') && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-3 text-xs gap-1 border-amber-200 dark:border-amber-800 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                            onClick={() => handleLeaveReview(mission)}
                          >
                            <Star className="h-3 w-3" />
                            Laisser un avis
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
              onClick={() => useAppStore.getState().setView('chat')}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Ouvrir le chat
            </Button>
          </div>
          <div className="space-y-3">
            {messageThreads.map((thread) => (
              <Card
                key={thread.id}
                className="border-border/50 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => useAppStore.getState().setView('chat')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold">
                        {thread.artisanName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{thread.artisanName}</span>
                        <span className="text-xs text-muted-foreground">{thread.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground truncate">{thread.lastMessage}</p>
                        {thread.unread && (
                          <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Mes favoris
          </h2>
          {favoriteIds.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun artisan favori</p>
                <p className="text-sm mt-1">Ajoutez des artisans à vos favoris en cliquant sur le cœur</p>
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground">
              {favoriteIds.length} artisan{favoriteIds.length !== 1 ? 's' : ''} dans vos favoris
            </p>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <h2 className="text-lg font-semibold">Mes avis</h2>
          {loadingReviews ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : reviews.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun avis pour le moment</p>
                <p className="text-sm mt-1">Les avis apparaîtront après la complétion de vos missions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <Card key={review.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-amber-500" />
                Mon profil
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={user?.name || ''} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={user?.phone || ''} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Localisation</Label>
                  <Input value={user?.location || ''} disabled className="bg-muted/50" />
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Pour modifier vos informations, contactez le support
              </p>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Review Dialog */}
      {reviewMission && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          artisanName={reviewMission.artisanId || 'Artisan'}
          missionTitle={reviewMission.title}
          artisanId={reviewMission.artisanId || ''}
          missionId={reviewMission.id}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  )
}
