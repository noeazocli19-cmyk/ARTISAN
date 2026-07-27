import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, specialties, skills, hourlyRate, experience, isAvailable, certifications, bio } = body

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const artisanData: Record<string, unknown> = {}
    if (specialties !== undefined) artisanData.specialties = JSON.stringify(specialties)
    if (skills !== undefined) artisanData.skills = JSON.stringify(skills)
    if (hourlyRate !== undefined) artisanData.hourlyRate = hourlyRate
    if (experience !== undefined) artisanData.experience = experience
    if (isAvailable !== undefined) artisanData.isAvailable = isAvailable
    if (certifications !== undefined) artisanData.certifications = JSON.stringify(certifications)

    if (bio !== undefined) {
      await db.user.update({ where: { id: userId }, data: { bio } })
    }

    const existingArtisan = await db.artisan.findUnique({ where: { userId } })

    let artisan
    if (existingArtisan) {
      artisan = await db.artisan.update({
        where: { userId },
        data: artisanData,
        include: { user: { select: { id: true, name: true, avatar: true, location: true, country: true, email: true, phone: true, bio: true, isVerified: true } } },
      })
    } else {
      artisan = await db.artisan.create({
        data: {
          userId,
          specialties: artisanData.specialties as string || JSON.stringify([]),
          skills: artisanData.skills as string || JSON.stringify([]),
          hourlyRate: (artisanData.hourlyRate as number) || 5000,
          experience: (artisanData.experience as number) || 0,
          isAvailable: (artisanData.isAvailable as boolean) ?? true,
          certifications: artisanData.certifications as string || JSON.stringify([]),
          portfolio: JSON.stringify([]),
        },
        include: { user: { select: { id: true, name: true, avatar: true, location: true, country: true, email: true, phone: true, bio: true, isVerified: true } } },
      })
    }

    return NextResponse.json({ success: true, artisan })
  } catch (error) {
    console.error('Artisan profile create/update error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du profil artisan' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, specialties, skills, hourlyRate, experience, isAvailable, certifications, bio } = body

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
    }

    const existingArtisan = await db.artisan.findUnique({ where: { userId } })
    if (!existingArtisan) {
      return NextResponse.json({ error: 'Profil artisan non trouvé' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (specialties !== undefined) updateData.specialties = typeof specialties === 'string' ? specialties : JSON.stringify(specialties)
    if (skills !== undefined) updateData.skills = typeof skills === 'string' ? skills : JSON.stringify(skills)
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate
    if (experience !== undefined) updateData.experience = experience
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable
    if (certifications !== undefined) updateData.certifications = typeof certifications === 'string' ? certifications : JSON.stringify(certifications)

    if (bio !== undefined) {
      await db.user.update({ where: { id: userId }, data: { bio } })
    }

    const artisan = await db.artisan.update({
      where: { userId },
      data: updateData,
      include: { user: { select: { id: true, name: true, avatar: true, location: true, country: true, email: true, phone: true, bio: true, isVerified: true } } },
    })

    return NextResponse.json({ success: true, artisan })
  } catch (error) {
    console.error('Artisan profile update error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil artisan' }, { status: 500 })
  }
}