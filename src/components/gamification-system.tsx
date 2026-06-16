'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Trophy,
  Medal,
  Star,
  Flame,
  Target,
  Clock,
  CheckCircle2,
  Lock,
  Crown,
  Zap,
  Heart,
  Users,
  TrendingUp,
  Calendar,
  Gift,
  Award,
  Shield,
  Sparkles,
} from 'lucide-react'
import type { Badge as BadgeType, BadgeCategory, UserLevel, GamificationProfile } from '@/lib/types'
import { useAppStore } from '@/lib/store'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GamificationSystemProps {
  onBack: () => void
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockUserLevel: UserLevel = {
  level: 12,
  title: 'Artisan Confirmé',
  xp: 3450,
  xpToNext: 5000,
  totalXp: 18450,
}

const mockBadges: BadgeType[] = [
  {
    id: 'b1',
    name: 'Première Mission',
    description: 'Complétez votre première mission avec succès',
    icon: '🎯',
    category: 'achievement',
    earned: true,
    earnedAt: '2024-11-15',
    progress: 1,
    maxProgress: 1,
  },
  {
    id: 'b2',
    name: '5 Avis Positifs',
    description: 'Recevez 5 avis positifs de clients satisfaits',
    icon: '⭐',
    category: 'social',
    earned: true,
    earnedAt: '2024-12-03',
    progress: 5,
    maxProgress: 5,
  },
  {
    id: 'b3',
    name: 'Master Plombier',
    description: 'Complétez 20 missions de plomberie',
    icon: '🔧',
    category: 'skill',
    earned: true,
    earnedAt: '2025-01-10',
    progress: 20,
    maxProgress: 20,
  },
  {
    id: 'b4',
    name: '30 Jours Consécutifs',
    description: 'Connectez-vous 30 jours de suite',
    icon: '🔥',
    category: 'loyalty',
    earned: true,
    earnedAt: '2025-02-01',
    progress: 30,
    maxProgress: 30,
  },
  {
    id: 'b5',
    name: 'Urgence Minuit',
    description: 'Acceptez une mission d\'urgence après minuit',
    icon: '🌙',
    category: 'special',
    earned: true,
    earnedAt: '2025-01-22',
    progress: 1,
    maxProgress: 1,
  },
  {
    id: 'b6',
    name: '10 Missions Réussies',
    description: 'Complétez 10 missions sans réclamation',
    icon: '🏆',
    category: 'achievement',
    earned: true,
    earnedAt: '2025-01-05',
    progress: 10,
    maxProgress: 10,
  },
  {
    id: 'b7',
    name: 'Ambassadeur',
    description: 'Parrainez 5 nouveaux artisans sur la plateforme',
    icon: '🤝',
    category: 'social',
    earned: true,
    earnedAt: '2025-02-14',
    progress: 5,
    maxProgress: 5,
  },
  {
    id: 'b8',
    name: 'Électricien Expert',
    description: 'Obtenez la certification Électricité niveau expert',
    icon: '⚡',
    category: 'skill',
    earned: true,
    earnedAt: '2025-02-20',
    progress: 1,
    maxProgress: 1,
  },
  {
    id: 'b9',
    name: '100 Missions',
    description: 'Complétez 100 missions au total',
    icon: '💎',
    category: 'achievement',
    earned: false,
    progress: 67,
    maxProgress: 100,
  },
  {
    id: 'b10',
    name: '20 Avis 5 Étoiles',
    description: 'Recevez 20 avis avec la note maximale',
    icon: '🌟',
    category: 'social',
    earned: false,
    progress: 14,
    maxProgress: 20,
  },
  {
    id: 'b11',
    name: 'Menuisier Légendaire',
    description: 'Complétez 50 missions de menuiserie',
    icon: '🪚',
    category: 'skill',
    earned: false,
    progress: 28,
    maxProgress: 50,
  },
  {
    id: 'b12',
    name: '100 Jours Consécutifs',
    description: 'Connectez-vous 100 jours de suite',
    icon: '💪',
    category: 'loyalty',
    earned: false,
    progress: 42,
    maxProgress: 100,
  },
  {
    id: 'b13',
    name: 'Sauveur du Week-end',
    description: 'Acceptez 3 missions urgentes le week-end',
    icon: '🦸',
    category: 'special',
    earned: false,
    progress: 1,
    maxProgress: 3,
  },
  {
    id: 'b14',
    name: 'Polyvalent',
    description: 'Obtenez des certifications dans 4 catégories différentes',
    icon: '🎨',
    category: 'skill',
    earned: false,
    progress: 2,
    maxProgress: 4,
  },
  {
    id: 'b15',
    name: 'Fidélité Annuelle',
    description: 'Restez actif sur la plateforme pendant 1 an',
    icon: '📅',
    category: 'loyalty',
    earned: false,
    progress: 8,
    maxProgress: 12,
  },
]

const mockLeaderboard = [
  { rank: 1, name: 'Amadou Diallo', level: 18, points: 12450, avatar: 'AD', color: 'bg-amber-500' },
  { rank: 2, name: 'Fatou Ndiaye', level: 17, points: 11200, avatar: 'FN', color: 'bg-emerald-500' },
  { rank: 3, name: 'Kofi Mensah', level: 16, points: 10800, avatar: 'KM', color: 'bg-orange-500' },
  { rank: 4, name: 'Aïcha Bello', level: 15, points: 9650, avatar: 'AB', color: 'bg-teal-500' },
  { rank: 5, name: 'Moussa Traoré', level: 14, points: 8900, avatar: 'MT', color: 'bg-cyan-500' },
  { rank: 6, name: 'Mariama Sow', level: 13, points: 8200, avatar: 'MS', color: 'bg-violet-500' },
  { rank: 7, name: 'Ibrahim Diarra', level: 13, points: 7800, avatar: 'ID', color: 'bg-rose-500' },
  { rank: 8, name: 'Aminata Koné', level: 12, points: 7200, avatar: 'AK', color: 'bg-indigo-500' },
  { rank: 9, name: 'Ousmane Ba', level: 12, points: 6900, avatar: 'OB', color: 'bg-pink-500' },
  { rank: 10, name: 'Jean-Pierre Aka', level: 11, points: 6500, avatar: 'JA', color: 'bg-sky-500' },
  { rank: 11, name: 'Mariam Doumbia', level: 11, points: 6200, avatar: 'MD', color: 'bg-lime-500' },
  { rank: 12, name: 'Abdoulaye Camara', level: 10, points: 5800, avatar: 'AC', color: 'bg-fuchsia-500' },
  { rank: 13, name: 'Kadiatou Sylla', level: 10, points: 5400, avatar: 'KS', color: 'bg-amber-600' },
  { rank: 14, name: 'Boubacar Diop', level: 9, points: 5100, avatar: 'BD', color: 'bg-emerald-600' },
  { rank: 15, name: 'Awa Touré', level: 9, points: 4800, avatar: 'AT', color: 'bg-orange-600' },
  { rank: 16, name: 'Seydou Keita', level: 8, points: 4500, avatar: 'SK', color: 'bg-teal-600' },
  { rank: 17, name: 'Fatoumata Diabaté', level: 8, points: 4200, avatar: 'FD', color: 'bg-cyan-600' },
  { rank: 18, name: 'Modibo Coulibaly', level: 7, points: 3900, avatar: 'MC', color: 'bg-violet-600' },
  { rank: 19, name: 'Djenaba Bah', level: 7, points: 3600, avatar: 'DB', color: 'bg-rose-600' },
  { rank: 20, name: 'Youssouf Sangaré', level: 6, points: 3300, avatar: 'YS', color: 'bg-pink-600' },
]

interface Challenge {
  id: string
  title: string
  description: string
  rewardXp: number
  rewardBadge: string
  progress: number
  maxProgress: number
  deadline: string
  completed: boolean
}

const mockActiveChallenges: Challenge[] = [
  {
    id: 'c1',
    title: 'Marathon du Mois',
    description: 'Complétez 15 missions ce mois-ci pour gagner un bonus XP exceptionnel',
    rewardXp: 500,
    rewardBadge: '🏃',
    progress: 9,
    maxProgress: 15,
    deadline: '2025-03-31',
    completed: false,
  },
  {
    id: 'c2',
    title: 'Avis en Or',
    description: 'Obtenez 5 avis 5 étoiles consécutifs pour débloquer ce défi',
    rewardXp: 300,
    rewardBadge: '✨',
    progress: 3,
    maxProgress: 5,
    deadline: '2025-03-15',
    completed: false,
  },
  {
    id: 'c3',
    title: 'Rapidité Extrême',
    description: 'Acceptez 3 missions en moins de 10 minutes après publication',
    rewardXp: 200,
    rewardBadge: '⚡',
    progress: 1,
    maxProgress: 3,
    deadline: '2025-03-20',
    completed: false,
  },
  {
    id: 'c4',
    title: 'Explorateur',
    description: 'Travaillez dans 5 quartiers différents ce mois-ci',
    rewardXp: 250,
    rewardBadge: '🗺️',
    progress: 3,
    maxProgress: 5,
    deadline: '2025-03-31',
    completed: false,
  },
]

const mockCompletedChallenges: Challenge[] = [
  {
    id: 'cc1',
    title: 'Premiers Pas',
    description: 'Complétez vos 3 premières missions sur la plateforme',
    rewardXp: 150,
    rewardBadge: '👣',
    progress: 3,
    maxProgress: 3,
    deadline: '2025-02-28',
    completed: true,
  },
  {
    id: 'cc2',
    title: 'Semaine Parfaite',
    description: 'Obtenez uniquement des avis 5 étoiles pendant une semaine',
    rewardXp: 400,
    rewardBadge: '👑',
    progress: 7,
    maxProgress: 7,
    deadline: '2025-02-14',
    completed: true,
  },
  {
    id: 'cc3',
    title: 'Nouvel An Artisan',
    description: 'Complétez une mission entre le 1er et le 7 janvier',
    rewardXp: 100,
    rewardBadge: '🎆',
    progress: 1,
    maxProgress: 1,
    deadline: '2025-01-07',
    completed: true,
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const categoryLabels: Record<BadgeCategory, string> = {
  achievement: 'Réalisation',
  social: 'Social',
  skill: 'Compétence',
  loyalty: 'Fidélité',
  special: 'Spécial',
}

const categoryColors: Record<BadgeCategory, string> = {
  achievement: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  social: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  skill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  loyalty: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  special: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
}

const categoryIconColors: Record<BadgeCategory, string> = {
  achievement: 'from-amber-400 to-amber-600',
  social: 'from-rose-400 to-rose-600',
  skill: 'from-emerald-400 to-emerald-600',
  loyalty: 'from-orange-400 to-orange-600',
  special: 'from-violet-400 to-violet-600',
}

function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'Expiré'
  if (diffDays === 1) return '1 jour restant'
  return `${diffDays} jours restants`
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProfileHeader({ profile }: { profile: GamificationProfile }) {
  const { user } = useAppStore()
  const level = profile.level
  const xpPercent = Math.round((level.xp / level.xpToNext) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-6 sm:p-8 text-white"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with level badge */}
          <div className="relative">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 p-[3px]">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'AC'}
                </div>
              </div>
              {/* Level badge overlay */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-900 font-extrabold text-xs shadow-lg border-2 border-white"
              >
                {level.level}
              </motion.div>
            </div>
          </div>

          {/* User info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold">{user?.name || 'Artisan Connect'}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <Crown className="h-4 w-4 text-amber-200" />
              <span className="text-amber-100 font-medium">{level.title}</span>
            </div>

            {/* XP Progress */}
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-amber-100">XP: {level.xp.toLocaleString()} / {level.xpToNext.toLocaleString()}</span>
                <span className="text-amber-200 font-semibold">{xpPercent}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-white/80 to-amber-200/90"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: Trophy, label: 'Points', value: profile.points.toLocaleString() },
            { icon: Award, label: 'Badges', value: `${profile.badges.filter(b => b.earned).length}/${profile.badges.length}` },
            { icon: Flame, label: 'Série', value: `${profile.streak} jours` },
            { icon: Medal, label: 'Rang', value: `#${profile.rank}` },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="flex flex-col items-center rounded-xl bg-white/10 backdrop-blur-sm p-3 sm:p-4 text-center"
            >
              <stat.icon className="h-5 w-5 mb-1.5 text-amber-200" />
              <span className="text-lg sm:text-xl font-bold">{stat.value}</span>
              <span className="text-xs text-amber-200">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Badge Card
// ---------------------------------------------------------------------------

function BadgeCard({
  badge,
  onClick,
  index,
}: {
  badge: BadgeType
  onClick: () => void
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`cursor-pointer group ${
        badge.earned ? '' : 'opacity-70 grayscale-[40%] hover:grayscale-[20%] hover:opacity-90'
      }`}
    >
      <Card
        className={`relative overflow-hidden transition-all duration-300 h-full ${
          badge.earned
            ? 'border-amber-300 dark:border-amber-700 shadow-md hover:shadow-lg'
            : 'border-border/50 hover:border-muted-foreground/30'
        }`}
      >
        {/* Golden glow for earned badges */}
        {badge.earned && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none" />
        )}

        <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center">
          {/* Icon circle */}
          <div
            className={`relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full mb-3 ${
              badge.earned
                ? `bg-gradient-to-br ${categoryIconColors[badge.category]} shadow-lg`
                : 'bg-muted'
            }`}
          >
            <span className="text-2xl sm:text-3xl">{badge.icon}</span>
            {!badge.earned && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                <Lock className="h-6 w-6 text-white/60" />
              </div>
            )}
            {/* Earned sparkle animation */}
            {badge.earned && (
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: index * 0.05 + 0.3, duration: 0.6, ease: 'easeOut' }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="h-4 w-4 text-yellow-300" />
              </motion.div>
            )}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-sm sm:text-base leading-tight mb-1">{badge.name}</h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{badge.description}</p>

          {/* Category tag */}
          <Badge
            variant="secondary"
            className={`text-[10px] px-2 py-0 mb-2 ${categoryColors[badge.category]}`}
          >
            {categoryLabels[badge.category]}
          </Badge>

          {/* Progress or earned date */}
          {badge.earned ? (
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Obtenu le {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
            </div>
          ) : badge.progress !== undefined && badge.maxProgress !== undefined ? (
            <div className="w-full">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{badge.progress}/{badge.maxProgress}</span>
                <span>{Math.round((badge.progress / badge.maxProgress) * 100)}%</span>
              </div>
              <Progress value={(badge.progress / badge.maxProgress) * 100} className="h-1.5" />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Badge Detail Dialog
// ---------------------------------------------------------------------------

function BadgeDetailDialog({
  badge,
  open,
  onClose,
}: {
  badge: BadgeType | null
  open: boolean
  onClose: () => void
}) {
  if (!badge) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Détails du badge</DialogTitle>
          <DialogDescription className="sr-only">
            Informations détaillées sur le badge {badge.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center text-center py-4">
          {/* Large icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full mb-4 ${
              badge.earned
                ? `bg-gradient-to-br ${categoryIconColors[badge.category]} shadow-xl`
                : 'bg-muted'
            }`}
          >
            <span className="text-4xl">{badge.icon}</span>
            {!badge.earned && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                <Lock className="h-8 w-8 text-white/60" />
              </div>
            )}
          </motion.div>

          {/* Name & category */}
          <h3 className="text-xl font-bold mb-1">{badge.name}</h3>
          <Badge
            variant="secondary"
            className={`mb-3 ${categoryColors[badge.category]}`}
          >
            {categoryLabels[badge.category]}
          </Badge>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4 max-w-xs">{badge.description}</p>

          <Separator className="mb-4" />

          {/* Progress or earned info */}
          {badge.earned ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Badge obtenu !</span>
              </div>
              {badge.earnedAt && (
                <span className="text-sm text-muted-foreground">
                  Le {new Date(badge.earnedAt).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </motion.div>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-semibold">
                  {badge.progress}/{badge.maxProgress}
                </span>
              </div>
              <Progress
                value={badge.progress && badge.maxProgress ? (badge.progress / badge.maxProgress) * 100 : 0}
                className="h-2.5 mb-2"
              />
              <p className="text-xs text-muted-foreground">
                Continuez vos efforts pour débloquer ce badge !
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Leaderboard Row
// ---------------------------------------------------------------------------

function LeaderboardRow({
  entry,
  isCurrentUser,
  index,
}: {
  entry: typeof mockLeaderboard[number]
  isCurrentUser: boolean
  index: number
}) {
  const rankStyles =
    entry.rank === 1
      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950'
      : entry.rank === 2
      ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
      : entry.rank === 3
      ? 'bg-gradient-to-r from-orange-400 to-amber-600 text-amber-950'
      : 'bg-muted text-muted-foreground'

  const rankIcons = ['', '🥇', '🥈', '🥉']

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <div
        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all ${
          isCurrentUser
            ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700'
            : 'hover:bg-muted/50'
        }`}
      >
        {/* Rank */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${rankStyles}`}
        >
          {entry.rank <= 3 ? (
            <span className="text-base">{rankIcons[entry.rank]}</span>
          ) : (
            entry.rank
          )}
        </div>

        {/* Avatar */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${entry.color}`}
        >
          {entry.avatar}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm truncate ${isCurrentUser ? 'text-amber-700 dark:text-amber-300' : ''}`}>
            {entry.name}
            {isCurrentUser && (
              <Badge variant="secondary" className="ml-2 text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                Vous
              </Badge>
            )}
          </p>
          <p className="text-xs text-muted-foreground">Niveau {entry.level}</p>
        </div>

        {/* Points */}
        <div className="text-right shrink-0">
          <p className="font-bold text-sm text-amber-600 dark:text-amber-400">
            {entry.points.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">points</p>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Challenge Card
// ---------------------------------------------------------------------------

function ChallengeCard({
  challenge,
  index,
}: {
  challenge: Challenge
  index: number
}) {
  const progressPercent = Math.round((challenge.progress / challenge.maxProgress) * 100)
  const isExpired = challenge.deadline && new Date(challenge.deadline) < new Date()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card className={`overflow-hidden ${challenge.completed ? 'border-emerald-200 dark:border-emerald-800' : 'border-border/50'}`}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            {/* Badge reward preview */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                challenge.completed
                  ? 'bg-emerald-100 dark:bg-emerald-950/50'
                  : 'bg-amber-100 dark:bg-amber-950/50'
              }`}
            >
              {challenge.rewardBadge}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">{challenge.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{challenge.description}</p>
                </div>
              </div>

              {/* Reward */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <Zap className="h-3 w-3" />
                  <span>+{challenge.rewardXp} XP</span>
                </div>
              </div>

              {/* Progress */}
              {!challenge.completed && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{challenge.progress}/{challenge.maxProgress}</span>
                    <span className="font-semibold">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              )}

              {/* Deadline or completed */}
              <div className="mt-2 flex items-center gap-2">
                {challenge.completed ? (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Complété</span>
                  </div>
                ) : (
                  <div className={`flex items-center gap-1 text-xs ${isExpired ? 'text-red-500' : 'text-muted-foreground'}`}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDeadline(challenge.deadline)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Daily Streak Calendar
// ---------------------------------------------------------------------------

function DailyStreakCalendar({ streak, streakMax }: { streak: number; streakMax: number }) {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const weeks = 4
  const totalDays = weeks * 7

  // Generate streak pattern: recent days are active
  const streakDays = useMemo(() => {
    const arr: boolean[] = []
    for (let i = 0; i < totalDays; i++) {
      // Make the last `streak` days active, and some random ones before
      const daysFromEnd = totalDays - i
      if (daysFromEnd <= streak) {
        arr.push(true)
      } else if (i % 5 === 0 || i % 7 === 2) {
        arr.push(true) // some scattered historical activity
      } else {
        arr.push(false)
      }
    }
    return arr
  }, [streak, totalDays])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Série de jours consécutifs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-orange-500">{streak}</span>
            <span className="text-sm text-muted-foreground">jours actuels</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">Record: <strong>{streakMax}</strong> jours</span>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {days.map((d, i) => (
            <div key={i} className="text-center text-[10px] text-muted-foreground font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar dots */}
        <div className="grid grid-cols-7 gap-1">
          {streakDays.map((active, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.01, duration: 0.2 }}
              className={`aspect-square rounded-sm ${
                active
                  ? 'bg-gradient-to-br from-orange-400 to-amber-500'
                  : 'bg-muted/50'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function GamificationSystem({ onBack }: GamificationSystemProps) {
  const { user } = useAppStore()
  const [activeTab, setActiveTab] = useState('badges')
  const [badgeFilter, setBadgeFilter] = useState<BadgeCategory | 'all'>('all')
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null)
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false)

  // Build the gamification profile from mock data
  const profile: GamificationProfile = {
    level: mockUserLevel,
    points: 3450,
    badges: mockBadges,
    streak: 42,
    streakMax: 67,
    rank: 8,
  }

  const filteredBadges = useMemo(() => {
    if (badgeFilter === 'all') return mockBadges
    return mockBadges.filter((b) => b.category === badgeFilter)
  }, [badgeFilter])

  const earnedCount = mockBadges.filter((b) => b.earned).length

  const handleBadgeClick = (badge: BadgeType) => {
    setSelectedBadge(badge)
    setBadgeDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-bold">Succès & Récompenses</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Profile Header */}
        <ProfileHeader profile={profile} />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto p-1">
            <TabsTrigger value="badges" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Collection de </span>Badges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
              <Medal className="h-4 w-4" />
              <span className="hidden sm:inline">Tableau des </span>Rangs
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline"> </span>Défis
            </TabsTrigger>
          </TabsList>

          {/* ─── Badges Tab ─── */}
          <TabsContent value="badges" className="mt-6 space-y-4">
            {/* Filter + counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-amber-600 dark:text-amber-400">{earnedCount}</span>
                <span className="text-muted-foreground">sur {mockBadges.length} badges obtenus</span>
              </div>

              {/* Category filter tabs */}
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'achievement', 'social', 'skill', 'loyalty', 'special'] as const).map(
                  (cat) => (
                    <Button
                      key={cat}
                      variant={badgeFilter === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBadgeFilter(cat)}
                      className={`text-xs h-7 px-2.5 ${
                        badgeFilter === cat
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0'
                          : ''
                      }`}
                    >
                      {cat === 'all' ? 'Tous' : categoryLabels[cat]}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Badge grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
              <AnimatePresence mode="popLayout">
                {filteredBadges.map((badge, idx) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    onClick={() => handleBadgeClick(badge)}
                    index={idx}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filteredBadges.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun badge dans cette catégorie</p>
              </div>
            )}
          </TabsContent>

          {/* ─── Leaderboard Tab ─── */}
          <TabsContent value="leaderboard" className="mt-6 space-y-4">
            {/* Top 3 podium */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[mockLeaderboard[1], mockLeaderboard[0], mockLeaderboard[2]].map((entry, i) => {
                const isFirst = entry.rank === 1
                return (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.5, ease: 'easeOut' }}
                    className={`flex flex-col items-center ${
                      isFirst ? 'sm:-mt-4' : ''
                    }`}
                  >
                    <Card
                      className={`w-full text-center overflow-hidden ${
                        entry.rank === 1
                          ? 'border-yellow-400 dark:border-yellow-600 shadow-lg'
                          : entry.rank === 2
                          ? 'border-gray-300 dark:border-gray-600'
                          : 'border-amber-400 dark:border-amber-700'
                      }`}
                    >
                      <CardContent className={`p-3 sm:p-4 ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30' : ''}`}>
                        <div className="text-2xl mb-1">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </div>
                        <div
                          className={`mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full text-white font-bold text-sm ${entry.color}`}
                        >
                          {entry.avatar}
                        </div>
                        <p className="font-semibold text-xs sm:text-sm mt-2 truncate">{entry.name}</p>
                        <p className="text-[10px] text-muted-foreground">Niv. {entry.level}</p>
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">
                          {entry.points.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Full leaderboard list */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Classement complet
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-3 max-h-[480px] overflow-y-auto">
                <div className="space-y-1">
                  {mockLeaderboard.map((entry, idx) => (
                    <LeaderboardRow
                      key={entry.rank}
                      entry={entry}
                      isCurrentUser={entry.rank === profile.rank}
                      index={idx}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Challenges Tab ─── */}
          <TabsContent value="challenges" className="mt-6 space-y-6">
            {/* Daily streak */}
            <DailyStreakCalendar streak={profile.streak} streakMax={profile.streakMax} />

            {/* Active challenges */}
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-amber-500" />
                Défis actifs
                <Badge variant="secondary" className="text-xs bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                  {mockActiveChallenges.length}
                </Badge>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {mockActiveChallenges.map((challenge, idx) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} index={idx} />
                ))}
              </div>
            </div>

            {/* Completed challenges */}
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Défis complétés
                <Badge variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                  {mockCompletedChallenges.length}
                </Badge>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {mockCompletedChallenges.map((challenge, idx) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} index={idx} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Badge Detail Dialog */}
      <BadgeDetailDialog
        badge={selectedBadge}
        open={badgeDialogOpen}
        onClose={() => setBadgeDialogOpen(false)}
      />
    </div>
  )
}
