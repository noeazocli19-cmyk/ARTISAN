'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Trash2, Ban, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

type Report = { id: string; reason: string; details?: string|null; status: string; reporter?: { name:string|null; email:string }; postId?: string|null; commentId?: string|null; post?: { id:string; content:string; authorId:string }; comment?: { id:string; content:string; authorId:string } }

export default function ModerationPage() {
  const { data: session } = authClient.useSession()
  const [reports, setReports] = useState<Report[]>([])
  async function load() { const r = await fetch('/api/reports', { credentials:'include' }); const d = await r.json(); if(r.ok) setReports(d.reports || []) }
  async function action(report: Report, action: string) { const authorId = report.post?.authorId || report.comment?.authorId; const r = await fetch('/api/reports',{method:'PATCH',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({reportId:report.id,action,authorId})}); if(!r.ok){toast.error('Action impossible');return}; toast.success('Signalement traité'); await load() }
  useEffect(()=>{if(session?.user?.id) void load()},[session?.user?.id])
  return <main className="min-h-screen bg-slate-50 p-4 pb-24"><div className="mx-auto max-w-3xl"><div className="mb-5 flex items-center gap-3"><ShieldAlert className="text-red-500"/><h1 className="text-xl font-bold">Modération des contenus</h1></div>{reports.length===0?<Card className="p-8 text-center text-sm text-slate-500">Aucun signalement.</Card>:<div className="space-y-3">{reports.map(r=><Card key={r.id} className="rounded-2xl p-4"><div className="flex items-start justify-between gap-3"><div><b>{r.reason}</b><p className="text-sm text-slate-500">{r.details || 'Aucun détail'}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{r.status}</span></div>{(r.post||r.comment)&&<p className="mt-3 rounded-xl bg-slate-100 p-3 text-sm">{r.post?.content || r.comment?.content}</p>}<p className="mt-2 text-xs text-slate-500">Signalé par {r.reporter?.name || r.reporter?.email}</p><div className="mt-3 flex flex-wrap gap-2">{r.postId&&<Button size="sm" variant="destructive" onClick={()=>action(r,'remove_post')}><Trash2 className="mr-1 h-4 w-4"/>Supprimer la publication</Button>}{r.commentId&&<Button size="sm" variant="destructive" onClick={()=>action(r,'remove_comment')}><Trash2 className="mr-1 h-4 w-4"/>Supprimer le commentaire</Button>}<Button size="sm" variant="outline" onClick={()=>action(r,'suspend_author')}><Ban className="mr-1 h-4 w-4"/>Suspendre</Button><Button size="sm" onClick={()=>action(r,'resolve')}><CheckCircle2 className="mr-1 h-4 w-4"/>Résolu</Button><Button size="sm" variant="ghost" onClick={()=>action(r,'dismiss')}>Rejeter</Button></div></Card>)}</div>}</div></main>
}
