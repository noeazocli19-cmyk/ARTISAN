'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  ArrowLeft,
  Plus,
  MapPin,
  Clock,
  FileText,
  Star,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Upload,
  Camera,
  Trophy,
  Zap,
  TrendingUp,
  Loader2,
  AlertCircle,
  MessageSquare,
  Calendar,
  DollarSign,
  Users,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react'
import type { QuoteRequest, Quote, QuoteItem, QuoteStatus } from '@/lib/types'
import { useAppStore } from '@/lib/store'

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_QUOTE_ITEMS_1: QuoteItem[] = [
  { id: 'qi1', description: 'Remplacement tuyau principal', quantity: 1, unitPrice: 25000, total: 25000 },
  { id: 'qi2', description: 'Joint en caoutchouc', quantity: 3, unitPrice: 2500, total: 7500 },
  { id: 'qi3', description: 'Main d\'œuvre (3h)', quantity: 3, unitPrice: 5000, total: 15000 },
  { id: 'qi4', description: 'Déplacement', quantity: 1, unitPrice: 3000, total: 3000 },
]

const MOCK_QUOTE_ITEMS_2: QuoteItem[] = [
  { id: 'qi5', description: 'Réparation tuyau existant', quantity: 1, unitPrice: 15000, total: 15000 },
  { id: 'qi6', description: 'Soudure joint', quantity: 2, unitPrice: 3000, total: 6000 },
  { id: 'qi7', description: 'Main d\'œuvre (2h)', quantity: 2, unitPrice: 4500, total: 9000 },
  { id: 'qi8', description: 'Déplacement', quantity: 1, unitPrice: 2000, total: 2000 },
]

const MOCK_QUOTE_ITEMS_3: QuoteItem[] = [
  { id: 'qi9', description: 'Inspection complète canalisation', quantity: 1, unitPrice: 10000, total: 10000 },
  { id: 'qi10', description: 'Remplacement joint torique', quantity: 4, unitPrice: 1500, total: 6000 },
  { id: 'qi11', description: 'Main d\'œuvre (4h)', quantity: 4, unitPrice: 4000, total: 16000 },
  { id: 'qi12', description: 'Nettoyage post-travaux', quantity: 1, unitPrice: 2500, total: 2500 },
]

const MOCK_QUOTE_ITEMS_ELEC_1: QuoteItem[] = [
  { id: 'qe1', description: 'Tableau électrique neuf', quantity: 1, unitPrice: 45000, total: 45000 },
  { id: 'qe2', description: 'Disjoncteur 20A', quantity: 4, unitPrice: 3500, total: 14000 },
  { id: 'qe3', description: 'Câblage complet', quantity: 1, unitPrice: 20000, total: 20000 },
  { id: 'qe4', description: 'Main d\'œuvre (5h)', quantity: 5, unitPrice: 5000, total: 25000 },
  { id: 'qe5', description: 'Certification', quantity: 1, unitPrice: 10000, total: 10000 },
]

const MOCK_QUOTE_ITEMS_ELEC_2: QuoteItem[] = [
  { id: 'qe6', description: 'Tableau électrique rénovation', quantity: 1, unitPrice: 35000, total: 35000 },
  { id: 'qe7', description: 'Disjoncteur 20A', quantity: 4, unitPrice: 3000, total: 12000 },
  { id: 'qe8', description: 'Câblage', quantity: 1, unitPrice: 18000, total: 18000 },
  { id: 'qe9', description: 'Main d\'œuvre (6h)', quantity: 6, unitPrice: 4500, total: 27000 },
  { id: 'qe10', description: 'Certification', quantity: 1, unitPrice: 8000, total: 8000 },
]

const MOCK_QUOTE_ITEMS_ELEC_3: QuoteItem[] = [
  { id: 'qe11', description: 'Tableau électrique premium', quantity: 1, unitPrice: 55000, total: 55000 },
  { id: 'qe12', description: 'Disjoncteur 20A + différentiel', quantity: 6, unitPrice: 4000, total: 24000 },
  { id: 'qe13', description: 'Câblage cuivre', quantity: 1, unitPrice: 25000, total: 25000 },
  { id: 'qe14', description: 'Main d\'œuvre (4h)', quantity: 4, unitPrice: 6000, total: 24000 },
  { id: 'qe15', description: 'Certification + garantie 2 ans', quantity: 1, unitPrice: 12000, total: 12000 },
]

const MOCK_QUOTE_ITEMS_ELEC_4: QuoteItem[] = [
  { id: 'qe16', description: 'Tableau électrique standard', quantity: 1, unitPrice: 38000, total: 38000 },
  { id: 'qe17', description: 'Disjoncteur 20A', quantity: 4, unitPrice: 3200, total: 12800 },
  { id: 'qe18', description: 'Câblage', quantity: 1, unitPrice: 15000, total: 15000 },
  { id: 'qe19', description: 'Main d\'œuvre (5h)', quantity: 5, unitPrice: 4000, total: 20000 },
]

const MOCK_QUOTE_ITEMS_MENU_1: QuoteItem[] = [
  { id: 'qm1', description: 'Planches de bois (iroko)', quantity: 8, unitPrice: 8000, total: 64000 },
  { id: 'qm2', description: 'Vis et quincaillerie', quantity: 1, unitPrice: 5000, total: 5000 },
  { id: 'qm3', description: 'Vernis protecteur', quantity: 2, unitPrice: 3500, total: 7000 },
  { id: 'qm4', description: 'Main d\'œuvre (8h)', quantity: 8, unitPrice: 4000, total: 32000 },
]

const MOCK_QUOTE_ITEMS_MENU_2: QuoteItem[] = [
  { id: 'qm5', description: 'Planches de bois (acajou)', quantity: 8, unitPrice: 10000, total: 80000 },
  { id: 'qm6', description: 'Quincaillerie premium', quantity: 1, unitPrice: 8000, total: 8000 },
  { id: 'qm7', description: 'Vernis + lasure', quantity: 3, unitPrice: 4000, total: 12000 },
  { id: 'qm8', description: 'Main d\'œuvre (10h)', quantity: 10, unitPrice: 4500, total: 45000 },
]

const MOCK_QUOTE_ITEMS_MENU_3: QuoteItem[] = [
  { id: 'qm9', description: 'Planches de bois (fraké)', quantity: 8, unitPrice: 6000, total: 48000 },
  { id: 'qm10', description: 'Vis et colle', quantity: 1, unitPrice: 4000, total: 4000 },
  { id: 'qm11', description: 'Lasure', quantity: 2, unitPrice: 3000, total: 6000 },
  { id: 'qm12', description: 'Main d\'œuvre (7h)', quantity: 7, unitPrice: 3500, total: 24500 },
]

const now = new Date()

function daysFromNow(days: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function daysAgo(days: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

const MOCK_QUOTE_REQUESTS: QuoteRequest[] = [
  {
    id: 'qr1',
    clientId: 'client1',
    title: 'Fuite d\'eau cuisine — réparation urgente',
    description: 'Fuite d\'eau importante sous l\'évier de la cuisine. Le tuyau principal semble fissuré. L\'eau coule en continu et il faut couper l\'arrivée d\'eau générale. Besoin d\'une intervention rapide pour éviter des dégâts supplémentaires.',
    category: 'Plomberie',
    location: 'Dakar, Sénégal',
    budget: { min: 30000, max: 60000 },
    urgency: 'high',
    photos: [],
    quotes: [
      {
        id: 'q1',
        requestId: 'qr1',
        artisanId: 'a1',
        artisanName: 'Amadou Diallo',
        artisanAvatar: 'AD',
        artisanRating: 4.9,
        artisanBadge: 'Élite',
        items: MOCK_QUOTE_ITEMS_1,
        totalAmount: 50500,
        estimatedDuration: '3 heures',
        availability: 'Disponible aujourd\'hui',
        message: 'Bonjour ! Je peux intervenir dans l\'heure. J\'ai tout le matériel nécessaire en stock. Mon travail est garanti 6 mois.',
        status: 'pending',
        createdAt: daysAgo(1),
      },
      {
        id: 'q2',
        requestId: 'qr1',
        artisanId: 'a2',
        artisanName: 'Ibrahim Sow',
        artisanAvatar: 'IS',
        artisanRating: 4.6,
        artisanBadge: 'Vérifié',
        items: MOCK_QUOTE_ITEMS_2,
        totalAmount: 32000,
        estimatedDuration: '2 heures',
        availability: 'Disponible demain matin',
        message: 'Je peux réparer votre fuite rapidement. Je propose une solution économique avec une garantie de 3 mois.',
        status: 'pending',
        createdAt: daysAgo(0),
      },
      {
        id: 'q3',
        requestId: 'qr1',
        artisanId: 'a3',
        artisanName: 'Ousmane Ba',
        artisanAvatar: 'OB',
        artisanRating: 4.8,
        artisanBadge: 'Top',
        items: MOCK_QUOTE_ITEMS_3,
        totalAmount: 34500,
        estimatedDuration: '4 heures',
        availability: 'Disponible cette semaine',
        message: 'Je propose une inspection complète de la canalisation pour éviter toute récidive. Travail soigné et garanti 1 an.',
        status: 'pending',
        createdAt: daysAgo(0),
      },
    ],
    status: 'open',
    createdAt: daysAgo(2),
    expiresAt: daysFromNow(5),
  },
  {
    id: 'qr2',
    clientId: 'client1',
    title: 'Installation tableau électrique neuf',
    description: 'Remplacement complet du tableau électrique de la maison. L\'installation actuelle est vétuste et ne respecte plus les normes. Besoin d\'un tableau neuf avec disjoncteurs différentiels et certification aux normes.',
    category: 'Électricité',
    location: 'Abidjan, Côte d\'Ivoire',
    budget: { min: 80000, max: 150000 },
    urgency: 'medium',
    photos: [],
    quotes: [
      {
        id: 'q4',
        requestId: 'qr2',
        artisanId: 'a4',
        artisanName: 'Fatou Ndiaye',
        artisanAvatar: 'FN',
        artisanRating: 4.8,
        artisanBadge: 'Top',
        items: MOCK_QUOTE_ITEMS_ELEC_1,
        totalAmount: 114000,
        estimatedDuration: '5 heures',
        availability: 'Disponible cette semaine',
        message: 'Je suis certifiée pour les installations aux normes NF C 15-100. Je fournis la certification à la fin des travaux.',
        status: 'pending',
        createdAt: daysAgo(1),
      },
      {
        id: 'q5',
        requestId: 'qr2',
        artisanId: 'a5',
        artisanName: 'Kofi Mensah',
        artisanAvatar: 'KM',
        artisanRating: 4.9,
        artisanBadge: 'Élite',
        items: MOCK_QUOTE_ITEMS_ELEC_3,
        totalAmount: 140000,
        estimatedDuration: '4 heures',
        availability: 'Disponible demain',
        message: 'Installation premium avec garantie 2 ans. Matériel de haute qualité et certification incluse. Intervention rapide et professionnelle.',
        status: 'pending',
        createdAt: daysAgo(0),
      },
      {
        id: 'q6',
        requestId: 'qr2',
        artisanId: 'a6',
        artisanName: 'Aïcha Bello',
        artisanAvatar: 'AB',
        artisanRating: 4.5,
        artisanBadge: 'Vérifié',
        items: MOCK_QUOTE_ITEMS_ELEC_2,
        totalAmount: 100000,
        estimatedDuration: '6 heures',
        availability: 'Disponible sous 3 jours',
        message: 'Solution fiable et abordable. Je travaille avec du matériel de qualité et je certifie l\'installation.',
        status: 'pending',
        createdAt: daysAgo(1),
      },
      {
        id: 'q7',
        requestId: 'qr2',
        artisanId: 'a7',
        artisanName: 'Moussa Traoré',
        artisanAvatar: 'MT',
        artisanRating: 4.3,
        artisanBadge: 'Vérifié',
        items: MOCK_QUOTE_ITEMS_ELEC_4,
        totalAmount: 85800,
        estimatedDuration: '5 heures',
        availability: 'Disponible demain',
        message: 'Tarif compétitif pour une installation complète. Certification en option (+8 000 FCFA).',
        status: 'pending',
        createdAt: daysAgo(0),
      },
    ],
    status: 'open',
    createdAt: daysAgo(3),
    expiresAt: daysFromNow(4),
  },
  {
    id: 'qr3',
    clientId: 'client1',
    title: 'Fabrication étagères sur mesure',
    description: 'Fabrication de 3 étagères en bois massif pour le salon. Dimensions : 120cm x 30cm x 180cm. Finition vernie. Livraison et installation incluses.',
    category: 'Menuiserie',
    location: 'Accra, Ghana',
    budget: { min: 100000, max: 200000 },
    urgency: 'low',
    photos: [],
    quotes: [
      {
        id: 'q8',
        requestId: 'qr3',
        artisanId: 'a8',
        artisanName: 'Kofi Mensah',
        artisanAvatar: 'KM',
        artisanRating: 4.9,
        artisanBadge: 'Élite',
        items: MOCK_QUOTE_ITEMS_MENU_1,
        totalAmount: 108000,
        estimatedDuration: '2 jours',
        availability: 'Disponible la semaine prochaine',
        message: 'Je travaille avec du bois d\'iroko de première qualité. Finition impeccable et livraison gratuite.',
        status: 'pending',
        createdAt: daysAgo(2),
      },
      {
        id: 'q9',
        requestId: 'qr3',
        artisanId: 'a9',
        artisanName: 'Yao Amegah',
        artisanAvatar: 'YA',
        artisanRating: 4.7,
        artisanBadge: 'Top',
        items: MOCK_QUOTE_ITEMS_MENU_2,
        totalAmount: 145000,
        estimatedDuration: '3 jours',
        availability: 'Disponible sous 1 semaine',
        message: 'Bois d\'acajou premium avec finition haut de gamme. Chaque étagère est une pièce unique.',
        status: 'pending',
        createdAt: daysAgo(1),
      },
      {
        id: 'q10',
        requestId: 'qr3',
        artisanId: 'a10',
        artisanName: 'Komlan Adjei',
        artisanAvatar: 'KA',
        artisanRating: 4.4,
        artisanBadge: 'Vérifié',
        items: MOCK_QUOTE_ITEMS_MENU_3,
        totalAmount: 82500,
        estimatedDuration: '2 jours',
        availability: 'Disponible cette semaine',
        message: 'Rapport qualité-prix imbattable. Bois fraké solide et finition soignée.',
        status: 'pending',
        createdAt: daysAgo(0),
      },
    ],
    status: 'open',
    createdAt: daysAgo(5),
    expiresAt: daysFromNow(7),
  },
  {
    id: 'qr4',
    clientId: 'client1',
    title: 'Peinture chambre — 2 couches',
    description: 'Peinture complète de la chambre principale (20m²) : préparation des murs, enduit, et application de 2 couches de peinture. Couleur : bleu pastel.',
    category: 'Peinture',
    location: 'Lomé, Togo',
    budget: { min: 40000, max: 70000 },
    urgency: 'low',
    photos: [],
    quotes: [],
    status: 'closed',
    createdAt: daysAgo(30),
    expiresAt: daysAgo(20),
  },
  {
    id: 'qr5',
    clientId: 'client1',
    title: 'Réparation porte d\'entrée — serrure cassée',
    description: 'La serrure de la porte d\'entrée est cassée suite à une tentative d\'effraction. Besoin de remplacer la serrure et renforcer la porte.',
    category: 'Serrurerie',
    location: 'Bamako, Mali',
    budget: { min: 20000, max: 45000 },
    urgency: 'high',
    photos: [],
    quotes: [
      {
        id: 'q11',
        requestId: 'qr5',
        artisanId: 'a11',
        artisanName: 'Seydou Keita',
        artisanAvatar: 'SK',
        artisanRating: 4.8,
        artisanBadge: 'Top',
        items: [
          { id: 'qs1', description: 'Serrure multipoints', quantity: 1, unitPrice: 18000, total: 18000 },
          { id: 'qs2', description: 'Renforcement porte', quantity: 1, unitPrice: 8000, total: 8000 },
          { id: 'qs3', description: 'Main d\'œuvre (2h)', quantity: 2, unitPrice: 4000, total: 8000 },
        ],
        totalAmount: 34000,
        estimatedDuration: '2 heures',
        availability: 'Intervention immédiate',
        message: 'Je peux intervenir immédiatement. Serrure multipoints haute sécurité avec 3 points de verrouillage.',
        status: 'accepted',
        createdAt: daysAgo(10),
      },
    ],
    status: 'awarded',
    createdAt: daysAgo(12),
    expiresAt: daysAgo(2),
  },
]

// =============================================================================
// Helpers
// =============================================================================

function formatFCFA(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' FCFA'
}

function getTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diff = expiry.getTime() - now.getTime()

  if (diff <= 0) return 'Expiré'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}j ${hours}h restants`
  return `${hours}h restants`
}

function getStatusBadge(status: 'open' | 'closed' | 'awarded') {
  switch (status) {
    case 'open':
      return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20 border">Ouverte</Badge>
    case 'closed':
      return <Badge className="bg-neutral-500/15 text-neutral-500 dark:text-neutral-400 border-neutral-500/25 hover:bg-neutral-500/20 border">Fermée</Badge>
    case 'awarded':
      return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25 hover:bg-amber-500/20 border">Attribuée</Badge>
  }
}

function getUrgencyBadge(urgency: 'low' | 'medium' | 'high') {
  switch (urgency) {
    case 'low':
      return <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-400/50 text-xs">Basse</Badge>
    case 'medium':
      return <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400 border-yellow-400/50 text-xs">Moyenne</Badge>
    case 'high':
      return <Badge variant="outline" className="text-red-600 dark:text-red-400 border-red-400/50 text-xs">Haute</Badge>
  }
}

function getBadgeColor(badge: string): string {
  switch (badge) {
    case 'Élite':
      return 'bg-amber-500 text-white'
    case 'Top':
      return 'bg-emerald-500 text-white'
    case 'Vérifié':
      return 'bg-teal-500 text-white'
    default:
      return 'bg-neutral-500 text-white'
  }
}

function getAvatarColor(initial: string): string {
  const colors = [
    'bg-amber-500', 'bg-emerald-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-violet-500',
  ]
  const idx = initial.charCodeAt(0) % colors.length
  return colors[idx]
}

// =============================================================================
// Animation variants
// =============================================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

// =============================================================================
// Sub-components
// =============================================================================

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i < rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700'
          }`}
        />
      ))}
      <span className={`ml-1 font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{rating}</span>
    </div>
  )
}

function QuoteCard({
  quote,
  isLowest,
  isFastest,
  isHighestRated,
  onAccept,
  onDecline,
}: {
  quote: Quote
  isLowest: boolean
  isFastest: boolean
  isHighestRated: boolean
  onAccept: () => void
  onDecline: () => void
}) {
  const [showItems, setShowItems] = useState(false)

  return (
    <motion.div variants={scaleIn} initial="hidden" animate="visible">
      <Card className="border-border/50 hover:border-amber-300/50 dark:hover:border-amber-700/50 transition-all hover:shadow-md overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          {/* Highlight badges */}
          {(isLowest || isFastest || isHighestRated) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {isLowest && (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 gap-1 border">
                  <DollarSign className="h-3 w-3" />
                  Meilleur prix
                </Badge>
              )}
              {isFastest && (
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25 gap-1 border">
                  <Zap className="h-3 w-3" />
                  Plus rapide
                </Badge>
              )}
              {isHighestRated && (
                <Badge className="bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25 gap-1 border">
                  <Trophy className="h-3 w-3" />
                  Mieux noté
                </Badge>
              )}
            </div>
          )}

          {/* Artisan info */}
          <div className="flex items-start gap-3 mb-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${getAvatarColor(quote.artisanAvatar)}`}>
              {quote.artisanAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm sm:text-base truncate">{quote.artisanName}</h4>
                <Badge className={`text-[10px] px-1.5 py-0 ${getBadgeColor(quote.artisanBadge)} border-0`}>
                  {quote.artisanBadge}
                </Badge>
              </div>
              <StarRating rating={quote.artisanRating} />
            </div>
          </div>

          {/* Itemized breakdown */}
          <div className="mb-4">
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              onClick={() => setShowItems(!showItems)}
            >
              <FileText className="h-4 w-4" />
              Détail du devis
              {showItems ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <AnimatePresence>
              {showItems && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-lg border border-border/50 overflow-hidden">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2 font-medium">Description</th>
                          <th className="text-center p-2 font-medium">Qté</th>
                          <th className="text-right p-2 font-medium">P.U.</th>
                          <th className="text-right p-2 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.items.map((item) => (
                          <tr key={item.id} className="border-t border-border/30">
                            <td className="p-2 text-muted-foreground">{item.description}</td>
                            <td className="p-2 text-center text-muted-foreground">{item.quantity}</td>
                            <td className="p-2 text-right text-muted-foreground">{formatFCFA(item.unitPrice)}</td>
                            <td className="p-2 text-right font-medium">{formatFCFA(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <span className="font-semibold text-sm">Total</span>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {formatFCFA(quote.totalAmount)}
            </span>
          </div>

          {/* Duration & Availability */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>Durée : <strong className="text-foreground">{quote.estimatedDuration}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-amber-500" />
              <span>{quote.availability}</span>
            </div>
          </div>

          {/* Message */}
          {quote.message && (
            <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/30">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Message de l&apos;artisan</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{quote.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
              onClick={onAccept}
            >
              <ThumbsUp className="h-4 w-4 mr-1.5" />
              Accepter
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={onDecline}
            >
              <ThumbsDown className="h-4 w-4 mr-1.5" />
              Décliner
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

interface QuoteRequestSystemProps {
  onBack: () => void
}

export function QuoteRequestSystem({ onBack }: QuoteRequestSystemProps) {
  const { user } = useAppStore()

  // State
  const [quoteRequests] = useState<QuoteRequest[]>(MOCK_QUOTE_REQUESTS)
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formBudgetMin, setFormBudgetMin] = useState('')
  const [formBudgetMax, setFormBudgetMax] = useState('')
  const [formUrgency, setFormUrgency] = useState<'low' | 'medium' | 'high'>('medium')
  const [formPhotos, setFormPhotos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Computed values for comparison
  const comparisonData = useMemo(() => {
    if (!selectedRequest || selectedRequest.quotes.length === 0) return null

    const quotes = selectedRequest.quotes.filter(q => q.status === 'pending')
    if (quotes.length === 0) return null

    const lowestPrice = Math.min(...quotes.map(q => q.totalAmount))
    const highestRating = Math.max(...quotes.map(q => q.artisanRating))

    // For fastest, try to parse the duration string
    const parseDuration = (d: string): number => {
      const match = d.match(/(\d+)/)
      return match ? parseInt(match[1]) : 999
    }
    const fastestDuration = Math.min(...quotes.map(q => parseDuration(q.estimatedDuration)))

    return {
      lowestPrice,
      highestRating,
      fastestDuration,
      quotes,
    }
  }, [selectedRequest])

  // Handlers
  const handleCreateSubmit = () => {
    if (!formTitle.trim() || !formDescription.trim() || !formCategory || !formLocation.trim()) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setCreateDialogOpen(false)
        resetForm()
      }, 3000)
    }, 2000)
  }

  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormCategory('')
    setFormLocation('')
    setFormBudgetMin('')
    setFormBudgetMax('')
    setFormUrgency('medium')
    setFormPhotos([])
  }

  const handleAccept = (quote: Quote) => {
    setSelectedQuote(quote)
    setAcceptDialogOpen(true)
  }

  const handleDecline = (quote: Quote) => {
    setSelectedQuote(quote)
    setDeclineDialogOpen(true)
  }

  const confirmAccept = () => {
    setAcceptDialogOpen(false)
    setSelectedQuote(null)
  }

  const confirmDecline = () => {
    setDeclineDialogOpen(false)
    setSelectedQuote(null)
  }

  const openRequests = quoteRequests.filter(qr => qr.status === 'open')
  const closedRequests = quoteRequests.filter(qr => qr.status !== 'open')

  // ──── Quote comparison view
  if (selectedRequest) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm sm:text-base truncate">{selectedRequest.title}</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{selectedRequest.location}</span>
                  <span>•</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {/* Request details */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <Card className="mb-6 border-border/50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline" className="border-amber-400/50 text-amber-600 dark:text-amber-400">
                    {selectedRequest.category}
                  </Badge>
                  {getUrgencyBadge(selectedRequest.urgency)}
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{selectedRequest.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <DollarSign className="h-4 w-4 text-amber-500" />
                    <span>Budget : <strong className="text-foreground">{formatFCFA(selectedRequest.budget.min)} — {formatFCFA(selectedRequest.budget.max)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>{getTimeRemaining(selectedRequest.expiresAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4 text-amber-500" />
                    <span>{selectedRequest.quotes.length} devis reçu{selectedRequest.quotes.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Comparison header */}
          {comparisonData && comparisonData.quotes.length > 1 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-lg">Comparaison des devis</h3>
                <Badge variant="secondary" className="ml-2">{comparisonData.quotes.length} devis</Badge>
              </div>

              {/* Comparison summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                      <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Meilleur prix</p>
                      <p className="font-bold text-sm">{formatFCFA(comparisonData.lowestPrice)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                      <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Plus rapide</p>
                      <p className="font-bold text-sm">Intervention prioritaire</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-violet-500/30 bg-violet-50/50 dark:bg-violet-950/20">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
                      <Trophy className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Mieux noté</p>
                      <p className="font-bold text-sm">{comparisonData.highestRating}/5 ⭐</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Quote cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          >
            {selectedRequest.quotes.map((quote) => {
              const isLowest = comparisonData
                ? quote.totalAmount === comparisonData.lowestPrice
                : false
              const isFastest = comparisonData
                ? (() => {
                    const parseDuration = (d: string): number => {
                      const match = d.match(/(\d+)/)
                      return match ? parseInt(match[1]) : 999
                    }
                    return parseDuration(quote.estimatedDuration) === comparisonData.fastestDuration
                  })()
                : false
              const isHighestRated = comparisonData
                ? quote.artisanRating === comparisonData.highestRating
                : false

              return (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  isLowest={isLowest}
                  isFastest={isFastest}
                  isHighestRated={isHighestRated}
                  onAccept={() => handleAccept(quote)}
                  onDecline={() => handleDecline(quote)}
                />
              )
            })}
          </motion.div>

          {selectedRequest.quotes.length === 0 && (
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center py-16">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 mb-4">
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Aucun devis reçu</h3>
              <p className="text-muted-foreground">Les artisans n&apos;ont pas encore répondu à cette demande.</p>
            </motion.div>
          )}
        </div>

        {/* Accept confirmation dialog */}
        <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Confirmer l&apos;acceptation
              </DialogTitle>
              <DialogDescription>
                Vous êtes sur le point d&apos;accepter le devis de <strong>{selectedQuote?.artisanName}</strong> pour un montant de <strong>{selectedQuote ? formatFCFA(selectedQuote.totalAmount) : ''}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                En acceptant ce devis, l&apos;artisan sera notifié et pourra commencer les travaux selon les conditions convenues. Un acompte de 30% sera requis pour confirmer la mission.
              </p>
            </div>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                onClick={confirmAccept}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Decline confirmation dialog */}
        <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Décliner le devis
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir décliner le devis de <strong>{selectedQuote?.artisanName}</strong> ?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Cette action est irréversible. L&apos;artisan sera notifié que son devis n&apos;a pas été retenu.
              </p>
            </div>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDecline}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Décliner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ──── Main list view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Retour</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="font-bold text-lg sm:text-xl">Mes demandes de devis</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Gérez vos demandes et comparez les devis reçus
                </p>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 gap-1.5"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nouvelle demande</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="open" className="w-full">
          <TabsList className="mb-6 bg-muted/50">
            <TabsTrigger value="open" className="gap-1.5">
              En cours
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] flex items-center justify-center text-[10px] px-1.5">
                {openRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="closed" className="gap-1.5">
              Terminées
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] flex items-center justify-center text-[10px] px-1.5">
                {closedRequests.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Open requests */}
          <TabsContent value="open">
            {openRequests.length === 0 ? (
              <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center py-16">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 mb-4">
                  <FileText className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Aucune demande en cours</h3>
                <p className="text-muted-foreground mb-4">Créez votre première demande de devis !</p>
                <Button
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Nouvelle demande
                </Button>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
              >
                {openRequests.map((request) => (
                  <motion.div key={request.id} variants={fadeInUp}>
                    <Card
                      className="cursor-pointer border-border/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:shadow-lg group"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <CardContent className="p-4 sm:p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-semibold text-sm sm:text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                            {request.title}
                          </h3>
                          {getStatusBadge(request.status)}
                        </div>

                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="outline" className="border-amber-400/50 text-amber-600 dark:text-amber-400 text-xs">
                            {request.category}
                          </Badge>
                          {getUrgencyBadge(request.urgency)}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" />
                          <span>{request.location}</span>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{request.quotes.length}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Devis</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <p className="text-xs sm:text-sm font-bold">
                              {formatFCFA(request.budget.min).replace(' FCFA', '')}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Budget min</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <p className="text-xs sm:text-sm font-bold">{getTimeRemaining(request.expiresAt)}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Restant</p>
                          </div>
                        </div>

                        {/* Quote preview */}
                        {request.quotes.length > 0 && (
                          <div className="pt-3 border-t border-border/30">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                À partir de <strong className="text-amber-600 dark:text-amber-400">
                                  {formatFCFA(Math.min(...request.quotes.map(q => q.totalAmount)))}
                                </strong>
                              </span>
                              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 group-hover:gap-1.5 transition-all">
                                Voir les devis
                                <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          {/* Closed/awarded requests */}
          <TabsContent value="closed">
            {closedRequests.length === 0 ? (
              <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center py-16">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted/50 mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Aucune demande terminée</h3>
                <p className="text-muted-foreground">Vos demandes clôturées apparaîtront ici.</p>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
              >
                {closedRequests.map((request) => (
                  <motion.div key={request.id} variants={fadeInUp}>
                    <Card
                      className="cursor-pointer border-border/50 hover:border-amber-300/50 dark:hover:border-amber-700/50 transition-all hover:shadow-md opacity-80 hover:opacity-100"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-semibold text-sm sm:text-base leading-tight">{request.title}</h3>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="outline" className="border-amber-400/50 text-amber-600 dark:text-amber-400 text-xs">
                            {request.category}
                          </Badge>
                          {getUrgencyBadge(request.urgency)}
                        </div>

                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{request.location}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Budget : {formatFCFA(request.budget.min)} — {formatFCFA(request.budget.max)}</span>
                          <span>{request.quotes.length} devis</span>
                        </div>

                        {request.status === 'awarded' && request.quotes.find(q => q.status === 'accepted') && (
                          <div className="mt-3 pt-3 border-t border-border/30">
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-amber-500" />
                              <span>Accepté : <strong>{request.quotes.find(q => q.status === 'accepted')?.artisanName}</strong></span>
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                {formatFCFA(request.quotes.find(q => q.status === 'accepted')?.totalAmount ?? 0)}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Quote Request Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        if (!open && !isSubmitting && !showSuccess) {
          setCreateDialogOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mb-6 shadow-lg">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Demande envoyée !</h3>
              <p className="text-muted-foreground mb-2">Votre demande de devis a été publiée avec succès.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium text-sm">
                <Sparkles className="h-4 w-4" />
                3 artisans ont été notifiés !
              </div>
            </motion.div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  Nouvelle demande de devis
                </DialogTitle>
                <DialogDescription>
                  Décrivez votre projet pour recevoir des propositions d&apos;artisans qualifiés.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Réparation fuite d'eau cuisine"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description détaillée *</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre projet en détail : le problème, l'emplacement, les contraintes..."
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Plomberie">Plomberie</SelectItem>
                      <SelectItem value="Électricité">Électricité</SelectItem>
                      <SelectItem value="Menuiserie">Menuiserie</SelectItem>
                      <SelectItem value="Peinture">Peinture</SelectItem>
                      <SelectItem value="Maçonnerie">Maçonnerie</SelectItem>
                      <SelectItem value="Climatisation">Climatisation</SelectItem>
                      <SelectItem value="Serrurerie">Serrurerie</SelectItem>
                      <SelectItem value="Nettoyage">Nettoyage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Ex: Dakar, Sénégal"
                      className="pl-10"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Budget range */}
                <div className="space-y-2">
                  <Label>Budget (FCFA)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Min</span>
                      <Input
                        type="number"
                        placeholder="30 000"
                        className="pl-10"
                        value={formBudgetMin}
                        onChange={(e) => setFormBudgetMin(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Max</span>
                      <Input
                        type="number"
                        placeholder="100 000"
                        className="pl-10"
                        value={formBudgetMax}
                        onChange={(e) => setFormBudgetMax(e.target.value)}
                      />
                    </div>
                  </div>
                  {formBudgetMin && formBudgetMax && (
                    <p className="text-xs text-muted-foreground">
                      Fourchette : {formatFCFA(parseInt(formBudgetMin))} — {formatFCFA(parseInt(formBudgetMax))}
                    </p>
                  )}
                </div>

                {/* Urgency */}
                <div className="space-y-2">
                  <Label>Urgence</Label>
                  <RadioGroup
                    value={formUrgency}
                    onValueChange={(val) => setFormUrgency(val as 'low' | 'medium' | 'high')}
                    className="grid grid-cols-3 gap-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="urgency-low" />
                      <Label htmlFor="urgency-low" className="cursor-pointer text-emerald-600 dark:text-emerald-400 font-normal">
                        Basse
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="urgency-medium" />
                      <Label htmlFor="urgency-medium" className="cursor-pointer text-yellow-600 dark:text-yellow-400 font-normal">
                        Moyenne
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="urgency-high" />
                      <Label htmlFor="urgency-high" className="cursor-pointer text-red-600 dark:text-red-400 font-normal">
                        Haute
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Photo upload (simulated) */}
                <div className="space-y-2">
                  <Label>Photos (optionnel)</Label>
                  <div
                    className="border-2 border-dashed border-border/60 rounded-lg p-6 text-center cursor-pointer hover:border-amber-400/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors"
                    onClick={() => {
                      if (formPhotos.length < 5) {
                        setFormPhotos(prev => [...prev, `photo-${prev.length + 1}`])
                      }
                    }}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Glissez vos photos ici</p>
                    <p className="text-xs text-muted-foreground mt-1">ou cliquez pour sélectionner (max 5)</p>
                  </div>
                  {formPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formPhotos.map((photo, idx) => (
                        <div key={photo} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50">
                          <Camera className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          <span className="text-xs">Photo {idx + 1}</span>
                          <button
                            type="button"
                            className="ml-1 text-neutral-400 hover:text-red-500 transition-colors"
                            onClick={() => setFormPhotos(prev => prev.filter((_, i) => i !== idx))}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false)
                    resetForm()
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                  onClick={handleCreateSubmit}
                  disabled={
                    isSubmitting ||
                    !formTitle.trim() ||
                    !formDescription.trim() ||
                    !formCategory ||
                    !formLocation.trim()
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Publier la demande
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
