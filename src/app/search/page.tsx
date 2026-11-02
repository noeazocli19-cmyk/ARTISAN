'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, Search, Crosshair, SlidersHorizontal, X } from 'lucide-react';

interface ArtisanResult {
  id: string;
  profession: string;
  experience: number | null;
  location: string | null;
  country: string | null;
  address: string | null;
  phone: string | null;
  bio: string | null;
  skills: string[];
  distance: number | null;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

const RADIUS_OPTIONS = [
  { label: '5 km', value: '5' },
  { label: '10 km', value: '10' },
  { label: '25 km', value: '25' },
  { label: '50 km', value: '50' },
  { label: '100 km', value: '100' },
  { label: 'Illimité', value: '0' },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [radius, setRadius] = useState('50');
  const [results, setResults] = useState<ArtisanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Restore searches and geolocation shared from the home page.
  useEffect(() => {
    const q = searchParams.get('q');
    const locationParam = searchParams.get('location');
    const countryParam = searchParams.get('country');
    const cat = searchParams.get('category');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radiusParam = searchParams.get('radius');

    if (q) setQuery(q);
    if (locationParam) setLocation(locationParam);
    if (countryParam) setCountry(countryParam);
    if (cat) setCategory(cat);
    if (lat && Number.isFinite(Number(lat))) setUserLat(Number(lat));
    if (lng && Number.isFinite(Number(lng))) setUserLng(Number(lng));
    if (radiusParam && RADIUS_OPTIONS.some((option) => option.value === radiusParam)) setRadius(radiusParam);
  }, [searchParams]);

  const clearCategory = () => {
    setCategory('');
    router.replace('/search');
  };

  // Géolocalisation navigateur
  const geolocateMe = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n’est pas prise en charge par cet appareil.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      },
      (error) => {
        setLocationError(error.code === error.PERMISSION_DENIED
          ? 'Autorisez l’accès à votre position pour rechercher les artisans proches.'
          : 'Impossible de déterminer votre position pour le moment.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  // Recherche avec debounce
  const searchArtisans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (location) params.set('location', location);
      if (country) params.set('country', country);
      if (category) params.set('category', category);
      if (userLat !== null) params.set('lat', userLat.toString());
      if (userLng !== null) params.set('lng', userLng.toString());
      params.set('radius', radius);

      const res = await fetch(`/api/artisans/search?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setResults(data.artisans);
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setLoading(false);
    }
  }, [query, location, country, category, radius, userLat, userLng]);

  // Debounce 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      searchArtisans();
      const recentValue = query.trim() || location.trim() || category.trim();
      if (recentValue) {
        try {
          const saved = JSON.parse(localStorage.getItem('findaRecentSearches') || '[]') as string[];
          const next = [recentValue, ...saved.filter((value) => value !== recentValue)].slice(0, 5);
          localStorage.setItem('findaRecentSearches', JSON.stringify(next));
        } catch {
          localStorage.setItem('findaRecentSearches', JSON.stringify([recentValue]));
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchArtisans]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {category ? `Artisans en ${category}` : 'Trouver un artisan près de chez vous'}
      </h1>

      {category && (
        <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-800 rounded-xl px-4 py-2 text-sm">
          <span className="flex-1">Filtré sur la catégorie <strong>{category}</strong></span>
          <button onClick={clearCategory} className="flex items-center gap-1 hover:underline shrink-0">
            <X className="h-3.5 w-3.5" />
            Voir tous les artisans
          </button>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un métier... (ex: Plombier)"
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={geolocateMe}
          className={`px-4 py-3 rounded-xl border flex items-center gap-2 ${
            userLat !== null
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white hover:bg-gray-50'
          }`}
          title="Utiliser ma position"
        >
          <Crosshair className="h-5 w-5" />
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 rounded-xl border bg-white hover:bg-gray-50 flex items-center gap-2"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {locationError && (
        <p className="text-sm text-red-600" role="alert">{locationError}</p>
      )}
      {userLat !== null && userLng !== null && !locationError && (
        <p className="flex items-center gap-2 text-sm text-blue-700" role="status">
          <Crosshair className="h-4 w-4" />
          Résultats autour de votre position GPS ({userLat.toFixed(5)}, {userLng.toFixed(5)}) dans un rayon de {radius === '0' ? 'partout' : `${radius} km`}.
        </p>
      )}

      {/* Filtres */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ville / Quartier"
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Pays"
              className="border rounded-lg px-3 py-2"
            />
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              {RADIUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Rayon : {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Indicateur géolocalisation */}
      {userLat !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            Géolocalisation active — résultats triés par proximité
          </span>
        </div>
      )}

      {/* Résultats */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Aucun artisan trouvé</p>
          <p className="text-sm">Essayez de modifier vos critères de recherche</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {results.length} artisan{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
          </p>
          {results.map((artisan) => (
            <div
              key={artisan.id}
              className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {artisan.user.name}
                  </h3>
                  <p className="text-primary font-medium">
                    {artisan.profession}
                  </p>
                  {artisan.experience && (
                    <p className="text-sm text-gray-500">
                      {artisan.experience} an{artisan.experience > 1 ? 's' : ''} d'expérience
                    </p>
                  )}
                </div>
                {artisan.distance !== null && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {artisan.distance < 1
                      ? `${Math.round(artisan.distance * 1000)} m`
                      : `${artisan.distance.toFixed(1)} km`}
                  </span>
                )}
              </div>

              {artisan.bio && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {artisan.bio}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                {artisan.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {artisan.location}
                  </span>
                )}
                {artisan.phone && (
                  <span>ðŸ“ž {artisan.phone}</span>
                )}
              </div>

              {artisan.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {artisan.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/artisan/${artisan.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                >
                  Voir le profil
                  <span aria-hidden>&rarr;</span>
                </Link>
                {artisan.phone && (
                  <a
                    href={`tel:${artisan.phone}`}
                    className="inline-flex rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Appeler
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-6">Chargement...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}