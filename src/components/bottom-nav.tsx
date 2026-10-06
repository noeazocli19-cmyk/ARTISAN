'use client'

import { useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, MessageSquare, LayoutDashboard, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/search', label: 'Recherche', icon: Search },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

function subscribeToInstallMode(onChange: () => void) {
  const mediaQuery = window.matchMedia('(display-mode: standalone)')
  mediaQuery.addEventListener('change', onChange)
  return () => mediaQuery.removeEventListener('change', onChange)
}

function getInstallMode() {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || nav.standalone
  if (!isStandalone) return 'browser'

  const isIos =
    /iphone|ipad|ipod/i.test(nav.userAgent) ||
    (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1)
  return isIos ? 'ios' : 'standalone'
}

export function BottomNav() {
  const installMode = useSyncExternalStore(subscribeToInstallMode, getInstallMode, () => 'browser')
  const isStandalone = installMode !== 'browser'
  const isIos = installMode === 'ios'
  const pathname = usePathname()

  useEffect(() => {
    document.body.classList.toggle('ios-standalone', isIos)

    return () => document.body.classList.remove('ios-standalone')
  }, [isIos])

  if (!isStandalone) return null

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t pb-[env(safe-area-inset-bottom,0px)] ${
        isIos
          ? 'ios-app-nav border-white/10 bg-[#06110f]/95 text-white backdrop-blur-xl'
          : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex min-h-14.5 flex-1 flex-col items-center justify-center gap-0.5 px-3 py-2.5 transition ${
              isActive
                ? isIos
                  ? 'text-[#00d4aa] after:absolute after:top-1 after:h-1 after:w-1 after:rounded-full after:bg-[#00d4aa]'
                  : 'text-brand-600 dark:text-brand-400'
                : isIos
                  ? 'text-white/55'
                  : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}