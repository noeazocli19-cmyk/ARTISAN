import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

async function geocodeAddress(address: string, country?: string, city?: string) {
  try {
    const fullAddress = [address, city, country].filter(Boolean).join(', ');
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&addressdetails=1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'ArtisanConnect/1.0' } });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || data.length === 0) return null;
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      formattedAddress: data[0].display_name,
    };
  } catch (error) {
    console.error('Erreur géocodage:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const artisan = await db.artisan.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { id: true, name: true, email: true, image: true, phone: true } } },
    });
    if (!artisan) return NextResponse.json({ artisan: null });
    return NextResponse.json({ artisan });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération du profil' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const body = await request.json();
    const { profession, experience, location, country, address, bio, phone, skills, specialties, hourlyRate, portfolio } = body;

    const existing = await db.artisan.findUnique({ where: { userId: session.user.id } });
    if (existing) {
      return NextResponse.json({ error: 'Profil déjà existant, utilisez PATCH' }, { status: 409 });
    }

    let latitude = null;
    let longitude = null;
    let formattedAddress = address;
    if (address && address.trim().length >= 3) {
      const geo = await geocodeAddress(address, country, location);
      if (geo) { latitude = geo.latitude; longitude = geo.longitude; formattedAddress = geo.formattedAddress; }
    }

    const artisan = await db.artisan.create({
      data: {
        userId: session.user.id, profession,
        experience: experience ? parseInt(experience) : 0,
        location, country, address: formattedAddress, latitude, longitude,
        phone, bio, skills: skills || '[]', specialties: specialties || '[]',
        hourlyRate: hourlyRate || 0, portfolio: portfolio || '[]',
      },
    });

    await db.user.update({
      where: { id: session.user.id },
      data: { bio: bio || null, location: location || null, country: country || null, phone: phone || null },
    });

    return NextResponse.json({ success: true, artisan }, { status: 201 });
  } catch (error) {
    console.error('Erreur création profil:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du profil' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const body = await request.json();
    const { profession, experience, location, country, address, bio, phone, skills, specialties, hourlyRate, portfolio } = body;

    const existing = await db.artisan.findUnique({ where: { userId: session.user.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Profil non trouvé, utilisez POST' }, { status: 404 });
    }

    let latitude = existing.latitude;
    let longitude = existing.longitude;
    let formattedAddress = existing.address;

    const newAddress = address || existing.address;
    const newCity = location || existing.location;
    const newCountry = country || existing.country;

    const addressChanged = (address && address !== existing.address) || (location && location !== existing.location) || (country && country !== existing.country);
    if (addressChanged && newAddress && newAddress.trim().length >= 3) {
      const geo = await geocodeAddress(newAddress, newCountry || undefined, newCity || undefined);
      if (geo) { latitude = geo.latitude; longitude = geo.longitude; formattedAddress = geo.formattedAddress; }
    }

    const artisan = await db.artisan.update({
      where: { userId: session.user.id },
      data: {
        profession: profession || existing.profession,
        experience: experience ? parseInt(experience) : existing.experience,
        location: newCity, country: newCountry, address: formattedAddress,
        latitude, longitude, phone: phone || existing.phone,
        bio: bio !== undefined ? bio : existing.bio,
        skills: skills || existing.skills, specialties: specialties || existing.specialties,
        hourlyRate: hourlyRate ? parseInt(hourlyRate) : existing.hourlyRate,
        portfolio: portfolio || existing.portfolio,
      },
    });

    await db.user.update({
      where: { id: session.user.id },
      data: { bio: bio !== undefined ? bio : undefined, location: newCity || undefined, country: newCountry || undefined, phone: phone || undefined },
    });

    return NextResponse.json({ success: true, artisan });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 });
  }
}