'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
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
  CalendarDays,
  Image,
  LifeBuoy,
  FileText,
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
  assignee: { label: 'Assignée', color: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' },
  en_cours: { label: 'En cours', color: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' },
  terminee_artisan: { label: 'À confirmer', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  terminee: { label: 'Terminée', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  litige: { label: 'Litige en cours', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  annulee: { label: 'Annulée', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function ClientDashboard() {
  const { user, token, favoriteIds } = useAppStore()
  const router = useRouter()
  const [missions, setMissions] = useState<Mission[]>([]) 
  const [activeTab, setActiveTab] = useState('overview')
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
      const res = await fetch(`/api/reviews?clientId=${user.id}`, {
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

  const handleReportDispute = async (mission: Mission) => {
    const reason = window.prompt('Explique brièvement le problème rencontré avec cette mission :')
    if (!reason || !reason.trim()) return
    try {
      const res = await fetch(`/api/missions/${mission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'litige', disputeReason: reason }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMissions((prev) => prev.map((m) => (m.id === mission.id ? { ...m, status: 'litige' as any } : m)))
        toast.success('Litige signalé. Notre équipe va examiner la situation.')
      } else {
        toast.error(data.error || 'Impossible de signaler le litige')
      }
    } catch {
      toast.error('Erreur réseau')
    }
  }

  const handleConfirmCompletion = async (mission: Mission) => {
    try {
      const res = await fetch(`/api/missions/${mission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'terminee' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMissions((prev) => prev.map((m) => (m.id === mission.id ? { ...m, status: 'terminee' as any } : m)))
        toast.success('Mission confirmée ! Vous pouvez maintenant laisser un avis.')
      } else {
        toast.error(data.error || 'Impossible de confirmer la mission')
      }
    } catch {
      toast.error('Erreur réseau')
    }
  }

  const reviewedMissionIds = new Set(reviews.map((r: any) => r.missionId).filter(Boolean))

  const ongoingMissions = missions.filter(m =>
    ['ouverte', 'assignee', 'en_cours', 'terminee_artisan', 'open', 'in_progress'].includes(m.status as string)
  )
  const completedMissions = missions.filter(m => (m.status as string) === 'terminee' || m.status === 'completed')
  const uniqueArtisans = new Set(missions.filter(m => m.artisanId).map(m => m.artisanId)).size

  const [conversations, setConversations] = useState<any[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/messages/conversations')
      .then((r) => (r.ok ? r.json() : { conversations: [] }))
      .then((data) => setConversations(data.conversations || []))
      .catch(() => {})
      .finally(() => setConversationsLoading(false))
  }, [])

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-brand-50/60 via-background to-background py-8 dark:from-brand-950/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-background/80 p-2.5 shadow-sm backdrop-blur">
        <Link href="/social" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-700">
          <Users className="h-4 w-4" />
          Accéder au réseau social
        </Link>
        <Link href="/devis" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-transparent px-3 text-sm font-semibold transition hover:border-border hover:bg-muted"><FileText className="h-4 w-4" />Mes devis</Link>
        <Link href="/agenda" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-transparent px-3 text-sm font-semibold transition hover:border-border hover:bg-muted"><CalendarDays className="h-4 w-4" />Agenda</Link>
        <Link href="/portfolio" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-transparent px-3 text-sm font-semibold transition hover:border-border hover:bg-muted"><Image className="h-4 w-4" />Portfolio</Link>
        <Link href="/support" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-transparent px-3 text-sm font-semibold transition hover:border-border hover:bg-muted"><LifeBuoy className="h-4 w-4" />Support</Link>
        <Link href="/" className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-brand-700">
          <ArrowLeftCircle className="h-4 w-4" />
          Retour au site
        </Link>
      </div>
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-brand-200/60 bg-gradient-to-br from-brand-600 via-brand-500 to-sky-500 p-6 text-white shadow-xl shadow-brand-500/10 sm:p-8">
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute bottom-[-4rem] right-24 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-brand-50/90">Votre espace client</p>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Bonjour, {user?.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-brand-50/90">Suivez vos missions, trouvez un artisan de confiance et gérez vos demandes au même endroit.</p>
          </div>
          <Button size="lg" className="shrink-0 bg-white text-brand-700 shadow-md hover:bg-brand-50" onClick={() => router.push('/missions/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Mission
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Menu déroulant - Mobile uniquement */}
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-muted/50 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="overview">Aperçu</option>
            <option value="missions">Mes Missions</option>
            <option value="messages">Messages</option>
            <option value="favorites">Favoris</option>
            <option value="reviews">Avis</option>
            <option value="profile">Profil</option>
          </select>
        </div>

        {/* Barre d'onglets - Desktop uniquement */}
        <TabsList className="hidden h-12 w-full justify-start overflow-x-auto rounded-2xl border border-border/60 bg-background/80 p-1.5 shadow-sm sm:flex">
          <TabsTrigger value="overview" className="text-sm">Aperçu</TabsTrigger>
          <TabsTrigger value="missions" className="text-sm">Mes Missions</TabsTrigger>
          <TabsTrigger value="messages" className="text-sm">Messages</TabsTrigger>
          <TabsTrigger value="favorites" className="text-sm flex items-center gap-1"><Heart className="h-3.5 w-3.5" />Favoris</TabsTrigger>
          <TabsTrigger value="reviews" className="text-sm">Avis</TabsTrigger>
          <TabsTrigger value="profile" className="text-sm flex items-center gap-1"><User className="h-3.5 w-3.5" />Profil</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Link
            href="/become-artisan"
            className="flex items-center justify-between rounded-2xl p-4 text-white shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#2596BE' }}
          >
            <div>
              <p className="font-bold">Je veux devenir artisan</p>
              <p className="text-sm text-white/85">Garde ton compte, complète ton profil pro et commence à recevoir des missions.</p>
            </div>
            <span className="text-xl">→</span>
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-950/50">
                      <Clock className="h-6 w-6 text-brand-600 dark:text-brand-400" />
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-950/50">
                      <Users className="h-6 w-6 text-brand-600 dark:text-brand-400" />
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
            <Button size="sm" className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white border-0" onClick={() => router.push('/missions/create')}>
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
                <Button variant="outline" className="mt-4" onClick={() => router.push('/missions/create')}>
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
                            <span className="font-semibold text-brand-600 dark:text-brand-400">
                              {mission.budget.toLocaleString()} FCFA
                            </span>
                          )}
                        </div>
                        {mission.artisanId && (mission as any).artisan?.user && (
                          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white text-[10px] font-bold">
                                {(mission as any).artisan.user.name?.charAt(0)?.toUpperCase() || 'A'}
                              </div>
                              <span className="text-xs font-medium truncate">
                                {(mission as any).artisan.user.name}
                              </span>
                            </div>
                            <Link
                              href={`/messages?userId=${(mission as any).artisan.user.id}`}
                              className="shrink-0 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700"
                            >
                              Envoyer un message
                            </Link>
                          </div>
                        )}
                        {mission.status === 'terminee_artisan' && (
                          <div className="mt-3 pt-3 border-t border-sky-100 dark:border-sky-900">
                            <p className="text-[11px] text-sky-700 dark:text-sky-300 mb-2 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              L'artisan indique avoir terminé.
                            </p>
                            <Button
                              size="sm"
                              className="w-full text-xs gap-1 bg-sky-600 hover:bg-sky-700 text-white"
                              onClick={() => handleConfirmCompletion(mission)}
                            >
                              Confirmer la fin de la mission
                            </Button>
                          </div>
                        )}
                        {(mission.status as any) === 'litige' && (
                          <div className="mt-3 pt-3 border-t border-red-100 dark:border-red-900">
                            <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Litige signalé, en cours d'examen par notre équipe.
                            </p>
                          </div>
                        )}
                        {['ouverte', 'assignee', 'en_cours', 'terminee_artisan'].includes(mission.status as string) && (
                          <button
                            onClick={() => handleReportDispute(mission)}
                            className="mt-2 text-[11px] text-gray-400 hover:text-red-500 underline decoration-dotted"
                          >
                            Signaler un problème
                          </button>
                        )}
                        {(mission.status === 'terminee' || mission.status === 'completed') && (
                          reviewedMissionIds.has(mission.id) ? (
                            <div className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 py-1.5">
                              <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                              Avis envoyé, merci !
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-3 text-xs gap-1 border-brand-200 dark:border-brand-800 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/50"
                              onClick={() => handleLeaveReview(mission)}
                            >
                              <Star className="h-3 w-3" />
                              Laisser un avis
                            </Button>
                          )
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
            <Link href="/messages">
              <Button
                size="sm"
                className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white border-0"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Ouvrir le chat
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {conversationsLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : conversations.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Aucune conversation pour le moment</p>
                  <p className="text-sm mt-1">Contactez un artisan depuis sa fiche pour demarrer une discussion</p>
                </CardContent>
              </Card>
            ) : (
              conversations.map((conv) => (
                <Link key={conv.partnerId} href={`/messages?userId=${conv.partnerId}`}>
                  <Card className="border-border/50 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white text-xs font-bold">
                            {conv.partner?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{conv.partner?.name || 'Artisan'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage?.content || ''}</p>
                            {conv.unreadCount > 0 && (
                              <div className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
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
                <p className="text-sm mt-1">Ajoutez des artisans à vos favoris en cliquant sur le cÅ“ur</p>
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
                                ? 'fill-brand-400 text-brand-400'
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
                <User className="h-5 w-5 text-brand-500" />
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
          artisanName={(reviewMission as any).artisan?.user?.name || 'Artisan'}
          missionTitle={reviewMission.title}
          artisanId={reviewMission.artisanId || ''}
          missionId={reviewMission.id}
          onSubmit={handleSubmitReview}
        />
      )}
      </div>
    </div>
  )
}