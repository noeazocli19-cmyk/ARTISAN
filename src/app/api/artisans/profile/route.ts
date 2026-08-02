import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Helper : géocodage via OpenStreetMap Nominatim
async function geocodeAddress(address: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ArtisanApp/1.0',
      },
    });

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

// POST — Créer un profil artisan
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      profession,
      experience,
      location,
      country,
      address,
      bio,
      phone,
      skills,
      portfolio,
    } = body;

    // Vérifier si un profil existe déjà
    const existing = await prisma.artisan.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Profil déjà existant, utilisez PATCH pour mettre à jour' },
        { status: 409 }
      );
    }

    // Géocodage automatique si adresse fournie
    let latitude = null;
    let longitude = null;
    let formattedAddress = address;

    if (address && address.trim().length >= 3) {
      const geo = await geocodeAddress(address);
      if (geo) {
        latitude = geo.latitude;
        longitude = geo.longitude;
        formattedAddress = geo.formattedAddress;
      }
    }

    // Créer le profil artisan
    const artisan = await prisma.artisan.create({
      data: {
        userId: session.user.id,
        profession,
        experience: experience ? parseInt(experience) : null,
        location,
        country,
        address: formattedAddress,
        latitude,
        longitude,
        phone,
        bio,
        skills: skills || [],
        portfolio: portfolio || [],
      },
    });

    // Mettre à jour aussi l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bio: bio || null,
        location: location || null,
        country: country || null,
      },
    });

    return NextResponse.json({ success: true, artisan }, { status: 201 });
  } catch (error) {
    console.error('Erreur création profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du profil' },
      { status: 500 }
    );
  }
}

// PATCH — Mettre à jour le profil artisan
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      profession,
      experience,
      location,
      country,
      address,
      bio,
      phone,
      skills,
      portfolio,
    } = body;

    // Vérifier que le profil existe
    const existing = await prisma.artisan.findUnique({
      where: { userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Profil non trouvé, utilisez POST pour créer' },
        { status: 404 }
      );
    }

    // Re-géocodage si l'adresse a changé
    let latitude = existing.latitude;
    let longitude = existing.longitude;
    let formattedAddress = existing.address;

    if (address && address !== existing.address && address.trim().length >= 3) {
      const geo = await geocodeAddress(address);
      if (geo) {
        latitude = geo.latitude;
        longitude = geo.longitude;
        formattedAddress = geo.formattedAddress;
      }
    }

    // Mettre à jour le profil
    const artisan = await prisma.artisan.update({
      where: { userId: session.user.id },
      data: {
        profession: profession || existing.profession,
        experience: experience ? parseInt(experience) : existing.experience,
        location: location || existing.location,
        country: country || existing.country,
        address: formattedAddress,
        latitude,
        longitude,
        phone: phone || existing.phone,
        bio: bio !== undefined ? bio : existing.bio,
        skills: skills || existing.skills,
        portfolio: portfolio || existing.portfolio,
      },
    });

    // Mettre à jour aussi l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bio: bio !== undefined ? bio : undefined,
        location: location || undefined,
        country: country || undefined,
      },
    });

    return NextResponse.json({ success: true, artisan });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}