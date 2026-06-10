'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import {
  MapPin,
  Star,
  Clock,
  Award,
  Shield,
  MessageSquare,
  FileText,
  ChevronLeft,
  Send,
  Loader2,
  CheckCircle2,
  Briefcase,
  Heart,
} from 'lucide-react'

const BADGE_STYLES: Record<string, { color: string; icon: typeof Award }> = {
  'Élite': { color: 'bg-amber-500 text-white', icon: Award },
  'Top': { color: 'bg-emerald-500 text-white', icon: Star },
  'Vérifié': { color: 'bg-teal-500 text-white', icon: Shield },
  'Nouveau': { color: 'bg-neutral-500 text-white', icon: Briefcase },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface ArtisanDetailProps {
  artisanId: string
  onBack: () => void
}

interface ArtisanReview {
  id: string
  rating: number
  comment: string
  createdAt: string
  author: {
    id: string
    name: string
    avatar?: string
  }
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
  portfolio: string
  user?: {
    id: string
    name: string
    avatar?: string
    location?: string
    country?: string
    bio?: string
    isVerified: boolean
    createdAt: string
  }
  reviews?: ArtisanReview[]
}

export function ArtisanDetail({ artisanId, onBack }: ArtisanDetailProps) {
  const { user, favoriteIds, toggleFavorite } = useAppStore()
  const [artisan, setArtisan] = useState<ArtisanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [contactOpen, setContactOpen] = useState(false)
  const [devisOpen, setDevisOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [devisText, setDevisText] = useState('')
  const [devisBudget, setDevisBudget] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetchArtisan = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/artisans/${artisanId}`)
        const data = await res.json()
        if (data.artisan) setArtisan(data.artisan)
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }
    fetchArtisan()
  }, [artisanId])

  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    setSending(true)
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSending(false)
    setContactOpen(false)
    setMessageText('')
  }

  const handleSendDevis = async () => {
    if (!devisText.trim()) return
    setSending(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSending(false)
    setDevisOpen(false)
    setDevisText('')
    setDevisBudget('')
  }

  const parseJSON = (val: unknown): string[] => {
    if (Array.isArray(val)) return val
    if (typeof val === 'string') {
      try { return JSON.parse(val) } catch { return [] }
    }
    return []
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-24" />
          <div className="flex gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    )
  }

  if (!artisan) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-muted-foreground">Artisan non trouvé</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>Retour</Button>
      </div>
    )
  }

  const name = artisan.user?.name || 'Artisan'
  const location = artisan.user?.location || ''
  const country = artisan.user?.country || ''
  const bio = artisan.user?.bio || ''
  const specialties = parseJSON(artisan.specialties)
  const skills = parseJSON(artisan.skills)
  const certifications = parseJSON(artisan.certifications)
  const portfolio = parseJSON(artisan.portfolio)
  const badgeInfo = BADGE_STYLES[artisan.badge] || BADGE_STYLES['Nouveau']
  const BadgeIcon = badgeInfo.icon
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const memberSince = artisan.user?.createdAt
    ? new Date(artisan.user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Button variant="ghost" className="mb-6 -ml-4" onClick={onBack}>
        <ChevronLeft className="h-4 w-4 mr-1" />
        Retour aux résultats
      </Button>

      {/* Header */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Card className="border-border/50 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-amber-500 to-orange-600 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)]" />
          </div>
          <CardContent className="p-6 -mt-12 relative">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-2xl border-4 border-background shadow-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{name}</h1>
                  <Badge className={`${badgeInfo.color} border-0 gap-1`}>
                    <BadgeIcon className="h-3 w-3" />
                    {artisan.badge}
                  </Badge>
                  {artisan.isAvailable && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700 gap-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      Disponible
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {(location || country) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {[location, country].filter(Boolean).join(', ')}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {artisan.rating.toFixed(1)} ({artisan.reviewCount} avis)
                  </span>
                  {memberSince && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Membre depuis {memberSince}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 sm:self-end">
                <button
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-border/50 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                  onClick={() => toggleFavorite(artisanId)}
                  aria-label={favoriteIds.includes(artisanId) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart className={`h-5 w-5 transition-colors ${favoriteIds.includes(artisanId) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                </button>
                <Button
                  variant="outline"
                  className="gap-1"
                  onClick={() => setContactOpen(true)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Contacter
                </Button>
                <Button
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 gap-1"
                  onClick={() => setDevisOpen(true)}
                >
                  <FileText className="h-4 w-4" />
                  Demander un devis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {bio && (
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{bio}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Skills & Specialties */}
          {(specialties.length > 0 || skills.length > 0) && (
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Compétences & Spécialités</CardTitle>
                </CardHeader>
                <CardContent>
                  {specialties.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Spécialités</p>
                      <div className="flex flex-wrap gap-2">
                        {specialties.map((spec) => (
                          <Badge key={spec} className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Compétences</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {portfolio.map((item, idx) => (
                      <div key={idx} className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                        {typeof item === 'string' ? item : JSON.stringify(item)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Reviews */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.25 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Avis ({artisan.reviewCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {artisan.reviews && artisan.reviews.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {artisan.reviews.map((review) => (
                      <div key={review.id} className="pb-4 border-b border-border/50 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                              {review.author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="font-medium text-sm">{review.author.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                          </span>
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Aucun avis pour le moment</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <Card className="border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {artisan.hourlyRate.toLocaleString()} <span className="text-base font-normal text-muted-foreground">FCFA/h</span>
                  </p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{artisan.experience} ans d&apos;expérience</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{artisan.missionCount} missions réalisées</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">{artisan.isAvailable ? 'Disponible maintenant' : 'Indisponible'}</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                  onClick={() => setDevisOpen(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Demander un devis
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setContactOpen(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Certifications */}
          {certifications.length > 0 && (
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{typeof cert === 'string' ? cert : JSON.stringify(cert)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Verification */}
          {artisan.user?.isVerified && (
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-emerald-500" />
                    <div>
                      <p className="font-medium text-sm">Identité vérifiée</p>
                      <p className="text-xs text-muted-foreground">Pièce d&apos;identité validée</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              Contacter {name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Votre message</Label>
              <Textarea
                placeholder="Décrivez votre besoin..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
              onClick={handleSendMessage}
              disabled={sending || !messageText.trim()}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Envoyer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Devis Dialog */}
      <Dialog open={devisOpen} onOpenChange={setDevisOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Demander un devis à {name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Description du projet</Label>
              <Textarea
                placeholder="Décrivez votre projet en détail..."
                value={devisText}
                onChange={e => setDevisText(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Budget estimé (FCFA)</Label>
              <Input
                type="number"
                placeholder="Ex: 50 000"
                value={devisBudget}
                onChange={e => setDevisBudget(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
              onClick={handleSendDevis}
              disabled={sending || !devisText.trim()}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Envoyer la demande
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
