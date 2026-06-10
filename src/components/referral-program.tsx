'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Send,
  Mail,
  MessageSquare,
  Link2,
  Gift,
  Users,
  Trophy,
  Star,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  UserPlus,
  Award,
  Crown,
  Shield,
  Zap,
  PartyPopper,
  ExternalLink,
} from 'lucide-react'
import type { ReferralStats, ReferralInvite } from '@/lib/types'
import { useAppStore } from '@/lib/store'

// ─── Props ─────────────────────────────────────────────────────────────────

interface ReferralProgramProps {
  onBack: () => void
}

// ─── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_STATS: ReferralStats = {
  code: 'ARTISAN-7K9M',
  totalInvites: 8,
  successfulReferrals: 3,
  creditsEarned: 7500,
  creditsUsed: 2500,
  creditsAvailable: 5000,
}

const MOCK_INVITES: ReferralInvite[] = [
  {
    id: '1',
    inviteeName: 'Aminata Koné',
    inviteeEmail: 'aminata.kone@email.com',
    status: 'completed',
    creditsEarned: 2500,
    date: '2025-01-15',
  },
  {
    id: '2',
    inviteeName: 'Ibrahim Diarra',
    inviteeEmail: 'ibrahim.diarra@email.com',
    status: 'completed',
    creditsEarned: 2500,
    date: '2025-01-22',
  },
  {
    id: '3',
    inviteeName: 'Fatou Sow',
    inviteeEmail: 'fatou.sow@email.com',
    status: 'registered',
    creditsEarned: 0,
    date: '2025-02-01',
  },
  {
    id: '4',
    inviteeName: 'Moussa Traoré',
    inviteeEmail: 'moussa.traore@email.com',
    status: 'completed',
    creditsEarned: 2500,
    date: '2025-02-05',
  },
  {
    id: '5',
    inviteeName: 'Aïcha Bello',
    inviteeEmail: 'aicha.bello@email.com',
    status: 'registered',
    creditsEarned: 0,
    date: '2025-02-10',
  },
  {
    id: '6',
    inviteeName: 'Ousmane Ba',
    inviteeEmail: 'ousmane.ba@email.com',
    status: 'pending',
    creditsEarned: 0,
    date: '2025-02-18',
  },
  {
    id: '7',
    inviteeName: 'Mariama Diallo',
    inviteeEmail: 'mariama.diallo@email.com',
    status: 'pending',
    creditsEarned: 0,
    date: '2025-02-20',
  },
  {
    id: '8',
    inviteeName: 'Kofi Mensah',
    inviteeEmail: 'kofi.mensah@email.com',
    status: 'pending',
    creditsEarned: 0,
    date: '2025-02-25',
  },
]

const REWARD_TIERS = [
  {
    id: '1',
    credits: 2500,
    title: 'Réduction sur prochaine mission',
    description: 'Obtenez une réduction de 2 500 FCFA sur votre prochaine mission réservée sur la plateforme.',
    icon: Sparkles,
    color: 'from-amber-400 to-amber-500',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  {
    id: '2',
    credits: 5000,
    title: 'Mission gratuite',
    description: 'Profitez d\'une mission gratuite d\'une valeur maximale de 5 000 FCFA. Parfait pour les petits travaux !',
    icon: Gift,
    color: 'from-orange-400 to-orange-600',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  {
    id: '3',
    credits: 10000,
    title: 'Badge "Ambassadeur" + 1 mois Pro',
    description: 'Recevez le badge exclusif "Ambassadeur" et un mois gratuit de l\'abonnement Pro avec toutes les fonctionnalités avancées.',
    icon: Award,
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/30',
    borderColor: 'border-amber-300 dark:border-amber-700',
  },
  {
    id: '4',
    credits: 25000,
    title: 'Statut VIP + Support prioritaire',
    description: 'Accédez au statut VIP avec support prioritaire 24/7, accès anticipé aux nouvelles fonctionnalités et avantages exclusifs.',
    icon: Crown,
    color: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/30',
    borderColor: 'border-orange-300 dark:border-orange-700',
  },
]

// ─── Confetti on Share ─────────────────────────────────────────────────────

function ConfettiPiece({ delay, x, color, size }: { delay: number; x: number; color: string; size: number }) {
  return (
    <motion.div
      className="absolute top-0 pointer-events-none"
      style={{ left: `${x}%`, width: size, height: size }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: ['0vh', '100vh'],
        opacity: [1, 1, 0],
        rotate: [0, 360, 720],
        x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        ease: 'easeOut',
      }}
    >
      <div
        className="w-full h-full rounded-sm"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  )
}

function ShareConfetti({ show }: { show: boolean }) {
  if (!show) return null
  const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316']
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 5 + Math.random() * 7,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} {...p} />
      ))}
    </div>
  )
}

// ─── Animated Counter ──────────────────────────────────────────────────────

function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) return

    const startTime = performance.now()
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (end - start) * eased)
      setDisplay(current)
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [value, duration])

  return (
    <span ref={ref}>
      {new Intl.NumberFormat('fr-FR').format(display)}
    </span>
  )
}

// ─── Status Badge ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReferralInvite['status'] }) {
  const config = {
    pending: {
      label: 'En attente',
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      icon: Clock,
    },
    registered: {
      label: 'Inscrit',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
    },
    completed: {
      label: 'Complété',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: CheckCircle2,
    },
  }

  const { label, className, icon: Icon } = config[status]

  return (
    <Badge variant="outline" className={`px-2 py-0.5 text-xs ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export function ReferralProgram({ onBack }: ReferralProgramProps) {
  const { user } = useAppStore()
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false)
  const [selectedReward, setSelectedReward] = useState<typeof REWARD_TIERS[0] | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSent, setInviteSent] = useState(false)

  const stats = MOCK_STATS
  const invites = MOCK_INVITES

  const completedInvites = invites.filter((i) => i.status === 'completed').length
  const registeredInvites = invites.filter((i) => i.status === 'registered').length
  const pendingInvites = invites.filter((i) => i.status === 'pending').length
  const missionsCompleted = completedInvites

  // Next milestone: 5 completed referrals = 10,000 FCFA bonus
  const nextMilestoneTarget = 5
  const nextMilestoneProgress = (completedInvites / nextMilestoneTarget) * 100
  const remainingToMilestone = nextMilestoneTarget - completedInvites

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(stats.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = stats.code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [stats.code])

  const handleShare = useCallback((method: string) => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)

    const shareText = `Rejoignez Artisan Connecté avec mon code de parrainage : ${stats.code}. Trouvez les meilleurs artisans en Afrique !`
    const shareUrl = `https://artisan-connecte.com/ref/${stats.code}`

    switch (method) {
      case 'whatsapp': {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        window.open(url, '_blank')
        break
      }
      case 'sms': {
        const url = `sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        window.open(url, '_blank')
        break
      }
      case 'email': {
        const subject = encodeURIComponent('Rejoignez Artisan Connecté !')
        const body = encodeURIComponent(shareText + '\n\n' + shareUrl)
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
        break
      }
      case 'link': {
        navigator.clipboard.writeText(shareUrl).catch(() => {})
        break
      }
    }
  }, [stats.code])

  const handleSendInvite = useCallback(() => {
    if (inviteEmail.trim()) {
      setInviteSent(true)
      setInviteEmail('')
      setTimeout(() => setInviteSent(false), 3000)
    }
  }, [inviteEmail])

  const handleRedeemReward = useCallback((reward: typeof REWARD_TIERS[0]) => {
    setSelectedReward(reward)
    setRedeemDialogOpen(true)
  }, [])

  // ─── Animation variants ─────────────────────────────────────────────────

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  }

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/20 to-orange-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-amber-950/5">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-border/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-amber-100 dark:hover:bg-amber-950/50"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <Gift className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-base bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Programme de parrainage
                  </h1>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">
                    Invitez vos amis et gagnez des crédits
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stats in header */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Crédits disponibles</p>
                <p className="font-bold text-sm text-amber-600 dark:text-amber-400">
                  {new Intl.NumberFormat('fr-FR').format(stats.creditsAvailable)} FCFA
                </p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Parrainages</p>
                <p className="font-bold text-sm">{stats.successfulReferrals}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 mb-6 bg-muted/50 p-1 h-auto">
            <TabsTrigger
              value="dashboard"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white py-2"
            >
              <Trophy className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Tableau
            </TabsTrigger>
            <TabsTrigger
              value="how-it-works"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white py-2"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Comment ça marche
            </TabsTrigger>
            <TabsTrigger
              value="invites"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white py-2"
            >
              <Users className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Mes invitations
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white py-2"
            >
              <Award className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Récompenses
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 1: REFERRAL DASHBOARD
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="dashboard" className="mt-0">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6"
            >
              {/* Referral Code Card */}
              <motion.div variants={fadeInUp}>
                <Card className="overflow-hidden border-amber-200 dark:border-amber-800 shadow-lg relative">
                  {showConfetti && <ShareConfetti show={showConfetti} />}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-amber-600/5 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-amber-600/10 pointer-events-none" />
                  <CardContent className="p-6 sm:p-8 relative z-[5]">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                          <Gift className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold">
                          Votre code de parrainage
                        </h2>
                      </div>

                      {/* Code Display */}
                      <motion.div
                        className="mx-auto max-w-xs"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 cursor-pointer group"
                          onClick={handleCopyCode}
                        >
                          <p className="text-3xl sm:text-4xl font-extrabold tracking-widest bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                            {stats.code}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            Cliquez pour copier
                          </p>
                        </div>
                      </motion.div>

                      {/* Copy Button */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 h-11 px-6 font-semibold shadow-lg shadow-amber-500/20"
                          onClick={handleCopyCode}
                        >
                          <AnimatePresence mode="wait">
                            {copied ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                className="flex items-center gap-2"
                              >
                                <Check className="h-4 w-4" />
                                Code copié !
                              </motion.div>
                            ) : (
                              <motion.div
                                key="copy"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="flex items-center gap-2"
                              >
                                <Copy className="h-4 w-4" />
                                Copier le code
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </motion.div>

                      {/* Share Buttons */}
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground mb-3">Partager via</p>
                        <div className="flex items-center justify-center gap-3">
                          {[
                            { method: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500 hover:bg-green-600', shadow: 'shadow-green-500/20' },
                            { method: 'sms', label: 'SMS', icon: Send, color: 'bg-blue-500 hover:bg-blue-600', shadow: 'shadow-blue-500/20' },
                            { method: 'email', label: 'Email', icon: Mail, color: 'bg-red-500 hover:bg-red-600', shadow: 'shadow-red-500/20' },
                            { method: 'link', label: 'Copier le lien', icon: Link2, color: 'bg-neutral-500 hover:bg-neutral-600', shadow: 'shadow-neutral-500/20' },
                          ].map((share) => (
                            <motion.button
                              key={share.method}
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleShare(share.method)}
                              className={`flex flex-col items-center gap-1.5 group/share`}
                            >
                              <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition-colors ${share.color} ${share.shadow}`}>
                                <share.icon className="h-5 w-5" />
                              </div>
                              <span className="text-[10px] text-muted-foreground group-hover/share:text-foreground transition-colors">
                                {share.label}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stats Cards Row */}
              <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  {
                    label: 'Invitations envoyées',
                    value: stats.totalInvites,
                    icon: Send,
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-100 dark:bg-blue-950/50',
                    format: false,
                  },
                  {
                    label: 'Inscriptions',
                    value: stats.successfulReferrals,
                    icon: UserPlus,
                    color: 'text-emerald-600 dark:text-emerald-400',
                    bg: 'bg-emerald-100 dark:bg-emerald-950/50',
                    format: false,
                  },
                  {
                    label: 'Missions complétées',
                    value: missionsCompleted,
                    icon: CheckCircle2,
                    color: 'text-amber-600 dark:text-amber-400',
                    bg: 'bg-amber-100 dark:bg-amber-950/50',
                    format: false,
                  },
                  {
                    label: 'Crédits gagnés',
                    value: stats.creditsEarned,
                    icon: Star,
                    color: 'text-orange-600 dark:text-orange-400',
                    bg: 'bg-orange-100 dark:bg-orange-950/50',
                    format: true,
                    suffix: ' FCFA',
                  },
                ].map((stat, idx) => (
                  <motion.div key={stat.label} variants={fadeInUp}>
                    <Card className="border-border/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:shadow-md h-full">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                          </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-extrabold">
                          <AnimatedCounter value={stat.value} duration={1 + idx * 0.2} />
                          {stat.format ? stat.suffix : ''}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Available Credits + Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Available Credits Card */}
                <motion.div variants={fadeInUp}>
                  <Card className="border-amber-200 dark:border-amber-800 shadow-md h-full">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Crédits disponibles</p>
                          <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            <AnimatedCounter value={stats.creditsAvailable} /> FCFA
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex justify-between">
                          <span>Crédits gagnés</span>
                          <span className="font-medium text-foreground">{new Intl.NumberFormat('fr-FR').format(stats.creditsEarned)} FCFA</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Crédits utilisés</span>
                          <span className="font-medium text-foreground">{new Intl.NumberFormat('fr-FR').format(stats.creditsUsed)} FCFA</span>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 font-semibold shadow-lg shadow-amber-500/20"
                        onClick={() => setActiveTab('rewards')}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Utiliser mes crédits
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Progress toward next milestone */}
                <motion.div variants={fadeInUp}>
                  <Card className="border-border/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all shadow-md h-full">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/20">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Prochain palier</p>
                          <p className="text-lg font-bold">10 000 FCFA</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {completedInvites}/{nextMilestoneTarget} parrainages
                          </span>
                        </div>
                        <Progress
                          value={nextMilestoneProgress}
                          className="h-3 bg-amber-100 dark:bg-amber-950/50 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-amber-500 [&>[data-slot=progress-indicator]]:to-orange-500 [&>[data-slot=progress-indicator]]:rounded-full"
                        />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-amber-600 dark:text-amber-400">{remainingToMilestone} parrainage{remainingToMilestone > 1 ? 's' : ''}</span> de plus pour débloquer{' '}
                          <span className="font-semibold">10 000 FCFA</span>
                        </p>
                      </div>

                      {/* Invite by email */}
                      <Separator className="my-4" />
                      <div>
                        <p className="text-sm font-medium mb-2">Inviter par email</p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="email@exemple.com"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="h-10 border-border/50 focus:border-amber-400 focus:ring-amber-400/20 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleSendInvite()}
                          />
                          <Button
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shrink-0"
                            onClick={handleSendInvite}
                            disabled={!inviteEmail.trim()}
                          >
                            <AnimatePresence mode="wait">
                              {inviteSent ? (
                                <motion.div
                                  key="sent"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <Check className="h-4 w-4" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="send"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <Send className="h-4 w-4" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2: HOW IT WORKS
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="how-it-works" className="mt-0">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} className="text-center space-y-3">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Comment ça{' '}
                  <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                    marche
                  </span>{' '}
                  ?
                </h2>
                <p className="text-muted-foreground text-base max-w-2xl mx-auto">
                  Gagnez des crédits en invitant vos amis à rejoindre Artisan Connecté. C&apos;est simple, rapide et gratifiant !
                </p>
              </motion.div>

              {/* 3 Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {[
                  {
                    step: 1,
                    emoji: '📤',
                    title: 'Partagez votre code',
                    description: 'Envoyez votre code unique à vos amis via WhatsApp, SMS, email ou en copiant le lien.',
                    icon: Share2,
                    gradient: 'from-amber-400 to-amber-600',
                    bg: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
                    border: 'border-amber-200 dark:border-amber-800',
                  },
                  {
                    step: 2,
                    emoji: '👥',
                    title: 'Ils s\'inscrivent',
                    description: 'Vos amis créent un compte sur Artisan Connecté en utilisant votre code de parrainage.',
                    icon: UserPlus,
                    gradient: 'from-orange-400 to-orange-600',
                    bg: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
                    border: 'border-orange-200 dark:border-orange-800',
                  },
                  {
                    step: 3,
                    emoji: '🎁',
                    title: 'Gagnez des crédits',
                    description: 'Recevez 2 500 FCFA pour chaque ami qui complète une mission sur la plateforme.',
                    icon: Gift,
                    gradient: 'from-amber-500 to-orange-600',
                    bg: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
                    border: 'border-amber-300 dark:border-amber-700',
                  },
                ].map((stepData, idx) => (
                  <motion.div key={stepData.step} variants={fadeInUp} className="relative">
                    {/* Connecting arrow (desktop) */}
                    {idx < 2 && (
                      <div className="hidden md:flex absolute top-20 -right-4 sm:-right-6 z-10 items-center">
                        <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-amber-300 to-orange-300 dark:from-amber-700 dark:to-orange-700" />
                        <ChevronRight className="h-5 w-5 text-amber-400 dark:text-amber-600 -ml-1" />
                      </div>
                    )}

                    <Card className={`h-full ${stepData.border} bg-gradient-to-br ${stepData.bg} hover:shadow-lg transition-all relative overflow-hidden`}>
                      <CardContent className="p-6 sm:p-8 text-center">
                        {/* Step number */}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white/60 dark:bg-neutral-900/60 text-amber-600 dark:text-amber-400 border-0 text-xs font-bold backdrop-blur-sm">
                            Étape {stepData.step}
                          </Badge>
                        </div>

                        {/* Emoji + Icon */}
                        <div className="mb-5">
                          <motion.div
                            className="text-5xl mb-3"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.4 }}
                          >
                            {stepData.emoji}
                          </motion.div>
                          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stepData.gradient} shadow-lg`}>
                            <stepData.icon className="h-7 w-7 text-white" />
                          </div>
                        </div>

                        <h3 className="text-xl font-bold mb-3">{stepData.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{stepData.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Bonus info card */}
              <motion.div variants={fadeInUp}>
                <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                        <PartyPopper className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">Bonus de bienvenue !</h3>
                        <p className="text-muted-foreground text-sm">
                          Pour chaque ami qui s&apos;inscrit avec votre code et complète sa première mission, vous recevez{' '}
                          <span className="font-bold text-amber-600 dark:text-amber-400">2 500 FCFA</span> de crédits.
                          Il n&apos;y a pas de limite ! Plus vous parrainez, plus vous gagnez.
                        </p>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shrink-0 font-semibold shadow-lg shadow-amber-500/20"
                        onClick={() => setActiveTab('dashboard')}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 3: MY INVITES
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="invites" className="mt-0">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.div variants={fadeInUp} className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    Mes{' '}
                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                      invitations
                    </span>
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Suivez le statut de vos invitations et vos gains
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="px-3 py-1 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-amber-500" />
                    {completedInvites} complété{completedInvites > 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
                    <UserPlus className="h-3 w-3 mr-1 text-emerald-500" />
                    {registeredInvites} inscrit{registeredInvites > 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
                    <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                    {pendingInvites} en attente
                  </Badge>
                </div>
              </motion.div>

              {invites.length > 0 ? (
                <motion.div variants={staggerContainer} className="space-y-3">
                  {/* Desktop table header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-3">Nom</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2">Statut</div>
                    <div className="col-span-2 text-right">Crédits</div>
                    <div className="col-span-2 text-right">Date</div>
                  </div>

                  {invites.map((invite, idx) => (
                    <motion.div key={invite.id} variants={fadeInUp}>
                      <Card className="border-border/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:shadow-sm">
                        <CardContent className="p-4">
                          {/* Desktop layout */}
                          <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3 flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-xs">
                                {invite.inviteeName.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <span className="font-medium text-sm truncate">{invite.inviteeName}</span>
                            </div>
                            <div className="col-span-3 text-sm text-muted-foreground truncate">{invite.inviteeEmail}</div>
                            <div className="col-span-2">
                              <StatusBadge status={invite.status} />
                            </div>
                            <div className="col-span-2 text-right">
                              {invite.creditsEarned > 0 ? (
                                <span className="font-semibold text-amber-600 dark:text-amber-400 text-sm">
                                  +{new Intl.NumberFormat('fr-FR').format(invite.creditsEarned)} FCFA
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </div>
                            <div className="col-span-2 text-right text-sm text-muted-foreground">
                              {new Date(invite.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          </div>

                          {/* Mobile layout */}
                          <div className="md:hidden flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-xs">
                              {invite.inviteeName.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium text-sm truncate">{invite.inviteeName}</p>
                                <StatusBadge status={invite.status} />
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{invite.inviteeEmail}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(invite.date).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                                {invite.creditsEarned > 0 && (
                                  <span className="font-semibold text-amber-600 dark:text-amber-400 text-xs">
                                    +{new Intl.NumberFormat('fr-FR').format(invite.creditsEarned)} FCFA
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                /* Empty state */
                <motion.div variants={fadeInUp}>
                  <Card className="border-dashed border-2 border-border/50">
                    <CardContent className="p-8 sm:p-12 text-center">
                      <motion.div
                        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 mb-4"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Users className="h-10 w-10 text-amber-500 dark:text-amber-400" />
                      </motion.div>
                      <h3 className="text-lg font-bold mb-2">Aucune invitation pour le moment</h3>
                      <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                        Commencez à partager votre code de parrainage avec vos amis pour gagner des crédits !
                      </p>
                      <Button
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 font-semibold"
                        onClick={() => setActiveTab('dashboard')}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager mon code
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 4: REWARDS
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="rewards" className="mt-0">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.div variants={fadeInUp}>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">
                      {' '}
                      <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                        Récompenses
                      </span>{' '}
                      disponibles
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Échangez vos crédits contre des récompenses exclusives
                    </p>
                  </div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 px-3 py-1 text-sm">
                    <Trophy className="h-3.5 w-3.5 mr-1.5" />
                    {new Intl.NumberFormat('fr-FR').format(stats.creditsAvailable)} FCFA
                  </Badge>
                </div>
              </motion.div>

              <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {REWARD_TIERS.map((reward, idx) => {
                  const canRedeem = stats.creditsAvailable >= reward.credits
                  const isPopular = idx === 2 // "Ambassadeur" tier

                  return (
                    <motion.div key={reward.id} variants={fadeInUp}>
                      <Card className={`h-full relative overflow-hidden transition-all hover:shadow-lg ${isPopular ? 'border-amber-300 dark:border-amber-700 shadow-md' : 'border-border/50 hover:border-amber-300 dark:hover:border-amber-700'}`}>
                        {/* Popular badge */}
                        {isPopular && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 text-[10px] px-2 py-0.5">
                              <Star className="h-2.5 w-2.5 mr-1" />
                              Populaire
                            </Badge>
                          </div>
                        )}

                        <CardContent className="p-5 sm:p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${reward.color} shadow-lg`}>
                              <reward.icon className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base mb-1">{reward.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{reward.description}</p>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">Coût</p>
                              <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                                {new Intl.NumberFormat('fr-FR').format(reward.credits)} FCFA
                              </p>
                            </div>

                            {canRedeem ? (
                              <Button
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 font-semibold shadow-lg shadow-amber-500/20"
                                onClick={() => handleRedeemReward(reward)}
                              >
                                <Sparkles className="h-4 w-4 mr-1.5" />
                                Échanger
                              </Button>
                            ) : (
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Il vous manque
                                </p>
                                <p className="text-sm font-semibold text-muted-foreground">
                                  {new Intl.NumberFormat('fr-FR').format(reward.credits - stats.creditsAvailable)} FCFA
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-1 text-xs border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400"
                                  onClick={() => setActiveTab('dashboard')}
                                >
                                  Inviter
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          REDEEM DIALOG
          ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-500" />
              Confirmer l&apos;échange
            </DialogTitle>
            <DialogDescription>
              Vous allez échanger vos crédits contre cette récompense.
            </DialogDescription>
          </DialogHeader>

          {selectedReward && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedReward.color} shadow-lg`}>
                  <selectedReward.icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">{selectedReward.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coût</span>
                  <span className="font-semibold">{new Intl.NumberFormat('fr-FR').format(selectedReward.credits)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vos crédits</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{new Intl.NumberFormat('fr-FR').format(stats.creditsAvailable)} FCFA</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Solde après échange</span>
                  <span className="font-semibold">{new Intl.NumberFormat('fr-FR').format(stats.creditsAvailable - selectedReward.credits)} FCFA</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setRedeemDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 font-semibold"
                  onClick={() => setRedeemDialogOpen(false)}
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Confirmer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
