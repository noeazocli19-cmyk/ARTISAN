import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimitByPreset } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Strict rate limiting for registration: 5 per 60 seconds
  const limiter = rateLimitByPreset(request, 'auth')
  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Trop de tentatives d\'inscription. Veuillez réessayer plus tard.' },
      { status: 429, headers: limiter.headers }
    )
  }

  try {
    const body = await request.json()
    const { name, email, password, role, phone, location, country, avatar } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nom, email et mot de passe sont requis' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    // Hash password
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.default.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'client',
        phone: phone || null,
        location: location || null,
        country: country || null,
        avatar: avatar || null,
      },
    })

    // If registering as artisan, create artisan profile
    if (role === 'artisan') {
      const { specialties, skills, hourlyRate, experience } = body
      await db.artisan.create({
        data: {
          userId: user.id,
          specialties: JSON.stringify(specialties || []),
          skills: JSON.stringify(skills || []),
          hourlyRate: hourlyRate || 5000,
          experience: experience || 0,
        },
      })
    }

    // Generate JWT token
    const { generateToken } = await import('@/lib/auth')
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword, token }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
