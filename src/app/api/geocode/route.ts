import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address || address.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Adresse trop courte' },
        { status: 400 }
      );
    }

    // Appel à OpenStreetMap Nominatim — GRATUIT, pas de clé API
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ArtisanApp/1.0', // Requis par Nominatim
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur Nominatim: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Adresse non trouvée' },
        { status: 404 }
      );
    }

    const result = data[0];

    return NextResponse.json({
      success: true,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
    });
  } catch (error) {
    console.error('Erreur géocodage:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du géocodage' },
      { status: 500 }
    );
  }
}