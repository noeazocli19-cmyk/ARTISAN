'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Bell, Home, LayoutDashboard, Search, Users } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export function SocialNavigation({
  search,
  onSearchChange,
}: {
  search: string
  onSearchChange: (value: string) => void
}) {
  const { data: session } = authClient.useSession()
  const role = (session?.user as { role?: string } | undefined)?.role
  const dashboardHref = role === 'artisan' ? '/dashboard/artisan' : role === 'client' ? '/dashboard/client' : '/dashboard'
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/notifications').then((response) => response.ok ? response.json() : null)
      .then((data) => setUnreadCount(data?.unreadCount || 0)).catch(() => setUnreadCount(0))
  }, [session?.user?.id])

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/70 bg-white/95 backdrop-blur-xl dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3 sm:px-5">
        <Link href="/" className="hidden items-center gap-2 sm:inline-flex" aria-label="Accueil Finda">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm"><Users className="h-5 w-5" /></span>
          <span className="font-bold text-slate-900 dark:text-white">Finda Social</span>
        </Link>
        <div className="relative min-w-0 flex-1 sm:max-w-md sm:ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Rechercher une réalisation ou un artisan"
            className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
        <Link href="/" className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 md:inline-flex" title="Retour au site public"><Home className="h-4 w-4" /> Site public</Link>
        <Link href={dashboardHref} className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 md:inline-flex" title="Retour au tableau de bord"><LayoutDashboard className="h-4 w-4" /> Tableau de bord</Link>
        <Button variant="outline" size="icon" className="relative shrink-0 rounded-full" aria-label={`${unreadCount} notifications`} onClick={() => window.location.assign('/dashboard#notifications')}><Bell className="h-4 w-4" />{unreadCount > 0 && <span className="absolute right-1 top-1 min-w-4 rounded-full bg-brand-600 px-1 text-[10px] leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}</Button>
      </div>
      <div className="mx-auto flex max-w-6xl gap-2 px-3 pb-3 sm:px-5 md:hidden">
        <Link href="/" className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium"><ArrowLeft className="h-4 w-4" /> Site public</Link>
        <Link href={dashboardHref} className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium"><LayoutDashboard className="h-4 w-4" /> Tableau de bord</Link>
      </div>
    </header>
  )
}
