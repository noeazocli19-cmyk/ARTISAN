'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { NotificationBell } from '@/components/notification-bell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Wrench,
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  User,
  LogOut,
  Search,
  Map,
  Image as ImageIcon,
  Calendar,
  Wallet,
  Trophy,
  ClipboardList,
  Siren,
  Gift,
} from 'lucide-react'

interface NavbarProps {
  onOpenAuth: (tab?: 'login' | 'register') => void
  onSearch: (query: string, location: string) => void
}

const navLinks = [
  { label: 'Accueil', href: '#', view: 'landing' as const },
  { label: 'Catégories', href: '#categories' },
  { label: 'Artisans', href: '#artisans' },
  { label: 'Carte', href: '#', view: 'map' as const },
  { label: 'Comment ça marche', href: '#comment-ca-marche' },
  { label: 'Témoignages', href: '#temoignages' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar({ onOpenAuth, onSearch }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLocation, setSearchLocation] = useState('')

  const { user, isAuthenticated, logout, setView } = useAppStore()

  // Use mounted from parent or local
  useState(() => {
    setMounted(true)
  })

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), searchLocation.trim())
    }
  }

  const handleLogoClick = () => {
    setView('landing')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button onClick={handleLogoClick} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Artisan Connecté
          </span>
        </button>

        {/* Desktop Nav - only show on landing */}
        {!isAuthenticated && (
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              link.view === 'map' ? (
                <button
                  key={link.label}
                  onClick={() => setView('map')}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-accent flex items-center gap-1.5"
                >
                  <Map className="h-3.5 w-3.5" />
                  {link.label}
                </button>
              ) : link.view === 'landing' ? (
                <button
                  key={link.label}
                  onClick={handleLogoClick}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-accent"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-accent"
                >
                  {link.label}
                </a>
              )
            ))}
          </div>
        )}

        {/* Search bar - show when authenticated */}
        {isAuthenticated && (
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 max-w-md flex-1 mx-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un artisan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-muted/50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </form>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
              aria-label="Changer le thème"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}

          {isAuthenticated && <NotificationBell />}

          {/* Map button */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('map')}
              className="h-9 w-9"
              aria-label="Carte"
            >
              <Map className="h-4 w-4" />
            </Button>
          )}

          {isAuthenticated && user ? (
            <DropdownMenu>
              
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setView('dashboard')} className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Mon Tableau de bord
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('map')} className="cursor-pointer">
                  <Map className="mr-2 h-4 w-4" />
                  Carte des artisans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('portfolio')} className="cursor-pointer">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Mon Portfolio
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setView('booking')} className="cursor-pointer">
                  <Calendar className="mr-2 h-4 w-4" />
                  Réservations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('payment')} className="cursor-pointer">
                  <Wallet className="mr-2 h-4 w-4" />
                  Portefeuille
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('quotes')} className="cursor-pointer">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Demandes de devis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('gamification')} className="cursor-pointer">
                  <Trophy className="mr-2 h-4 w-4" />
                  Badges & Niveaux
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('referral')} className="cursor-pointer">
                  <Gift className="mr-2 h-4 w-4" />
                  Parrainage
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('emergency')} className="cursor-pointer">
                  <Siren className="mr-2 h-4 w-4" />
                  Service d'urgence
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Mon Profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex text-sm"
                onClick={() => onOpenAuth('login')}
              >
                Se connecter
              </Button>
              <Button
                className="hidden sm:inline-flex bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 text-sm"
                onClick={() => onOpenAuth('register')}
              >
                S&apos;inscrire
              </Button>
            </>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-1 p-4">
              {!isAuthenticated && navLinks.map((link) => (
                link.view === 'map' ? (
                  <button
                    key={link.label}
                    onClick={() => { setView('map'); setMobileMenuOpen(false) }}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent text-left flex items-center gap-2"
                  >
                    <Map className="h-4 w-4" />
                    {link.label}
                  </button>
                ) : link.view === 'landing' ? (
                  <button
                    key={link.label}
                    onClick={() => { handleLogoClick(); setMobileMenuOpen(false) }}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent text-left"
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
                  >
                    {link.label}
                  </a>
                )
              ))}
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => { setView('dashboard'); setMobileMenuOpen(false) }}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent text-left"
                  >
                    Mon Tableau de bord
                  </button>
                  <button
                    onClick={() => { setView('map'); setMobileMenuOpen(false) }}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent text-left flex items-center gap-2"
                  >
                    <Map className="h-4 w-4" />
                    Carte des artisans
                  </button>
                  <button
                    onClick={() => { setView('portfolio'); setMobileMenuOpen(false) }}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent text-left flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Mon Portfolio
                  </button>
                  <button
                    onClick={() => { setView('booking'); setMobileMenuOpen(false) }}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent text-left flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Réservations
                  </button>
                  <button
                    onClick={() => { setView('payment'); setMobileMenuOpen(false) }}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent text-left flex items-center gap-2"
                  >
                    <Wallet className="h-4 w-4" />
                    Portefeuille
                  </button>
                  <button
                    onClick={() => { setView('quotes'); setMobileMenuOpen(false) }}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent text-left flex items-center gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Demandes de devis
                  </button>
                  <button
                    onClick={() => { setView('gamification'); setMobileMenuOpen(false) }}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent text-left flex items-center gap-2"
                  >
                    <Trophy className="h-4 w-4" />
                    Badges & Niveaux
                  </button>
                  <button
                    onClick={() => { setView('referral'); setMobileMenuOpen(false) }}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent text-left flex items-center gap-2"
                  >
                    <Gift className="h-4 w-4" />
                    Parrainage
                  </button>
                  <button
                    onClick={() => { setView('emergency'); setMobileMenuOpen(false) }}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent text-left flex items-center gap-2"
                  >
                    <Siren className="h-4 w-4" />
                    Service d'urgence
                  </button>
                </>
              )}
              <Separator className="my-2" />
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start text-sm"
                    onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false) }}
                  >
                    Se connecter
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 text-sm"
                    onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false) }}
                  >
                    S&apos;inscrire
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="justify-start text-sm text-red-600 dark:text-red-400"
                  onClick={() => { logout(); setMobileMenuOpen(false) }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
