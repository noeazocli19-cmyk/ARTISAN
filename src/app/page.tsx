'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Wrench,
  Search,
  MapPin,
  Droplets,
  Zap,
  Hammer,
  Paintbrush,
  KeyRound,
  BrickWall,
  Wind,
  Sparkles,
  Star,
  CheckCircle2,
  Shield,
  MessageSquare,
  CreditCard,
  Headphones,
  ThumbsUp,
  Navigation,
  ChevronRight,
  ArrowRight,
  Users,
  Briefcase,
  Heart,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Flame,
  LayoutGrid,
  Home as HomeIcon,
  Scissors,
  UtensilsCrossed,
  Flower2,
  Car,
  ShowerHead,
  DoorOpen,
  TreePine,
  Gem,
  ChefHat,
  Shirt,
  Anvil,
  Ruler,
  Camera,
  Music,
  Bone,
  Baby,
  BookOpen,
  CalendarDays,
  Trophy,
  ClipboardList,
  Siren,
  Gift,
  Rocket,
  Crosshair,
  LoaderCircle,
  ArrowDown,
  Download,
  Smartphone,
  BadgeCheck,
  Clock3,
  TicketPercent,
  Mic,
  Calculator,
  Bell,
  Camera,
} from "lucide-react"

// Import our new components
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { SearchResults } from "@/components/search-results"
import { ArtisanDetail } from "@/components/artisan-detail"
import { Chatbot } from "@/components/chatbot"
import { PricingSection } from "@/components/pricing-section"
import { RealtimeChat } from "@/components/realtime-chat"
import { ArtisanMap } from "@/components/artisan-map"
import { PortfolioUpload } from "@/components/portfolio-upload"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { InstallPrompt } from "@/components/install-prompt"
import { AdminDashboard } from "@/components/admin-dashboard"
import { WelcomeScreen } from "@/components/welcome-screen"
import { BookingCalendar } from "@/components/booking-calendar"
import { PaymentWallet } from "@/components/payment-wallet"
import { GamificationSystem } from "@/components/gamification-system"
import { QuoteRequestSystem } from "@/components/quote-request"
import { EmergencyService } from "@/components/emergency-service"
import { ReferralProgram } from "@/components/referral-program"
import { AnimatedStats } from "@/components/animated-stats"
import { CallModal } from "@/components/call-modal"
import { useAppStore } from "@/lib/store"
import Image from "next/image" 
import dynamic from "next/dynamic" 

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const quickCategories = [
  "Plomberie",
  "Électricité",
  "Menuiserie",
  "Peinture",
  "Climatisation",
  "Nettoyage",
  "Soudure",
  "Carrelage",
  "Couture",
  "Pâtisserie",
  "Mécanique",
  "Coiffure",
]

const statsTemplate = [
  { key: "artisans", label: "Artisans inscrits", icon: Users },
  { key: "missions", label: "Missions créées", icon: Briefcase },
  { key: "rating", label: "Note moyenne", icon: Heart },
  { key: "countries", label: "Pays représentés", icon: Globe },
] as const

const categories = [
  { name: "Plomberie", icon: Droplets, count: "1 250 artisans", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  { name: "Électricité", icon: Zap, count: "1 100 artisans", color: "bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400" },
  { name: "Menuiserie", icon: Hammer, count: "980 artisans", color: "bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400" },
  { name: "Peinture", icon: Paintbrush, count: "870 artisans", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
  { name: "Serrurerie", icon: KeyRound, count: "650 artisans", color: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400" },
  { name: "Maçonnerie", icon: BrickWall, count: "920 artisans", color: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400" },
  { name: "Climatisation", icon: Wind, count: "780 artisans", color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400" },
  { name: "Nettoyage", icon: Sparkles, count: "1 450 artisans", color: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400" },
  { name: "Soudure", icon: Flame, count: "540 artisans", color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
  { name: "Carrelage", icon: LayoutGrid, count: "670 artisans", color: "bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400" },
  { name: "Couture", icon: Scissors, count: "890 artisans", color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400" },
  { name: "Couvreur", icon: HomeIcon, count: "430 artisans", color: "bg-stone-100 text-stone-600 dark:bg-stone-950 dark:text-stone-400" },
  { name: "Plâtrerie", icon: Ruler, count: "510 artisans", color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
  { name: "Pâtisserie", icon: ChefHat, count: "720 artisans", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
  { name: "Mécanique", icon: Car, count: "960 artisans", color: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400" },
  { name: "Coiffure", icon: Scissors, count: "1 100 artisans", color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950 dark:text-fuchsia-400" },
  { name: "Paysagisme", icon: TreePine, count: "380 artisans", color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" },
  { name: "Vitrerie", icon: DoorOpen, count: "290 artisans", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
  { name: "Forgeron", icon: Anvil, count: "210 artisans", color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400" },
  { name: "Photographie", icon: Camera, count: "560 artisans", color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
]

const artisans = [
  {
    name: "Amadou Diallo",
    skill: "Plombier certifié",
    location: "Dakar, Sénégal",
    rating: 4.9,
    reviews: 127,
    badge: "Élite",
    badgeColor: "bg-brand-500 text-white",
    avatar: "AD",
    avatarColor: "bg-brand-500",
    image: "/images/artisan-plumber.png",
  },
  {
    name: "Fatou Ndiaye",
    skill: "Électricienne",
    location: "Abidjan, Côte d'Ivoire",
    rating: 4.8,
    reviews: 98,
    badge: "Top",
    badgeColor: "bg-emerald-500 text-white",
    avatar: "FN",
    avatarColor: "bg-emerald-500",
    image: "/images/artisan-electrician.png",
  },
  {
    name: "Kofi Mensah",
    skill: "Menuisier artisan",
    location: "Accra, Ghana",
    rating: 4.9,
    reviews: 156,
    badge: "Élite",
    badgeColor: "bg-brand-500 text-white",
    avatar: "KM",
    avatarColor: "bg-brand-500",
    image: "/images/artisan-carpenter.png",
  },
  {
    name: "Aïcha Bello",
    skill: "Peintre décoratrice",
    location: "Lomé, Togo",
    rating: 4.7,
    reviews: 73,
    badge: "Vérifié",
    badgeColor: "bg-teal-500 text-white",
    avatar: "AB",
    avatarColor: "bg-teal-500",
    image: "/images/artisan-painter.png",
  },
  {
    name: "Ibrahim Coulibaly",
    skill: "Soudeur professionnel",
    location: "Bamako, Mali",
    rating: 4.8,
    reviews: 112,
    badge: "Top",
    badgeColor: "bg-emerald-500 text-white",
    avatar: "IC",
    avatarColor: "bg-red-500",
    image: "/images/artisan-welder.png",
  },
  {
    name: "Mariama Sow",
    skill: "Carreleuse experte",
    location: "Conakry, Guinée",
    rating: 4.9,
    reviews: 201,
    badge: "Élite",
    badgeColor: "bg-brand-500 text-white",
    avatar: "MS",
    avatarColor: "bg-sky-500",
    image: "/images/artisan-tiler.png",
  },
  {
    name: "Ousmane Camara",
    skill: "Couvreur certifié",
    location: "Dakar, Sénégal",
    rating: 4.7,
    reviews: 89,
    badge: "Vérifié",
    badgeColor: "bg-teal-500 text-white",
    avatar: "OC",
    avatarColor: "bg-stone-500",
    image: "/images/artisan-roofer.png",
  },
  {
    name: "Aminata Koné",
    skill: "Couturière mode",
    location: "Abidjan, Côte d'Ivoire",
    rating: 4.9,
    reviews: 178,
    badge: "Élite",
    badgeColor: "bg-brand-500 text-white",
    avatar: "AK",
    avatarColor: "bg-pink-500",
    image: "/images/artisan-tailor.png",
  },
  {
    name: "Moussa Traoré",
    skill: "Mécanicien auto",
    location: "Bamako, Mali",
    rating: 4.8,
    reviews: 134,
    badge: "Top",
    badgeColor: "bg-emerald-500 text-white",
    avatar: "MT",
    avatarColor: "bg-gray-500",
    image: "/images/artisan-mechanic.png",
  },
  {
    name: "Seydou Keita",
    skill: "Forgeron artisan",
    location: "Bamako, Mali",
    rating: 4.9,
    reviews: 95,
    badge: "Élite",
    badgeColor: "bg-brand-500 text-white",
    avatar: "SK",
    avatarColor: "bg-zinc-600",
    image: "/images/artisan-blacksmith.png",
  },
  {
    name: "Fatoumata Diarra",
    skill: "Paysagiste",
    location: "Conakry, Guinée",
    rating: 4.7,
    reviews: 67,
    badge: "Vérifié",
    badgeColor: "bg-teal-500 text-white",
    avatar: "FD",
    avatarColor: "bg-green-500",
    image: "/images/artisan-landscaper.png",
  },
  {
    name: "Kwame Asante",
    skill: "Vitrier professionnel",
    location: "Accra, Ghana",
    rating: 4.8,
    reviews: 82,
    badge: "Top",
    badgeColor: "bg-emerald-500 text-white",
    avatar: "KA",
    avatarColor: "bg-indigo-500",
    image: "/images/artisan-glassmaker.png",
  },
  {
    name: "Adama Bâ",
    skill: "Plâtrier qualifié",
    location: "Dakar, Sénégal",
    rating: 4.6,
    reviews: 58,
    badge: "Vérifié",
    badgeColor: "bg-teal-500 text-white",
    avatar: "AB",
    avatarColor: "bg-neutral-500",
    image: "/images/artisan-plasterer.png",
  },
  {
    name: "Ramatoulaye Dia",
    skill: "Pâtissière",
    location: "Dakar, Sénégal",
    rating: 4.9,
    reviews: 210,
    badge: "Élite",
    badgeColor: "bg-brand-500 text-white",
    avatar: "RD",
    avatarColor: "bg-yellow-500",
    image: "/images/artisan-baker.png",
  },
  {
    name: "Awa Ndiaye",
    skill: "Coiffeuse professionnelle",
    location: "Abidjan, Côte d'Ivoire",
    rating: 4.8,
    reviews: 165,
    badge: "Top",
    badgeColor: "bg-emerald-500 text-white",
    avatar: "AN",
    avatarColor: "bg-fuchsia-500",
    image: "/images/artisan-hairdresser.png",
  },
]

const howItWorks = [
  {
    step: "01",
    title: "Décrivez",
    description: "Décrivez votre projet en quelques clics. Précisez le type de service, la localisation et vos préférences.",
    icon: Search,
    color: "from-brand-500 to-brand-500",
  },
  {
    step: "02",
    title: "Recevez",
    description: "Recevez des propositions d'artisans qualifiés et vérifiés près de chez vous dans les minutes qui suivent.",
    icon: MessageSquare,
    color: "from-emerald-500 to-teal-500",
  },
  {
    step: "03",
    title: "Choisissez",
    description: "Comparez les profils, avis et tarifs. Choisissez l'artisan idéal et réservez en toute confiance.",
    icon: CheckCircle2,
    color: "from-brand-500 to-brand-500",
  },
]

const recentMissions = [
  { service: "Réparation de plomberie", city: "Cotonou", time: "Il y a 12 min", status: "Artisan assigné", icon: Droplets, color: "bg-blue-100 text-blue-600" },
  { service: "Installation électrique", city: "Abomey-Calavi", time: "Il y a 34 min", status: "Devis reçu", icon: Zap, color: "bg-brand-100 text-brand-600" },
  { service: "Peinture intérieure", city: "Porto-Novo", time: "Il y a 1 h", status: "Mission terminée", icon: Paintbrush, color: "bg-emerald-100 text-emerald-600" },
  { service: "Réparation climatisation", city: "Parakou", time: "Il y a 2 h", status: "Artisan en route", icon: Wind, color: "bg-cyan-100 text-cyan-600" },
]

const localOffers = [
  { city: "Cotonou", title: "Devis gratuits sur le domicile", offer: "0 F de frais de demande", color: "from-brand-500 to-brand-600" },
  { city: "Abomey-Calavi", title: "Urgence dépannage 24/7", offer: "Intervention prioritaire", color: "from-emerald-500 to-teal-600" },
  { city: "Porto-Novo", title: "Petits travaux à domicile", offer: "Artisans disponibles", color: "from-violet-500 to-fuchsia-600" },
]

const testimonials = [
  {
    name: "Ousmane Ba",
    role: "Propriétaire à Dakar",
    text: "FINDA m'a permis de trouver un plombier exceptionnel en moins de 30 minutes. Le service était rapide, professionnel et le prix très raisonnable. Je recommande vivement !",
    rating: 5,
    avatar: "OB",
    avatarColor: "bg-brand-500",
  },
  {
    name: "Aminata Koné",
    role: "Gérante d'hôtel à Abidjan",
    text: "Nous utilisons FINDA pour tous nos besoins en maintenance. La qualité des artisans est constante et le support est toujours disponible. Un partenaire de confiance.",
    rating: 5,
    avatar: "AK",
    avatarColor: "bg-emerald-500",
  },
  {
    name: "Jean-Pierre Aka",
    role: "Architecte à Lomé",
    text: "En tant qu'architecte, j'ai besoin d'artisans fiables pour mes projets. FINDA m'offre un vivier de professionnels vérifiés avec des avis authentiques. Indispensable !",
    rating: 5,
    avatar: "JA",
    avatarColor: "bg-brand-500",
  },
  {
    name: "Mariam Doumbia",
    role: "Restauratrice à Bamako",
    text: "Mon restaurant avait un problème électrique urgent un dimanche soir. Grâce à FINDA, un électricien est arrivé en 45 minutes. Service au top, je suis cliente pour la vie !",
    rating: 4,
    avatar: "MD",
    avatarColor: "bg-teal-500",
  },
  {
    name: "Ibrahim Diarra",
    role: "Entrepreneur à Conakry",
    text: "La plateforme m'a permis de développer mon réseau d'artisans partenaires. La géolocalisation et les avis vérifiés me font gagner un temps précieux sur chaque chantier.",
    rating: 5,
    avatar: "ID",
    avatarColor: "bg-cyan-500",
  },
]

const trustFeatures = [
  {
    icon: Shield,
    title: "Identité Vérifiée",
    description: "Chaque artisan passe par un processus de vérification d'identité rigoureux avant de rejoindre la plateforme.",
    color: "text-brand-500",
    bg: "bg-brand-50 dark:bg-brand-950/30",
  },
  {
    icon: MessageSquare,
    title: "Avis Authentiques",
    description: "Seuls les clients ayant réellement utilisé un service peuvent laisser un avis. Transparence totale.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: CreditCard,
    title: "Paiement Sécurisé",
    description: "Vos transactions sont protégées par un système de paiement sécurisé avec retention jusqu'à validation du travail.",
    color: "text-brand-500",
    bg: "bg-brand-50 dark:bg-brand-950/30",
  },
  {
    icon: Headphones,
    title: "Support 24/7",
    description: "Notre équipe est disponible à tout moment pour vous accompagner et résoudre tout problème éventuel.",
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/30",
  },
  {
    icon: ThumbsUp,
    title: "Satisfaction Garantie",
    description: "Si le travail ne correspond pas à la description, nous vous remboursons. Votre satisfaction est notre priorité.",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    icon: Navigation,
    title: "Géolocalisation",
    description: "Trouvez les artisans les plus proches de vous grâce à notre système de géolocalisation en temps réel.",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
  },
]

const faqItems = [
  {
    question: "Comment fonctionne FINDA ?",
    answer: "FINDA est une plateforme qui met en relation les clients avec des artisans qualifiés et vérifiés à travers l'Afrique. Il vous suffit de décrire votre besoin, de recevoir des propositions d'artisans, et de choisir celui qui vous convient le mieux. Le processus est simple, rapide et sécurisé.",
  },
  {
    question: "Comment les artisans sont-ils vérifiés ?",
    answer: "Chaque artisan doit passer par un processus de vérification en plusieurs étapes : vérification d'identité avec pièce d'identité officielle, vérification des certifications et diplômes, contrôle des références professionnelles, et période probatoire avec suivi des premiers avis clients.",
  },
  {
    question: "Quels sont les moyens de paiement acceptés ?",
    answer: "Nous acceptons plusieurs moyens de paiement : cartes bancaires (Visa, Mastercard), Mobile Money (Orange Money, MTN Money, Wave), virements bancaires, et paiement en espèces via nos points de service. Tous les paiements sont sécurisés.",
  },
  {
    question: "Que se passe-t-il si je ne suis pas satisfait du travail ?",
    answer: "Votre satisfaction est notre priorité. Si le travail ne correspond pas à la description initiale, vous pouvez signaler un litige dans les 48 heures. Notre équipe de médiation examinera votre dossier et vous pourrez bénéficier d'un remboursement partiel ou total selon le cas.",
  },
  {
    question: "Dans quels pays FINDA est-il disponible ?",
    answer: "FINDA est actuellement disponible dans 15 pays africains : Sénégal, Côte d'Ivoire, Ghana, Togo, Mali, Guinée, Bénin, Burkina Faso, Cameroun, Gabon, Congo, RDC, Niger, Mauritanie et Cap-Vert. Nous étendons régulièrement notre couverture.",
  },
  {
    question: "Comment devenir artisan sur la plateforme ?",
    answer: "Pour rejoindre FINDA, créez un compte artisan, soumettez vos documents de vérification (identité, certifications, références), complétez votre profil avec vos compétences et tarifs, puis passez l'entretien de validation. Une fois approuvé, vous pourrez recevoir des demandes de clients.",
  },
]

const footerLinks = {
  platform: [
    { label: "Comment ça marche", href: "#comment-ca-marche" },
    { label: "Tarification", href: "#tarifs" },
    { label: "Devenir artisan", href: "/become-artisan" },
    { label: "Centre d'aide", href: "/support" },
  ],
  services: [
    { label: "Plomberie", href: "/search?category=Plomberie" },
    { label: "Électricité", href: "/search?category=Électricité" },
    { label: "Menuiserie", href: "/search?category=Menuiserie" },
    { label: "Peinture", href: "/search?category=Peinture" },
    { label: "Climatisation", href: "/search?category=Climatisation" },
    { label: "Nettoyage", href: "/search?category=Nettoyage" },
    { label: "Soudure", href: "/search?category=Soudure" },
    { label: "Carrelage", href: "/search?category=Carrelage" },
    { label: "Couture", href: "/search?category=Couture" },
    { label: "Mécanique", href: "/search?category=Mécanique" },
    { label: "Coiffure", href: "/search?category=Coiffure" },
    { label: "Pâtisserie", href: "/search?category=Pâtisserie" },
    { label: "Paysagisme", href: "/search?category=Paysagisme" },
    { label: "Photographie", href: "/search?category=Photographie" },
  ],
  company: [
    { label: "À propos", href: "/informations" },
    { label: "Devenir artisan", href: "/become-artisan" },
    { label: "Nous contacter", href: "/contact" },
    { label: "Support", href: "/support" },
  ],
  legal: [
    { label: "Conditions d'utilisation", href: "/cgu" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Cookies", href: "/confidentialite#cookies" },
  ],
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ animation helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (value <= 0) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setDisplayValue(value)
      return
    }

    let frame = 0
    const startedAt = performance.now()
    const duration = 900
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      setDisplayValue(value * (1 - Math.pow(1 - progress, 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{decimals ? displayValue.toFixed(decimals) : Math.round(displayValue).toLocaleString('fr-FR')}</>
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Landing Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function LandingPage({ onOpenAuth, onSearch, onViewMap }: { onOpenAuth: (tab?: 'login' | 'register') => void; onSearch: (query: string, location: string) => void; onViewMap: () => void }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLocation, setSearchLocation] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [userCoordinates, setUserCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [registeredArtisans, setRegisteredArtisans] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [platformStats, setPlatformStats] = useState({ artisans: 0, missions: 0, rating: 0, countries: 0 })
  const [estimateService, setEstimateService] = useState("Plomberie")
  const [estimateSize, setEstimateSize] = useState(1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/artisans?location=Cotonou&limit=10')
      .then((r) => r.json())
      .then((data) => setRegisteredArtisans(Array.isArray(data.artisans) ? data.artisans : []))
      .catch(() => setRegisteredArtisans([]))
  }, [])

  useEffect(() => {
    fetch('/api/categories/counts')
      .then((r) => r.json())
      .then((data) => {
        if (data.counts) setCategoryCounts(data.counts)
      })
      .catch(() => {})

    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => setPlatformStats({
        artisans: Number(data.artisans?.total || 0),
        missions: Number(data.missions?.total || 0),
        rating: Number(data.averageRating || 0),
        countries: Number(data.countries?.total || 0),
      }))
      .catch(() => {})
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setRecentSearches((current) => [searchQuery.trim(), ...current.filter((item) => item !== searchQuery.trim())].slice(0, 4))
    onSearch(searchQuery.trim(), searchLocation.trim())
    window.setTimeout(() => setIsSearching(false), 700)
  }

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as typeof window & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition || (window as typeof window & { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setLocationError("La recherche vocale n’est pas disponible sur ce navigateur.")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = "fr-FR"
    recognition.interimResults = false
    recognition.onresult = (event: any) => setSearchQuery(event.results[0][0].transcript)
    recognition.onerror = () => setLocationError("Impossible de reconnaître votre demande. Réessayez ou saisissez-la.")
    recognition.start()
  }

  const enableMissionNotifications = async () => {
    if (!("Notification" in window)) {
      setLocationError("Les notifications ne sont pas prises en charge sur cet appareil.")
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      new Notification("FINDA", { body: "Les missions proches de vous seront bientôt affichées ici." })
    }
  }

  const locateUser = () => {
    setLocationError("")
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n’est pas disponible sur cet appareil.")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserCoordinates({ latitude: coords.latitude, longitude: coords.longitude })
        setSearchLocation(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`)
        setIsLocating(false)
      },
      (error) => {
        setIsLocating(false)
        setLocationError(error.code === error.PERMISSION_DENIED
          ? "Autorisez la localisation pour trouver les artisans près de vous."
          : "Impossible de déterminer votre position pour le moment.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  return (
    <>
      {/* ────────── HERO ────────── */}
      <section id="top-search" className="relative pt-28 pb-10 sm:pt-36 sm:pb-16 overflow-hidden">
        {/* Static background image (video removed for better PWA/mobile) */}
        <motion.div
          className="absolute inset-0 w-full h-full overflow-hidden bg-center bg-cover opacity-90"
          style={{ backgroundImage: "url('/images/hero-family.png')" }}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1, x: [0, 4, 0] }}
          transition={{ scale: { duration: 1.2 }, x: { duration: 12, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/75 to-background" />
        </motion.div>
        <div className="hero-glow absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="hero-particles absolute inset-x-0 top-0 h-[75%] overflow-hidden pointer-events-none" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => <span key={index} className={`hero-particle hero-particle-${index + 1}`} />)}
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0, y: [0, -7, 0] }}
            transition={{ opacity: { delay: .8, duration: .5 }, x: { delay: .8, duration: .5 }, y: { delay: 1.3, duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
            className="hidden xl:flex absolute right-0 top-36 w-60 items-center gap-3 rounded-2xl border border-white/20 bg-white/90 p-3 shadow-2xl backdrop-blur dark:bg-neutral-950/90"
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 font-bold text-white">
              AD
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,.9)]" />
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-bold">Amadou Diallo</p>
              <p className="text-xs text-muted-foreground">Disponible près de vous</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-brand-600"><Star className="h-3 w-3 fill-brand-400 text-brand-400" /> 4.9 · Intervention rapide</p>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 gap-10 items-center max-w-3xl mx-auto text-center">
            {/* Left: Text content */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={fadeInUp}>
                <Badge
                  variant="secondary"
                  className="mb-6 px-4 py-1.5 text-sm border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300"
                >
                  La 1ère plateforme d&apos;artisans en Afrique
                </Badge>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                {['Trouvez', 'l\'artisan'].map((word, index) => (
                  <motion.span key={word} className="inline-block mr-[0.24em]" initial={{ opacity: 0, y: 24, rotateX: -35 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.2 + index * 0.09, duration: 0.55 }}>{word}</motion.span>
                ))}
                <motion.span className="inline-block mr-[0.24em] bg-gradient-to-r from-brand-500 via-brand-500 to-brand-600 bg-clip-text text-transparent" initial={{ opacity: 0, y: 24, rotateX: -35 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.38, duration: 0.55 }}>parfait</motion.span>
                {' '}pour chaque projet
              </motion.h1>

              <motion.p variants={fadeInUp} className="mt-6 text-lg sm:text-xl text-muted-foreground">
                Connectez-vous avec des artisans qualifiés et vérifiés à travers l&apos;Afrique.
                Service rapide, prix transparent, satisfaction garantie.
              </motion.p>

              {/* Search bar */}
              <motion.div variants={fadeInUp} className="mt-8">
                <Card className="p-2 shadow-xl border-border/50">
                  <form onSubmit={handleSearch}>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Quel service recherchez-vous ?"
                          className="pl-10 h-12 border-0 bg-muted/50 focus-visible:ring-1"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          onFocus={() => setSearchQuery(searchQuery)}
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={startVoiceSearch}
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950"
                          aria-label="Recherche vocale"
                          title="Recherche vocale"
                        ><Mic className="h-4 w-4" /></button>
                        {searchQuery.trim() && (
                          <div className="absolute z-30 left-0 right-0 top-[calc(100%+0.5rem)] max-h-52 overflow-auto rounded-xl border bg-background p-1 shadow-2xl">
                            {quickCategories.filter(category => category.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6).map(category => (
                              <button key={category} type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50 dark:hover:bg-brand-950/40" onClick={() => setSearchQuery(category)}>
                                <Search className="h-3.5 w-3.5 text-brand-500" />{category}
                              </button>
                            ))}
                            {quickCategories.filter(category => category.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                              <p className="px-3 py-2 text-sm text-muted-foreground">Appuyez sur Entrée pour lancer la recherche.</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Ville ou position GPS"
                          className="pl-10 pr-12 h-12 border-0 bg-muted/50 focus-visible:ring-1"
                          value={searchLocation}
                          onChange={e => {
                            setSearchLocation(e.target.value)
                            setUserCoordinates(null)
                          }}
                        />
                        <button
                          type="button"
                          onClick={locateUser}
                          disabled={isLocating}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-brand-600 hover:bg-brand-50 disabled:opacity-50 dark:hover:bg-brand-950"
                          aria-label="Utiliser ma position précise"
                          title="Utiliser ma position précise"
                        >
                          {isLocating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button type="submit" disabled={isSearching || !searchQuery.trim()} className="hero-search-button h-12 px-8 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white border-0 disabled:opacity-70">
                        {isSearching ? <LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                        {isSearching ? 'Recherche...' : 'Rechercher'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
              {(locationError || userCoordinates) && (
                <p className={`mt-2 text-xs ${locationError ? "text-red-600" : "text-brand-600"}`} role="status">
                  {locationError || `Position détectée avec précision (${userCoordinates?.latitude.toFixed(6)}, ${userCoordinates?.longitude.toFixed(6)}).`}
                </p>
              )}

              {/* Popular cities */}
              <motion.div variants={fadeInUp} className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="mr-1 text-xs font-semibold text-muted-foreground">Populaire :</span>
                {["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou"].map((city) => (
                  <Badge
                    key={city}
                    variant="outline"
                    className="cursor-pointer px-3 py-1 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                    asChild
                  >
                    <button type="button" onClick={() => setSearchLocation(city)}>{city}</button>
                  </Badge>
                ))}
              </motion.div>

              {/* Quick category pills */}
              <motion.div variants={fadeInUp} className="mt-3 flex flex-wrap justify-center gap-2">
                {quickCategories.map((cat) => (
                  <Badge
                    key={cat}
                    asChild
                    variant="outline"
                    className="cursor-pointer px-4 py-1.5 text-sm hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                  >
                    <button type="button" onClick={() => onSearch(cat, searchLocation)}>{cat}</button>
                  </Badge>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="mt-4 flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  className="gap-2 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/50"
                  onClick={onViewMap}
                >
                  <Navigation className="h-4 w-4" />
                  Voir la carte des artisans
                </Button>
                <Button
                  variant="ghost"
                  className="gap-2 text-brand-700 dark:text-brand-300 hover:bg-brand-50"
                  onClick={() => router.push('/missions/create')}
                >
                  <Siren className="h-4 w-4" />
                  Publier une demande urgente
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {statsTemplate.map((stat) => {
              const rawValue = platformStats[stat.key]
              return (
                <motion.div key={stat.label} variants={fadeInUp} className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950/50">
                    <stat.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold">
                    <AnimatedNumber value={rawValue} decimals={stat.key === 'rating' ? 1 : 0} />
                    {stat.key === 'rating' ? '/5' : ''}
                  </span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </motion.div>
              )
            })}
          </motion.div>
          <motion.a
            href="#categories"
            aria-label="Découvrir les catégories"
            className="mx-auto mt-10 flex h-9 w-9 items-center justify-center rounded-full border border-brand-300/60 text-brand-600 dark:text-brand-300"
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="h-4 w-4" />
          </motion.a>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ TRUST SIGNALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border-y border-border/60 bg-background/80 py-5 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 md:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { Icon: Shield, label: 'Artisans vérifiés' },
            { Icon: Star, label: 'Avis authentiques' },
            { Icon: CreditCard, label: 'Paiement sécurisé' },
            { Icon: Headphones, label: 'Assistance disponible' },
          ].map(({ Icon, label }, index) => (
            <motion.div key={label} initial={{ opacity: 0, scale: .92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
              <Icon className="h-5 w-5 text-brand-500" />
              <span>{label}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ANIMATED STATS & CHARTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatedStats />

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ CATEGORIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="categories" className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Explorez nos{" "}
              <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">catégories</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Des milliers d&apos;artisans spécialisés dans tous les corps de métier, prêts à intervenir près de chez vous.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <motion.div key={cat.name} variants={fadeInUp} whileHover={{ y: -7, rotateY: 3, scale: 1.025 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }} style={{ transformPerspective: 800 }}>
                <Card
                  className="group cursor-pointer border-border/50 hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:shadow-lg hover:-translate-y-1"
                  onClick={() => router.push(`/search?category=${encodeURIComponent(cat.name)}`)}
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center gap-2">
                    <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${cat.color}`}>
                      <cat.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base">{cat.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {categoryCounts[cat.name] !== undefined
                        ? `${categoryCounts[cat.name]} artisan${categoryCounts[cat.name] !== 1 ? 's' : ''}`
                        : cat.count}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="mt-10 text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50"
              onClick={() => router.push('/search')}
            >
              Voir tous les artisans inscrits
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-10"><div className="mx-auto max-w-7xl px-4 text-center"><Button size="lg" variant="outline" className="gap-2" onClick={() => router.push("/informations") }><span>Voir plus d’informations</span><ArrowRight className="h-4 w-4" /></Button></div></section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ POPULAR ARTISANS CAROUSEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="artisans" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Nos artisans{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">en action</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Découvrez les artisans réellement inscrits à Cotonou et dans ses environs.
            </motion.p>
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {registeredArtisans.map((artisan: any, index: number) => {
                  const name = artisan.user?.name || 'Artisan Finda'
                  const initials = name.split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase()
                  const skill = artisan.profession || artisan.specialties || 'Artisan'
                  const location = artisan.user?.location || 'Cotonou, Bénin'
                  const photo = artisan.user?.avatar || artisan.user?.image
                  return (
                    <CarouselItem key={artisan.id || name} className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08, duration: 0.45 }} className="h-full">
                        <motion.div whileHover={{ y: -8, rotateX: 2 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className="h-full">
                        <Card className="group hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:shadow-xl overflow-hidden h-full">
                          <div className="relative h-72 overflow-hidden bg-gradient-to-br from-brand-500 to-emerald-600">
                            {photo ? <Image src={photo} alt={`${name} — ${skill}`} fill className="object-cover transition-transform duration-700 group-hover:scale-110" /> : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                            {(artisan.user?.isVerified || artisan.isPremium) && <Badge className="absolute top-3 right-3 border-0 bg-teal-500 text-white shadow-md">Vérifié</Badge>}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-brand-500 text-xs font-bold text-white shadow-md">{initials}</div>
                                <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-white">{name}</h3><p className="truncate text-xs text-white/80">{skill}</p></div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-white/70"><MapPin className="h-3 w-3" /><span className="truncate">{location}</span></div>
                                <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-brand-400 text-brand-400" /><span className="text-xs font-bold text-white">{Number(artisan.rating || 0).toFixed(1)}</span></div>
                              </div>
                            </div>
                          </div>
                        </Card>
                        </motion.div>
                      </motion.div>
                    </CarouselItem>
                  )
                })}
                {registeredArtisans.length === 0 && <CarouselItem className="pl-4 basis-full"><div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">Aucun artisan enregistré à Cotonou pour le moment.</div></CarouselItem>}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex -left-12" />
              <CarouselNext className="hidden sm:flex -right-12" />
            </Carousel>
          </motion.div>
        </div>
      </section>

      {/* ────────── HOW IT WORKS ────────── */}
      <section id="comment-ca-marche" className="relative py-20 sm:py-28 bg-muted/30 overflow-hidden">
        {/* Decorative images removed for mobile-first PWA */}

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Mobile images removed to optimize mobile-first PWA */}

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Comment ça{" "}
              <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">marche</span>{" "}?
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Trois étapes simples pour trouver l&apos;artisan idéal et réaliser votre projet en toute sérénité.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((step, idx) => (
              <motion.div key={step.step} variants={fadeInUp} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="relative">
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[calc(50%+60px)] w-[calc(100%-120px)] h-0.5 bg-gradient-to-r from-brand-300 to-brand-300 dark:from-brand-700 dark:to-brand-700" />
                )}
                <Card className="text-center border-border/50 hover:shadow-lg transition-shadow h-full bg-background/95 backdrop-blur">
                  <CardContent className="p-8">
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg mb-6`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-sm font-bold text-brand-600 dark:text-brand-400 mb-2">Étape {step.step}</div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ RECENT MISSIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="mb-10 text-center">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">Dernières missions <span className="text-brand-600">près de chez vous</span></motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground">Suivez l’activité locale et trouvez rapidement un professionnel disponible.</motion.p>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {recentMissions.map((mission) => (
              <Card key={`${mission.city}-${mission.service}`} className="border-border/50 hover:-translate-y-1 hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${mission.color}`}><mission.icon className="h-5 w-5" /></div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3 w-3" />{mission.time}</span>
                  </div>
                  <h3 className="mt-4 font-semibold">{mission.service}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{mission.city}</p>
                  <Badge variant="secondary" className="mt-4 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">{mission.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center"><Button variant="outline" onClick={() => router.push('/missions/create')}>Publier ma demande<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ GUARANTEES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="mb-12 text-center">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">Réservez en toute <span className="text-brand-600">confiance</span></motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground">Des protections simples pour sécuriser chaque intervention.</motion.p>
          </motion.div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              [BadgeCheck, "Profils vérifiés", "Identité, compétences et références contrôlées."],
              [CreditCard, "Paiement protégé", "Vos fonds restent sécurisés jusqu’à la validation."],
              [MessageSquare, "Médiation rapide", "Notre équipe accompagne le client et l’artisan."],
              [ThumbsUp, "Garantie satisfaction", "Ouvrez un litige et obtenez une solution adaptée."],
            ].map(([Icon, title, description]) => {
              const GuaranteeIcon = Icon as typeof Shield
              return <Card key={String(title)} className="h-full"><CardContent className="p-6"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/30"><GuaranteeIcon className="h-6 w-6" /></div><h3 className="mt-5 font-bold">{String(title)}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{String(description)}</p></CardContent></Card>
            })}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ LOCAL OFFERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr_1fr]">
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-brand-500 to-brand-700 text-white lg:row-span-2">
              <CardContent className="flex h-full flex-col justify-between p-7 sm:p-8">
                <div><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15"><TicketPercent className="h-6 w-6" /></div><p className="mt-6 text-sm font-semibold text-white/75">BONS PLANS LOCAUX</p><h2 className="mt-2 text-3xl font-bold">Plus de services, près de chez vous.</h2><p className="mt-4 text-white/80">Comparez les artisans disponibles et profitez des avantages proposés dans votre ville.</p></div>
                <Button className="mt-8 w-fit bg-white text-brand-700 hover:bg-white/90" onClick={() => router.push('/search')}>Voir les offres<ArrowRight className="ml-2 h-4 w-4" /></Button>
              </CardContent>
            </Card>
            {localOffers.map((offer) => (
              <Card key={offer.city} className="overflow-hidden border-border/50"><div className={`h-1.5 bg-gradient-to-r ${offer.color}`} /><CardContent className="p-6"><Badge variant="outline" className="text-brand-600"><MapPin className="mr-1 h-3 w-3" />{offer.city}</Badge><h3 className="mt-4 text-lg font-bold">{offer.title}</h3><p className="mt-2 text-sm text-muted-foreground">{offer.offer}</p><Button variant="link" className="mt-3 h-auto p-0 text-brand-600" onClick={() => { setSearchLocation(offer.city); document.getElementById('top-search')?.scrollIntoView({ behavior: 'smooth' }) }}>Rechercher dans cette ville<ChevronRight className="ml-1 h-4 w-4" /></Button></CardContent></Card>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ TESTIMONIALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="temoignages" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Ce que nos{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">clients</span>{" "}disent
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Des milliers de clients satisfaits font confiance à FINDA chaque jour.
            </motion.p>
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {testimonials.map((t) => (
                  <CarouselItem key={t.name} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full border-border/50 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-center gap-1 mb-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-brand-400 text-brand-400" : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"}`} />
                          ))}
                        </div>
                        <p className="text-muted-foreground flex-1 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/50">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${t.avatarColor}`}>{t.avatar}</div>
                          <div>
                            <p className="font-semibold text-sm">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex -left-12" />
              <CarouselNext className="hidden sm:flex -right-12" />
            </Carousel>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ESTIMATEUR & NOTIFICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-brand-50/60 via-background to-emerald-50/40 dark:from-brand-950/20 dark:to-emerald-950/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.div variants={fadeInUp}><Badge variant="secondary" className="bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"><Calculator className="mr-1 h-3 w-3" />Estimation gratuite</Badge></motion.div>
              <motion.h2 variants={fadeInUp} className="mt-4 text-3xl font-bold sm:text-4xl">Obtenez une idée du budget avant de commencer.</motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground">Sélectionnez un service et estimez rapidement l’enveloppe à prévoir. Le tarif final reste validé avec l’artisan.</motion.p>
              {recentSearches.length > 0 && <motion.div variants={fadeInUp} className="mt-5 flex flex-wrap gap-2"><span className="text-sm font-medium text-muted-foreground">Recherches récentes :</span>{recentSearches.map((item) => <Badge key={item} variant="outline" className="cursor-pointer" onClick={() => setSearchQuery(item)}>{item}</Badge>)}</motion.div>}
            </motion.div>
            <Card className="shadow-xl"><CardContent className="p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div><label className="text-sm font-semibold">Type de service</label><select className="mt-2 h-11 w-full rounded-md border bg-background px-3" value={estimateService} onChange={(event) => setEstimateService(event.target.value)}><option>Plomberie</option><option>Électricité</option><option>Peinture</option><option>Menuiserie</option><option>Climatisation</option><option>Nettoyage</option></select></div>
                <div><label className="text-sm font-semibold">Nombre de pièces / points</label><Input className="mt-2 h-11" type="number" min={1} max={20} value={estimateSize} onChange={(event) => setEstimateSize(Math.max(1, Number(event.target.value) || 1))} /></div>
              </div>
              {(() => {
                const prices: Record<string, number> = { Plomberie: 8500, Électricité: 12000, Peinture: 6500, Menuiserie: 15000, Climatisation: 18000, Nettoyage: 5500 }
                const low = prices[estimateService] * estimateSize
                return <div className="mt-7 rounded-2xl border border-brand-200 bg-brand-50/70 p-5 dark:border-brand-900 dark:bg-brand-950/30"><p className="text-sm text-muted-foreground">Estimation indicative</p><p className="mt-1 text-3xl font-bold text-brand-700 dark:text-brand-300">{low.toLocaleString('fr-FR')} – {(low * 1.55).toLocaleString('fr-FR')} F CFA</p><Button className="mt-5" onClick={() => router.push(`/missions/create?category=${encodeURIComponent(estimateService)}`)}>Obtenir un devis précis<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
              })()}
            </CardContent></Card>
          </div>
          <Card className="mt-6 border-brand-200/70"><CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><Bell className="h-5 w-5" /></div><div><p className="font-semibold">Recevoir les missions près de chez vous</p><p className="text-sm text-muted-foreground">Activez les notifications sur cet appareil.</p></div></div><Button variant="outline" onClick={enableMissionNotifications}>Activer les notifications</Button></CardContent></Card>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ VERIFIED PHOTO REVIEWS & PARTNERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center"><Badge variant="outline"><Camera className="mr-1 h-3 w-3" />Preuves vérifiées</Badge><h2 className="mt-4 text-3xl font-bold sm:text-4xl">Des avis, mais surtout des réalisations.</h2><p className="mt-4 text-lg text-muted-foreground">Découvrez les retours accompagnés de photos de travaux vérifiées.</p></div>
          <div className="grid gap-5 md:grid-cols-3">
            {[{ service: "Salle de bain rénovée", name: "Awa S.", note: "Très professionnel, propre et ponctuel." }, { service: "Installation de climatisation", name: "Marc T.", note: "Conseils utiles et installation impeccable." }, { service: "Portail en menuiserie métallique", name: "Grâce A.", note: "Résultat fidèle au devis initial." }].map((review, index) => <Card key={review.service} className="overflow-hidden"><div className={`relative h-44 bg-gradient-to-br ${index === 0 ? "from-blue-100 to-cyan-200" : index === 1 ? "from-brand-100 to-emerald-200" : "from-violet-100 to-brand-200"}`}><div className="absolute inset-0 flex items-center justify-center"><Hammer className="h-12 w-12 text-neutral-700/40" /></div><Badge className="absolute left-4 top-4 bg-white text-emerald-700"><BadgeCheck className="mr-1 h-3 w-3" />Travail vérifié</Badge></div><CardContent className="p-5"><div className="flex items-center gap-1">{[1,2,3,4,5].map((star) => <Star key={star} className="h-4 w-4 fill-brand-400 text-brand-400" />)}</div><h3 className="mt-3 font-bold">{review.service}</h3><p className="mt-2 text-sm text-muted-foreground">« {review.note} »</p><p className="mt-4 text-xs font-semibold">{review.name} · Client FINDA</p></CardContent></Card>)}
          </div>
          <div className="mt-14 border-t pt-10"><p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">Solutions disponibles avec des partenaires locaux</p><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{["Orange Money", "MTN MoMo", "Wave", "Assurances partenaires"].map((partner) => <div key={partner} className="flex h-16 items-center justify-center rounded-xl border bg-background px-3 text-center text-sm font-bold text-muted-foreground">{partner}</div>)}</div></div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ TARIFS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <PricingSection />

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ARTISAN RECRUITMENT & PWA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden border-0 bg-neutral-950 text-white">
              <CardContent className="p-7 sm:p-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500"><Briefcase className="h-6 w-6" /></div>
                <Badge className="mt-6 bg-brand-500 text-white">Pour les artisans</Badge>
                <h2 className="mt-4 text-3xl font-bold">Développez votre activité avec FINDA.</h2>
                <p className="mt-4 max-w-xl text-neutral-300">Recevez des missions qualifiées près de chez vous, gérez vos demandes et construisez une réputation durable.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3"><div><strong className="text-2xl text-brand-400">+40%</strong><p className="mt-1 text-xs text-neutral-400">de visibilité moyenne</p></div><div><strong className="text-2xl text-brand-400">24/7</strong><p className="mt-1 text-xs text-neutral-400">accès à vos demandes</p></div><div><strong className="text-2xl text-brand-400">0 F</strong><p className="mt-1 text-xs text-neutral-400">pour créer votre profil</p></div></div>
                <Button className="mt-7 bg-brand-500 text-white hover:bg-brand-600" onClick={() => window.location.href='/become-artisan'}>Créer mon profil artisan<ArrowRight className="ml-2 h-4 w-4" /></Button>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-brand-200 bg-gradient-to-br from-white to-brand-50 dark:border-brand-900 dark:from-neutral-950 dark:to-brand-950/30">
              <CardContent className="flex h-full flex-col justify-center p-7 sm:p-9">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg"><Smartphone className="h-7 w-7" /></div>
                <Badge variant="secondary" className="mt-6 w-fit bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">Application FINDA</Badge>
                <h2 className="mt-4 text-3xl font-bold">FINDA dans votre poche.</h2>
                <p className="mt-4 text-muted-foreground">Installez l’application pour accéder plus rapidement aux missions, recevoir les notifications et garder vos échanges à portée de main.</p>
                <ul className="mt-5 space-y-3 text-sm"><li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-600" />Accès rapide depuis l’écran d’accueil</li><li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-600" />Notifications de nouvelles demandes</li><li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-600" />Interface optimisée pour mobile</li></ul>
                <Button variant="outline" className="mt-7 w-fit border-brand-300 text-brand-700" onClick={() => document.querySelector<HTMLElement>('[aria-label="Installer FINDA"]')?.click()}><Download className="mr-2 h-4 w-4" />Installer FINDA</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div><Badge variant="secondary" className="bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">Centre d’aide</Badge><h2 className="mt-4 text-3xl font-bold sm:text-4xl">Questions fréquentes</h2><p className="mt-4 text-muted-foreground">Tout ce qu’il faut savoir avant de publier une demande ou de réserver un artisan.</p><Button variant="outline" className="mt-6" onClick={() => router.push('/support')}>Consulter le centre d’aide<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
          <Accordion type="single" collapsible className="rounded-2xl border px-5 sm:px-7">
            {faqItems.slice(0, 5).map((item, index) => (
              <AccordionItem key={item.question} value={`home-faq-${index}`}><AccordionTrigger className="text-left font-semibold">{item.question}</AccordionTrigger><AccordionContent className="pb-5 leading-relaxed text-muted-foreground">{item.answer}</AccordionContent></AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 sm:py-28 bg-gradient-to-r from-brand-500 to-brand-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Prêt à trouver l&apos;artisan idéal ?
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Rejoignez des milliers de clients satisfaits et trouvez l&apos;artisan parfait pour votre projet.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-brand-600 hover:bg-white/90 h-12 px-8 font-semibold"
                onClick={() => window.location.href='/register'}
              >
                S&apos;inscrire gratuitement
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 h-12 px-8"
                onClick={() => window.location.href='/register'}
              >
                Devenir artisan
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer className="mt-auto bg-neutral-950 text-neutral-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand + Newsletter */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">FINDA</span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                La première plateforme africaine qui connecte les clients avec des artisans qualifiés et vérifiés.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                  <a key={idx} href="/contact" aria-label="Contacter FINDA" title="Contacter FINDA" className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 hover:bg-brand-500 transition-colors text-neutral-400 hover:text-white">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Plateforme</h4>
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.label}><a href={link.href} className="text-sm text-neutral-400 hover:text-brand-400 transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Services</h4>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.label}><a href={link.href} className="text-sm text-neutral-400 hover:text-brand-400 transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Légal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}><a href={link.href} className="text-sm text-neutral-400 hover:text-brand-400 transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">&copy; {new Date().getFullYear()} FINDA. Tous droits réservés.</p>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <a href="/cgu" className="hover:text-brand-400 transition-colors">Conditions</a>
              <a href="/confidentialite" className="hover:text-brand-400 transition-colors">Confidentialité</a>
              <a href="/confidentialite#cookies" className="hover:text-brand-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const { currentView, user, isAuthenticated, initializeAuth, search, setView, setSelectedArtisan, selectedArtisanId } = useAppStore()

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login')
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [callArtisan, setCallArtisan] = useState({ name: '', initials: '', color: '#f59e0b' })

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (currentView === 'dashboard' && isAuthenticated && user) {
      router.push('/dashboard')
    }
  }, [currentView, isAuthenticated, user, router])

  const handleOpenAuth = useCallback((tab?: 'login' | 'register') => {
    if (tab === 'register') { window.location.href = '/register' } else { window.location.href = '/login' }
  }, [])

  const handleSearch = useCallback((query: string, location: string) => {
    const gpsMatch = location.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
    if (gpsMatch) {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      params.set('lat', gpsMatch[1])
      params.set('lng', gpsMatch[2])
      router.push(`/search?${params.toString()}`)
      return
    }

    const filters: Record<string, string> = {}
    if (location) filters.location = location
    search(query, filters)
  }, [search, router])

  const handleViewArtisan = useCallback((id: string) => {
    setSelectedArtisan(id)
    setView('artisan-detail')
  }, [setSelectedArtisan, setView])

  const handleBackFromDetail = useCallback(() => {
    setSelectedArtisan(null)
    setView('search')
  }, [setSelectedArtisan, setView])

  const handleBackFromMap = useCallback(() => {
    setView('landing')
  }, [setView])

  const handleViewMap = useCallback(() => {
    setView('map')
  }, [setView])

  const handleBackFromPortfolio = useCallback(() => {
    setView('dashboard')
  }, [setView])

  const handleBackFromAdmin = useCallback(() => {
    setView('landing')
  }, [setView])

  const handleBackFromBooking = useCallback(() => {
    setView('dashboard')
  }, [setView])

  const handleBackFromPayment = useCallback(() => {
    setView('dashboard')
  }, [setView])

  const handleBackFromGamification = useCallback(() => {
    setView('dashboard')
  }, [setView])

  const handleBackFromQuotes = useCallback(() => {
    setView('dashboard')
  }, [setView])

  const handleBackFromEmergency = useCallback(() => {
    setView('landing')
  }, [setView])

  const handleBackFromReferral = useCallback(() => {
    setView('dashboard')
  }, [setView])

  /* â”€â”€â”€â”€â”€ Loading Screen â”€â”€â”€â”€â”€ */
  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-neutral-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-600 bg-clip-text text-transparent">
              FINDA
            </span>
          </div>
          <motion.div
            className="h-1 w-32 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-500"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <div className="min-h-screen flex flex-col">
        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ NAVBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {currentView !== 'onboarding' && (
          <Navbar onOpenAuth={handleOpenAuth} onSearch={handleSearch} />
        )}

        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MAIN CONTENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <main className={`flex-1 ${currentView !== 'onboarding' ? 'pt-16' : ''}`}>
          <AnimatePresence mode="wait">
            {currentView === 'landing' && (
              <LandingPage
                key="landing"
                onOpenAuth={handleOpenAuth}
                onSearch={handleSearch}
                onViewMap={handleViewMap}
              />
            )}

            {currentView === 'welcome' && isAuthenticated && user && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <WelcomeScreen
                  userName={user?.name?.split(' ')[0]}
                  onContinue={() => router.push('/dashboard')}
                />
              </motion.div>
            )}

            {currentView === 'dashboard' && isAuthenticated && user && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <a href="/dashboard" className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold transition">Mon Tableau de Bord</a>
              </motion.div>
            )}

            {currentView === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SearchResults onViewArtisan={handleViewArtisan} />
              </motion.div>
            )}

            {currentView === 'artisan-detail' && (
              <motion.div
                key="artisan-detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ArtisanDetail
                  artisanId={selectedArtisanId || ''}
                  onBack={handleBackFromDetail}
                />
              </motion.div>
            )}

            {currentView === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PortfolioUpload
                  onBack={handleBackFromPortfolio}
                />
              </motion.div>
            )}

            {currentView === 'map' && (
              <ArtisanMap
                onViewArtisan={handleViewArtisan}
                onBack={handleBackFromMap}
              />
            )}

            {currentView === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RealtimeChat
                  onBack={() => setView('dashboard')}
                  onCallArtisan={(name: string, initials: string, color: string) => {
                    setCallArtisan({ name, initials, color })
                    setCallModalOpen(true)
                  }}
                />
              </motion.div>
            )}

            {currentView === 'onboarding' && (
              <OnboardingFlow
                key="onboarding"
                onComplete={() => setView('dashboard')}
                onSkip={() => setView('dashboard')}
              />
            )}

            {currentView === 'admin' && user?.role === 'admin' && (
              <AdminDashboard
                key="admin"
                onBack={handleBackFromAdmin}
              />
            )}

            {currentView === 'booking' && (
              <motion.div
                key="booking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BookingCalendar onBack={handleBackFromBooking} />
              </motion.div>
            )}

            {currentView === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PaymentWallet onBack={handleBackFromPayment} />
              </motion.div>
            )}

            {currentView === 'gamification' && (
              <motion.div
                key="gamification"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GamificationSystem onBack={handleBackFromGamification} />
              </motion.div>
            )}

            {currentView === 'quotes' && (
              <motion.div
                key="quotes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <QuoteRequestSystem onBack={handleBackFromQuotes} />
              </motion.div>
            )}

            {currentView === 'emergency' && (
              <motion.div
                key="emergency"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EmergencyService onBack={handleBackFromEmergency} />
              </motion.div>
            )}

            {currentView === 'referral' && (
              <motion.div
                key="referral"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ReferralProgram onBack={handleBackFromReferral} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ AUTH MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <AuthModal open={false}
          onOpenChange={setAuthModalOpen}
          defaultTab={authModalTab}
        />

        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ CHATBOT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Chatbot />

        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ CALL MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <CallModal
          isOpen={callModalOpen}
          onClose={() => setCallModalOpen(false)}
          artisanName={callArtisan.name}
          artisanInitials={callArtisan.initials}
          artisanColor={callArtisan.color}
        />

        {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ PWA INSTALL PROMPT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <InstallPrompt />
      </div>
    </AnimatePresence>
  )
}