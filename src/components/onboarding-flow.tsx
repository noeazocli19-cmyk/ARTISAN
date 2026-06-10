'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Sparkles,
  Wrench,
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Bell,
  Globe,
  Moon,
  MapPinned,
  CheckCircle2,
  PartyPopper,
  Droplets,
  Zap,
  Hammer,
  Paintbrush,
  KeyRound,
  BrickWall,
  Wind,
  Shield,
  Award,
  Users,
  Briefcase,
  ArrowRight,
  Star,
  Heart,
  Handshake,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface OnboardingData {
  // Profile
  fullName: string
  phone: string
  location: string
  bio: string
  // Role
  role: 'client' | 'artisan' | null
  // Skills (artisan only)
  skills: string[]
  hourlyRate: number
  experience: string
  hasCertifications: boolean
  // Preferences
  notifEmail: boolean
  notifSms: boolean
  notifPush: boolean
  language: 'fr' | 'en'
  darkMode: boolean
  locationSharing: boolean
}

interface OnboardingFlowProps {
  onComplete: () => void
  onSkip: () => void
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6

const SKILLS_LIST = [
  { id: 'plomberie', label: 'Plomberie', icon: Droplets, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { id: 'electricite', label: 'Électricité', icon: Zap, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { id: 'menuiserie', label: 'Menuiserie', icon: Hammer, color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  { id: 'peinture', label: 'Peinture', icon: Paintbrush, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { id: 'serrurerie', label: 'Serrurerie', icon: KeyRound, color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  { id: 'maconnerie', label: 'Maçonnerie', icon: BrickWall, color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
  { id: 'climatisation', label: 'Climatisation', icon: Wind, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
  { id: 'nettoyage', label: 'Nettoyage', icon: Sparkles, color: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-violet-200 dark:border-violet-800' },
  { id: 'carrelage', label: 'Carrelage', icon: BrickWall, color: 'bg-stone-100 text-stone-700 dark:bg-stone-950 dark:text-stone-300 border-stone-200 dark:border-stone-800' },
  { id: 'toiture', label: 'Toiture', icon: Shield, color: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800' },
]

const EXPERIENCE_OPTIONS = [
  { value: '1-5', label: '1 - 5 ans' },
  { value: '5-10', label: '5 - 10 ans' },
  { value: '10+', label: '10+ ans' },
]

// ─── Confetti Component ──────────────────────────────────────────────────────

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

function Confetti() {
  const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316']
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.8,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} {...p} />
      ))}
    </div>
  )
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step, currentStep }: { step: number; currentStep: number }) {
  const isCompleted = step < currentStep
  const isCurrent = step === currentStep

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        className={`
          flex items-center justify-center rounded-full h-9 w-9 sm:h-10 sm:w-10 text-sm font-bold
          transition-all duration-300 border-2
          ${isCompleted
            ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-500 text-white shadow-lg shadow-amber-500/30'
            : isCurrent
              ? 'bg-amber-100 dark:bg-amber-950/50 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-muted border-muted-foreground/20 text-muted-foreground/50'
          }
        `}
        animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
        transition={isCurrent ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
      >
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <CheckCircle2 className="h-5 w-5" />
          </motion.div>
        ) : (
          step
        )}
      </motion.div>
    </div>
  )
}

// ─── Animated Illustration for Welcome ────────────────────────────────────────

function WelcomeIllustration() {
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto">
      {/* Background glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200/50 to-orange-200/50 dark:from-amber-900/30 dark:to-orange-900/30 blur-2xl" />

      {/* Main circle */}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 flex items-center justify-center border-2 border-amber-200 dark:border-amber-800"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative flex flex-col items-center gap-2">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Wrench className="h-12 w-12 sm:h-14 sm:w-14 text-amber-600 dark:text-amber-400" />
          </motion.div>
          <div className="flex gap-1">
            {[Star, Heart, Shield].map((Icon, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              >
                <Icon className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating icons around the circle */}
      {[
        { Icon: Droplets, x: -15, y: -10, delay: 0, color: 'text-blue-500' },
        { Icon: Zap, x: 30, y: -20, delay: 0.5, color: 'text-amber-500' },
        { Icon: Hammer, x: -30, y: 20, delay: 1, color: 'text-orange-500' },
        { Icon: Paintbrush, x: 25, y: 25, delay: 1.5, color: 'text-emerald-500' },
      ].map(({ Icon, x, y, delay, color }, i) => (
        <motion.div
          key={i}
          className={`absolute top-1/2 left-1/2 ${color}`}
          style={{ x: `${x}px`, y: `${y}px` }}
          animate={{
            y: [y - 5, y + 5, y - 5],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 3, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="h-5 w-5" />
        </motion.div>
      ))}
    </div>
  )
}

// ─── Step Content Components ─────────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center text-center gap-6 py-4"
    >
      <WelcomeIllustration />

      <div className="space-y-3">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Bienvenue sur{' '}
          <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            Artisan Connecté
          </span>{' '}
          !
        </motion.h2>

        <motion.p
          className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          La plateforme qui vous connecte avec les meilleurs artisans d&apos;Afrique.
          Configurez votre profil en quelques étapes pour commencer.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 h-12 px-8 text-base font-semibold shadow-lg shadow-amber-500/25"
          onClick={onNext}
        >
          Commencer
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {[
          { icon: Shield, text: 'Vérifié' },
          { icon: Star, text: 'Noté' },
          { icon: Handshake, text: 'Fiable' },
          { icon: Briefcase, text: '10K+ Artisans' },
        ].map(({ icon: Icon, text }) => (
          <Badge
            key={text}
            variant="outline"
            className="px-3 py-1 text-xs border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
          >
            <Icon className="h-3 w-3 mr-1" />
            {text}
          </Badge>
        ))}
      </motion.div>
    </motion.div>
  )
}

function StepProfile({
  data,
  setData,
}: {
  data: OnboardingData
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>
}) {
  const updateField = useCallback(
    <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }))
    },
    [setData]
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6 py-2"
    >
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">
          Votre{' '}
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            profil
          </span>
        </h2>
        <p className="text-muted-foreground text-sm">Dites-nous en plus sur vous</p>
      </div>

      {/* Avatar Upload Placeholder */}
      <div className="flex justify-center mb-6">
        <motion.div
          className="relative group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 border-2 border-dashed border-amber-300 dark:border-amber-700 flex items-center justify-center transition-colors group-hover:border-amber-500 dark:group-hover:border-amber-500">
            <Camera className="h-8 w-8 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
            <Camera className="h-3.5 w-3.5 text-white" />
          </div>
        </motion.div>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-amber-500" />
            Nom complet
          </Label>
          <Input
            id="fullName"
            placeholder="Ex: Amadou Diallo"
            value={data.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            className="h-11 border-border/50 focus:border-amber-400 focus:ring-amber-400/20 transition-colors"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-amber-500" />
            Téléphone
          </Label>
          <Input
            id="phone"
            placeholder="Ex: +221 77 123 45 67"
            value={data.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="h-11 border-border/50 focus:border-amber-400 focus:ring-amber-400/20 transition-colors"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-amber-500" />
            Localisation (ville/pays)
          </Label>
          <Input
            id="location"
            placeholder="Ex: Dakar, Sénégal"
            value={data.location}
            onChange={(e) => updateField('location', e.target.value)}
            className="h-11 border-border/50 focus:border-amber-400 focus:ring-amber-400/20 transition-colors"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-amber-500" />
            Bio
          </Label>
          <Textarea
            id="bio"
            placeholder="Parlez-nous de vous en quelques mots..."
            value={data.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            className="min-h-[80px] border-border/50 focus:border-amber-400 focus:ring-amber-400/20 transition-colors resize-none"
          />
        </div>
      </div>
    </motion.div>
  )
}

function StepRole({
  data,
  setData,
}: {
  data: OnboardingData
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>
}) {
  const roles = [
    {
      id: 'client' as const,
      icon: Search,
      title: 'Je cherche un artisan',
      description: 'Trouvez et réservez des artisans qualifiés pour vos projets',
      features: ['Recherche par catégorie', 'Avis vérifiés', 'Paiement sécurisé'],
      gradient: 'from-emerald-500 to-teal-600',
      border: 'border-emerald-400 dark:border-emerald-600',
      glow: 'shadow-emerald-500/20',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      id: 'artisan' as const,
      icon: Wrench,
      title: 'Je suis un artisan',
      description: 'Recevez des demandes et développez votre activité en ligne',
      features: ['Profil professionnel', 'Demandes ciblées', 'Paiements rapides'],
      gradient: 'from-amber-500 to-orange-600',
      border: 'border-amber-400 dark:border-amber-600',
      glow: 'shadow-amber-500/20',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6 py-2"
    >
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">
          Votre{' '}
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            rôle
          </span>
        </h2>
        <p className="text-muted-foreground text-sm">Comment souhaitez-vous utiliser la plateforme ?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {roles.map((role) => {
          const isSelected = data.role === role.id
          return (
            <motion.div
              key={role.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 overflow-hidden h-full
                  ${isSelected
                    ? `${role.border} border-2 shadow-xl ${role.glow} ${role.bg}`
                    : 'border-border/50 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md'
                  }`}
                onClick={() => setData((prev) => ({ ...prev, role: role.id }))}
              >
                <CardContent className="p-5 sm:p-6 flex flex-col items-center text-center gap-4">
                  <motion.div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${role.gradient} shadow-lg`}
                    animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    <role.icon className="h-8 w-8 text-white" />
                  </motion.div>

                  <div>
                    <h3 className="font-bold text-base mb-1">{role.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{role.description}</p>
                  </div>

                  <div className="flex flex-col gap-1.5 w-full">
                    {role.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-amber-500' : 'text-muted-foreground/50'}`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="mt-1"
                    >
                      <Badge className={`bg-gradient-to-r ${role.gradient} text-white border-0 px-3 py-0.5`}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Sélectionné
                      </Badge>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

function StepSkills({
  data,
  setData,
}: {
  data: OnboardingData
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>
}) {
  const toggleSkill = useCallback(
    (skillId: string) => {
      setData((prev) => ({
        ...prev,
        skills: prev.skills.includes(skillId)
          ? prev.skills.filter((s) => s !== skillId)
          : [...prev.skills, skillId],
      }))
    },
    [setData]
  )

  const formatRate = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA/h'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6 py-2"
    >
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">
          Vos{' '}
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            compétences
          </span>
        </h2>
        <p className="text-muted-foreground text-sm">Sélectionnez vos domaines d&apos;expertise</p>
      </div>

      {/* Skill Tags */}
      <div className="max-w-2xl mx-auto">
        <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
          <Award className="h-3.5 w-3.5 text-amber-500" />
          Compétences
        </Label>
        <div className="flex flex-wrap gap-2 mb-8">
          {SKILLS_LIST.map((skill) => {
            const isSelected = data.skills.includes(skill.id)
            return (
              <motion.div
                key={skill.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={isSelected ? 'default' : 'outline'}
                  className={`
                    cursor-pointer px-3 py-1.5 text-sm transition-all duration-200
                    ${isSelected
                      ? `${skill.color} border-2 shadow-md`
                      : 'border-border/50 hover:border-amber-300 dark:hover:border-amber-700'
                    }`}
                  onClick={() => toggleSkill(skill.id)}
                >
                  <skill.icon className="h-3.5 w-3.5 mr-1.5" />
                  {skill.label}
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-1.5"
                    >
                      ✓
                    </motion.span>
                  )}
                </Badge>
              </motion.div>
            )
          })}
        </div>

        {/* Hourly Rate Slider */}
        <div className="space-y-4 mb-8">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 text-amber-500" />
            Tarif horaire
          </Label>
          <div className="space-y-3">
            <Slider
              value={[data.hourlyRate]}
              min={1000}
              max={50000}
              step={500}
              onValueChange={(val) => setData((prev) => ({ ...prev, hourlyRate: val[0] }))}
              className="w-full [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-amber-500 [&_[data-slot=slider-range]]:to-orange-500 [&_[data-slot=slider-thumb]]:border-amber-500"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>1 000 FCFA</span>
              <motion.span
                key={data.hourlyRate}
                initial={{ scale: 1.2, color: '#f59e0b' }}
                animate={{ scale: 1, color: 'inherit' }}
                className="font-bold text-sm text-amber-600 dark:text-amber-400"
              >
                {formatRate(data.hourlyRate)}
              </motion.span>
              <span>50 000 FCFA</span>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-3 mb-8">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-amber-500" />
            Expérience
          </Label>
          <Select
            value={data.experience}
            onValueChange={(val) => setData((prev) => ({ ...prev, experience: val }))}
          >
            <SelectTrigger className="w-full h-11 border-border/50 focus:border-amber-400">
              <SelectValue placeholder="Sélectionnez votre expérience" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Certifications Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
              <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <Label className="text-sm font-medium">Certifications</Label>
              <p className="text-xs text-muted-foreground">Avez-vous des certifications professionnelles ?</p>
            </div>
          </div>
          <Switch
            checked={data.hasCertifications}
            onCheckedChange={(val) => setData((prev) => ({ ...prev, hasCertifications: val }))}
            className="data-[state=checked]:bg-amber-500"
          />
        </div>
      </div>
    </motion.div>
  )
}

function StepPreferences({
  data,
  setData,
}: {
  data: OnboardingData
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>
}) {
  const toggleField = useCallback(
    <K extends keyof OnboardingData>(field: K) => {
      setData((prev) => ({ ...prev, [field]: !prev[field] }))
    },
    [setData]
  )

  const prefItems = [
    {
      icon: Mail,
      title: 'Notifications par email',
      description: 'Recevez les mises à jour par email',
      field: 'notifEmail' as const,
    },
    {
      icon: Phone,
      title: 'Notifications par SMS',
      description: 'Alertes SMS pour les demandes urgentes',
      field: 'notifSms' as const,
    },
    {
      icon: Bell,
      title: 'Notifications push',
      description: 'Notifications en temps réel dans votre navigateur',
      field: 'notifPush' as const,
    },
    {
      icon: Moon,
      title: 'Mode sombre',
      description: 'Utiliser le thème sombre de l\'application',
      field: 'darkMode' as const,
    },
    {
      icon: MapPinned,
      title: 'Partage de localisation',
      description: 'Permettre la géolocalisation pour des résultats proches',
      field: 'locationSharing' as const,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6 py-2"
    >
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">
          Vos{' '}
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            préférences
          </span>
        </h2>
        <p className="text-muted-foreground text-sm">Personnalisez votre expérience</p>
      </div>

      <div className="max-w-md mx-auto space-y-3">
        {prefItems.map((item, idx) => (
          <motion.div
            key={item.field}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/30 hover:border-amber-300/50 dark:hover:border-amber-700/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                  <item.icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <Label className="text-sm font-medium">{item.title}</Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <Switch
                checked={data[item.field] as boolean}
                onCheckedChange={() => toggleField(item.field)}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
          </motion.div>
        ))}

        {/* Language Preference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefItems.length * 0.08 }}
        >
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <Label className="text-sm font-medium">Langue</Label>
                <p className="text-xs text-muted-foreground">Choisissez la langue de l&apos;interface</p>
              </div>
            </div>
            <Select
              value={data.language}
              onValueChange={(val) => setData((prev) => ({ ...prev, language: val as 'fr' | 'en' }))}
            >
              <SelectTrigger className="w-28 h-9 border-border/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function StepComplete({
  data,
  onComplete,
}: {
  data: OnboardingData
  onComplete: () => void
}) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const summaryItems = [
    { label: 'Profil', value: data.fullName || 'Non renseigné', icon: User },
    { label: 'Rôle', value: data.role === 'artisan' ? 'Artisan' : 'Client', icon: data.role === 'artisan' ? Wrench : Search },
    ...(data.role === 'artisan'
      ? [
          { label: 'Compétences', value: data.skills.length > 0 ? `${data.skills.length} sélectionnées` : 'Aucune', icon: Award },
          { label: 'Tarif', value: `${new Intl.NumberFormat('fr-FR').format(data.hourlyRate)} FCFA/h`, icon: Briefcase },
        ]
      : []),
    { label: 'Localisation', value: data.location || 'Non renseignée', icon: MapPin },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center text-center gap-6 py-4 relative"
    >
      {showConfetti && <Confetti />}

      {/* Celebration Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="relative"
      >
        <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/30">
          <PartyPopper className="h-12 w-12 sm:h-14 sm:w-14 text-white" />
        </div>
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-amber-400/50"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
          Vous êtes{' '}
          <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            prêt
          </span>{' '}
          !
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto">
          Votre profil est configuré. Voici un récapitulatif de vos informations.
        </p>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm"
      >
        <Card className="border-amber-200 dark:border-amber-800 shadow-lg">
          <CardContent className="p-5 space-y-3">
            {summaryItems.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
                className="flex items-center gap-3 py-1.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                  <item.icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium truncate">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Button
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 h-12 px-8 text-base font-semibold shadow-lg shadow-amber-500/25"
          onClick={onComplete}
        >
          Aller au tableau de bord
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Onboarding Flow ────────────────────────────────────────────────────

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    phone: '',
    location: '',
    bio: '',
    role: null,
    skills: [],
    hourlyRate: 10000,
    experience: '',
    hasCertifications: false,
    notifEmail: true,
    notifSms: false,
    notifPush: true,
    language: 'fr',
    darkMode: false,
    locationSharing: true,
  })

  const containerRef = useRef<HTMLDivElement>(null)

  // Determine the actual step number (skip step 4 for clients)
  const getEffectiveStep = () => {
    if (currentStep >= 4 && data.role === 'client') {
      return currentStep + 1 // skip step 4
    }
    return currentStep
  }

  const maxStep = 6
  const effectiveStep = currentStep === 4 && data.role === 'client' ? 5 : currentStep

  const progressValue = ((effectiveStep - 1) / (maxStep - 1)) * 100

  const handleNext = useCallback(() => {
    // If on step 3 (role) and role is client, skip step 4 (skills)
    if (currentStep === 3 && data.role === 'client') {
      setCurrentStep(5) // Jump to preferences
    } else if (currentStep < maxStep) {
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep, data.role])

  const handlePrev = useCallback(() => {
    // If on step 5 (preferences) and role is client, go back to step 3 (role)
    if (currentStep === 5 && data.role === 'client') {
      setCurrentStep(3)
    } else if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep, data.role])

  const handleSkip = useCallback(() => {
    onSkip()
  }, [onSkip])

  // Step labels for the indicator
  const stepLabels = [
    '', // 0-index padding
    'Bienvenue',
    'Profil',
    'Rôle',
    'Compétences',
    'Préférences',
    'Terminé',
  ]

  // Compute which steps to show in the indicator
  // For clients: 1, 2, 3, 5, 6 (skip 4)
  const visibleSteps = data.role === 'client'
    ? [1, 2, 3, 5, 6]
    : [1, 2, 3, 4, 5, 6]

  const currentIndicatorStep = visibleSteps.indexOf(currentStep) + 1
  const totalIndicatorSteps = visibleSteps.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-amber-950/10 flex flex-col">
      {/* Header with progress */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-border/30">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-4">
          {/* Skip button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Artisan Connecté
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs"
              onClick={handleSkip}
            >
              <SkipForward className="h-3.5 w-3.5 mr-1" />
              Passer
            </Button>
          </div>

          {/* Progress bar */}
          <Progress
            value={progressValue}
            className="h-2 bg-amber-100 dark:bg-amber-950/50 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-amber-500 [&>[data-slot=progress-indicator]]:to-orange-500"
          />

          {/* Step indicators */}
          <div className="flex items-center justify-between mt-4 px-2">
            {visibleSteps.map((stepNum, idx) => (
              <div key={stepNum} className="flex flex-col items-center">
                <StepIndicator step={idx + 1} currentStep={currentIndicatorStep} />
                <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">
                  {stepLabels[stepNum]}
                </span>
              </div>
            ))}
            {/* Connector lines */}
            {visibleSteps.map((_, idx) => {
              if (idx >= visibleSteps.length - 1) return null
              const isCompleted = idx + 1 < currentIndicatorStep
              return (
                <div
                  key={`line-${idx}`}
                  className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-5 sm:mb-6 transition-colors duration-300 ${
                    isCompleted ? 'bg-amber-500' : 'bg-border/30'
                  }`}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div ref={containerRef} className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-6 sm:py-10 flex-1">
          <AnimatePresence mode="wait">
            {currentStep === 1 && <StepWelcome key="step1" onNext={handleNext} />}
            {currentStep === 2 && <StepProfile key="step2" data={data} setData={setData} />}
            {currentStep === 3 && <StepRole key="step3" data={data} setData={setData} />}
            {currentStep === 4 && data.role === 'artisan' && <StepSkills key="step4" data={data} setData={setData} />}
            {currentStep === 5 && <StepPreferences key="step5" data={data} setData={setData} />}
            {currentStep === 6 && <StepComplete key="step6" data={data} onComplete={onComplete} />}
          </AnimatePresence>
        </div>

        {/* Navigation footer */}
        {currentStep > 1 && currentStep < 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-t border-border/30 py-4"
          >
            <div className="mx-auto max-w-2xl px-4 sm:px-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrev}
                className="h-10 border-border/50 hover:border-amber-300 dark:hover:border-amber-700"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground text-xs"
                  onClick={handleSkip}
                >
                  Passer
                </Button>

                <Button
                  onClick={handleNext}
                  className="h-10 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-md shadow-amber-500/20"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
