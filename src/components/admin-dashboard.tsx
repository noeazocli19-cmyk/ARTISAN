'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  Wrench,
  Briefcase,
  Star,
  Shield,
  Settings,
  Search,
  Eye,
  Ban,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  Bell,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserCheck,
  CalendarDays,
  MessageSquare,
  FileWarning,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

// ─── Types ──────────────────────────────────────────────────────────────────

type AdminTab = 'overview' | 'users' | 'artisans' | 'missions' | 'reviews' | 'moderation' | 'settings'

interface AdminDashboardProps {
  onBack: () => void
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const revenueData = [
  { month: 'Jan', revenue: 1200000, missions: 45 },
  { month: 'Fév', revenue: 1800000, missions: 62 },
  { month: 'Mar', revenue: 2200000, missions: 78 },
  { month: 'Avr', revenue: 1900000, missions: 55 },
  { month: 'Mai', revenue: 2600000, missions: 89 },
  { month: 'Jun', revenue: 3100000, missions: 102 },
  { month: 'Jul', revenue: 2800000, missions: 95 },
  { month: 'Aoû', revenue: 2400000, missions: 82 },
  { month: 'Sep', revenue: 3200000, missions: 110 },
  { month: 'Oct', revenue: 3500000, missions: 118 },
  { month: 'Nov', revenue: 3800000, missions: 125 },
  { month: 'Déc', revenue: 4200000, missions: 140 },
]

const missionsByCategory = [
  { category: 'Plomberie', count: 245, fill: 'var(--color-plomberie)' },
  { category: 'Électricité', count: 198, fill: 'var(--color-electricite)' },
  { category: 'Menuiserie', count: 167, fill: 'var(--color-menuiserie)' },
  { category: 'Peinture', count: 134, fill: 'var(--color-peinture)' },
  { category: 'Climatisation', count: 112, fill: 'var(--color-climatisation)' },
  { category: 'Nettoyage', count: 189, fill: 'var(--color-nettoyage)' },
  { category: 'Maçonnerie', count: 98, fill: 'var(--color-maconnerie)' },
  { category: 'Serrurerie', count: 76, fill: 'var(--color-serrurerie)' },
]

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenus (FCFA)', color: '#f59e0b' },
  missions: { label: 'Missions', color: '#10b981' },
}

const missionsCategoryChartConfig: ChartConfig = {
  count: { label: 'Missions' },
  plomberie: { label: 'Plomberie', color: '#3b82f6' },
  electricite: { label: 'Électricité', color: '#f59e0b' },
  menuiserie: { label: 'Menuiserie', color: '#f97316' },
  peinture: { label: 'Peinture', color: '#10b981' },
  climatisation: { label: 'Climatisation', color: '#06b6d4' },
  nettoyage: { label: 'Nettoyage', color: '#8b5cf6' },
  maconnerie: { label: 'Maçonnerie', color: '#14b8a6' },
  serrurerie: { label: 'Serrurerie', color: '#f43f5e' },
}

const mockUsers = [
  { id: '1', name: 'Amadou Diallo', email: 'amadou.diallo@email.com', role: 'artisan', status: 'actif', date: '2025-01-15' },
  { id: '2', name: 'Fatou Ndiaye', email: 'fatou.ndiaye@email.com', role: 'client', status: 'actif', date: '2025-02-03' },
  { id: '3', name: 'Kofi Mensah', email: 'kofi.mensah@email.com', role: 'artisan', status: 'actif', date: '2025-01-22' },
  { id: '4', name: 'Aïcha Bello', email: 'aicha.bello@email.com', role: 'client', status: 'suspendu', date: '2024-11-10' },
  { id: '5', name: 'Moussa Traoré', email: 'moussa.traore@email.com', role: 'artisan', status: 'actif', date: '2025-03-05' },
  { id: '6', name: 'Mariama Sow', email: 'mariama.sow@email.com', role: 'client', status: 'actif', date: '2025-02-18' },
  { id: '7', name: 'Ibrahim Diarra', email: 'ibrahim.diarra@email.com', role: 'artisan', status: 'en_attente', date: '2025-03-12' },
  { id: '8', name: 'Aminata Koné', email: 'aminata.kone@email.com', role: 'client', status: 'actif', date: '2024-12-28' },
  { id: '9', name: 'Ousmane Ba', email: 'ousmane.ba@email.com', role: 'artisan', status: 'actif', date: '2025-01-08' },
  { id: '10', name: 'Mariam Doumbia', email: 'mariam.doumbia@email.com', role: 'client', status: 'actif', date: '2025-03-01' },
  { id: '11', name: 'Jean-Pierre Aka', email: 'jp.aka@email.com', role: 'artisan', status: 'suspendu', date: '2024-10-15' },
  { id: '12', name: 'Adama Cissé', email: 'adama.cisse@email.com', role: 'client', status: 'actif', date: '2025-02-22' },
]

const mockArtisans = [
  { id: '1', name: 'Amadou Diallo', specialty: 'Plomberie', badge: 'Élite', rating: 4.9, missions: 127, status: 'actif' },
  { id: '2', name: 'Fatou Ndiaye', specialty: 'Électricité', badge: 'Top', rating: 4.8, missions: 98, status: 'actif' },
  { id: '3', name: 'Kofi Mensah', specialty: 'Menuiserie', badge: 'Élite', rating: 4.9, missions: 156, status: 'actif' },
  { id: '4', name: 'Aïcha Bello', specialty: 'Peinture', badge: 'Vérifié', rating: 4.7, missions: 73, status: 'en_attente' },
  { id: '5', name: 'Moussa Traoré', specialty: 'Climatisation', badge: 'Top', rating: 4.8, missions: 112, status: 'actif' },
  { id: '6', name: 'Mariama Sow', specialty: 'Nettoyage', badge: 'Élite', rating: 4.9, missions: 201, status: 'actif' },
  { id: '7', name: 'Ibrahim Diarra', specialty: 'Maçonnerie', badge: 'Vérifié', rating: 4.5, missions: 45, status: 'en_attente' },
  { id: '8', name: 'Ousmane Ba', specialty: 'Serrurerie', badge: 'Top', rating: 4.7, missions: 89, status: 'suspendu' },
  { id: '9', name: 'Abdoulaye Keita', specialty: 'Plomberie', badge: 'Vérifié', rating: 4.3, missions: 34, status: 'en_attente' },
  { id: '10', name: 'Fanta Coulibaly', specialty: 'Électricité', badge: 'Élite', rating: 4.9, missions: 178, status: 'actif' },
]

const mockMissions = [
  { id: '1', title: 'Réparation fuite robinet', client: 'Aminata Koné', artisan: 'Amadou Diallo', status: 'en_cours', budget: 25000, date: '2025-03-10' },
  { id: '2', title: 'Installation tableau électrique', client: 'Ousmane Ba', artisan: 'Fatou Ndiaye', status: 'complétée', budget: 85000, date: '2025-03-08' },
  { id: '3', title: 'Fabriquer armoire sur mesure', client: 'Mariam Doumbia', artisan: 'Kofi Mensah', status: 'en_cours', budget: 150000, date: '2025-03-05' },
  { id: '4', title: 'Peinture salon 40m²', client: 'Adama Cissé', artisan: 'Aïcha Bello', status: 'ouverte', budget: 65000, date: '2025-03-12' },
  { id: '5', title: 'Maintenance climatisation', client: 'Fatou Ndiaye', artisan: 'Moussa Traoré', status: 'complétée', budget: 35000, date: '2025-02-28' },
  { id: '6', title: 'Nettoyage appartement', client: 'Ibrahim Diarra', artisan: 'Mariama Sow', status: 'annulée', budget: 15000, date: '2025-03-01' },
  { id: '7', title: 'Réparation mur fissuré', client: 'Mariama Sow', artisan: 'Ibrahim Diarra', status: 'en_cours', budget: 45000, date: '2025-03-11' },
  { id: '8', title: 'Installation serrure sécurité', client: 'Aminata Koné', artisan: 'Ousmane Ba', status: 'ouverte', budget: 30000, date: '2025-03-13' },
  { id: '9', title: 'Dépannage urgence plomberie', client: 'Jean-Pierre Aka', artisan: 'Amadou Diallo', status: 'en_cours', budget: 40000, date: '2025-03-14' },
  { id: '10', title: 'Rénovation électrique complète', client: 'Adama Cissé', artisan: 'Fanta Coulibaly', status: 'ouverte', budget: 200000, date: '2025-03-09' },
]

const mockReviews = [
  { id: '1', author: 'Aminata Koné', artisan: 'Amadou Diallo', rating: 5, comment: 'Travail excellent, très professionnel !', date: '2025-03-10', reported: false },
  { id: '2', author: 'Ousmane Ba', artisan: 'Fatou Ndiaye', rating: 4, comment: 'Bon travail, mais un peu de retard sur le planning.', date: '2025-03-08', reported: false },
  { id: '3', author: 'Mariam Doumbia', artisan: 'Kofi Mensah', rating: 5, comment: 'Superbe armoire, exactement ce que je voulais !', date: '2025-03-05', reported: false },
  { id: '4', author: 'Adama Cissé', artisan: 'Aïcha Bello', rating: 1, comment: 'Travail bâclé, peinture qui s\'écaille déjà. Arnaque !', date: '2025-03-12', reported: true },
  { id: '5', author: 'Ibrahim Diarra', artisan: 'Mariama Sow', rating: 3, comment: 'Service correct mais je m\'attendais à mieux pour le prix.', date: '2025-03-01', reported: false },
  { id: '6', author: 'Fanta Coulibaly', artisan: 'Moussa Traoré', rating: 5, comment: 'Parfait ! Climatisation qui fonctionne comme neuve.', date: '2025-02-28', reported: false },
]

const mockVerificationRequests = [
  { id: '1', name: 'Ibrahim Diarra', specialty: 'Maçonnerie', date: '2025-03-12', documents: 3, status: 'en_attente' },
  { id: '2', name: 'Aïcha Bello', specialty: 'Peinture', date: '2025-03-10', documents: 5, status: 'en_attente' },
  { id: '3', name: 'Abdoulaye Keita', specialty: 'Plomberie', date: '2025-03-08', documents: 4, status: 'en_attente' },
  { id: '4', name: 'Seydou Touré', specialty: 'Électricité', date: '2025-03-05', documents: 2, status: 'en_attente' },
  { id: '5', name: 'Bintou Camara', specialty: 'Nettoyage', date: '2025-03-03', documents: 3, status: 'en_attente' },
]

const mockDisputes = [
  { id: '1', title: 'Peinture non conforme', client: 'Adama Cissé', artisan: 'Aïcha Bello', amount: 65000, date: '2025-03-12', status: 'ouvert' },
  { id: '2', title: 'Travail incomplet - plomberie', client: 'Ibrahim Diarra', artisan: 'Amadou Diallo', amount: 25000, date: '2025-03-09', status: 'en_examen' },
  { id: '3', title: 'Surfacturation électricité', client: 'Ousmane Ba', artisan: 'Fanta Coulibaly', amount: 120000, date: '2025-03-06', status: 'ouvert' },
  { id: '4', title: 'Délai non respecté', client: 'Mariam Doumbia', artisan: 'Kofi Mensah', amount: 150000, date: '2025-02-28', status: 'résolu' },
]

const recentActivity = [
  { id: '1', type: 'user', message: 'Nouvel artisan inscrit : Abdoulaye Keita', time: 'Il y a 5 min', icon: Users },
  { id: '2', type: 'mission', message: 'Mission complétée : Installation tableau électrique', time: 'Il y a 15 min', icon: Briefcase },
  { id: '3', type: 'review', message: 'Avis signalé sur Aïcha Bello', time: 'Il y a 32 min', icon: AlertTriangle },
  { id: '4', type: 'payment', message: 'Paiement reçu : 85 000 FCFA', time: 'Il y a 1h', icon: DollarSign },
  { id: '5', type: 'verification', message: 'Vérification demandée par Seydou Touré', time: 'Il y a 2h', icon: Shield },
  { id: '6', type: 'dispute', message: 'Nouveau litige ouvert : Surfature électricité', time: 'Il y a 3h', icon: FileWarning },
  { id: '7', type: 'user', message: 'Compte suspendu : Jean-Pierre Aka', time: 'Il y a 5h', icon: Ban },
  { id: '8', type: 'mission', message: 'Nouvelle mission : Réparation fuite robinet', time: 'Il y a 6h', icon: Briefcase },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusBadge = (status: string) => {
  const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    actif: { variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0' },
    suspendu: { variant: 'secondary', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0' },
    en_attente: { variant: 'secondary', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0' },
    ouverte: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-0' },
    en_cours: { variant: 'secondary', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0' },
    complétée: { variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0' },
    annulée: { variant: 'secondary', className: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 border-0' },
    ouvert: { variant: 'secondary', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0' },
    en_examen: { variant: 'secondary', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0' },
    résolu: { variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0' },
  }
  const config = map[status] || { variant: 'outline' as const, className: '' }
  return <Badge variant={config.variant} className={config.className}>{status.replace('_', ' ')}</Badge>
}

const badgeStyle = (badge: string) => {
  const map: Record<string, string> = {
    'Élite': 'bg-amber-500 text-white border-0',
    'Top': 'bg-emerald-500 text-white border-0',
    'Vérifié': 'bg-teal-500 text-white border-0',
  }
  return map[badge] || 'bg-neutral-500 text-white border-0'
}

const formatFCFA = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

const formatCompactFCFA = (amount: number) => {
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M FCFA'
  if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K FCFA'
  return amount + ' FCFA'
}

// ─── Sidebar Navigation ─────────────────────────────────────────────────────

const navItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'artisans', label: 'Artisans', icon: Wrench },
  { id: 'missions', label: 'Missions', icon: Briefcase },
  { id: 'reviews', label: 'Avis', icon: Star },
  { id: 'moderation', label: 'Modération', icon: Shield },
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

// ─── Overview Tab ───────────────────────────────────────────────────────────

function OverviewTab() {
  const statCards = [
    { title: 'Total Utilisateurs', value: '12 450', change: '+12.5%', up: true, icon: Users, color: 'from-amber-500 to-orange-500' },
    { title: 'Artisans Actifs', value: '3 280', change: '+8.3%', up: true, icon: Wrench, color: 'from-emerald-500 to-teal-500' },
    { title: 'Missions en cours', value: '845', change: '+5.2%', up: true, icon: Briefcase, color: 'from-orange-500 to-amber-500' },
    { title: 'Revenus', value: '28.5M FCFA', change: '+15.8%', up: true, icon: DollarSign, color: 'from-teal-500 to-emerald-500' },
    { title: 'Vérifications en attente', value: '23', change: '-3.1%', up: false, icon: UserCheck, color: 'from-rose-500 to-red-500' },
    { title: 'Taux de complétion', value: '87%', change: '+2.4%', up: true, icon: TrendingUp, color: 'from-cyan-500 to-blue-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 text-sm">
                      {stat.up ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={stat.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground">vs mois dernier</span>
                    </div>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Revenus mensuels</CardTitle>
            <CardDescription>Évolution des revenus et missions sur 12 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
              <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="var(--color-muted-foreground)"
                  tickFormatter={(v: number) => formatCompactFCFA(v)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'var(--color-revenue)' }}
                  activeDot={{ r: 6 }}
                  name="Revenus (FCFA)"
                />
                <Line
                  type="monotone"
                  dataKey="missions"
                  stroke="var(--color-missions)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: 'var(--color-missions)' }}
                  name="Missions"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Missions Bar Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Missions par catégorie</CardTitle>
            <CardDescription>Répartition des missions actives par spécialité</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={missionsCategoryChartConfig} className="h-[300px] w-full">
              <BarChart data={missionsByCategory} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Missions" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Activité récente</CardTitle>
              <CardDescription>Dernières actions sur la plateforme</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                  <activity.icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Users Tab ──────────────────────────────────────────────────────────────

function UsersTab() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<{ type: string; user: typeof mockUsers[0] | null }>({ type: '', user: null })

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || user.role === roleFilter
      const matchStatus = statusFilter === 'all' || user.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [search, roleFilter, statusFilter])

  const handleAction = (type: string, user: typeof mockUsers[0]) => {
    setDialogAction({ type, user })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="artisan">Artisan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Liste des utilisateurs</CardTitle>
              <CardDescription>{filteredUsers.length} utilisateurs trouvés</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d&apos;inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{user.role}</Badge>
                    </TableCell>
                    <TableCell>{statusBadge(user.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{user.date}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => handleAction('view', user)}>
                            <Eye className="h-4 w-4" /> Voir le profil
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2" onClick={() => handleAction('suspend', user)}>
                            <Ban className="h-4 w-4" /> Suspendre
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" className="gap-2" onClick={() => handleAction('delete', user)}>
                            <Trash2 className="h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction.type === 'view' && 'Voir le profil'}
              {dialogAction.type === 'suspend' && 'Suspendre l\'utilisateur'}
              {dialogAction.type === 'delete' && 'Supprimer l\'utilisateur'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction.type === 'view' && `Profil de ${dialogAction.user?.name}`}
              {dialogAction.type === 'suspend' && `Êtes-vous sûr de vouloir suspendre ${dialogAction.user?.name} ? Cette action peut être annulée.`}
              {dialogAction.type === 'delete' && `Êtes-vous sûr de vouloir supprimer ${dialogAction.user?.name} ? Cette action est irréversible.`}
            </DialogDescription>
          </DialogHeader>
          {dialogAction.type === 'view' && dialogAction.user && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Nom :</span> <span className="font-medium">{dialogAction.user.name}</span></div>
                <div><span className="text-muted-foreground">Email :</span> <span className="font-medium">{dialogAction.user.email}</span></div>
                <div><span className="text-muted-foreground">Rôle :</span> <span className="font-medium capitalize">{dialogAction.user.role}</span></div>
                <div><span className="text-muted-foreground">Statut :</span> {statusBadge(dialogAction.user.status)}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Inscrit le :</span> <span className="font-medium">{dialogAction.user.date}</span></div>
              </div>
            </div>
          )}
          <DialogFooter>
            {dialogAction.type === 'view' ? (
              <Button onClick={() => setDialogOpen(false)} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
                Fermer
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button
                  className={dialogAction.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0'
                  }
                  onClick={() => setDialogOpen(false)}
                >
                  {dialogAction.type === 'suspend' ? 'Suspendre' : 'Supprimer'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Artisans Tab ───────────────────────────────────────────────────────────

function ArtisansTab() {
  const [search, setSearch] = useState('')
  const [badgeFilter, setBadgeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredArtisans = useMemo(() => {
    return mockArtisans.filter((artisan) => {
      const matchSearch = artisan.name.toLowerCase().includes(search.toLowerCase())
      const matchBadge = badgeFilter === 'all' || artisan.badge === badgeFilter
      const matchStatus = statusFilter === 'all' || artisan.status === statusFilter
      const matchCategory = categoryFilter === 'all' || artisan.specialty === categoryFilter
      return matchSearch && matchBadge && matchStatus && matchCategory
    })
  }, [search, badgeFilter, statusFilter, categoryFilter])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un artisan..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={badgeFilter} onValueChange={setBadgeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Badge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les badges</SelectItem>
                <SelectItem value="Élite">Élite</SelectItem>
                <SelectItem value="Top">Top</SelectItem>
                <SelectItem value="Vérifié">Vérifié</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="Plomberie">Plomberie</SelectItem>
                <SelectItem value="Électricité">Électricité</SelectItem>
                <SelectItem value="Menuiserie">Menuiserie</SelectItem>
                <SelectItem value="Peinture">Peinture</SelectItem>
                <SelectItem value="Climatisation">Climatisation</SelectItem>
                <SelectItem value="Nettoyage">Nettoyage</SelectItem>
                <SelectItem value="Maçonnerie">Maçonnerie</SelectItem>
                <SelectItem value="Serrurerie">Serrurerie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Artisans Table */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Liste des artisans</CardTitle>
              <CardDescription>{filteredArtisans.length} artisans trouvés</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Missions</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArtisans.map((artisan) => (
                  <TableRow key={artisan.id}>
                    <TableCell className="font-medium">{artisan.name}</TableCell>
                    <TableCell className="text-muted-foreground">{artisan.specialty}</TableCell>
                    <TableCell>
                      <Badge className={badgeStyle(artisan.badge)}>{artisan.badge}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{artisan.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{artisan.missions}</TableCell>
                    <TableCell>{statusBadge(artisan.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Vérifier
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" /> Voir profil
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2">
                            <Ban className="h-4 w-4" /> Suspendre
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Missions Tab ───────────────────────────────────────────────────────────

function MissionsTab() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filteredMissions = useMemo(() => {
    return mockMissions.filter((mission) => {
      const matchSearch = mission.title.toLowerCase().includes(search.toLowerCase()) ||
        mission.client.toLowerCase().includes(search.toLowerCase()) ||
        mission.artisan.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || mission.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une mission..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ouverte">Ouverte</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="complétée">Complétée</SelectItem>
                <SelectItem value="annulée">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Missions Table */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Liste des missions</CardTitle>
              <CardDescription>{filteredMissions.length} missions trouvées</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Artisan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMissions.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{mission.title}</TableCell>
                    <TableCell className="text-muted-foreground">{mission.client}</TableCell>
                    <TableCell className="text-muted-foreground">{mission.artisan}</TableCell>
                    <TableCell>{statusBadge(mission.status)}</TableCell>
                    <TableCell className="font-medium text-amber-600 dark:text-amber-400">{formatFCFA(mission.budget)}</TableCell>
                    <TableCell className="text-muted-foreground">{mission.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-1.5 text-amber-600 hover:text-amber-700 dark:text-amber-400">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Détails</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Reviews Tab ────────────────────────────────────────────────────────────

function ReviewsTab() {
  const [filter, setFilter] = useState<string>('all')

  const filteredReviews = useMemo(() => {
    if (filter === 'reported') return mockReviews.filter((r) => r.reported)
    if (filter === 'positive') return mockReviews.filter((r) => r.rating >= 4)
    if (filter === 'negative') return mockReviews.filter((r) => r.rating <= 2)
    return mockReviews
  }, [filter])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
              <Star className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
              <p className="text-xl font-bold">4.3/5</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
              <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total avis</p>
              <p className="text-xl font-bold">2 847</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/50">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avis signalés</p>
              <p className="text-xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Table */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Avis clients</CardTitle>
              <CardDescription>{filteredReviews.length} avis</CardDescription>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les avis</SelectItem>
                <SelectItem value="positive">Positifs (4+)</SelectItem>
                <SelectItem value="negative">Négatifs (≤2)</SelectItem>
                <SelectItem value="reported">Signalés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Artisan</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Commentaire</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.author}</TableCell>
                    <TableCell className="text-muted-foreground">{review.artisan}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700'}`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate text-muted-foreground">{review.comment}</TableCell>
                    <TableCell className="text-muted-foreground">{review.date}</TableCell>
                    <TableCell>
                      {review.reported ? (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0">Signalé</Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0">Normal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Moderation Tab ─────────────────────────────────────────────────────────

function ModerationTab() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<{ type: string; item: typeof mockVerificationRequests[0] | typeof mockDisputes[0] | null }>({ type: '', item: null })

  const handleAction = (type: string, item: typeof mockVerificationRequests[0] | typeof mockDisputes[0]) => {
    setDialogAction({ type, item })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Verification Requests */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                <UserCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base">Vérifications en attente</CardTitle>
                <CardDescription>{mockVerificationRequests.length} demandes à examiner</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockVerificationRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.name}</TableCell>
                    <TableCell className="text-muted-foreground">{req.specialty}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{req.documents} fichiers</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{req.date}</TableCell>
                    <TableCell>{statusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                          onClick={() => handleAction('approve', req)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Approuver</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400"
                          onClick={() => handleAction('reject', req)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Rejeter</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reported Reviews */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/50">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-base">Avis signalés</CardTitle>
              <CardDescription>Avis nécessitant une modération</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Artisan</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Commentaire</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReviews.filter((r) => r.reported).map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.author}</TableCell>
                    <TableCell className="text-muted-foreground">{review.artisan}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-red-400 text-red-400' : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700'}`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">{review.comment}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" variant="ghost" className="h-8 gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400">
                          <Eye className="h-3.5 w-3.5" />
                          Examiner
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 gap-1 text-red-600 hover:text-red-700 dark:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Disputes */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/50">
              <FileWarning className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-base">Litiges</CardTitle>
              <CardDescription>{mockDisputes.filter((d) => d.status !== 'résolu').length} litiges ouverts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Artisan</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDisputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-medium">{dispute.title}</TableCell>
                    <TableCell className="text-muted-foreground">{dispute.client}</TableCell>
                    <TableCell className="text-muted-foreground">{dispute.artisan}</TableCell>
                    <TableCell className="font-medium text-amber-600 dark:text-amber-400">{formatFCFA(dispute.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{dispute.date}</TableCell>
                    <TableCell>{statusBadge(dispute.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400"
                        onClick={() => handleAction('examine', dispute)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Examiner
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction.type === 'approve' && 'Approuver la vérification'}
              {dialogAction.type === 'reject' && 'Rejeter la vérification'}
              {dialogAction.type === 'examine' && 'Examiner le litige'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction.type === 'approve' && `Approuver la demande de vérification de ${'name' in (dialogAction.item || {}) ? (dialogAction.item as { name: string }).name : ''} ?`}
              {dialogAction.type === 'reject' && `Rejeter la demande de vérification de ${'name' in (dialogAction.item || {}) ? (dialogAction.item as { name: string }).name : ''} ?`}
              {dialogAction.type === 'examine' && `Examiner le litige : ${'title' in (dialogAction.item || {}) ? (dialogAction.item as { title: string }).title : ''}`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button
              className={
                dialogAction.type === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : dialogAction.type === 'reject'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0'
              }
              onClick={() => setDialogOpen(false)}
            >
              {dialogAction.type === 'approve' && 'Approuver'}
              {dialogAction.type === 'reject' && 'Rejeter'}
              {dialogAction.type === 'examine' && 'Examiner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Settings Tab ───────────────────────────────────────────────────────────

function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Paramètres généraux</CardTitle>
          <CardDescription>Configuration de la plateforme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de la plateforme</label>
              <Input defaultValue="Artisan Connecté" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email de contact</label>
              <Input defaultValue="admin@artisanconnecte.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Commission plateforme (%)</label>
              <Input type="number" defaultValue="12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Devise</label>
              <Select defaultValue="fcfa">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fcfa">FCFA</SelectItem>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Gestion des alertes administrateur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Nouvelles inscriptions artisan', desc: 'Recevoir un email à chaque nouvelle inscription artisan' },
            { label: 'Litiges', desc: 'Être notifié lors de l\'ouverture d\'un nouveau litige' },
            { label: 'Avis signalés', desc: 'Recevoir une alerte quand un avis est signalé' },
            { label: 'Rapport hebdomadaire', desc: 'Recevoir un résumé d\'activité chaque lundi' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <div className="flex h-6 w-11 items-center rounded-full bg-amber-500 p-0.5 cursor-pointer">
                <div className="h-5 w-5 translate-x-5 rounded-full bg-white shadow-sm transition-transform" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Zone dangereuse</CardTitle>
          <CardDescription>Actions irréversibles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Réinitialiser la base de données</p>
              <p className="text-xs text-muted-foreground">Supprimer toutes les données et recommencer à zéro</p>
            </div>
            <Button variant="destructive" size="sm">Réinitialiser</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0">
          Sauvegarder les modifications
        </Button>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'users':
        return <UsersTab />
      case 'artisans':
        return <ArtisansTab />
      case 'missions':
        return <MissionsTab />
      case 'reviews':
        return <ReviewsTab />
      case 'moderation':
        return <ModerationTab />
      case 'settings':
        return <SettingsTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="hidden sm:block h-5 w-px bg-border" />
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <Wrench className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-sm bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Admin Dashboard
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">3</span>
            </Button>
            <div className="flex items-center gap-2 ml-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold">
                AD
              </div>
              <span className="hidden sm:inline text-sm font-medium">Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`sticky top-14 h-[calc(100vh-3.5rem)] border-r border-border/50 bg-muted/30 transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-56'
          } hidden md:block`}
        >
          <div className="flex flex-col h-full py-4">
            {/* Collapse Toggle */}
            <div className="px-3 mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center h-8"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-90' : '-rotate-90'}`} />
              </Button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : ''}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                )
              })}
            </nav>

            {/* Sidebar Footer */}
            {!sidebarCollapsed && (
              <div className="px-3 pt-4 border-t border-border/50">
                <div className="rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-3">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Besoin d&apos;aide ?</p>
                  <p className="text-xs text-muted-foreground mt-1">Consultez la documentation admin</p>
                  <Button size="sm" variant="outline" className="w-full mt-2 h-7 text-xs border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50">
                    Documentation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border/50 md:hidden">
          <div className="flex items-center justify-around py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                    isActive
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="truncate max-w-[48px]">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
