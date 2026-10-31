import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await request.json();
  const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 80) : '';
  const postId = typeof body.postId === 'string' ? body.postId : null;
  const commentId = typeof body.commentId === 'string' ? body.commentId : null;
  if (!reason || (!postId && !commentId)) return NextResponse.json({ error: 'Contenu et motif requis' }, { status: 400 });
  const report = await db.contentReport.create({ data: { reporterId: session.user.id, postId, commentId, reason, details: typeof body.details === 'string' ? body.details.slice(0, 2000) : null } });
  return NextResponse.json({ report }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const currentUser = session?.user?.id ? await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } }) : null;
  if (currentUser?.role !== 'admin') return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  const reports = await db.contentReport.findMany({ include: { reporter: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ reports });
}
