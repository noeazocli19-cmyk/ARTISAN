import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/better-auth'

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const body = await request.json()
    const { avatar, name, phone, location, country, bio, role } = body
    const userId = session.user.id

    const updateData: Record<string, string> = {
      updatedAt: new Date().toISOString(),
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar
      updateData.image = avatar
    }
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (location !== undefined) updateData.location = location
    if (country !== undefined) updateData.country = country
    if (bio !== undefined) updateData.bio = bio
    if (role !== undefined) updateData.role = role

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        location: true,
        country: true,
        bio: true,
        isVerified: true,
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}