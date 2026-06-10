'use client'

import { useEffect, useRef, useCallback } from 'react'

// Extend WindowEventMap for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

// Singleton to share the deferred prompt across components
let deferredPrompt: BeforeInstallPromptEvent | null = null
let isInstalled = false
const listeners: Array<(prompt: BeforeInstallPromptEvent | null, installed: boolean) => void> = []

function notifyListeners() {
  listeners.forEach((fn) => fn(deferredPrompt, isInstalled))
}

export function usePWAInstall() {
  const promptRef = useRef(deferredPrompt)

  const getPrompt = useCallback(() => promptRef.current, [])

  useEffect(() => {
    // Check if already in standalone mode (installed)
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true

      if (isStandalone) {
        isInstalled = true
      }
    }

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      promptRef.current = deferredPrompt
      notifyListeners()
    }

    const installedHandler = () => {
      isInstalled = true
      deferredPrompt = null
      promptRef.current = null
      notifyListeners()
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  return { getPrompt, isInstalled }
}

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope)

          // Check for updates periodically
          setInterval(
            () => {
              registration.update().catch(() => {})
            },
            60 * 60 * 1000
          ) // Every hour
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error)
        })
    }
  }, [])

  return null
}
