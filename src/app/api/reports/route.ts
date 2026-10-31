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
  const reports = await db.contentReport.findMany({ include: { reporter: { select: { id: true, name: true, email: true } }, post: { select: { id: true, content: true, authorId: true } }, comment: { select: { id: true, content: true, authorId: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ reports });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user?.id ? await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } }) : null;
  if (user?.role !== 'admin') return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  const body = await request.json();
  if (typeof body.reportId !== 'string') return NextResponse.json({ error: 'Signalement requis' }, { status: 400 });
  const report = await db.contentReport.findUnique({ where: { id: body.reportId } });
  if (!report) return NextResponse.json({ error: 'Signalement introuvable' }, { status: 404 });
  if (body.action === 'remove_post' && report.postId) await db.socialPost.delete({ where: { id: report.postId } });
  if (body.action === 'remove_comment' && report.commentId) await db.socialComment.delete({ where: { id: report.commentId } });
  if (body.action === 'suspend_author' && body.authorId) await db.user.update({ where: { id: body.authorId }, data: { role: 'suspended' } });
  const status = body.action === 'dismiss' ? 'rejete' : body.action === 'resolve' || body.action === 'remove_post' || body.action === 'remove_comment' || body.action === 'suspend_author' ? 'resolu' : (typeof body.status === 'string' ? body.status : 'examine');
  const updated = await db.contentReport.update({ where: { id: body.reportId }, data: { status, moderatorId: session!.user.id, resolution: typeof body.resolution === 'string' ? body.resolution.slice(0, 2000) : null } });
  return NextResponse.json({ report: updated });
}
