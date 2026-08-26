'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import {
  MapPin, Phone, Briefcase, Clock, Star, CheckCircle, AlertCircle, Crosshair,
  ClipboardList, MessageSquare, TrendingUp, Settings, Wrench, Hand,
  LayoutGrid, ArrowLeftCircle, Loader2, User as UserIcon, Search, Clock3, CalendarCheck,
} from 'lucide-react';

interface ArtisanProfile {
  id: string;
  profession: string;
  experience: number | null;
  location: string | null;
  country: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  bio: string | null;
  skills: string[];
  portfolio: string[];
  rating?: number | null;
  reviewCount?: number | null;
}

interface Mission {
  id: string;
  title: string;
  status: string;
  budget: number;
  client?: { name: string | null };
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  client?: { name: string | null; image: string | null };
  mission?: { title: string | null };
}

interface Conversation {
  partnerId: string;
  partner?: { name: string | null };
  lastMessage?: { content: string; createdAt: string };
  unreadCount: number;
}

const AFRICAN_COUNTRIES = [
  'Cameroun', 'Sénégal', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso',
  'Niger', 'Guinée', 'Bénin', 'Togo', 'Gabon',
  'Congo', 'RD Congo', 'Tchad', 'Centrafrique', 'Madagascar',
  'Nigeria', 'Ghana', 'Kenya', 'Tanzanie', 'Ouganda',
  'Éthiopie', 'Rwanda', 'Burundi', 'Maroc', 'Algérie',
  'Tunisie', 'Mauritanie', 'Cameroun',
];

type TabId = 'apercu' | 'missions' | 'dispo' | 'reservations' | 'messages' | 'avis' | 'profil';

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'apercu', label: 'Aperçu', icon: LayoutGrid },
  { id: 'missions', label: 'Mes Missions', icon: ClipboardList },
  { id: 'dispo', label: 'Missions dispo', icon: Search },
  { id: 'reservations', label: 'Reservations', icon: CalendarCheck },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'avis', label: 'Avis', icon: Star },
  { id: 'profil', label: 'Profil', icon: UserIcon },
];

function initialsOf(name?: string | null) {
  if (!name) return 'AR';
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || 'AR';
}

export function ArtisanDashboard() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [artisanProfile, setArtisanProfile] = useState<ArtisanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('apercu');

  const [missions, setMissions] = useState<Mission[]>([]);
  const [openMissions, setOpenMissions] = useState<Mission[]>([]);
  const [openMissionsLoading, setOpenMissionsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [missionsLoading, setMissionsLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  const [form, setForm] = useState({
    profession: '',
    experience: '',
    location: '',
    country: '',
    address: '',
    phone: '',
    bio: '',
    skills: '',
  });

  useEffect(() => {
    async function loadAll() {
      try {
        const res = await fetch('/api/artisans/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.artisan) {
            setArtisanProfile(data.artisan);
            setForm({
              profession: data.artisan.profession || '',
              experience: data.artisan.experience?.toString() || '',
              location: data.artisan.location || '',
              country: data.artisan.country || '',
              address: data.artisan.address || '',
              phone: data.artisan.phone || '',
              bio: data.artisan.bio || '',
              skills: (Array.isArray(data.artisan.skills)
                ? data.artisan.skills
                : JSON.parse(data.artisan.skills || '[]')
              )?.join(', ') || '',
            });

            const [missionsRes, reviewsRes] = await Promise.all([
              fetch(`/api/missions?artisanId=${data.artisan.id}`),
              fetch(`/api/reviews?artisanId=${data.artisan.id}`),
            ]);
            if (missionsRes.ok) {
              const missionsData = await missionsRes.json();
              setMissions(missionsData.missions || []);
            }
            if (reviewsRes.ok) {
              const reviewsData = await reviewsRes.json();
              setReviews(reviewsData.reviews || []);
            }
          } else {
            setActiveTab('profil');
          }
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error);
      } finally {
        setLoading(false);
        setMissionsLoading(false);
        setReviewsLoading(false);
      }
    }
    loadAll();

    fetch('/api/messages/conversations')
      .then((r) => (r.ok ? r.json() : { conversations: [] }))
      .then((data) => setConversations(data.conversations || []))
      .catch(() => {})
      .finally(() => setConversationsLoading(false));
  }, []);

  const profileCompletion = () => {
    if (!artisanProfile) return 0;
    const fields = [
      artisanProfile.profession,
      artisanProfile.experience,
      artisanProfile.location,
      artisanProfile.country,
      artisanProfile.address,
      artisanProfile.phone,
      artisanProfile.bio,
      artisanProfile.skills?.length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const missingFields = () => {
    if (!artisanProfile) return [];
    const missing = [];
    if (!artisanProfile.profession) missing.push('Métier');
    if (!artisanProfile.experience) missing.push('Expérience');
    if (!artisanProfile.location) missing.push('Localisation');
    if (!artisanProfile.country) missing.push('Pays');
    if (!artisanProfile.address) missing.push('Adresse');
    if (!artisanProfile.phone) missing.push('Téléphone');
    if (!artisanProfile.bio) missing.push('Bio');
    if (!artisanProfile.skills?.length) missing.push('Compétences');
    return missing;
  };

  const geolocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((prev) => ({
          ...prev,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        }));
        toast.success('Position GPS récupérée !');
      },
      () => {
        toast.error('Impossible de récupérer votre position');
      }
    );
  };

  const loadOpenMissions = async () => {
    setOpenMissionsLoading(true);
    try {
      const res = await fetch('/api/missions?status=ouverte');
      if (res.ok) {
        const data = await res.json();
        setOpenMissions(data.missions || []);
      }
    } catch (error) {
      console.error('Erreur chargement missions disponibles:', error);
    } finally {
      setOpenMissionsLoading(false);
    }
  };

  useEffect(() => {
    loadOpenMissions();
  }, []);

  useEffect(() => {
    if (!artisanProfile?.id) return;
    fetch(`/api/bookings?artisanId=${artisanProfile.id}`)
      .then((r) => (r.ok ? r.json() : { bookings: [] }))
      .then((data) => setBookings(data.bookings || []))
      .catch((e) => console.error('Erreur chargement reservations:', e))
      .finally(() => setBookingsLoading(false));
  }, [artisanProfile?.id]);

  const handleClaimBooking = async (bookingId: string) => {
    setRespondingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? data.booking : b)));
        toast.success('Reservation acceptee !');
      } else {
        toast.error('Cette reservation a peut-etre deja ete prise par un autre artisan');
      }
    } catch (error) {
      toast.error('Erreur reseau');
    } finally {
      setRespondingId(null);
    }
  };

  const handleRespondBooking = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    setRespondingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
        toast.success(status === 'confirmed' ? 'Reservation confirmee' : 'Reservation refusee');
      }
    } catch (error) {
      toast.error('Erreur reseau');
    } finally {
      setRespondingId(null);
    }
  };

  const handleAcceptMission = async (missionId: string) => {
    setAcceptingId(missionId);
    try {
      const res = await fetch(`/api/missions/${missionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'assignee' }),
      });
      if (res.ok) {
        toast.success('Mission acceptee !');
        const acceptedMission = openMissions.find((m) => m.id === missionId);
        setOpenMissions((prev) => prev.filter((m) => m.id !== missionId));
        if (acceptedMission) {
          setMissions((prev) => [{ ...acceptedMission, status: 'assignee' }, ...prev]);
        }
      } else {
        const data = await res.json();
        toast.error('Erreur', { description: data.error || "Impossible d'accepter cette mission" });
      }
    } catch (error) {
      toast.error('Erreur reseau');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        userId,
        specialties: form.profession ? [form.profession] : [],
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        profession: form.profession,
        experience: parseInt(form.experience) || 0,
        location: form.location,
        country: form.country,
        address: form.address,
        phone: form.phone,
        bio: form.bio,
      };

      const res = await fetch('/api/artisans/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setArtisanProfile(data.artisan);
        toast.success('Profil sauvegardé !', {
          description: data.artisan?.latitude
            ? `Coordonnées GPS: ${data.artisan.latitude.toFixed(4)}, ${data.artisan.longitude?.toFixed(4) || ''}`
            : undefined,
        });
        setActiveTab('apercu');
      } else {
        toast.error('Erreur', { description: data.error || 'Problème de sauvegarde' });
      }
    } catch (error) {
      toast.error('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 rounded-full border-4 border-amber-200 border-t-orange-600 animate-spin" />
      </div>
    );
  }

  const completion = profileCompletion();
  const missing = missingFields();
  const missionsOuvertes = missions.filter((m) => m.status === 'ouverte').length;
  const missionsTerminees = missions.filter((m) => m.status === 'terminée').length;
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Bouton retour au site */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-orange-700 transition"
      >
        <ArrowLeftCircle className="h-4 w-4" />
        Retour au site
      </Link>

      {/* Bandeau d'en-tête — signature de marque (dégradé ambre → orange) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-6 shadow-lg">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -right-2 bottom-[-2rem] h-20 w-20 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white ring-2 ring-white/40 backdrop-blur">
            {initialsOf(session?.user?.name)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
              Bonjour {session?.user?.name?.split(' ')[0] || 'Artisan'}
              <Hand className="h-5 w-5 sm:h-6 sm:w-6 text-white/90" />
            </h1>
            <p className="text-sm text-amber-50/90 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              {artisanProfile?.profession || 'Métier non renseigné'}
              {artisanProfile?.location && (
                <>
                  <span className="opacity-60">·</span>
                  <MapPin className="h-3.5 w-3.5" />
                  {artisanProfile.location}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Barre d'onglets */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'messages' && totalUnread > 0 && (
                <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                  {totalUnread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'apercu' && (
        <div className="space-y-6">
          {artisanProfile && completion < 100 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-800">
                  Profil complété à {completion}%
                </span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className="text-sm text-amber-700 mb-3">
                Champs manquants : {missing.join(', ')}
              </p>
              <button
                onClick={() => setActiveTab('profil')}
                className="text-sm font-semibold text-amber-800 underline"
              >
                Compléter maintenant
              </button>
            </div>
          )}

          {artisanProfile && completion === 100 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">
                Profil complet ! Vous êtes visible par les clients.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
                <ClipboardList className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{missionsLoading ? '–' : missionsOuvertes}</p>
              <p className="text-xs text-muted-foreground">Missions ouvertes</p>
            </div>
            <div className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center mb-2">
                <CheckCircle className="h-4.5 w-4.5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{missionsLoading ? '–' : missionsTerminees}</p>
              <p className="text-xs text-muted-foreground">Missions terminées</p>
            </div>
            <div className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center mb-2">
                <Star className="h-4.5 w-4.5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{artisanProfile?.rating?.toFixed(1) ?? '–'}</p>
              <p className="text-xs text-muted-foreground">Note moyenne</p>
            </div>
            <div className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                <MessageSquare className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{reviewsLoading ? '–' : reviews.length}</p>
              <p className="text-xs text-muted-foreground">Avis reçus</p>
            </div>
          </div>

          <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                <Wrench className="h-5 w-5 text-orange-500" />
                Mes missions récentes
              </h2>
              <button
                onClick={() => setActiveTab('missions')}
                className="text-xs font-semibold text-orange-700 hover:underline"
              >
                Tout voir
              </button>
            </div>
            {missionsLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : missions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                  <TrendingUp className="h-6 w-6 text-amber-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">Aucune mission pour le moment.</p>
                <p className="text-xs mt-1">
                  Complétez votre profil pour apparaître dans les recherches clients.
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {missions.slice(0, 5).map((m) => (
                  <li key={m.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.client?.name || 'Client'} · {m.budget} FCFA
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        m.status === 'terminée'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === 'missions' && (
        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <ClipboardList className="h-5 w-5 text-orange-500" />
            Toutes mes missions
          </h2>
          {missionsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </div>
          ) : missions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Aucune mission pour le moment.</p>
              <p className="text-xs mt-1">
                Complétez votre profil pour apparaître dans les recherches clients.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {missions.map((m) => (
                <li key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.client?.name || 'Client'} · {m.budget} FCFA
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      m.status === 'terminée'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {m.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'dispo' && (
        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2 text-gray-900">
            <Search className="h-5 w-5 text-orange-500" />
            Missions disponibles
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Missions publiees par des clients, pas encore prises par un artisan.
          </p>
          {openMissionsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </div>
          ) : openMissions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                <Search className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Aucune mission disponible pour le moment.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {openMissions.map((m: any) => {
                const isMatch = artisanProfile?.profession &&
                  m.category?.toLowerCase().includes(artisanProfile.profession.toLowerCase());
                return (
                  <li key={m.id} className={`py-4 ${isMatch ? 'bg-amber-50/50 -mx-2 px-2 rounded-lg' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900">{m.title}</p>
                          {isMatch && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              Correspond a votre metier
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {m.category} - {m.client?.name || 'Client'} - {m.budget} FCFA
                        </p>
                        {m.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {m.location}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Clock3 className="h-3 w-3" />
                          Publiee le {new Date(m.createdAt).toLocaleDateString('fr-FR')} a{' '}
                          {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAcceptMission(m.id)}
                        disabled={acceptingId === m.id}
                        className="shrink-0 text-xs font-semibold px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
                      >
                        {acceptingId === m.id ? 'En cours...' : 'Accepter'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2 text-gray-900">
            <CalendarCheck className="h-5 w-5 text-orange-500" />
            Mes reservations
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Demandes de rendez-vous envoyees directement par des clients.
          </p>
          {bookingsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                <CalendarCheck className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Aucune reservation pour le moment.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {bookings.map((b: any) => {
                const d = new Date(b.date);
                const statusStyles: Record<string, string> = {
                  pending: 'bg-amber-100 text-amber-700',
                  confirmed: 'bg-green-100 text-green-700',
                  completed: 'bg-blue-100 text-blue-700',
                  cancelled: 'bg-red-100 text-red-700',
                };
                const statusLabels: Record<string, string> = {
                  pending: 'En attente',
                  confirmed: 'Confirmee',
                  completed: 'Terminee',
                  cancelled: 'Annulee',
                };
                return (
                  <li key={b.id} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900">{b.service}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[b.status] || statusStyles.pending}`}>
                            {statusLabels[b.status] || b.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {b.client?.name || 'Client'} · {d.toLocaleDateString('fr-FR')} a {d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {b.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{b.notes}</p>
                        )}
                      </div>
                      {!b.artisanId && b.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleClaimBooking(b.id)}
                            disabled={respondingId === b.id}
                            className="text-xs font-semibold px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
                          >
                            {respondingId === b.id ? 'En cours...' : 'Accepter'}
                          </button>
                        </div>
                      )}
                      {b.artisanId && b.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleRespondBooking(b.id, 'confirmed')}
                            disabled={respondingId === b.id}
                            className="text-xs font-semibold px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => handleRespondBooking(b.id, 'cancelled')}
                            disabled={respondingId === b.id}
                            className="text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              Mes conversations
            </h2>
            <Link
              href="/messages"
              className="text-xs font-semibold text-orange-700 hover:underline"
            >
              Ouvrir la messagerie
            </Link>
          </div>
          {conversationsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                <MessageSquare className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Aucune conversation pour le moment.</p>
              <p className="text-xs mt-1">
                Les messages des clients intéressés apparaîtront ici.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {conversations.map((c) => (
                <li key={c.partnerId}>
                  <Link
                    href={`/messages?userId=${c.partnerId}`}
                    className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
                      {c.partner?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {c.partner?.name || 'Client'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.lastMessage?.content || '—'}
                      </p>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-bold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'avis' && (
        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <Star className="h-5 w-5 text-orange-500" />
            Avis reçus
            {artisanProfile?.rating ? (
              <span className="text-sm font-normal text-muted-foreground">
                ({artisanProfile.rating.toFixed(1)}/5 · {reviews.length} avis)
              </span>
            ) : null}
          </h2>
          {reviewsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                <Star className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Aucun avis pour le moment.</p>
              <p className="text-xs mt-1">
                Les avis de vos clients apparaîtront ici après vos missions.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {reviews.map((r) => (
                <li key={r.id} className="py-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {r.client?.name || 'Client'}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < r.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    {r.mission?.title ? ` · ${r.mission.title}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'profil' && (
        <div className="space-y-6">
          {artisanProfile && completion < 100 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-800">
                  Profil complété à {completion}%
                </span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className="text-sm text-amber-700">
                Champs manquants : {missing.join(', ')}
              </p>
            </div>
          )}

          {artisanProfile?.latitude && artisanProfile?.longitude && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Position GPS enregistrée
                </p>
                <p className="text-xs text-blue-600">
                  {artisanProfile.latitude.toFixed(4)}, {artisanProfile.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Mon profil artisan</h2>

            <div>
              <label className="block text-sm font-medium mb-1">
                <Briefcase className="inline h-4 w-4 mr-1 text-orange-500" />
                Métier *
              </label>
              <input
                type="text"
                value={form.profession}
                onChange={(e) => setForm({ ...form, profession: e.target.value })}
                placeholder="Ex: Plombier, Électricien, Menuisier..."
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <Clock className="inline h-4 w-4 mr-1 text-orange-500" />
                Années d'expérience
              </label>
              <input
                type="number"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder="5"
                min="0"
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <MapPin className="inline h-4 w-4 mr-1 text-orange-500" />
                Quartier / Ville *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ex: Agla, Cotonou"
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Pays *</label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
              >
                <option value="">Sélectionner un pays</option>
                {AFRICAN_COUNTRIES.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <MapPin className="inline h-4 w-4 mr-1 text-orange-500" />
                Adresse précise (pour géolocalisation)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Ex: Rue de la République, Douala"
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                />
                <button
                  type="button"
                  onClick={geolocateMe}
                  className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 flex items-center gap-1"
                  title="Utiliser ma position GPS"
                >
                  <Crosshair className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                L'adresse sera convertie automatiquement en coordonnées GPS
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <Phone className="inline h-4 w-4 mr-1 text-orange-500" />
                Téléphone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+229 01 XX XX XX XX"
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Décrivez votre activité, vos spécialités..."
                rows={3}
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <Star className="inline h-4 w-4 mr-1 text-orange-500" />
                Compétences (séparées par des virgules)
              </label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="Plomberie, Chauffe-eau, Tuyauterie"
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition"
            >
              {saving ? 'Sauvegarde en cours...' : artisanProfile ? 'Mettre à jour le profil' : 'Créer mon profil'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}









