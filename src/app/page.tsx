'use client'

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
} from "lucide-react"

// Import our new components
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { ClientDashboard } from "@/components/client-dashboard"
import { ArtisanDashboard } from "@/components/artisan-dashboard"
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

/* ───────────── data ───────────── */

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

const stats = [
  { value: "10 000+", label: "Artisans", icon: Users },
  { value: "50 000+", label: "Missions", icon: Briefcase },
  { value: "4.8/5", label: "Satisfaction", icon: Heart },
  { value: "15+", label: "Pays", icon: Globe },
]

const categories = [
  { name: "Plomberie", icon: Droplets, count: "1 250 artisans", color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  { name: "Électricité", icon: Zap, count: "1 100 artisans", color: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  { name: "Menuiserie", icon: Hammer, count: "980 artisans", color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400" },
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
    badgeColor: "bg-amber-500 text-white",
    avatar: "AD",
    avatarColor: "bg-amber-500",
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
    badgeColor: "bg-amber-500 text-white",
    avatar: "KM",
    avatarColor: "bg-orange-500",
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
    badgeColor: "bg-amber-500 text-white",
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
    badgeColor: "bg-amber-500 text-white",
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
    badgeColor: "bg-amber-500 text-white",
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
    badgeColor: "bg-amber-500 text-white",
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
    color: "from-amber-500 to-orange-500",
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
    color: "from-orange-500 to-amber-500",
  },
]

const testimonials = [
  {
    name: "Ousmane Ba",
    role: "Propriétaire à Dakar",
    text: "Artisan Connect m'a permis de trouver un plombier exceptionnel en moins de 30 minutes. Le service était rapide, professionnel et le prix très raisonnable. Je recommande vivement !",
    rating: 5,
    avatar: "OB",
    avatarColor: "bg-amber-500",
  },
  {
    name: "Aminata Koné",
    role: "Gérante d'hôtel à Abidjan",
    text: "Nous utilisons Artisan Connect pour tous nos besoins en maintenance. La qualité des artisans est constante et le support est toujours disponible. Un partenaire de confiance.",
    rating: 5,
    avatar: "AK",
    avatarColor: "bg-emerald-500",
  },
  {
    name: "Jean-Pierre Aka",
    role: "Architecte à Lomé",
    text: "En tant qu'architecte, j'ai besoin d'artisans fiables pour mes projets. Artisan Connect m'offre un vivier de professionnels vérifiés avec des avis authentiques. Indispensable !",
    rating: 5,
    avatar: "JA",
    avatarColor: "bg-orange-500",
  },
  {
    name: "Mariam Doumbia",
    role: "Restauratrice à Bamako",
    text: "Mon restaurant avait un problème électrique urgent un dimanche soir. Grâce à Artisan Connect, un électricien est arrivé en 45 minutes. Service au top, je suis cliente pour la vie !",
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
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
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
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
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
    question: "Comment fonctionne Artisan Connect ?",
    answer: "Artisan Connect est une plateforme qui met en relation les clients avec des artisans qualifiés et vérifiés à travers l'Afrique. Il vous suffit de décrire votre besoin, de recevoir des propositions d'artisans, et de choisir celui qui vous convient le mieux. Le processus est simple, rapide et sécurisé.",
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
    question: "Dans quels pays Artisan Connect est-il disponible ?",
    answer: "Artisan Connect est actuellement disponible dans 15 pays africains : Sénégal, Côte d'Ivoire, Ghana, Togo, Mali, Guinée, Bénin, Burkina Faso, Cameroun, Gabon, Congo, RDC, Niger, Mauritanie et Cap-Vert. Nous étendons régulièrement notre couverture.",
  },
  {
    question: "Comment devenir artisan sur la plateforme ?",
    answer: "Pour rejoindre Artisan Connect, créez un compte artisan, soumettez vos documents de vérification (identité, certifications, références), complétez votre profil avec vos compétences et tarifs, puis passez l'entretien de validation. Une fois approuvé, vous pourrez recevoir des demandes de clients.",
  },
]

const footerLinks = {
  platform: [
    { label: "Comment ça marche", href: "#comment-ca-marche" },
    { label: "Tarification", href: "#" },
    { label: "Devenir artisan", href: "#" },
    { label: "Centre d'aide", href: "#" },
  ],
  services: [
    { label: "Plomberie", href: "#" },
    { label: "Électricité", href: "#" },
    { label: "Menuiserie", href: "#" },
    { label: "Peinture", href: "#" },
    { label: "Climatisation", href: "#" },
    { label: "Nettoyage", href: "#" },
    { label: "Soudure", href: "#" },
    { label: "Carrelage", href: "#" },
    { label: "Couture", href: "#" },
    { label: "Mécanique", href: "#" },
    { label: "Coiffure", href: "#" },
    { label: "Pâtisserie", href: "#" },
    { label: "Paysagisme", href: "#" },
    { label: "Photographie", href: "#" },
  ],
  company: [
    { label: "À propos", href: "#" },
    { label: "Carrières", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Presse", href: "#" },
  ],
  legal: [
    { label: "Conditions d'utilisation", href: "#" },
    { label: "Politique de confidentialité", href: "#" },
    { label: "Mentions légales", href: "#" },
    { label: "Cookies", href: "#" },
  ],
}

/* ───────────── animation helpers ───────────── */

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

/* ───────────── Landing Page ───────────── */

function LandingPage({ onOpenAuth, onSearch, onViewMap }: { onOpenAuth: (tab?: 'login' | 'register') => void; onSearch: (query: string, location: string) => void; onViewMap: () => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLocation, setSearchLocation] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), searchLocation.trim())
    }
  }

  return (
    <>
      {/* ────────── HERO ────────── */}
      <section className="relative pt-28 pb-10 sm:pt-36 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-amber-200/30 dark:bg-amber-900/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-emerald-200/30 dark:bg-emerald-900/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-orange-100/20 dark:bg-orange-900/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Text content */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={fadeInUp}>
                <Badge
                  variant="secondary"
                  className="mb-6 px-4 py-1.5 text-sm border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
                >
                  🌍 La 1ère plateforme d&apos;artisans en Afrique
                </Badge>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Trouvez l&apos;artisan{" "}
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  parfait
                </span>{" "}
                pour chaque projet
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
                        />
                      </div>
                      <div className="flex-1 relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Votre localisation"
                          className="pl-10 h-12 border-0 bg-muted/50 focus-visible:ring-1"
                          value={searchLocation}
                          onChange={e => setSearchLocation(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0">
                        <Search className="h-4 w-4 mr-2" />
                        Rechercher
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>

              {/* Quick category pills */}
              <motion.div variants={fadeInUp} className="mt-4 flex flex-wrap gap-2">
                {quickCategories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="cursor-pointer px-4 py-1.5 text-sm hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                  >
                    {cat}
                  </Badge>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="mt-4 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="gap-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                  onClick={onViewMap}
                >
                  <Navigation className="h-4 w-4" />
                  Voir la carte des artisans
                </Button>
              </motion.div>
            </motion.div>

            {/* Right: Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero-family.png"
                  alt="Famille africaine heureuse dans sa maison rénovée"
                  width={1344}
                  height={768}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {["bg-amber-500", "bg-emerald-500", "bg-orange-500", "bg-teal-500"].map((c, i) => (
                        <div key={i} className={`h-8 w-8 rounded-full ${c} border-2 border-white dark:border-neutral-800 flex items-center justify-center text-white text-xs font-bold`}>
                          {["AD", "FN", "KM", "AB"][i]}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">+10 000 artisans vérifiés</p>
                      <p className="text-xs text-muted-foreground">Prêts à intervenir chez vous</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <motion.div
                className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl px-4 py-3 shadow-lg"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="text-xs font-semibold">🚀 Réponse en</p>
                <p className="text-lg font-extrabold">15 min</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp} className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50">
                  <stat.icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────── ANIMATED STATS & CHARTS ────────── */}
      <AnimatedStats />

      {/* ────────── CATEGORIES ────────── */}
      <section id="categories" className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Explorez nos{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">catégories</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Des milliers d&apos;artisans spécialisés dans tous les corps de métier, prêts à intervenir près de chez vous.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <motion.div key={cat.name} variants={fadeInUp}>
                <Card className="group cursor-pointer border-border/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center gap-2">
                    <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${cat.color}`}>
                      <cat.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base">{cat.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{cat.count}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────── POPULAR ARTISANS CAROUSEL ────────── */}
      <section id="artisans" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Nos artisans{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">en action</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Découvrez nos artisans à travers l&apos;Afrique — tous les métiers, tous les talents.
            </motion.p>
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {artisans.map((artisan) => (
                  <CarouselItem key={artisan.name} className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                    <Card className="group hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:shadow-xl overflow-hidden h-full">
                      {/* Full image card */}
                      <div className={`relative h-72 overflow-hidden bg-gradient-to-br ${artisan.avatarColor.replace('bg-', 'from-').replace('-500', '-400')} to-amber-600`}>
                        <Image
                          src={artisan.image}
                          alt={`${artisan.name} - ${artisan.skill}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <Badge className={`absolute top-3 right-3 text-[10px] px-2.5 py-0.5 ${artisan.badgeColor} border-0 shadow-md`}>{artisan.badge}</Badge>
                        {/* Name & skill overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white font-bold text-xs ${artisan.avatarColor} border-2 border-white/30 shadow-md`}>
                              {artisan.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm text-white truncate">{artisan.name}</h3>
                              <p className="text-xs text-white/80 truncate">{artisan.skill}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-white/70">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{artisan.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-xs text-white">{artisan.rating}</span>
                              <span className="text-[10px] text-white/60">({artisan.reviews})</span>
                            </div>
                          </div>
                        </div>
                      </div>
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

      {/* ────────── HOW IT WORKS ────────── */}
      <section id="comment-ca-marche" className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Comment ça{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">marche</span>{" "}?
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Trois étapes simples pour trouver l&apos;artisan idéal et réaliser votre projet en toute sérénité.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, idx) => (
              <motion.div key={step.step} variants={fadeInUp} className="relative">
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[calc(50%+60px)] w-[calc(100%-120px)] h-0.5 bg-gradient-to-r from-amber-300 to-orange-300 dark:from-amber-700 dark:to-orange-700" />
                )}
                <Card className="text-center border-border/50 hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-8">
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg mb-6`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-2">Étape {step.step}</div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────── PLATFORM FEATURES ────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Des fonctionnalités{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">complètes</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour trouver un artisan, réserver, payer et gérer vos projets.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { emoji: "📅", title: "Réservation", desc: "Réservez un créneau en quelques clics", color: "from-amber-500 to-orange-500" },
              { emoji: "💰", title: "Mobile Money", desc: "Orange Money, MTN, Wave — paiement africain", color: "from-emerald-500 to-teal-500" },
              { emoji: "🏆", title: "Badges & Niveaux", desc: "Gagnez des points et débloquez des récompenses", color: "from-yellow-500 to-amber-500" },
              { emoji: "📋", title: "Demande de devis", desc: "Comparez les devis de plusieurs artisans", color: "from-orange-500 to-red-500" },
              { emoji: "🚨", title: "Service d'urgence", desc: "Un artisan chez vous en moins de 30 min", color: "from-red-500 to-rose-500" },
              { emoji: "🎯", title: "Parrainage", desc: "Invitez vos amis et gagnez des crédits", color: "from-violet-500 to-purple-500" },
              { emoji: "🗺️", title: "Géolocalisation", desc: "Trouvez les artisans proches de chez vous", color: "from-cyan-500 to-blue-500" },
              { emoji: "💬", title: "Messagerie", desc: "Chat en temps réel avec les artisans", color: "from-teal-500 to-emerald-500" },
            ].map((feat) => (
              <motion.div key={feat.title} variants={fadeInUp}>
                <Card className="group cursor-pointer border-border/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:shadow-lg hover:-translate-y-1 h-full">
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feat.color} shadow-md text-xl`}>
                      {feat.emoji}
                    </div>
                    <h3 className="font-semibold text-sm">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────── TESTIMONIALS ────────── */}
      <section id="temoignages" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Ce que nos{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">clients</span>{" "}disent
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Des milliers de clients satisfaits font confiance à Artisan Connect chaque jour.
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
                            <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"}`} />
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

      {/* ────────── TRUST SECTION ────────── */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Pourquoi nous{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">faire confiance</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Votre sécurité et satisfaction sont au cœur de tout ce que nous faisons.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustFeatures.map((feat) => (
              <motion.div key={feat.title} variants={fadeInUp}>
                <Card className="h-full border-border/50 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feat.bg} mb-4`}>
                      <feat.icon className={`h-6 w-6 ${feat.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feat.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feat.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────── SCALABILITY / INFRASTRUCTURE SECTION ────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Une plateforme{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">ultra-résistante</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Conçue pour supporter des milliers d&apos;utilisateurs simultanés sans jamais faiblir.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "5 000+ Utilisateurs Simultanés",
                description: "Notre architecture supporte plus de 5 000 utilisateurs connectés en même temps, sans ralentissement ni interruption.",
                color: "text-emerald-500",
                bg: "bg-emerald-50 dark:bg-emerald-950/30",
                stat: "5 000+",
                statLabel: "utilisateurs en ligne",
              },
              {
                icon: Zap,
                title: "Réponse en < 100ms",
                description: "Grâce au cache serveur et aux index de base de données optimisés, chaque requête est traitée en moins de 100 millisecondes.",
                color: "text-amber-500",
                bg: "bg-amber-50 dark:bg-amber-950/30",
                stat: "< 100ms",
                statLabel: "temps de réponse",
              },
              {
                icon: Globe,
                title: "Disponibilité 99.9%",
                description: "Infrastructure redondante avec surveillance automatique. La plateforme reste disponible même en cas de pic de trafic.",
                color: "text-teal-500",
                bg: "bg-teal-50 dark:bg-teal-950/30",
                stat: "99.9%",
                statLabel: "disponibilité",
              },
              {
                icon: CreditCard,
                title: "Paiement Sécurisé",
                description: "Transactions chiffrées de bout en bout avec Mobile Money, cartes bancaires et virements. Protection anti-fraude intégrée.",
                color: "text-orange-500",
                bg: "bg-orange-50 dark:bg-orange-950/30",
                stat: "256-bit",
                statLabel: "chiffrement SSL",
              },
              {
                icon: MessageSquare,
                title: "Messagerie Temps Réel",
                description: "Communication instantanée entre clients et artisans via WebSocket. Notifications push en moins de 2 secondes.",
                color: "text-cyan-500",
                bg: "bg-cyan-50 dark:bg-cyan-950/30",
                stat: "< 2s",
                statLabel: "latence message",
              },
              {
                icon: Shield,
                title: "Protection Anti-Surcharge",
                description: "Système de rate limiting intelligent qui protège contre les attaques et assure un accès équitable pour tous les utilisateurs.",
                color: "text-rose-500",
                bg: "bg-rose-50 dark:bg-rose-950/30",
                stat: "Auto",
                statLabel: "rate limiting",
              },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeInUp}>
                <Card className="h-full border-border/50 hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} mb-4`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{item.description}</p>
                    <div className="flex items-baseline gap-2 pt-2 border-t border-border/50">
                      <span className={`text-2xl font-bold ${item.color}`}>{item.stat}</span>
                      <span className="text-xs text-muted-foreground">{item.statLabel}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Live server status indicator */}
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12">
            <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </div>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">Serveur en ligne</span>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>Latence: <strong className="text-foreground">42ms</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-500" />
                    <span>En ligne: <strong className="text-foreground">1 247</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-teal-500" />
                    <span>Uptime: <strong className="text-foreground">99.97%</strong></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ────────── PRICING ────────── */}
      <PricingSection />

      {/* ────────── FAQ ────────── */}
      <section id="faq" className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-14">
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">
              Questions{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">fréquentes</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground text-lg">
              Tout ce que vous devez savoir sur Artisan Connect.
            </motion.p>
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ────────── CTA ────────── */}
      <section className="py-20 sm:py-28 bg-gradient-to-r from-amber-500 to-orange-600 relative overflow-hidden">
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
                className="bg-white text-amber-600 hover:bg-white/90 h-12 px-8 font-semibold"
                onClick={() => onOpenAuth('register')}
              >
                S&apos;inscrire gratuitement
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 h-12 px-8"
                onClick={() => onOpenAuth('register')}
              >
                Devenir artisan
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ────────── FOOTER ────────── */}
      <footer className="mt-auto bg-neutral-950 text-neutral-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand + Newsletter */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Artisan Connect</span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                La première plateforme africaine qui connecte les clients avec des artisans qualifiés et vérifiés.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                  <a key={idx} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 hover:bg-amber-500 transition-colors text-neutral-400 hover:text-white">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Plateforme</h4>
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.label}><a href={link.href} className="text-sm text-neutral-400 hover:text-amber-400 transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Services</h4>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.label}><a href={link.href} className="text-sm text-neutral-400 hover:text-amber-400 transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Légal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}><a href={link.href} className="text-sm text-neutral-400 hover:text-amber-400 transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">&copy; 2025 Artisan Connect. Tous droits réservés.</p>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <a href="#" className="hover:text-amber-400 transition-colors">Conditions</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

/* ───────────── Main Component ───────────── */

export default function Home() {
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

  const handleOpenAuth = useCallback((tab?: 'login' | 'register') => {
    setAuthModalTab(tab || 'login')
    setAuthModalOpen(true)
  }, [])

  const handleSearch = useCallback((query: string, location: string) => {
    const filters: Record<string, string> = {}
    if (location) filters.location = location
    search(query, filters)
  }, [search])

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

  /* ───── Loading Screen ───── */
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Artisan Connect
            </span>
          </div>
          <motion.div
            className="h-1 w-32 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
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
        {/* ────────── NAVBAR ────────── */}
        {currentView !== 'onboarding' && (
          <Navbar onOpenAuth={handleOpenAuth} onSearch={handleSearch} />
        )}

        {/* ────────── MAIN CONTENT ────────── */}
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

            {currentView === 'dashboard' && isAuthenticated && user && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {user.role === 'artisan' ? <ArtisanDashboard /> : <ClientDashboard />}
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

            {currentView === 'admin' && (
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

        {/* ────────── AUTH MODAL ────────── */}
        <AuthModal
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          defaultTab={authModalTab}
        />

        {/* ────────── CHATBOT ────────── */}
        <Chatbot />

        {/* ────────── CALL MODAL ────────── */}
        <CallModal
          isOpen={callModalOpen}
          onClose={() => setCallModalOpen(false)}
          artisanName={callArtisan.name}
          artisanInitials={callArtisan.initials}
          artisanColor={callArtisan.color}
        />

        {/* ────────── PWA INSTALL PROMPT ────────── */}
        <InstallPrompt />
      </div>
    </AnimatePresence>
  )
}
