'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { LifeBuoy, Send } from 'lucide-react'
import { toast } from 'sonner'

type Ticket = { id:string; subject:string; message:string; status:string; response?:string|null; category:string; createdAt:string; user?:{name:string|null;email:string} }

export default function AdminSupportPage() {
  const { data: session } = authClient.useSession()
  const [tickets,setTickets] = useState<Ticket[]>([])
  const [answers,setAnswers] = useState<Record<string,string>>({})
  async function load() { const r=await fetch('/api/support/id',{credentials:'include'}); const d=await r.json(); if(r.ok) setTickets(d.tickets || []) }
  async function reply(ticket:Ticket) { const response=(answers[ticket.id]||ticket.response||'').trim(); if(!response){toast.error('Écrivez une réponse');return}; const r=await fetch(`/api/support/${ticket.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({response})}); if(!r.ok){toast.error('Impossible de répondre');return};toast.success('Réponse envoyée');await load() }
  useEffect(()=>{if(session?.user?.id)void load()},[session?.user?.id])
  return <main className="min-h-screen bg-slate-50 p-4 pb-24"><div className="mx-auto max-w-4xl"><div className="mb-5 flex items-center gap-3"><LifeBuoy className="text-brand-600"/><h1 className="text-xl font-bold">Support administrateur</h1></div><div className="space-y-4">{tickets.map(ticket=><Card key={ticket.id} className="rounded-2xl p-4"><div className="flex justify-between gap-3"><div><h2 className="font-semibold">{ticket.subject}</h2><p className="text-xs text-slate-500">{ticket.user?.name || ticket.user?.email} · {ticket.category}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{ticket.status}</span></div><p className="mt-3 rounded-xl bg-slate-100 p-3 text-sm">{ticket.message}</p><Textarea className="mt-3" value={answers[ticket.id] ?? ticket.response ?? ''} onChange={(e)=>setAnswers(v=>({...v,[ticket.id]:e.target.value}))} placeholder="Réponse à l'utilisateur…"/><Button className="mt-3" onClick={()=>reply(ticket)}><Send className="mr-2 h-4 w-4"/>Envoyer la réponse</Button></Card>)}</div></div></main>
}
