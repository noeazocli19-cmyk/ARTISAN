import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/better-auth";

function safeStringify(value: any): string {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "[]";
  return JSON.stringify(value);
}

function safeParse(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  }
  return [];
}

// Convertit une adresse texte en coordonnées GPS via le service de géocodage interne.
// Ne bloque jamais la sauvegarde du profil si le géocodage échoue.
async function geocodeAddress(address: string, origin: string): Promise<{ latitude: number; longitude: number } | null> {
  if (!address || address.trim().length < 3) return null;
  try {
    const res = await fetch(`${origin}/api/geocode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success) {
      return { latitude: data.latitude, longitude: data.longitude };
    }
    return null;
  } catch (error) {
    console.error("Erreur géocodage (non bloquant):", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    const artisan = await db.artisan.findUnique({
      where: { userId: session.user.id },
    });
    if (!artisan) {
      return NextResponse.json({ artisan: null }, { status: 200 });
    }
    const parsedArtisan = {
      ...artisan,
      skills: safeParse(artisan.skills),
      specialties: safeParse(artisan.specialties),
      certifications: safeParse(artisan.certifications),
      portfolio: safeParse(artisan.portfolio),
    };
    return NextResponse.json({ artisan: parsedArtisan }, { status: 200 });
  } catch (error: any) {
    console.error("GET profile error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    const body = await request.json();
    const userId = session.user.id;

    // Géocodage optionnel : si une adresse est fournie et qu'elle n'est pas déjà
    // au format "lat, lng" (cas du bouton GPS), on la convertit en coordonnées.
    let latitude: number | undefined;
    let longitude: number | undefined;
    if (body.address) {
      const gpsMatch = body.address.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
      if (gpsMatch) {
        latitude = parseFloat(gpsMatch[1]);
        longitude = parseFloat(gpsMatch[2]);
      } else {
        const origin = request.nextUrl.origin;
        const geo = await geocodeAddress(body.address, origin);
        if (geo) {
          latitude = geo.latitude;
          longitude = geo.longitude;
        }
      }
    }

    const artisan = await db.artisan.upsert({
      where: { userId },
      update: {
        phone: body.phone || undefined,
        profession: body.profession || undefined,
        specialties: safeStringify(body.specialties || []),
        portfolio: safeStringify(body.portfolio || []),
        skills: safeStringify(body.skills || []),
        certifications: safeStringify(body.certifications || []),
        experience: body.experience !== undefined ? Number(body.experience) : undefined,
        location: body.location || undefined,
        country: body.country || undefined,
        address: body.address || undefined,
        bio: body.bio || undefined,
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
      },
      create: {
        userId,
        phone: body.phone || "",
        profession: body.profession || "",
        specialties: safeStringify(body.specialties || []),
        portfolio: safeStringify(body.portfolio || []),
        skills: safeStringify(body.skills || []),
        certifications: safeStringify(body.certifications || []),
        experience: body.experience ? Number(body.experience) : 0,
        location: body.location || "",
        country: body.country || "",
        address: body.address || "",
        bio: body.bio || "",
        latitude,
        longitude,
      },
    });

    const parsedArtisan = {
      ...artisan,
      skills: safeParse(artisan.skills),
      specialties: safeParse(artisan.specialties),
      certifications: safeParse(artisan.certifications),
      portfolio: safeParse(artisan.portfolio),
    };
    return NextResponse.json({ artisan: parsedArtisan }, { status: 201 });
  } catch (error: any) {
    console.error("POST profile error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    const body = await request.json();
    const userId = session.user.id;
    const updateData: any = {};
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.profession !== undefined) updateData.profession = body.profession;
    if (body.specialties !== undefined) updateData.specialties = safeStringify(body.specialties);
    if (body.portfolio !== undefined) updateData.portfolio = safeStringify(body.portfolio);
    if (body.skills !== undefined) updateData.skills = safeStringify(body.skills);
    if (body.certifications !== undefined) updateData.certifications = safeStringify(body.certifications);
    if (body.experience !== undefined) updateData.experience = Number(body.experience);
    if (body.location !== undefined) updateData.location = body.location;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.bio !== undefined) updateData.bio = body.bio;

    if (body.address !== undefined) {
      updateData.address = body.address;
      const gpsMatch = body.address?.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
      if (gpsMatch) {
        updateData.latitude = parseFloat(gpsMatch[1]);
        updateData.longitude = parseFloat(gpsMatch[2]);
      } else if (body.address) {
        const origin = request.nextUrl.origin;
        const geo = await geocodeAddress(body.address, origin);
        if (geo) {
          updateData.latitude = geo.latitude;
          updateData.longitude = geo.longitude;
        }
      }
    }

    // Si l'artisan n'a pas encore de profil, PATCH échouerait (P2025) : on
    // bascule alors sur une création (upsert) plutôt que de planter en 500.
    const artisan = await db.artisan.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        phone: body.phone || "",
        profession: body.profession || "",
        specialties: safeStringify(body.specialties || []),
        portfolio: safeStringify(body.portfolio || []),
        skills: safeStringify(body.skills || []),
        certifications: safeStringify(body.certifications || []),
        experience: body.experience ? Number(body.experience) : 0,
        location: body.location || "",
        country: body.country || "",
        address: body.address || "",
        bio: body.bio || "",
        latitude: updateData.latitude,
        longitude: updateData.longitude,
      },
    });
    const parsedArtisan = {
      ...artisan,
      skills: safeParse(artisan.skills),
      specialties: safeParse(artisan.specialties),
      certifications: safeParse(artisan.certifications),
      portfolio: safeParse(artisan.portfolio),
    };
    return NextResponse.json({ artisan: parsedArtisan }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH profile error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

