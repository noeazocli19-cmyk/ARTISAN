'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Wrench,
  Star,
  Heart,
  Shield,
  Droplets,
  Zap,
  Hammer,
  Paintbrush,
  ArrowRight,
  Handshake,
  Briefcase,
} from 'lucide-react'

function WelcomeIllustration() {
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200/50 to-orange-200/50 dark:from-amber-900/30 dark:to-orange-900/30 blur-2xl" />

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

interface WelcomeScreenProps {
  onContinue: () => void
  userName?: string | null
}

export function WelcomeScreen({ onContinue, userName }: WelcomeScreenProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center text-center gap-6 py-4 max-w-lg"
      >
        <WelcomeIllustration />

        <div className="space-y-3">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Bienvenue{userName ? `, ${userName}` : ''} sur{' '}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              Artisan Connect
            </span>{' '}
            !
          </motion.h2>

          <motion.p
            className="text-muted-foreground text-base sm:text-lg leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Votre compte est prêt. Direction votre tableau de bord pour commencer.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 h-12 px-8 text-base font-semibold shadow-lg shadow-amber-500/25"
            onClick={onContinue}
          >
            Accéder à mon tableau de bord
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>

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
    </div>
  )
}
