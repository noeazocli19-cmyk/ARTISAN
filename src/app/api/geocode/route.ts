import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    if (!address || address.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Adresse trop courte' }, { status: 400 });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'ArtisanConnect/1.0' } });
    if (!response.ok) throw new Error(`Erreur Nominatim: ${response.status}`);

    const data = await response.json();
    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: 'Adresse non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      formattedAddress: data[0].display_name,
      addressDetails: data[0].address || {},
    });
  } catch (error) {
    console.error('Erreur géocodage:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors du géocodage' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ success: false, error: 'lat et lng sont requis' }, { status: 400 });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'ArtisanConnect/1.0' } });
    if (!response.ok) throw new Error(`Erreur Nominatim: ${response.status}`);

    const data = await response.json();
    if (!data || data.error) {
      return NextResponse.json({ success: false, error: 'Adresse non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      formattedAddress: data.display_name,
      addressDetails: data.address || {},
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    });
  } catch (error) {
    console.error('Erreur géocodage inverse:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors du géocodage inverse' }, { status: 500 });
  }
}