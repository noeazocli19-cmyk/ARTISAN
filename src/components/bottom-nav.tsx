'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, MessageSquare, LayoutDashboard, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/search', label: 'Recherche', icon: Search },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export function BottomNav() {
  const [isStandalone, setIsStandalone] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsStandalone(standalone)
  }, [])

  if (!isStandalone) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom,0px)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-2.5 px-3 flex-1 transition ${
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'
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