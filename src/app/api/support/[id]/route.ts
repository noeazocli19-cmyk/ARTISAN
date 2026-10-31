import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/better-auth'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  const user = session?.user?.id ? await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } }) : null
  if (user?.role !== 'admin') return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
  const tickets = await db.supportTicket.findMany({ include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ tickets })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers })
  const user = session?.user?.id ? await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } }) : null
  if (user?.role !== 'admin') return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
  const { id } = await params
  const body = await request.json()
  const response = typeof body.response === 'string' ? body.response.trim().slice(0, 5000) : ''
  if (!response) return NextResponse.json({ error: 'Réponse requise' }, { status: 400 })
  const ticket = await db.supportTicket.update({ where: { id }, data: { response, status: body.status === 'en_cours' ? 'en_cours' : 'resolu', updatedAt: new Date() } })
  await db.notification.create({ data: { userId: ticket.userId, title: 'Réponse du support', message: `FINDA a répondu à votre ticket « ${ticket.subject} ».`, type: 'support', link: '/support' } })
  return NextResponse.json({ ticket })
}
