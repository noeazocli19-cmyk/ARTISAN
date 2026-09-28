'use client'

import { useState, useEffect } from 'react'
import { Share, X } from 'lucide-react'

const DISMISS_KEY = 'finda-ios-hint-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000

export function IosInstallHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const nav = window.navigator as any
    const isIos =
      /iphone|ipad|ipod/i.test(nav.userAgent) ||
      (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
    if (!isIos || isStandalone) return
    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY)
      if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < DISMISS_DURATION) return
    } catch {}
    setShow(true)
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {}
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[60] flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
        <Share className="h-5 w-5" />
      </div>
      <div className="flex-1 text-sm">
        <p className="font-semibold text-gray-900 dark:text-gray-100">Installer Finda sur ton iPhone</p>
        <p className="mt-0.5 text-gray-600 dark:text-gray-300">
          Appuie sur le bouton Partager (le carre avec une fleche), puis sur
          &laquo;&nbsp;Sur l&apos;ecran d&apos;accueil&nbsp;&raquo;.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fermer"
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}