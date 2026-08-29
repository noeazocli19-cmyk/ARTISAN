'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Search, Crosshair, SlidersHorizontal } from 'lucide-react';

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
  { label: '10 km', value: '10' },
  { label: '25 km', value: '25' },
  { label: '50 km', value: '50' },
  { label: '100 km', value: '100' },
  { label: 'Illimité', value: '0' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [radius, setRadius] = useState('50');
  const [results, setResults] = useState<ArtisanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Géolocalisation navigateur
  const geolocateMe = () => {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée par votre navigateur');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      },
      () => {
        alert('Impossible de récupérer votre position');
      }
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
  }, [query, location, country, radius, userLat, userLng]);

  // Debounce 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      searchArtisans();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchArtisans]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Trouver un artisan près de chez vous
      </h1>

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
            Géolocalisation active â€” résultats triés par proximité
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
              <Link
                href={`/artisan/${artisan.id}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                Voir le profil
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}