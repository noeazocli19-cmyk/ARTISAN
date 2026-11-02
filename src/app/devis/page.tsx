'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { BadgeCheck, Banknote, ClipboardCheck, Clock3, FileText } from 'lucide-react'

type Quote = { id: string; title: string; description?: string; amount: number; status: string; artisanNote?: string; mission?: { id: string; status: string }; client?: { name?: string }; artisan?: { user?: { name?: string } } }

export default function QuotesPage() {
  const { data: session } = authClient.useSession()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  async function load() {
    setLoading(true)
    try { const response = await fetch('/api/quotes', { credentials: 'include', cache: 'no-store' }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setQuotes(data.quotes || []) }
    catch (error: any) { toast.error(error.message || 'Impossible de charger les devis') }
    finally { setLoading(false) }
  }
  useEffect(() => { if (session?.user?.id) void load() }, [session?.user?.id])
  async function updateQuote(id: string, status: string) {
    try { const response = await fetch(`/api/quotes/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, amount: amounts[id] ? Number(amounts[id]) : undefined, note: notes[id] || undefined }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); toast.success(status === 'accepte' ? 'Devis accepté, mission créée' : 'Statut du devis mis à jour'); await load() }
    catch (error: any) { toast.error(error.message || 'Action impossible') }
  }
  const statusLabel: Record<string, string> = { en_attente: 'En attente', accepte: 'Accepté', refuse: 'Refusé', expire: 'Annulé' }
  return (
    <main className="min-h-screen bg-[#f7f8f6] pb-24 dark:bg-slate-950 md:pb-8">
      <div className="mx-auto max-w-3xl px-4 py-5 sm:py-8">
        <div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20"><FileText className="h-5 w-5" /></div><div><h1 className="text-xl font-bold sm:text-2xl">Mes devis</h1><p className="text-sm text-slate-500">Suivez les propositions et leurs missions.</p></div></div>
        {!session?.user?.id ? <Card className="p-8 text-center text-sm text-slate-500">Connectez-vous pour consulter vos devis.</Card> : loading ? <div className="space-y-3">{[1,2,3].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-slate-200/70" />)}</div> : quotes.length === 0 ? <Card className="p-10 text-center"><ClipboardCheck className="mx-auto mb-3 h-9 w-9 text-brand-500" /><p className="font-semibold">Aucun devis pour le moment</p><p className="mt-1 text-sm text-slate-500">Vos demandes et propositions apparaÃƒÂ®tront ici.</p></Card> : <div className="space-y-3">
          {quotes.map((quote) => <Card key={quote.id} className="rounded-2xl p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-bold text-slate-900 dark:text-white">{quote.title}</p><p className="mt-1 text-xs text-slate-500">{quote.client?.name ? `Client : ${quote.client.name}` : quote.artisan?.user?.name ? `Artisan : ${quote.artisan.user.name}` : ''}</p></div><span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"><Clock3 className="h-3 w-3" />{statusLabel[quote.status] || quote.status}</span></div>
            {quote.description && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{quote.description}</p>}
            {quote.artisanNote && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">{quote.artisanNote}</p>}
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold"><Banknote className="h-4 w-4 text-brand-600" />{quote.amount ? `${quote.amount.toLocaleString('fr-FR')} XAF` : 'Montant à proposer'}</div>
            {quote.status === 'en_attente' && (session.user as typeof session.user & { role?: string }).role === 'artisan' && <div className="mt-4 grid gap-2 sm:grid-cols-[140px_1fr]"><Input type="number" min="0" value={amounts[quote.id] || ''} onChange={(event) => setAmounts((current) => ({ ...current, [quote.id]: event.target.value }))} placeholder="Montant XAF" /><Textarea rows={2} value={notes[quote.id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [quote.id]: event.target.value }))} placeholder="Note pour le client" /></div>}
            {quote.status === 'en_attente' && (session.user as typeof session.user & { role?: string }).role === 'artisan' && <div className="mt-3 flex gap-2"><Button className="flex-1" onClick={() => void updateQuote(quote.id, 'accepte')}><BadgeCheck className="mr-2 h-4 w-4" />Proposer et accepter</Button><Button variant="outline" onClick={() => void updateQuote(quote.id, 'refuse')}>Refuser</Button></div>}
            {quote.status === 'accepte' && quote.mission && <Button variant="outline" className="mt-4 w-full" asChild><a href={`/missions/${quote.mission.id}`}>Voir la mission {quote.mission.status.replace('_', ' ')}</a></Button>}
          </Card>)}
        </div>}
      </div>
    </main>
  )
}
