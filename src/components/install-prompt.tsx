'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Wrench, X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSAL_KEY = 'artisan-connecte-install-dismissed'
const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  const shouldBeVisible = useCallback(() => {
    if (!deferredPrompt) return false

    // Don't show if already installed
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true)
    if (isStandalone) return false

    // Check dismissal timestamp
    const dismissedAt = localStorage.getItem(DISMISSAL_KEY)
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10)
      if (elapsed < DISMISSAL_DURATION) return false
    }

    return true
  }, [deferredPrompt])

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const installedHandler = () => {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  useEffect(() => {
    if (shouldBeVisible()) {
      // Delay showing the prompt slightly for a better UX
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    } else {
      setShowPrompt(false)
    }
  }, [shouldBeVisible])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)
    try {
      await deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      if (result.outcome === 'accepted') {
        // Will be handled by appinstalled event
      }
    } catch (error) {
      console.warn('[InstallPrompt] Install failed:', error)
    } finally {
      setDeferredPrompt(null)
      setIsInstalling(false)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSAL_KEY, Date.now().toString())
    setShowPrompt(false)
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/80 dark:via-orange-950/80 dark:to-amber-950/80 shadow-2xl backdrop-blur-sm">
            {/* Decorative gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" />

            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* App Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-amber-900 dark:text-amber-100">
                    Installer Artisan Connecté
                  </h3>
                  <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                    Accédez rapidement à nos artisans depuis votre écran d&apos;accueil. Fonctionne même hors connexion !
                  </p>

                  {/* Action buttons */}
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleInstall}
                      disabled={isInstalling}
                      className="h-8 px-4 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-md"
                    >
                      {isInstalling ? (
                        <span className="flex items-center gap-1.5">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </motion.div>
                          Installation...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Download className="h-3.5 w-3.5" />
                          Installer
                        </span>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                      className="h-8 px-3 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/50"
                    >
                      Plus tard
                    </Button>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-amber-400 hover:text-amber-600 dark:text-amber-500 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Bottom hint */}
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-amber-600/60 dark:text-amber-400/40">
                <Smartphone className="h-3 w-3" />
                <span>Expérience optimale sur mobile</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
