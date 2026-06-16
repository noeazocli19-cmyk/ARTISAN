'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  History,
  Wallet as WalletIcon,
  Plus,
  Send,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  CreditCard,
  Banknote,
  Phone,
  FileText,
  ChevronRight,
  Search,
  CalendarDays,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import type { PaymentMethod, PaymentStatus, Payment } from '@/lib/types'
import { useAppStore } from '@/lib/store'

// =============================================================================
// Props
// =============================================================================

interface PaymentWalletProps {
  onBack: () => void
  initialAmount?: number
  recipientId?: string
}

// =============================================================================
// Constants & Mock Data
// =============================================================================

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; color: string; bgColor: string; borderColor: string }[] = [
  { id: 'orange_money', label: 'Orange Money', icon: '🟠', color: 'text-orange-700 dark:text-orange-300', bgColor: 'bg-gradient-to-br from-orange-400 to-orange-600', borderColor: 'border-orange-400' },
  { id: 'mtn_money', label: 'MTN Money', icon: '🟡', color: 'text-yellow-700 dark:text-yellow-300', bgColor: 'bg-gradient-to-br from-yellow-400 to-yellow-600', borderColor: 'border-yellow-400' },
  { id: 'wave', label: 'Wave', icon: '🔵', color: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600', borderColor: 'border-blue-400' },
  { id: 'moov_money', label: 'Moov Money', icon: '🟣', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-gradient-to-br from-purple-400 to-purple-600', borderColor: 'border-purple-400' },
  { id: 'card', label: 'Carte bancaire', icon: '💳', color: 'text-neutral-700 dark:text-neutral-300', bgColor: 'bg-gradient-to-br from-neutral-400 to-neutral-600', borderColor: 'border-neutral-400' },
  { id: 'cash', label: 'Espèces', icon: '💵', color: 'text-emerald-700 dark:text-emerald-300', bgColor: 'bg-gradient-to-br from-emerald-400 to-emerald-600', borderColor: 'border-emerald-400' },
]

const METHOD_BADGE_MAP: Record<PaymentMethod, { label: string; className: string }> = {
  orange_money: { label: 'Orange Money', className: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  mtn_money: { label: 'MTN Money', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
  wave: { label: 'Wave', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  moov_money: { label: 'Moov Money', className: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  card: { label: 'Carte', className: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300' },
  cash: { label: 'Espèces', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
}

const STATUS_BADGE_MAP: Record<PaymentStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', icon: Clock },
  processing: { label: 'En cours', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', icon: Loader2 },
  completed: { label: 'Complété', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', icon: CheckCircle2 },
  failed: { label: 'Échoué', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', icon: XCircle },
  refunded: { label: 'Remboursé', className: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300', icon: RefreshCw },
}

type TransactionType = 'payment' | 'receipt' | 'refund'

interface Transaction extends Payment {
  type: TransactionType
  description: string
  recipientName: string
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    amount: 25000,
    currency: 'FCFA',
    method: 'orange_money',
    status: 'completed',
    phoneNumber: '+221 77 123 456',
    reference: 'PAY-2025-001',
    createdAt: '2025-03-01T14:30:00Z',
    type: 'payment',
    description: 'Paiement plomberie - Amadou Diallo',
    recipientName: 'Amadou Diallo',
  },
  {
    id: 'tx-002',
    amount: 50000,
    currency: 'FCFA',
    method: 'mtn_money',
    status: 'completed',
    phoneNumber: '+225 07 987 654',
    reference: 'RCV-2025-002',
    createdAt: '2025-02-28T09:15:00Z',
    type: 'receipt',
    description: 'Encaissement mission électricité',
    recipientName: 'Fatou Ndiaye',
  },
  {
    id: 'tx-003',
    amount: 15000,
    currency: 'FCFA',
    method: 'wave',
    status: 'pending',
    phoneNumber: '+221 78 456 789',
    reference: 'PAY-2025-003',
    createdAt: '2025-03-02T11:00:00Z',
    type: 'payment',
    description: 'Paiement menuiserie - Kofi Mensah',
    recipientName: 'Kofi Mensah',
  },
  {
    id: 'tx-004',
    amount: 8000,
    currency: 'FCFA',
    method: 'moov_money',
    status: 'completed',
    phoneNumber: '+228 90 123 456',
    reference: 'RCV-2025-004',
    createdAt: '2025-02-27T16:45:00Z',
    type: 'receipt',
    description: 'Encaissement peinture intérieure',
    recipientName: 'Aïcha Bello',
  },
  {
    id: 'tx-005',
    amount: 12000,
    currency: 'FCFA',
    method: 'orange_money',
    status: 'failed',
    phoneNumber: '+223 70 987 654',
    reference: 'PAY-2025-005',
    createdAt: '2025-02-26T08:30:00Z',
    type: 'payment',
    description: 'Paiement climatisation - Moussa Traoré',
    recipientName: 'Moussa Traoré',
  },
  {
    id: 'tx-006',
    amount: 25000,
    currency: 'FCFA',
    method: 'card',
    status: 'completed',
    phoneNumber: undefined,
    reference: 'PAY-2025-006',
    createdAt: '2025-02-25T13:20:00Z',
    type: 'payment',
    description: 'Paiement nettoyage professionnel',
    recipientName: 'Mariama Sow',
  },
  {
    id: 'tx-007',
    amount: 12000,
    currency: 'FCFA',
    method: 'wave',
    status: 'refunded',
    phoneNumber: '+221 76 111 222',
    reference: 'REF-2025-007',
    createdAt: '2025-02-24T10:00:00Z',
    type: 'refund',
    description: 'Remboursement mission annulée',
    recipientName: 'Ibrahim Diarra',
  },
  {
    id: 'tx-008',
    amount: 35000,
    currency: 'FCFA',
    method: 'mtn_money',
    status: 'pending',
    phoneNumber: '+225 05 333 444',
    reference: 'PAY-2025-008',
    createdAt: '2025-03-02T15:30:00Z',
    type: 'payment',
    description: 'Paiement serrurerie urgente',
    recipientName: 'Ousmane Ba',
  },
  {
    id: 'tx-009',
    amount: 20000,
    currency: 'FCFA',
    method: 'cash',
    status: 'completed',
    phoneNumber: undefined,
    reference: 'RCV-2025-009',
    createdAt: '2025-02-23T17:00:00Z',
    type: 'receipt',
    description: 'Encaissement maçonnerie',
    recipientName: 'Jean-Pierre Aka',
  },
  {
    id: 'tx-010',
    amount: 10000,
    currency: 'FCFA',
    method: 'orange_money',
    status: 'completed',
    phoneNumber: '+221 77 555 666',
    reference: 'RCV-2025-010',
    createdAt: '2025-02-22T09:00:00Z',
    type: 'receipt',
    description: 'Encaissement réparation plomberie',
    recipientName: 'Aminata Koné',
  },
  {
    id: 'tx-011',
    amount: 18000,
    currency: 'FCFA',
    method: 'moov_money',
    status: 'pending',
    phoneNumber: '+228 91 777 888',
    reference: 'PAY-2025-011',
    createdAt: '2025-03-03T07:45:00Z',
    type: 'payment',
    description: 'Paiement électricité bâtiment',
    recipientName: 'Seydou Keita',
  },
  {
    id: 'tx-012',
    amount: 30000,
    currency: 'FCFA',
    method: 'wave',
    status: 'completed',
    phoneNumber: '+221 78 999 000',
    reference: 'RCV-2025-012',
    createdAt: '2025-02-21T14:00:00Z',
    type: 'receipt',
    description: 'Encaissement installation complète',
    recipientName: 'Fatoumata Diarra',
  },
]

// =============================================================================
// Helpers
// =============================================================================

function formatFCFA(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' FCFA'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function getRelativeTime(iso: string): string {
  const now = new Date()
  const d = new Date(iso)
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "À l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'Hier'
  if (diffD < 7) return `il y a ${diffD}j`
  return formatDate(iso)
}

function validatePhone(phone: string): boolean {
  // Format: +2XX XXX XXX XXX or local format
  const cleaned = phone.replace(/\s/g, '')
  return /^\+?2\d{2}\d{3}\d{3}\d{3}$/.test(cleaned) || /^\d{8,12}$/.test(cleaned)
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
  visible: { transition: { staggerChildren: 0.06 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

// =============================================================================
// Sub-components
// =============================================================================

function TransactionIcon({ type }: { type: TransactionType }) {
  if (type === 'payment') {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
        <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
      </div>
    )
  }
  if (type === 'receipt') {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
        <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>
    )
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950/50">
      <RefreshCw className="h-4 w-4 text-sky-600 dark:text-sky-400" />
    </div>
  )
}

function AmountDisplay({ type, amount }: { type: TransactionType; amount: number }) {
  if (type === 'payment') {
    return <span className="font-semibold text-red-600 dark:text-red-400">-{formatFCFA(amount)}</span>
  }
  if (type === 'receipt') {
    return <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{formatFCFA(amount)}</span>
  }
  return <span className="font-semibold text-sky-600 dark:text-sky-400">+{formatFCFA(amount)}</span>
}

// =============================================================================
// Main Component
// =============================================================================

export function PaymentWallet({ onBack, initialAmount, recipientId }: PaymentWalletProps) {
  const { user } = useAppStore()

  // ---- State ----
  const [activeTab, setActiveTab] = useState<string>('wallet')
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)

  // Send payment state
  const [paymentStep, setPaymentStep] = useState(0) // 0=method, 1=details, 2=confirm
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [payAmount, setPayAmount] = useState(initialAmount?.toString() || '')
  const [payPhone, setPayPhone] = useState('')
  const [payReference, setPayReference] = useState('')
  const [payNote, setPayNote] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // History filters
  const [historyFilter, setHistoryFilter] = useState<string>('all')
  const [historyMethod, setHistoryMethod] = useState<string>('all')
  const [historySearch, setHistorySearch] = useState('')
  const [historyDateFrom, setHistoryDateFrom] = useState('')
  const [historyDateTo, setHistoryDateTo] = useState('')

  // Deposit dialog
  const [depositOpen, setDepositOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')

  // Withdraw dialog
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // ---- Derived ----
  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    setTransactionsLoading(true)
    try {
      const token = (useAppStore.getState() as { token: string | null }).token
      const res = await fetch('/api/payments/history', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.payments) {
        const apiTransactions: Transaction[] = data.payments.map((p: { id: string; amount: number; currency: string; method: PaymentMethod; status: PaymentStatus; phoneNumber?: string; reference: string; createdAt: string; description?: string; recipientName?: string; recipientId?: string }) => ({
          id: p.id,
          amount: p.amount,
          currency: p.currency || 'FCFA',
          method: p.method,
          status: p.status,
          phoneNumber: p.phoneNumber,
          reference: p.reference,
          createdAt: p.createdAt,
          type: p.recipientId ? 'payment' as const : 'receipt' as const,
          description: p.description || `Paiement via ${METHOD_BADGE_MAP[p.method]?.label || p.method}`,
          recipientName: p.recipientName || 'Artisan Connect',
        }))
        setTransactions(apiTransactions)
        if (data.summary) {
          setBalance(data.summary.balance || data.summary.totalReceived - data.summary.totalSpent)
        }
      }
    } catch {
      // Use empty transactions on error
    } finally {
      setTransactionsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions])
  const pendingCount = useMemo(() => transactions.filter(t => t.status === 'pending').length, [transactions])

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Type filter
    if (historyFilter === 'payments') filtered = filtered.filter(t => t.type === 'payment')
    else if (historyFilter === 'receipts') filtered = filtered.filter(t => t.type === 'receipt')
    else if (historyFilter === 'refunds') filtered = filtered.filter(t => t.type === 'refund')

    // Method filter
    if (historyMethod !== 'all') filtered = filtered.filter(t => t.method === historyMethod)

    // Search
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase()
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.recipientName.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q)
      )
    }

    // Date range
    if (historyDateFrom) {
      const from = new Date(historyDateFrom)
      filtered = filtered.filter(t => new Date(t.createdAt) >= from)
    }
    if (historyDateTo) {
      const to = new Date(historyDateTo)
      to.setHours(23, 59, 59)
      filtered = filtered.filter(t => new Date(t.createdAt) <= to)
    }

    return filtered
  }, [historyFilter, historyMethod, historySearch, historyDateFrom, historyDateTo])

  // ---- Handlers ----
  const handleSelectMethod = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method)
    setPaymentStep(1)
  }, [])

  const handlePaySubmit = useCallback(async () => {
    if (!payAmount || !selectedMethod) return
    // Phone required for Mobile Money
    const momoMethods = ['orange_money', 'mtn_money', 'wave', 'moov_money']
    if (momoMethods.includes(selectedMethod) && !payPhone) return

    setIsProcessing(true)
    try {
      const token = (useAppStore.getState() as { token: string | null }).token
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(payAmount),
          method: selectedMethod,
          phoneNumber: payPhone || undefined,
          description: payReference || undefined,
          recipientId: recipientId || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de paiement')
      }

      // If CinetPay returns a payment URL, redirect the user
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank')
      }

      // Payment initiated successfully
      setIsProcessing(false)
      setPaymentSuccess(true)
      // Refresh transactions
      fetchTransactions()
    } catch (err) {
      setIsProcessing(false)
      // Show error in payment step
      alert(err instanceof Error ? err.message : 'Erreur de paiement')
    }
  }, [payAmount, payPhone, selectedMethod, payReference, recipientId, fetchTransactions])

  const handlePaymentReset = useCallback(() => {
    setPaymentStep(0)
    setSelectedMethod(null)
    setPayAmount(initialAmount?.toString() || '')
    setPayPhone('')
    setPayReference('')
    setPayNote('')
    setIsProcessing(false)
    setPaymentSuccess(false)
  }, [initialAmount])

  const handleExportCSV = useCallback(() => {
    // Export real transactions to CSV
    const csv = [
      'Référence,Description,Montant,Méthode,Statut,Date',
      ...filteredTransactions.map(t =>
        `${t.reference},"${t.description}",${t.type === 'payment' ? '-' : '+'}${t.amount},${METHOD_BADGE_MAP[t.method]?.label || t.method},${STATUS_BADGE_MAP[t.status]?.label || t.status},${formatDate(t.createdAt)}`
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'transactions_artisan_connecte.csv'
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  const phoneValid = selectedMethod && ['orange_money', 'mtn_money', 'wave', 'moov_money'].includes(selectedMethod) ? validatePhone(payPhone) : true
  const canProceed = Number(payAmount) > 0 && (phoneValid || !selectedMethod || !['orange_money', 'mtn_money', 'wave', 'moov_money'].includes(selectedMethod)) && (['orange_money', 'mtn_money', 'wave', 'moov_money'].includes(selectedMethod || '') ? payPhone.length > 0 : true)

  // Quick amounts
  const quickAmounts = [5000, 10000, 15000, 25000, 50000]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 hover:bg-amber-50 dark:hover:bg-amber-950/50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">Portefeuille</h1>
            <p className="text-sm text-muted-foreground">
              {user?.name ? `Bonjour, ${user.name}` : 'Gérez vos paiements'}
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0">
              {pendingCount} en attente
            </Badge>
          )}
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="wallet" className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
              <WalletIcon className="h-4 w-4 hidden sm:block" />
              Portefeuille
            </TabsTrigger>
            <TabsTrigger value="send" className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
              <Send className="h-4 w-4 hidden sm:block" />
              Envoyer
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
              <History className="h-4 w-4 hidden sm:block" />
              Historique
            </TabsTrigger>
          </TabsList>

          {/* ===================== WALLET TAB ===================== */}
          <TabsContent value="wallet">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
              {/* Balance Card */}
              <motion.div variants={fadeInUp}>
                <Card className="overflow-hidden border-0 shadow-lg">
                  <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-6 sm:p-8 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                          <WalletIcon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium">Solde disponible</span>
                      </div>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' as const }}
                      >
                        <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                          {formatFCFA(balance)}
                        </p>
                      </motion.div>
                      <div className="mt-4 flex items-center gap-2">
                        <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm hover:bg-white/30">
                          Compte principal
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={fadeInUp}>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: Plus, label: 'Déposer', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', onClick: () => setDepositOpen(true) },
                    { icon: ArrowUpRight, label: 'Retirer', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', onClick: () => setWithdrawOpen(true) },
                    { icon: Send, label: 'Transférer', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', onClick: () => setActiveTab('send') },
                    { icon: History, label: 'Historique', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', onClick: () => setActiveTab('history') },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      variant="ghost"
                      className="flex flex-col items-center gap-2 h-auto py-4 px-2 rounded-xl hover:bg-muted/50 transition-all"
                      onClick={action.onClick}
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${action.bg}`}>
                        <action.icon className={`h-5 w-5 ${action.color}`} />
                      </div>
                      <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </motion.div>

              {/* Recent Transactions */}
              <motion.div variants={fadeInUp}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-base">Transactions récentes</h3>
                  <Button variant="ghost" size="sm" className="text-amber-600 dark:text-amber-400 text-xs" onClick={() => setActiveTab('history')}>
                    Voir tout
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <Card className="border-border/50">
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      {recentTransactions.map((tx, idx) => (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08, duration: 0.3 }}
                          className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                        >
                          <TransactionIcon type={tx.type} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{tx.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{getRelativeTime(tx.createdAt)}</span>
                              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${METHOD_BADGE_MAP[tx.method].className}`}>
                                {METHOD_BADGE_MAP[tx.method].label}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <AmountDisplay type={tx.type} amount={tx.amount} />
                            <div className="mt-0.5">
                              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${STATUS_BADGE_MAP[tx.status].className}`}>
                                {STATUS_BADGE_MAP[tx.status].label}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ===================== SEND TAB ===================== */}
          <TabsContent value="send">
            <AnimatePresence mode="wait">
              {paymentSuccess ? (
                // Success Screen
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.1 }}
                    className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl mb-6"
                  >
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold mb-2"
                  >
                    Paiement envoyé !
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground text-center mb-1"
                  >
                    {formatFCFA(Number(payAmount))} via {selectedMethod ? PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label : ''}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-muted-foreground mb-8"
                  >
                    Référence : {payReference || 'PAY-' + Date.now().toString().slice(-6)}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-3"
                  >
                    <Button
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                      onClick={handlePaymentReset}
                    >
                      Nouveau paiement
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('history')}>
                      Voir l&apos;historique
                    </Button>
                  </motion.div>
                </motion.div>
              ) : isProcessing ? (
                // Processing Screen
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' as const }}
                    className="mb-6"
                  >
                    <Loader2 className="h-16 w-16 text-amber-500" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">Traitement en cours...</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Votre paiement de {formatFCFA(Number(payAmount))} est en cours de traitement.
                    <br />
                    Veuillez ne pas fermer cette page.
                  </p>
                  <div className="w-64 mt-6">
                    <Progress value={66} className="h-2" />
                  </div>
                </motion.div>
              ) : (
                // Step-by-step Payment Flow
                <motion.div key="flow" initial="hidden" animate="visible" variants={staggerContainer}>
                  {/* Step indicator */}
                  <motion.div variants={fadeInUp} className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      {[0, 1, 2].map((step) => (
                        <div key={step} className="flex items-center gap-2 flex-1">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-all ${
                            paymentStep >= step
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {step + 1}
                          </div>
                          {step < 2 && (
                            <div className={`flex-1 h-1 rounded-full transition-all ${
                              paymentStep > step ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-muted'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {paymentStep === 0 && 'Choisissez votre méthode de paiement'}
                      {paymentStep === 1 && 'Entrez les détails du paiement'}
                      {paymentStep === 2 && 'Vérifiez et confirmez'}
                    </p>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {/* Step 0: Choose Method */}
                    {paymentStep === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {PAYMENT_METHODS.map((method) => (
                            <motion.button
                              key={method.id}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleSelectMethod(method.id)}
                              className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${method.borderColor} hover:shadow-lg cursor-pointer bg-card`}
                            >
                              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${method.bgColor} shadow-md`}>
                                <span className="text-2xl">{method.icon}</span>
                              </div>
                              <span className={`text-sm font-semibold ${method.color}`}>{method.label}</span>
                              <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 1: Enter Details */}
                    {paymentStep === 1 && selectedMethod && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        {/* Selected method badge */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.bgColor}`}>
                            <span className="text-lg">{PAYMENT_METHODS.find(m => m.id === selectedMethod)?.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label}</p>
                            <p className="text-xs text-muted-foreground">Méthode sélectionnée</p>
                          </div>
                          <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => setPaymentStep(0)}>
                            Changer
                          </Button>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                          <Label htmlFor="pay-amount">Montant</Label>
                          <div className="relative">
                            <Input
                              id="pay-amount"
                              type="number"
                              placeholder="0"
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              className="pr-16 h-12 text-lg font-semibold"
                              min={0}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">FCFA</span>
                          </div>
                          {/* Quick amounts */}
                          <div className="flex flex-wrap gap-2">
                            {quickAmounts.map((amt) => (
                              <Button
                                key={amt}
                                variant="outline"
                                size="sm"
                                className="text-xs hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/50 dark:hover:border-amber-700"
                                onClick={() => setPayAmount(amt.toString())}
                              >
                                {amt.toLocaleString('fr-FR')}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Phone number (for mobile money) */}
                        {['orange_money', 'mtn_money', 'wave', 'moov_money'].includes(selectedMethod) && (
                          <div className="space-y-2">
                            <Label htmlFor="pay-phone">Numéro de téléphone</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="pay-phone"
                                type="tel"
                                placeholder="+2XX XXX XXX XXX"
                                value={payPhone}
                                onChange={(e) => setPayPhone(e.target.value)}
                                className="pl-10 h-12"
                              />
                            </div>
                            {payPhone && !validatePhone(payPhone) && (
                              <p className="text-xs text-red-500">Format invalide. Ex: +221 77 123 456</p>
                            )}
                          </div>
                        )}

                        {/* Reference */}
                        <div className="space-y-2">
                          <Label htmlFor="pay-ref">Référence (optionnel)</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="pay-ref"
                              placeholder="Ex: Paiement mission plomberie"
                              value={payReference}
                              onChange={(e) => setPayReference(e.target.value)}
                              className="pl-10 h-12"
                            />
                          </div>
                        </div>

                        {/* Note */}
                        <div className="space-y-2">
                          <Label htmlFor="pay-note">Note (optionnel)</Label>
                          <Input
                            id="pay-note"
                            placeholder="Ajouter une note..."
                            value={payNote}
                            onChange={(e) => setPayNote(e.target.value)}
                            className="h-10"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <Button variant="outline" className="flex-1" onClick={() => setPaymentStep(0)}>
                            Retour
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                            disabled={!canProceed}
                            onClick={() => setPaymentStep(2)}
                          >
                            Continuer
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Confirm */}
                    {paymentStep === 2 && selectedMethod && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <Card className="border-border/50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Récapitulatif du paiement</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Montant</span>
                                <span className="font-bold text-lg">{formatFCFA(Number(payAmount))}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Méthode</span>
                                <Badge className={`${METHOD_BADGE_MAP[selectedMethod].className} border-0`}>
                                  {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.icon}{' '}
                                  {METHOD_BADGE_MAP[selectedMethod].label}
                                </Badge>
                              </div>
                              {payPhone && (
                                <>
                                  <Separator />
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Téléphone</span>
                                    <span className="font-medium">{payPhone}</span>
                                  </div>
                                </>
                              )}
                              {payReference && (
                                <>
                                  <Separator />
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Référence</span>
                                    <span className="font-medium">{payReference}</span>
                                  </div>
                                </>
                              )}
                              {payNote && (
                                <>
                                  <Separator />
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Note</span>
                                    <span className="font-medium">{payNote}</span>
                                  </div>
                                </>
                              )}
                              <Separator />
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Frais</span>
                                <span className="font-medium text-emerald-600">0 FCFA</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between text-sm font-bold">
                                <span>Total</span>
                                <span className="text-amber-600 dark:text-amber-400 text-lg">{formatFCFA(Number(payAmount))}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                              <WalletIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Solde après paiement</p>
                              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                {formatFCFA(balance - Number(payAmount))}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => setPaymentStep(1)}>
                            Retour
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 h-12 text-base font-semibold"
                            onClick={handlePaySubmit}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Confirmer le paiement
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ===================== HISTORY TAB ===================== */}
          <TabsContent value="history">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
              {/* Filters */}
              <motion.div variants={fadeInUp}>
                <Card className="border-border/50">
                  <CardContent className="p-4 space-y-3">
                    {/* Type filter with RadioGroup */}
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-2 block">Type de transaction</Label>
                      <RadioGroup
                        value={historyFilter}
                        onValueChange={setHistoryFilter}
                        className="flex flex-wrap gap-2"
                      >
                        {[
                          { value: 'all', label: 'Tous' },
                          { value: 'payments', label: 'Paiements' },
                          { value: 'receipts', label: 'Encaissements' },
                          { value: 'refunds', label: 'Remboursements' },
                        ].map((opt) => (
                          <div key={opt.value}>
                            <RadioGroupItem value={opt.value} id={`filter-${opt.value}`} className="peer sr-only" />
                            <Label
                              htmlFor={`filter-${opt.value}`}
                              className="cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all peer-data-[state=checked]:bg-gradient-to-r peer-data-[state=checked]:from-amber-500 peer-data-[state=checked]:to-orange-600 peer-data-[state=checked]:text-white peer-data-[state=checked]:border-transparent hover:bg-muted/50"
                            >
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* Method + Search row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Méthode</Label>
                        <Select value={historyMethod} onValueChange={setHistoryMethod}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Toutes les méthodes" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Toutes les méthodes</SelectItem>
                            {PAYMENT_METHODS.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.icon} {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Recherche</Label>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Rechercher..."
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            className="pl-8 h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Date range */}
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Période</Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                          <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            type="date"
                            value={historyDateFrom}
                            onChange={(e) => setHistoryDateFrom(e.target.value)}
                            className="pl-8 h-9 text-sm"
                            placeholder="Du"
                          />
                        </div>
                        <span className="self-center text-xs text-muted-foreground">à</span>
                        <div className="flex-1 relative">
                          <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            type="date"
                            value={historyDateTo}
                            onChange={(e) => setHistoryDateTo(e.target.value)}
                            className="pl-8 h-9 text-sm"
                            placeholder="Au"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Results count + Export */}
              <motion.div variants={fadeInUp} className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/50 dark:hover:border-amber-700"
                  onClick={handleExportCSV}
                >
                  <Download className="h-3.5 w-3.5" />
                  Exporter CSV
                </Button>
              </motion.div>

              {/* Transaction List */}
              <motion.div variants={fadeInUp}>
                <Card className="border-border/50">
                  <CardContent className="p-0">
                    {filteredTransactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Filter className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm text-muted-foreground">Aucune transaction trouvée</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Essayez de modifier vos filtres</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
                        {filteredTransactions.map((tx, idx) => {
                          const statusInfo = STATUS_BADGE_MAP[tx.status]
                          const StatusIcon = statusInfo.icon
                          const methodInfo = METHOD_BADGE_MAP[tx.method]
                          return (
                            <motion.div
                              key={tx.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.04, duration: 0.25 }}
                              className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                            >
                              <TransactionIcon type={tx.type} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{tx.description}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs text-muted-foreground">{formatDate(tx.createdAt)} · {formatTime(tx.createdAt)}</span>
                                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${methodInfo.className}`}>
                                    {methodInfo.label}
                                  </Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{tx.reference}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <AmountDisplay type={tx.type} amount={tx.amount} />
                                <div className="mt-1">
                                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 gap-0.5 ${statusInfo.className}`}>
                                    {tx.status === 'processing' ? (
                                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                    ) : (
                                      <StatusIcon className="h-2.5 w-2.5" />
                                    )}
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ===================== DEPOSIT DIALOG ===================== */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Déposer de l&apos;argent
            </DialogTitle>
            <DialogDescription>
              Ajoutez des fonds à votre portefeuille Artisan Connect
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Montant à déposer</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="pr-16 h-12 text-lg font-semibold"
                  min={0}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">FCFA</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[10000, 25000, 50000, 100000].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    className="text-xs hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950/50"
                    onClick={() => setDepositAmount(amt.toString())}
                  >
                    {amt.toLocaleString('fr-FR')}
                  </Button>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Le dépôt sera crédité sur votre portefeuille dans les minutes qui suivent.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDepositOpen(false)}>
              Annuler
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0"
              disabled={!depositAmount || Number(depositAmount) <= 0}
              onClick={() => setDepositOpen(false)}
            >
              Confirmer le dépôt
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== WITHDRAW DIALOG ===================== */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/50">
                <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              Retirer de l&apos;argent
            </DialogTitle>
            <DialogDescription>
              Retirez des fonds de votre portefeuille
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-700 dark:text-amber-300">Solde disponible</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{formatFCFA(balance)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Montant à retirer</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pr-16 h-12 text-lg font-semibold"
                  min={0}
                  max={balance}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">FCFA</span>
              </div>
              {Number(withdrawAmount) > balance && (
                <p className="text-xs text-red-500">Montant supérieur au solde disponible</p>
              )}
              <div className="flex flex-wrap gap-2">
                {[5000, 10000, 25000, 50000].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    className="text-xs hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950/50"
                    onClick={() => setWithdrawAmount(amt.toString())}
                    disabled={amt > balance}
                  >
                    {amt.toLocaleString('fr-FR')}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Méthode de retrait</Label>
              <Select defaultValue="orange_money">
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.filter(m => ['orange_money', 'mtn_money', 'wave', 'moov_money'].includes(m.id)).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.icon} {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setWithdrawOpen(false)}>
              Annuler
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
              disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > balance}
              onClick={() => setWithdrawOpen(false)}
            >
              Confirmer le retrait
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
