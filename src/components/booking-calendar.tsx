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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
} from '@/components/ui/dialog'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  Filter,
  MessageSquare,
  Loader2,
  PartyPopper,
} from 'lucide-react'
import type { Booking, BookingStatus, TimeSlot } from '@/lib/types'
import { useAppStore } from '@/lib/store'

// =============================================================================
// Props
// =============================================================================

interface BookingCalendarProps {
  onBack: () => void
  onBookingComplete?: (booking: Booking) => void
  artisanId?: string
}

// =============================================================================
// Helpers
// =============================================================================

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

function formatDateFR(d: Date) {
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  // Shift so Monday = 0
  return d === 0 ? 6 : d - 1
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// =============================================================================
// Status helpers
// =============================================================================

const statusConfig: Record<BookingStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  pending: { label: 'En attente', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700', icon: AlertCircle },
  confirmed: { label: 'Confirmé', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700', icon: CheckCircle2 },
  in_progress: { label: 'En cours', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700', icon: Clock },
  completed: { label: 'Terminé', color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800/40 border-gray-300 dark:border-gray-600', icon: CheckCircle2 },
  cancelled: { label: 'Annulé', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700', icon: XCircle },
}

// =============================================================================
// Mock artisans
// =============================================================================

const MOCK_ARTISANS = [
  { id: 'a1', name: 'Amadou Diallo', specialty: 'Plomberie', avatar: 'AD', avatarColor: 'bg-amber-500', rating: 4.9, hourlyRate: 8000 },
  { id: 'a2', name: 'Fatou Ndiaye', specialty: 'Électricité', avatar: 'FN', avatarColor: 'bg-emerald-500', rating: 4.8, hourlyRate: 7500 },
  { id: 'a3', name: 'Kofi Mensah', specialty: 'Menuiserie', avatar: 'KM', avatarColor: 'bg-orange-500', rating: 4.9, hourlyRate: 9000 },
  { id: 'a4', name: 'Aïcha Bello', specialty: 'Peinture', avatar: 'AB', avatarColor: 'bg-teal-500', rating: 4.7, hourlyRate: 6500 },
  { id: 'a5', name: 'Moussa Traoré', specialty: 'Climatisation', avatar: 'MT', avatarColor: 'bg-cyan-500', rating: 4.8, hourlyRate: 8500 },
  { id: 'a6', name: 'Mariama Sow', specialty: 'Nettoyage', avatar: 'MS', avatarColor: 'bg-violet-500', rating: 4.9, hourlyRate: 5000 },
]

// =============================================================================
// Generate mock bookings (8 total)
// =============================================================================

function generateMockBookings(): Booking[] {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()

  return [
    {
      id: 'b1',
      artisanId: 'a1',
      artisanName: 'Amadou Diallo',
      clientId: 'client1',
      clientName: 'Utilisateur',
      service: 'Réparation fuite robinet',
      date: new Date(y, m, now.getDate() + 1).toISOString(),
      startTime: '09:00',
      endTime: '10:00',
      status: 'confirmed',
      location: 'Dakar, Sénégal',
      notes: 'Fuite dans la cuisine, robinet principal',
      price: 8000,
      createdAt: new Date(y, m, now.getDate() - 2).toISOString(),
    },
    {
      id: 'b2',
      artisanId: 'a2',
      artisanName: 'Fatou Ndiaye',
      clientId: 'client1',
      clientName: 'Utilisateur',
      service: 'Installation prise électrique',
      date: new Date(y, m, now.getDate() + 3).toISOString(),
      startTime: '14:00',
      endTime: '15:30',
      status: 'pending',
      location: 'Abidjan, Côte d\'Ivoire',
      notes: 'Ajout de 2 prises dans le salon',
      price: 11250,
      createdAt: new Date(y, m, now.getDate() - 1).toISOString(),
    },
    {
      id: 'b3',
      artisanId: 'a3',
      artisanName: 'Kofi Mensah',
      clientId: 'client1',
      clientName: 'Utilisateur',
      service: 'Réparation porte chambre',
      date: new Date(y, m, now.getDate() - 3).toISOString(),
      startTime: '10:00',
      endTime: '12:00',
      status: 'completed',
      location: 'Accra, Ghana',
      price: 18000,
      createdAt: new Date(y, m, now.getDate() - 7).toISOString(),
    },
    {
      id: 'b4',
      artisanId: 'a4',
      artisanName: 'Aïcha Bello',
      clientId: 'client1',
      clientName: 'Utilisateur',
      service: 'Peinture salon',
      date: new Date(y, m, now.getDate() - 5).toISOString(),
      startTime: '08:00',
      endTime: '16:00',
      status: 'completed',
      location: 'Lomé, Togo',
      price: 52000,
      createdAt: new Date(y, m, now.getDate() - 10).toISOString(),
    },
    {
      id: 'b5',
      artisanId: 'a5',
      artisanName: 'Moussa Traoré',
      clientId: 'client1',
      clientName: 'Utilisateur',
      service: 'Maintenance climatisation',
      date: new Date(y, m, now.getDate() + 5).toISOString(),
      startTime: '11:00',
      endTime: '12:00',
      status: 'pending',
      location: 'Bamako, Mali',
      notes: 'Climatiseur split, nettoyage et recharge gaz',
      price: 8500,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'b6',
      artisanId: 'a1',
      artisanName: 'Amadou Diallo',
      clientId: 'client1',
      clientName: 'Utilisateur',
      service: 'Débouchage canalisation',
      date: new Date(y, m, now.getDate() + 2).toISOString(),
      startTime: '16:00',
      endTime: '17:00',
      status: 'in_progress',
      location: 'Dakar, Sénégal',
      price: 8000,
      createdAt: new Date(y, m, now.getDate() - 1).toISOString(),
    },
    {
      id: 'b7',
      artisanId: 'a6',
      artisanName: 'Mariama Sow',
      clientId: 'client1',
      clientName: 'Utilisateur',
      service: 'Nettoyage appartement',
      date: new Date(y, m, now.getDate() - 8).toISOString(),
      startTime: '09:00',
      endTime: '13:00',
      status: 'cancelled',
      location: 'Conakry, Guinée',
      price: 20000,
      createdAt: new Date(y, m, now.getDate() - 12).toISOString(),
    },
    {
      id: 'b8',
      artisanId: 'a2',
      artisanName: 'Fatou Ndiaye',
      clientId: 'client1',
      clientName: 'Utilisateur',
      service: 'Diagnostic installation électrique',
      date: new Date(y, m, now.getDate() + 4).toISOString(),
      startTime: '10:00',
      endTime: '11:00',
      status: 'confirmed',
      location: 'Abidjan, Côte d\'Ivoire',
      notes: 'Vérification conformité installation',
      price: 7500,
      createdAt: new Date(y, m, now.getDate() - 1).toISOString(),
    },
  ]
}

// =============================================================================
// Generate time slots for a given date
// =============================================================================

function generateTimeSlots(date: Date, bookings: Booking[]): TimeSlot[] {
  const slots: TimeSlot[] = []
  const startHour = 8
  const endHour = 18

  for (let h = startHour; h < endHour; h++) {
    const start = `${String(h).padStart(2, '0')}:00`
    const end = `${String(h + 1).padStart(2, '0')}:00`
    const dateStr = date.toISOString().split('T')[0]

    // Check if this slot is booked
    const isBooked = bookings.some(
      (b) => {
        const bDate = new Date(b.date).toISOString().split('T')[0]
        return bDate === dateStr && b.startTime === start && b.status !== 'cancelled'
      }
    )

    slots.push({
      id: `${dateStr}-${start}`,
      start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), h).toISOString(),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), h + 1).toISOString(),
      available: !isBooked && h !== 12, // Lunch break at 12:00
    })
  }
  return slots
}

// =============================================================================
// Availability map for a month — which days have at least one slot
// =============================================================================

function getAvailabilityMap(year: number, month: number, bookings: Booking[]): Map<number, boolean> {
  const map = new Map<number, boolean>()
  const daysInMonth = getDaysInMonth(year, month)

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dow = date.getDay()
    // No availability on Sundays
    if (dow === 0) {
      map.set(d, false)
      continue
    }
    const slots = generateTimeSlots(date, bookings)
    const hasAvailable = slots.some((s) => s.available)
    map.set(d, hasAvailable)
  }
  return map
}

// =============================================================================
// Filter type for My Bookings
// =============================================================================

type BookingFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

const filterLabels: { key: BookingFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmés' },
  { key: 'completed', label: 'Terminés' },
  { key: 'cancelled', label: 'Annulés' },
]

// =============================================================================
// Booking Form State
// =============================================================================

interface BookingFormState {
  service: string
  notes: string
  location: string
}

// =============================================================================
// Main Component
// =============================================================================

export function BookingCalendar({ onBack, onBookingComplete, artisanId }: BookingCalendarProps) {
  const { user } = useAppStore()

  // ---- Calendar state ----
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // ---- Tabs ----
  const [activeTab, setActiveTab] = useState('calendar')

  // ---- Bookings ----
  const [bookings, setBookings] = useState<Booking[]>(generateMockBookings)

  // ---- Booking filter ----
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('all')

  // ---- Booking form ----
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [formState, setFormState] = useState<BookingFormState>({
    service: '',
    notes: '',
    location: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // ---- Selected artisan (if artisanId provided) ----
  const selectedArtisan = useMemo(
    () => artisanId ? MOCK_ARTISANS.find((a) => a.id === artisanId) ?? null : null,
    [artisanId]
  )

  // ---- Derived data ----
  const availabilityMap = useMemo(
    () => getAvailabilityMap(currentYear, currentMonth, bookings),
    [currentYear, currentMonth, bookings]
  )

  const timeSlots = useMemo(
    () => selectedDate ? generateTimeSlots(selectedDate, bookings) : [],
    [selectedDate, bookings]
  )

  const filteredBookings = useMemo(() => {
    let filtered = bookings
    if (artisanId) {
      filtered = filtered.filter((b) => b.artisanId === artisanId)
    }
    if (bookingFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === bookingFilter)
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [bookings, bookingFilter, artisanId])

  // ---- Calendar navigation ----
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    setSelectedDate(null)
  }

  // ---- Slot click ----
  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return
    setSelectedSlot(slot)
    setFormState({ service: '', notes: '', location: user?.location ?? '' })
    setBookingSuccess(false)
    setBookingDialogOpen(true)
  }

  // ---- Day click ----
  const handleDayClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return
    setSelectedDate(date)
  }

  // ---- Submit booking ----
  const handleSubmitBooking = () => {
    if (!selectedSlot || !selectedDate || !formState.service) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const artisan = selectedArtisan ?? MOCK_ARTISANS[Math.floor(Math.random() * MOCK_ARTISANS.length)]
      const startH = new Date(selectedSlot.start).getHours()
      const startTime = `${String(startH).padStart(2, '0')}:00`
      const endTime = `${String(startH + 1).padStart(2, '0')}:00`

      const newBooking: Booking = {
        id: `b${Date.now()}`,
        artisanId: artisan.id,
        artisanName: artisan.name,
        clientId: user?.id ?? 'client1',
        clientName: user?.name ?? 'Utilisateur',
        service: formState.service,
        date: selectedDate.toISOString(),
        startTime,
        endTime,
        status: 'pending',
        location: formState.location || artisan.specialty,
        notes: formState.notes || undefined,
        price: artisan.hourlyRate,
        createdAt: new Date().toISOString(),
      }

      setBookings((prev) => [newBooking, ...prev])
      setBookingSuccess(true)
      setIsSubmitting(false)

      if (onBookingComplete) {
        onBookingComplete(newBooking)
      }

      // Auto close after success animation
      setTimeout(() => {
        setBookingDialogOpen(false)
        setBookingSuccess(false)
        setSelectedSlot(null)
      }, 2000)
    }, 1500)
  }

  // ---- Cancel booking ----
  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b))
    )
  }

  // ---- Calendar grid ----
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const cells: (number | null)[] = []

    // Empty cells before the 1st
    for (let i = 0; i < firstDay; i++) {
      cells.push(null)
    }
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d)
    }
    return cells
  }, [currentYear, currentMonth])

  // ---- Services for the artisan ----
  const serviceOptions = useMemo(() => {
    if (selectedArtisan) {
      return [
        `${selectedArtisan.specialty} — Intervention standard`,
        `${selectedArtisan.specialty} — Urgence`,
        `${selectedArtisan.specialty} — Diagnostic`,
        `${selectedArtisan.specialty} — Installation`,
        `${selectedArtisan.specialty} — Réparation`,
      ]
    }
    return [
      'Plomberie — Intervention standard',
      'Plomberie — Urgence',
      'Électricité — Intervention standard',
      'Électricité — Diagnostic',
      'Menuiserie — Réparation',
      'Menuiserie — Installation',
      'Peinture — Décoration intérieure',
      'Peinture — Peinture extérieure',
      'Climatisation — Maintenance',
      'Climatisation — Installation',
      'Nettoyage — Standard',
      'Nettoyage — Grand nettoyage',
    ]
  }, [selectedArtisan])

  // =====================================================================
  // RENDER
  // =====================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* ---- Header ---- */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                Réservation
              </span>{' '}
              & Calendrier
            </h1>
            {selectedArtisan && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <User className="h-3 w-3" />
                {selectedArtisan.name} — {selectedArtisan.specialty}
              </p>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300">
              <CalendarDays className="h-3 w-3 mr-1" />
              {MONTHS_FR[currentMonth]} {currentYear}
            </Badge>
          </div>
        </div>
      </div>

      {/* ---- Main content ---- */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendrier
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Mes Réservations
              {bookings.filter((b) => b.status === 'pending').length > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-white text-[10px] border-0">
                  {bookings.filter((b) => b.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ============================================================ */}
          {/* TAB: CALENDAR VIEW                                           */}
          {/* ============================================================ */}
          <TabsContent value="calendar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ---- Left: Calendar ---- */}
              <div className="lg:col-span-2 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-border/50 overflow-hidden">
                    {/* Month navigation */}
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="icon" onClick={goToPrevMonth}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-center">
                          <CardTitle className="text-lg sm:text-xl">
                            {MONTHS_FR[currentMonth]} {currentYear}
                          </CardTitle>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-amber-600 dark:text-amber-400 text-xs h-auto p-0"
                            onClick={goToToday}
                          >
                            Aujourd&apos;hui
                          </Button>
                        </div>
                        <Button variant="outline" size="icon" onClick={goToNextMonth}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-4">
                      {/* Day headers */}
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {DAYS_FR.map((d) => (
                          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
                            {d}
                          </div>
                        ))}
                      </div>

                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => {
                          if (day === null) {
                            return <div key={`empty-${idx}`} className="aspect-square" />
                          }

                          const date = new Date(currentYear, currentMonth, day)
                          const isToday = isSameDay(date, today)
                          const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                          const isSunday = date.getDay() === 0
                          const hasAvail = availabilityMap.get(day) ?? false
                          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false

                          let cellClass =
                            'aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200 relative '

                          if (isSunday || isPast) {
                            cellClass += 'text-muted-foreground/40 cursor-not-allowed '
                          } else if (isSelected) {
                            cellClass += 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 scale-105 '
                          } else if (isToday) {
                            cellClass += 'ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-neutral-900 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 '
                          } else if (hasAvail) {
                            cellClass += 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-950/40 hover:shadow-md '
                          } else {
                            cellClass += 'text-muted-foreground hover:bg-muted/50 '
                          }

                          return (
                            <motion.button
                              key={day}
                              className={cellClass}
                              onClick={() => !isSunday && !isPast && handleDayClick(day)}
                              whileTap={!isSunday && !isPast ? { scale: 0.92 } : undefined}
                              disabled={isSunday || isPast}
                            >
                              {day}
                              {hasAvail && !isPast && !isSunday && !isSelected && (
                                <div className="absolute bottom-1 h-1 w-1 rounded-full bg-amber-500" />
                              )}
                              {isToday && !isSelected && (
                                <div className="absolute bottom-1 h-1 w-1 rounded-full bg-amber-600 dark:bg-amber-300" />
                              )}
                            </motion.button>
                          )
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                          Disponible
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-neutral-900" />
                          Aujourd&apos;hui
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600" />
                          Sélectionné
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* ---- Right: Time slots ---- */}
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {selectedDate ? (
                    <motion.div
                      key={selectedDate.toISOString()}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-border/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            Créneaux disponibles
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {formatDateFR(selectedDate)}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                          {timeSlots.map((slot) => {
                            const startH = new Date(slot.start).getHours()
                            const startStr = `${String(startH).padStart(2, '0')}:00`
                            const endStr = `${String(startH + 1).padStart(2, '0')}:00`

                            return (
                              <motion.button
                                key={slot.id}
                                className={`w-full text-left rounded-xl p-3 border transition-all duration-200 ${
                                  slot.available
                                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 hover:shadow-md cursor-pointer'
                                    : startH === 12
                                      ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 cursor-not-allowed'
                                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 cursor-not-allowed opacity-60'
                                }`}
                                onClick={() => handleSlotClick(slot)}
                                disabled={!slot.available}
                                whileTap={slot.available ? { scale: 0.97 } : undefined}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Clock className={`h-4 w-4 ${slot.available ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                    <span className={`font-medium text-sm ${slot.available ? 'text-green-700 dark:text-green-300' : 'text-gray-500'}`}>
                                      {startStr} — {endStr}
                                    </span>
                                  </div>
                                  {slot.available ? (
                                    <Badge className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-[10px]">
                                      Disponible
                                    </Badge>
                                  ) : startH === 12 ? (
                                    <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[10px]">
                                      Pause
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 text-[10px]">
                                      Réservé
                                    </Badge>
                                  )}
                                </div>
                              </motion.button>
                            )
                          })}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Card className="border-border/50">
                        <CardContent className="p-8 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/30">
                              <CalendarDays className="h-8 w-8 text-amber-500" />
                            </div>
                            <h3 className="font-semibold text-base">Sélectionnez un jour</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">
                              Cliquez sur un jour du calendrier pour voir les créneaux horaires disponibles
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Artisan info card (if specific artisan) */}
                {selectedArtisan && (
                  <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-bold ${selectedArtisan.avatarColor}`}>
                          {selectedArtisan.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{selectedArtisan.name}</h4>
                          <p className="text-xs text-muted-foreground">{selectedArtisan.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-medium">{selectedArtisan.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                              {formatPrice(selectedArtisan.hourlyRate)}/h
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick stats */}
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Filter className="h-4 w-4 text-amber-500" />
                      Résumé
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          {bookings.filter((b) => b.status === 'pending').length}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">En attente</p>
                      </div>
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 text-center">
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {bookings.filter((b) => b.status === 'confirmed').length}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Confirmés</p>
                      </div>
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-center">
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {bookings.filter((b) => b.status === 'in_progress').length}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">En cours</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/30 p-3 text-center">
                        <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                          {bookings.filter((b) => b.status === 'completed').length}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Terminés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB: MY BOOKINGS                                             */}
          {/* ============================================================ */}
          <TabsContent value="bookings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Filter bar */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {filterLabels.map((f) => (
                      <Button
                        key={f.key}
                        variant={bookingFilter === f.key ? 'default' : 'outline'}
                        size="sm"
                        className={
                          bookingFilter === f.key
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0'
                            : 'border-border/50'
                        }
                        onClick={() => setBookingFilter(f.key)}
                      >
                        {f.label}
                        {f.key !== 'all' && (
                          <Badge className="ml-1.5 h-4 px-1 text-[10px] bg-white/20 text-white border-0">
                            {bookings.filter((b) => f.key === 'all' || b.status === f.key).length}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bookings list */}
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredBookings.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Card className="border-border/50">
                        <CardContent className="p-8 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                              <Briefcase className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="font-semibold">Aucune réservation</h3>
                            <p className="text-sm text-muted-foreground">
                              Aucune réservation trouvée pour ce filtre
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    filteredBookings.map((booking, idx) => {
                      const artisan = MOCK_ARTISANS.find((a) => a.id === booking.artisanId)
                      const cfg = statusConfig[booking.status]
                      const StatusIcon = cfg.icon
                      const bookingDate = new Date(booking.date)

                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <Card className="border-border/50 hover:shadow-md transition-shadow overflow-hidden">
                            <CardContent className="p-0">
                              <div className="flex flex-col sm:flex-row">
                                {/* Left color accent */}
                                <div className={`hidden sm:block w-1.5 shrink-0 ${
                                  booking.status === 'pending' ? 'bg-yellow-400' :
                                  booking.status === 'confirmed' ? 'bg-green-400' :
                                  booking.status === 'in_progress' ? 'bg-blue-400' :
                                  booking.status === 'completed' ? 'bg-gray-400' :
                                  'bg-red-400'
                                }`} />

                                <div className="flex-1 p-4 sm:p-5">
                                  <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${artisan?.avatarColor ?? 'bg-amber-500'}`}>
                                      {artisan?.avatar ?? '??'}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div>
                                          <h4 className="font-semibold text-sm">{booking.artisanName}</h4>
                                          <p className="text-xs text-muted-foreground mt-0.5">{booking.service}</p>
                                        </div>
                                        <Badge className={`${cfg.bg} ${cfg.color} text-xs shrink-0`} variant="outline">
                                          <StatusIcon className="h-3 w-3 mr-1" />
                                          {cfg.label}
                                        </Badge>
                                      </div>

                                      <Separator className="my-3" />

                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                          <CalendarDays className="h-3 w-3" />
                                          <span>{bookingDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          <span>{booking.startTime} — {booking.endTime}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                          <MapPin className="h-3 w-3" />
                                          <span className="truncate">{booking.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                                          {formatPrice(booking.price)}
                                        </div>
                                      </div>

                                      {/* Notes */}
                                      {booking.notes && (
                                        <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5 flex items-start gap-1.5">
                                          <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                                          <span>{booking.notes}</span>
                                        </div>
                                      )}

                                      {/* Action buttons */}
                                      <div className="mt-3 flex items-center gap-2">
                                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs h-8"
                                            onClick={() => handleCancelBooking(booking.id)}
                                          >
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Annuler
                                          </Button>
                                        )}
                                        {booking.status === 'completed' && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs h-8"
                                          >
                                            <Star className="h-3 w-3 mr-1" />
                                            Laisser un avis
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ============================================================ */}
      {/* BOOKING FORM DIALOG                                          */}
      {/* ============================================================ */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <AnimatePresence mode="wait">
            {bookingSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 mb-4"
                >
                  <PartyPopper className="h-10 w-10 text-green-600 dark:text-green-400" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Réservation confirmée !</h3>
                <p className="text-muted-foreground text-sm">
                  Votre demande a été envoyée avec succès. Vous recevrez une confirmation sous peu.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-amber-500" />
                    Nouvelle réservation
                  </DialogTitle>
                  <DialogDescription>
                    Remplissez les détails pour confirmer votre réservation
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                  {/* Artisan & time info */}
                  <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${selectedArtisan?.avatarColor ?? 'bg-amber-500'}`}>
                        {selectedArtisan?.avatar ?? 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{selectedArtisan?.name ?? 'Artisan'}</p>
                        <p className="text-xs text-muted-foreground">{selectedArtisan?.specialty ?? 'Service'}</p>
                      </div>
                    </div>
                    <Separator className="my-2 bg-amber-200 dark:bg-amber-800" />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {selectedDate && (
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          <span>{selectedDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        </div>
                      )}
                      {selectedSlot && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          <span>
                            {String(new Date(selectedSlot.start).getHours()).padStart(2, '0')}:00 — {String(new Date(selectedSlot.end).getHours()).padStart(2, '0')}:00
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service select */}
                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-sm font-medium">
                      Service *
                    </Label>
                    <Select value={formState.service} onValueChange={(v) => setFormState((s) => ({ ...s, service: v }))}>
                      <SelectTrigger id="service">
                        <SelectValue placeholder="Sélectionnez un service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">
                      Lieu
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Adresse du lieu d'intervention"
                        className="pl-10"
                        value={formState.location}
                        onChange={(e) => setFormState((s) => ({ ...s, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Décrivez votre besoin en détail..."
                      className="resize-none min-h-[80px]"
                      value={formState.notes}
                      onChange={(e) => setFormState((s) => ({ ...s, notes: e.target.value }))}
                    />
                  </div>

                  <Separator />

                  {/* Price display */}
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Tarif horaire</span>
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                      {formatPrice(selectedArtisan?.hourlyRate ?? 8000)}
                    </span>
                  </div>

                  {/* Submit button */}
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 font-semibold text-base"
                    onClick={handleSubmitBooking}
                    disabled={!formState.service || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirmer la réservation
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d8;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa;
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #52525b;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #71717a;
          }
        }
      `}</style>
    </div>
  )
}
