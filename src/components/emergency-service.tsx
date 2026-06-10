'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import type {
  EmergencyRequest,
  EmergencyType,
  EmergencyStatus,
} from '@/lib/types';

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

interface EmergencyServiceProps {
  onBack: () => void;
}

type ViewPhase = 'hero' | 'form' | 'tracking' | 'history';

const EMERGENCY_TYPES: { type: EmergencyType; icon: string; label: string; color: string }[] = [
  { type: 'plumbing', icon: '💧', label: "Fuite d'eau", color: 'bg-blue-500' },
  { type: 'electrical', icon: '⚡', label: 'Panne électrique', color: 'bg-yellow-500' },
  { type: 'locksmith', icon: '🔒', label: 'Serrurerie', color: 'bg-gray-600' },
  { type: 'gas', icon: '🔥', label: 'Fuite de gaz', color: 'bg-orange-500' },
  { type: 'flood', icon: '🌊', label: 'Inondation', color: 'bg-cyan-500' },
  { type: 'other', icon: '❓', label: 'Autre', color: 'bg-purple-500' },
];

const STATUS_LABELS: Record<EmergencyStatus, string> = {
  dispatching: 'Demande envoyée',
  en_route: 'En route',
  on_site: 'Sur place',
  resolved: 'Résolu',
  cancelled: 'Annulé',
};

const STATUS_ICONS: Record<EmergencyStatus, string> = {
  dispatching: '✅',
  en_route: '🔄',
  on_site: '⏳',
  resolved: '✅',
  cancelled: '❌',
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_ACTIVE_EMERGENCY: EmergencyRequest = {
  id: 'em-001',
  type: 'plumbing',
  description: "Fuite d'eau importante sous l'évier de la cuisine, l'eau coule en continu",
  location: 'Plateau, Dakar — Rue 10, Maison 25',
  clientName: 'Mariama Sow',
  clientPhone: '+221 77 123 4567',
  status: 'en_route',
  assignedArtisan: {
    name: 'Amadou Diallo',
    avatar: '',
    rating: 4.9,
    eta: '12 min',
    phone: '+221 76 987 6543',
  },
  createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
};

const MOCK_PAST_EMERGENCIES: EmergencyRequest[] = [
  {
    id: 'em-002',
    type: 'electrical',
    description: "Coupure de courant totale, disjoncteur qui saute en boucle",
    location: 'Médina, Dakar',
    clientName: 'Ibrahima Fall',
    clientPhone: '+221 78 111 2233',
    status: 'resolved',
    assignedArtisan: {
      name: 'Fatou Ndiaye',
      avatar: '',
      rating: 4.8,
      eta: '',
      phone: '+221 76 555 4433',
    },
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 86400000 + 55 * 60000).toISOString(),
  },
  {
    id: 'em-003',
    type: 'locksmith',
    description: "Porte claquée, clés à l'intérieur, impossible d'entrer",
    location: 'Almadies, Dakar',
    clientName: 'Aminata Diop',
    clientPhone: '+221 77 222 3344',
    status: 'resolved',
    assignedArtisan: {
      name: 'Moussa Traoré',
      avatar: '',
      rating: 4.7,
      eta: '',
      phone: '+221 76 666 7788',
    },
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 5 * 86400000 + 35 * 60000).toISOString(),
  },
  {
    id: 'em-004',
    type: 'gas',
    description: "Odeur de gaz très forte dans la cuisine, fuite au niveau du raccord",
    location: 'Ouakam, Dakar',
    clientName: 'Ousmane Sy',
    clientPhone: '+221 78 333 4455',
    status: 'resolved',
    assignedArtisan: {
      name: 'Amadou Diallo',
      avatar: '',
      rating: 4.9,
      eta: '',
      phone: '+221 76 987 6543',
    },
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 8 * 86400000 + 20 * 60000).toISOString(),
  },
  {
    id: 'em-005',
    type: 'flood',
    description: "Inondation sous-sol après fortes pluies, 20cm d'eau accumulée",
    location: 'Point E, Dakar',
    clientName: 'Aïssatou Ba',
    clientPhone: '+221 77 444 5566',
    status: 'resolved',
    assignedArtisan: {
      name: 'Ibrahim Cissé',
      avatar: '',
      rating: 4.6,
      eta: '',
      phone: '+221 76 888 9900',
    },
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 15 * 86400000 + 90 * 60000).toISOString(),
  },
  {
    id: 'em-006',
    type: 'plumbing',
    description: "WC bouché, remontée d'eau sale, urgence sanitaire",
    location: 'Fann, Dakar',
    clientName: 'Cheikh Mbacké',
    clientPhone: '+221 78 555 6677',
    status: 'resolved',
    assignedArtisan: {
      name: 'Amadou Diallo',
      avatar: '',
      rating: 4.9,
      eta: '',
      phone: '+221 76 987 6543',
    },
    createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 22 * 86400000 + 45 * 60000).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getTypeInfo(type: EmergencyType) {
  return EMERGENCY_TYPES.find((t) => t.type === type) ?? EMERGENCY_TYPES[5];
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

function formatResolutionTime(created: string, resolved: string): string {
  const diff = new Date(resolved).getTime() - new Date(created).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}min`;
}

// ---------------------------------------------------------------------------
// Pulse animation keyframes (inline)
// ---------------------------------------------------------------------------

const heartbeatKeyframes = {
  scale: [1, 1.08, 1, 1.08, 1],
};

const heartbeatTransition = {
  duration: 1.2,
  repeat: Infinity,
  ease: 'easeInOut',
};

const pulseBorderKeyframes = {
  boxShadow: [
    '0 0 0 0 rgba(239, 68, 68, 0.5)',
    '0 0 0 12px rgba(239, 68, 68, 0)',
    '0 0 0 0 rgba(239, 68, 68, 0)',
  ],
};

const pulseBorderTransition = {
  duration: 1.5,
  repeat: Infinity,
  ease: 'easeOut',
};

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

/** Red pulsing emergency CTA button */
function EmergencyCTAButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      animate={heartbeatKeyframes}
      transition={heartbeatTransition}
      className="relative w-full max-w-md mx-auto flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-white font-bold text-xl bg-gradient-to-r from-red-600 to-red-500 shadow-2xl shadow-red-500/30 cursor-pointer select-none"
    >
      <span className="text-2xl">🚨</span>
      <span>APPEL D&apos;URGENCE</span>
      {/* Pulse ring */}
      <motion.span
        className="absolute inset-0 rounded-2xl border-2 border-red-400"
        animate={pulseBorderKeyframes}
        transition={pulseBorderTransition}
      />
    </motion.button>
  );
}

/** Emergency type quick-select grid */
function EmergencyTypeGrid({ onSelect }: { onSelect: (type: EmergencyType) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {EMERGENCY_TYPES.map((item) => (
        <motion.button
          key={item.type}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(item.type)}
          className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-red-200 bg-white hover:border-red-400 hover:bg-red-50 transition-colors cursor-pointer dark:bg-zinc-900 dark:border-red-900 dark:hover:border-red-500 dark:hover:bg-red-950/30"
        >
          <span className="text-3xl">{item.icon}</span>
          <span className="text-xs font-semibold text-center text-red-700 dark:text-red-400">
            {item.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

/** Urgency level slider */
function UrgencySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const labels = ['Normal', 'Urgent', 'Très urgent'];
  const colors = ['bg-amber-400', 'bg-orange-500', 'bg-red-600'];
  const current = value <= 33 ? 0 : value <= 66 ? 1 : 2;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-red-700 dark:text-red-400">
        Niveau d&apos;urgence
      </Label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-red-600"
          style={{
            background: `linear-gradient(to right, #ef4444 ${value}%, #fecaca ${value}%)`,
          }}
        />
        <Badge
          className={`${colors[current]} text-white border-0 px-3 py-1 text-xs font-bold`}
        >
          {labels[current]}
        </Badge>
      </div>
    </div>
  );
}

/** Dispatch animation overlay */
function DispatchAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="flex flex-col items-center gap-6 p-8"
      >
        {/* Spinning radar */}
        <div className="relative w-32 h-32">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-red-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-3 rounded-full border-4 border-red-400/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <motion.div
            className="absolute inset-6 rounded-full border-4 border-red-300/50"
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl">🚨</span>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Recherche en cours...</h3>
          <p className="text-red-200 text-sm">
            Nous trouvons un artisan disponible près de chez vous
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Timeline step */
function TimelineStep({
  icon,
  label,
  subtitle,
  active,
  completed,
  isLast,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  active: boolean;
  completed: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Vertical line + circle */}
      <div className="flex flex-col items-center">
        <motion.div
          animate={active ? { scale: [1, 1.2, 1] } : {}}
          transition={active ? { duration: 1, repeat: Infinity } : {}}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            completed
              ? 'bg-green-500 text-white'
              : active
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
              : 'bg-gray-200 text-gray-400 dark:bg-zinc-700 dark:text-zinc-500'
          }`}
        >
          {icon}
        </motion.div>
        {!isLast && (
          <div
            className={`w-0.5 h-8 ${
              completed ? 'bg-green-400' : 'bg-gray-200 dark:bg-zinc-700'
            }`}
          />
        )}
      </div>
      {/* Content */}
      <div className="pb-4">
        <p
          className={`font-semibold text-sm ${
            completed
              ? 'text-green-700 dark:text-green-400'
              : active
              ? 'text-red-700 dark:text-red-400'
              : 'text-gray-400 dark:text-zinc-500'
          }`}
        >
          {label}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/** Map placeholder */
function MapPlaceholder() {
  return (
    <motion.div
      animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
      transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
      className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden border-2 border-red-200 dark:border-red-900"
      style={{
        background:
          'linear-gradient(135deg, #fef2f2 25%, #fee2e2 50%, #fef2f2 75%)',
        backgroundSize: '200% 200%',
      }}
    >
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full h-px bg-red-600"
            style={{ top: `${(i + 1) * 12.5}%` }}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute h-full w-px bg-red-600"
            style={{ left: `${(i + 1) * 12.5}%` }}
          />
        ))}
      </div>
      {/* Road lines */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-amber-300/40 -translate-y-1/2" />
      <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-amber-300/40" />
      <div className="absolute top-0 bottom-0 right-1/4 w-1 bg-amber-300/30" />
      {/* Destination pin */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="text-3xl drop-shadow-lg">📍</span>
      </motion.div>
      {/* Artisan marker */}
      <motion.div
        className="absolute top-1/3 left-1/4"
        animate={{ x: [0, 8, 16, 24], y: [0, 4, 2, 6] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
      >
        <span className="text-2xl">🚗</span>
      </motion.div>
      {/* ETA badge */}
      <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
        <p className="text-xs font-bold text-red-600">ETA: ~12 min</p>
      </div>
    </motion.div>
  );
}

/** Artisan info card */
function ArtisanCard({ artisan }: { artisan: NonNullable<EmergencyRequest['assignedArtisan']> }) {
  return (
    <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-800 dark:border-amber-800">
      <CardContent className="p-4 flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg">
          {artisan.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base text-gray-900 dark:text-white truncate">
            {artisan.name}
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-400">Plombier certifié</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-amber-500">★</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {artisan.rating}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white gap-1.5 shrink-0"
        >
          <span>📞</span>
          <span className="hidden sm:inline">Appeler</span>
        </Button>
      </CardContent>
    </Card>
  );
}

/** Emergency history card */
function HistoryCard({ request }: { request: EmergencyRequest }) {
  const typeInfo = getTypeInfo(request.type);
  const resTime = request.resolvedAt
    ? formatResolutionTime(request.createdAt, request.resolvedAt)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-gray-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-start gap-3">
          {/* Type icon */}
          <div
            className={`w-10 h-10 rounded-lg ${typeInfo.color} bg-opacity-20 flex items-center justify-center text-xl shrink-0`}
            style={{ backgroundColor: undefined }}
          >
            <span className="text-2xl">{typeInfo.icon}</span>
          </div>
          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="text-xs border-green-400 text-green-700 dark:border-green-600 dark:text-green-400"
              >
                Résolu
              </Badge>
              {resTime && (
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  ⏱ {resTime}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium line-clamp-1">
              {request.description}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              {request.assignedArtisan && (
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  👷 {request.assignedArtisan.name}
                </span>
              )}
              <span className="text-xs text-gray-400 dark:text-zinc-500">
                {formatTimeAgo(request.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function EmergencyService({ onBack }: EmergencyServiceProps) {
  const { user } = useAppStore();

  // Phase state
  const [phase, setPhase] = useState<ViewPhase>(
    MOCK_ACTIVE_EMERGENCY ? 'tracking' : 'hero'
  );

  // Form state
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [urgencyLevel, setUrgencyLevel] = useState(50);

  // Tracking state
  const [activeEmergency, setActiveEmergency] = useState<EmergencyRequest | null>(
    MOCK_ACTIVE_EMERGENCY
  );
  const [etaCountdown, setEtaCountdown] = useState(12);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Dispatch animation
  const [isDispatching, setIsDispatching] = useState(false);

  // History
  const [pastEmergencies] = useState<EmergencyRequest[]>(MOCK_PAST_EMERGENCIES);

  // Active tab within tracking view
  const [trackingTab, setTrackingTab] = useState<'tracking' | 'history'>('tracking');

  // ETA countdown
  useEffect(() => {
    if (phase !== 'tracking' || !activeEmergency || activeEmergency.status === 'resolved' || activeEmergency.status === 'cancelled') return;

    const interval = setInterval(() => {
      setEtaCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Count down every minute

    return () => clearInterval(interval);
  }, [phase, activeEmergency]);

  // Simulate status progression after dispatch
  useEffect(() => {
    if (!isDispatching || !activeEmergency) return;

    const timer1 = setTimeout(() => {
      setActiveEmergency((prev) =>
        prev ? { ...prev, status: 'dispatching' } : prev
      );
    }, 2000);

    const timer2 = setTimeout(() => {
      setActiveEmergency((prev) =>
        prev
          ? {
              ...prev,
              status: 'en_route',
              assignedArtisan: {
                name: 'Amadou Diallo',
                avatar: '',
                rating: 4.9,
                eta: '12 min',
                phone: '+221 76 987 6543',
              },
            }
          : prev
      );
      setIsDispatching(false);
      setEtaCountdown(12);
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isDispatching, activeEmergency]);

  // Handle emergency type selection
  const handleTypeSelect = useCallback((type: EmergencyType) => {
    setSelectedType(type);
    setPhase('form');
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!selectedType || !description.trim() || !location.trim() || !phone.trim()) return;

    setIsDispatching(true);

    const newEmergency: EmergencyRequest = {
      id: `em-${Date.now()}`,
      type: selectedType,
      description: description.trim(),
      location: location.trim(),
      clientName: user?.name ?? 'Utilisateur',
      clientPhone: phone.trim(),
      status: 'dispatching',
      createdAt: new Date().toISOString(),
    };

    setActiveEmergency(newEmergency);

    // After dispatch animation, switch to tracking
    setTimeout(() => {
      setPhase('tracking');
    }, 5500);
  }, [selectedType, description, location, phone, user]);

  // Handle GPS location
  const handleUseGPS = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (position GPS)`);
        },
        () => {
          setLocation('Dakar, Sénégal (position approximative)');
        }
      );
    } else {
      setLocation('Dakar, Sénégal (position approximative)');
    }
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setActiveEmergency((prev) =>
      prev ? { ...prev, status: 'cancelled' } : prev
    );
    setShowCancelDialog(false);
    setPhase('hero');
    setSelectedType(null);
    setDescription('');
    setLocation('');
    setPhone(user?.phone ?? '');
    setUrgencyLevel(50);
  }, [user]);

  // Get timeline steps based on status
  const getTimelineSteps = useCallback(() => {
    if (!activeEmergency) return [];
    const s = activeEmergency.status;
    return [
      {
        icon: '✅',
        label: 'Demande envoyée',
        completed: true,
        active: s === 'dispatching',
      },
      {
        icon: '✅',
        label: 'Artisan trouvé',
        subtitle: activeEmergency.assignedArtisan
          ? activeEmergency.assignedArtisan.name
          : undefined,
        completed: s !== 'dispatching',
        active: s === 'en_route',
      },
      {
        icon: '🔄',
        label: 'En route',
        subtitle:
          s === 'en_route'
            ? `Arrivée dans ${etaCountdown} min`
            : undefined,
        completed: s === 'on_site' || s === 'resolved',
        active: s === 'en_route',
      },
      {
        icon: '⏳',
        label: 'Sur place',
        completed: s === 'resolved',
        active: s === 'on_site',
      },
      {
        icon: '⏳',
        label: 'Résolu',
        completed: false,
        active: false,
        isLast: true,
      },
    ];
  }, [activeEmergency, etaCountdown]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Dispatch animation overlay */}
      <AnimatePresence>
        {isDispatching && <DispatchAnimation />}
      </AnimatePresence>

      {/* Cancel dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">⚠️ Annuler l&apos;urgence ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler cette demande d&apos;urgence ?
              L&apos;artisan en sera informé immédiatement.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Non, garder
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Oui, annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="shrink-0 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
          >
            ←
          </Button>
          <div>
            <h1 className="text-xl font-bold text-red-700 dark:text-red-400">
              🚨 Service d&apos;Urgence
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Intervention rapide 24h/24
            </p>
          </div>
          {phase === 'tracking' && activeEmergency && (
            <Badge className="ml-auto bg-red-600 text-white animate-pulse border-0">
              EN COURS
            </Badge>
          )}
        </motion.div>

        {/* Tracking tab switcher */}
        {phase === 'tracking' && (
          <div className="flex gap-2 mb-6">
            <Button
              size="sm"
              variant={trackingTab === 'tracking' ? 'default' : 'outline'}
              onClick={() => setTrackingTab('tracking')}
              className={
                trackingTab === 'tracking'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'border-red-200 dark:border-red-900'
              }
            >
              Suivi en direct
            </Button>
            <Button
              size="sm"
              variant={trackingTab === 'history' ? 'default' : 'outline'}
              onClick={() => setTrackingTab('history')}
              className={
                trackingTab === 'history'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'border-red-200 dark:border-red-900'
              }
            >
              Historique
            </Button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ===== HERO PHASE ===== */}
          {phase === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* CTA */}
              <div className="text-center space-y-4">
                <EmergencyCTAButton onClick={() => setPhase('hero')} />
                <p className="text-sm text-red-600/80 dark:text-red-400/80 font-medium">
                  Un artisan chez vous en moins de 30 minutes
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <Separator className="flex-1 bg-red-200 dark:bg-red-900" />
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                  ou choisissez le type d&apos;urgence
                </span>
                <Separator className="flex-1 bg-red-200 dark:bg-red-900" />
              </div>

              {/* Type grid */}
              <EmergencyTypeGrid onSelect={handleTypeSelect} />

              {/* Active emergency banner */}
              {activeEmergency && activeEmergency.status !== 'cancelled' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4"
                >
                  <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-800 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-2xl"
                        >
                          🚨
                        </motion.div>
                        <div className="flex-1">
                          <p className="font-bold text-red-700 dark:text-red-400 text-sm">
                            Urgence en cours
                          </p>
                          <p className="text-xs text-red-600/70 dark:text-red-400/70">
                            {getTypeInfo(activeEmergency.type).icon}{' '}
                            {getTypeInfo(activeEmergency.type).label} —{' '}
                            {STATUS_LABELS[activeEmergency.status]}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => {
                            setTrackingTab('tracking');
                            setPhase('tracking');
                          }}
                        >
                          Suivre
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Quick history link */}
              {pastEmergencies.length > 0 && (
                <button
                  onClick={() => {
                    setTrackingTab('history');
                    setPhase('tracking');
                  }}
                  className="w-full text-center text-sm text-gray-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer py-2"
                >
                  Voir l&apos;historique de vos urgences ({pastEmergencies.length})
                </button>
              )}
            </motion.div>
          )}

          {/* ===== FORM PHASE ===== */}
          {phase === 'form' && selectedType && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="space-y-6"
            >
              {/* Back button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPhase('hero');
                  setSelectedType(null);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 -ml-2"
              >
                ← Retour
              </Button>

              {/* Selected type badge */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <span className="text-4xl">{getTypeInfo(selectedType).icon}</span>
                <div>
                  <h3 className="font-bold text-red-700 dark:text-red-400">
                    {getTypeInfo(selectedType).label}
                  </h3>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70">
                    Remplissez les détails ci-dessous
                  </p>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-5">
                {/* Type (pre-filled, read-only) */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type d&apos;urgence
                  </Label>
                  <Select value={selectedType} disabled>
                    <SelectTrigger className="bg-gray-50 dark:bg-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMERGENCY_TYPES.map((t) => (
                        <SelectItem key={t.type} value={t.type}>
                          {t.icon} {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Décrivez l&apos;urgence
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez la situation en détail : nature du problème, gravité, accès..."
                    className="min-h-[100px] border-red-200 focus:border-red-500 focus:ring-red-500 dark:border-red-900 dark:focus:border-red-600"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Votre adresse
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Quartier, rue, numéro..."
                      className="flex-1 border-red-200 focus:border-red-500 focus:ring-red-500 dark:border-red-900"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUseGPS}
                      className="shrink-0 border-amber-300 hover:bg-amber-50 text-amber-700 dark:border-amber-800 dark:hover:bg-amber-950 dark:text-amber-400 gap-1.5"
                    >
                      📍 <span className="hidden sm:inline">GPS</span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">
                    Utiliser ma position pour une localisation précise
                  </p>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Numéro de téléphone
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 7X XXX XXXX"
                    type="tel"
                    className="border-red-200 focus:border-red-500 focus:ring-red-500 dark:border-red-900"
                  />
                </div>

                {/* Urgency slider */}
                <UrgencySlider value={urgencyLevel} onChange={setUrgencyLevel} />

                <Separator className="bg-red-100 dark:bg-red-900" />

                {/* Submit */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={
                    !description.trim() || !location.trim() || !phone.trim()
                  }
                  animate={heartbeatKeyframes}
                  transition={{ ...heartbeatTransition, repeat: description.trim() && location.trim() && phone.trim() ? Infinity : 0 }}
                  className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-red-600 to-red-500 shadow-xl shadow-red-500/30 disabled:opacity-40 disabled:shadow-none disabled:animate-none cursor-pointer disabled:cursor-not-allowed transition-opacity"
                >
                  🚨 Envoyer la demande d&apos;urgence
                </motion.button>

                <p className="text-center text-xs text-gray-400 dark:text-zinc-500">
                  Un artisan sera dispatché immédiatement après envoi
                </p>
              </div>
            </motion.div>
          )}

          {/* ===== TRACKING PHASE ===== */}
          {phase === 'tracking' && trackingTab === 'tracking' && activeEmergency && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Emergency info */}
              <Card className="border-2 border-red-400 dark:border-red-800 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-amber-500" />
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeInfo(activeEmergency.type).icon}</span>
                      <div>
                        <h3 className="font-bold text-red-700 dark:text-red-400">
                          {getTypeInfo(activeEmergency.type).label}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                          {formatTimeAgo(activeEmergency.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                      {STATUS_LABELS[activeEmergency.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {activeEmergency.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">
                    📍 {activeEmergency.location}
                  </p>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="border border-gray-200 dark:border-zinc-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-gray-800 dark:text-gray-200">
                    Suivi en temps réel
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-0">
                    {getTimelineSteps().map((step, i) => (
                      <TimelineStep
                        key={i}
                        icon={step.icon}
                        label={step.label}
                        subtitle={step.subtitle}
                        completed={step.completed}
                        active={step.active}
                        isLast={i === getTimelineSteps().length - 1}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ETA banner */}
              {activeEmergency.status === 'en_route' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-center shadow-lg"
                >
                  <motion.p
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-3xl font-bold"
                  >
                    ⏱ {etaCountdown} min
                  </motion.p>
                  <p className="text-sm text-red-100 mt-1">
                    Arrivée estimée de l&apos;artisan
                  </p>
                </motion.div>
              )}

              {/* Map */}
              {(activeEmergency.status === 'en_route' || activeEmergency.status === 'on_site') && (
                <MapPlaceholder />
              )}

              {/* Artisan card */}
              {activeEmergency.assignedArtisan && activeEmergency.status !== 'dispatching' && (
                <ArtisanCard artisan={activeEmergency.assignedArtisan} />
              )}

              {/* Contact & Cancel */}
              <div className="flex gap-3">
                {activeEmergency.assignedArtisan && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 h-12"
                  >
                    <span>📞</span>
                    Contacter l&apos;artisan
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(true)}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 h-12"
                >
                  Annuler l&apos;urgence
                </Button>
              </div>
            </motion.div>
          )}

          {/* ===== HISTORY PHASE ===== */}
          {phase === 'tracking' && trackingTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">
                  Historique des urgences
                </h3>
                <Badge variant="outline" className="text-xs">
                  {pastEmergencies.length} interventions
                </Badge>
              </div>

              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="border-green-200 dark:border-green-900">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{pastEmergencies.length}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">Résolues</p>
                  </CardContent>
                </Card>
                <Card className="border-amber-200 dark:border-amber-900">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600">~49</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">Min moy.</p>
                  </CardContent>
                </Card>
                <Card className="border-red-200 dark:border-red-900">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">4.8</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">Note moy.</p>
                  </CardContent>
                </Card>
              </div>

              {/* History list */}
              <div className="max-h-96 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {pastEmergencies.map((req) => (
                  <HistoryCard key={req.id} request={req} />
                ))}
              </div>

              {/* Back to hero */}
              <Button
                variant="outline"
                onClick={() => setPhase('hero')}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
              >
                ← Nouvelle urgence
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom emergency bar (always visible) */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <motion.div
          animate={{
            background: [
              'linear-gradient(to right, #dc2626, #ef4444)',
              'linear-gradient(to right, #ef4444, #dc2626)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          className="px-4 py-2.5 text-center"
        >
          <p className="text-white text-xs font-medium flex items-center justify-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🔴
            </motion.span>
            Service d&apos;urgence disponible 24h/24 — Appelez le{' '}
            <a href="tel:+221800000000" className="underline font-bold">
              80 000 00 00
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
