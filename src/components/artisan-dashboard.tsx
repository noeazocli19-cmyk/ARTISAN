'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { MapPin, Phone, Briefcase, Clock, Star, CheckCircle, AlertCircle, Crosshair } from 'lucide-react';

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
}

const AFRICAN_COUNTRIES = [
  'Cameroun', 'Sénégal', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso',
  'Niger', 'Guinée', 'Bénin', 'Togo', 'Gabon',
  'Congo', 'RD Congo', 'Tchad', 'Centrafrique', 'Madagascar',
  'Nigeria', 'Ghana', 'Kenya', 'Tanzanie', 'Ouganda',
  'Éthiopie', 'Rwanda', 'Burundi', 'Maroc', 'Algérie',
  'Tunisie', 'Mauritanie', 'Cameroun',
];

export function ArtisanDashboard() {
  const { data: session } = useSession();
  const [artisanProfile, setArtisanProfile] = useState<ArtisanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // Charger le profil existant
  useEffect(() => {
    async function loadProfile() {
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
              skills: data.artisan.skills?.join(', ') || '',
            });
          }
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Calcul complétion profil
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

  // Champs manquants
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

  // Géolocaliser via navigateur
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
      (err) => {
        toast.error('Impossible de récupérer votre position');
      }
    );
  };

  // Sauvegarder le profil — FIX PRINCIPAL
  const handleSave = async () => {
    setSaving(true);
    try {
      // POST si nouveau, PATCH si existant
      const method = artisanProfile ? 'PATCH' : 'POST';

      const payload = {
        profession: form.profession,
        experience: form.experience,
        location: form.location,
        country: form.country,
        address: form.address,
        phone: form.phone,
        bio: form.bio,
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      let res = await fetch('/api/artisans/profile', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Retry automatique si 409 (profil existe déjà)
      if (res.status === 409 && method === 'POST') {
        res = await fetch('/api/artisans/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (res.ok) {
        setArtisanProfile(data.artisan);
        toast.success('Profil sauvegardé !', {
          description: data.artisan?.latitude
            ? `Coordonnées GPS: ${data.artisan.latitude.toFixed(4)}, ${data.artisan.longitude?.toFixed(4)}`
            : undefined,
        });
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completion = profileCompletion();
  const missing = missingFields();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Bannière de complétion de profil */}
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
              className="bg-amber-500 h-2 rounded-full transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="text-sm text-amber-700">
            Champs manquants : {missing.join(', ')}
          </p>
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

      {/* Coordonnées GPS si géocodé */}
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

      {/* Formulaire */}
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold">Mon profil artisan</h2>

        {/* Métier */}
        <div>
          <label className="block text-sm font-medium mb-1">
            <Briefcase className="inline h-4 w-4 mr-1" />
            Métier *
          </label>
          <input
            type="text"
            value={form.profession}
            onChange={(e) => setForm({ ...form, profession: e.target.value })}
            placeholder="Ex: Plombier, Électricien, Menuisier..."
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Expérience */}
        <div>
          <label className="block text-sm font-medium mb-1">
            <Clock className="inline h-4 w-4 mr-1" />
            Années d'expérience
          </label>
          <input
            type="number"
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
            placeholder="5"
            min="0"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Localisation */}
        <div>
          <label className="block text-sm font-medium mb-1">
            <MapPin className="inline h-4 w-4 mr-1" />
            Quartier / Ville *
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Ex: Bastos, Yaoundé"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Pays */}
        <div>
          <label className="block text-sm font-medium mb-1">Pays *</label>
          <select
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
          >
            <option value="">Sélectionner un pays</option>
            {AFRICAN_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Adresse (pour géocodage) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            <MapPin className="inline h-4 w-4 mr-1" />
            Adresse précise (pour géolocalisation)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Ex: Rue de la République, Douala"
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={geolocateMe}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1"
              title="Utiliser ma position GPS"
            >
              <Crosshair className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            L'adresse sera convertie automatiquement en coordonnées GPS
          </p>
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium mb-1">
            <Phone className="inline h-4 w-4 mr-1" />
            Téléphone
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+237 6XX XXX XXX"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Décrivez votre activité, vos spécialités..."
            rows={3}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Compétences */}
        <div>
          <label className="block text-sm font-medium mb-1">
            <Star className="inline h-4 w-4 mr-1" />
            Compétences (séparées par des virgules)
          </label>
          <input
            type="text"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            placeholder="Plomberie, Chauffe-eau, Tuyauterie"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Bouton sauvegarder */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Sauvegarde en cours...' : artisanProfile ? 'Mettre à jour le profil' : 'Créer mon profil'}
        </button>
      </div>
    </div>
  );
}