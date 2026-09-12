'use client'

import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { CheckCircle2, XCircle, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface VerificationArtisan {
  id: string
  userId: string
  profession: string | null
  identityStatus: string
  identityDocument: string | null
  user: { id: string; name: string; email: string }
}

export default function AdminVerificationsPage() {
  const { data: session, isPending } = authClient.useSession()
  const [artisans, setArtisans] = useState<VerificationArtisan[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (isPending) return
    fetch('/api/admin/verifications')
      .then(async (res) => {
        if (res.status === 403) {
          setForbidden(true)
          return
        }
        const data = await res.json()
        setArtisans(data.artisans || [])
      })
      .finally(() => setLoading(false))
  }, [isPending])

  const handleDecision = async (artisanId: string, decision: 'approuve' | 'refuse') => {
    setProcessingId(artisanId)
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artisanId, decision }),
      })
      if (res.ok) {
        setArtisans((prev) => prev.map((a) => (a.id === artisanId ? { ...a, identityStatus: decision } : a)))
        toast.success(decision === 'approuve' ? 'Artisan vérifié !' : 'Demande refusée')
      } else {
        toast.error('Erreur lors du traitement')
      }
    } finally {
      setProcessingId(null)
    }
  }

  if (isPending || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
  }

  if (forbidden || !session?.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <XCircle className="h-10 w-10 text-red-400" />
        <p className="font-semibold">Accès réservé aux administrateurs</p>
        <Link href="/" className="text-sm text-brand-600 hover:underline">Retour à l'accueil</Link>
      </div>
    )
  }

  const pending = artisans.filter((a) => a.identityStatus === 'en_attente')
  const processed = artisans.filter((a) => a.identityStatus !== 'en_attente')

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
        <ShieldCheck className="h-6 w-6 text-brand-500" />
        Vérifications d'identité
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        {pending.length} demande{pending.length !== 1 ? 's' : ''} en attente
      </p>

      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Aucune demande en attente pour le moment.</p>
      ) : (
        <div className="space-y-4 mb-10">
          {pending.map((artisan) => (
            <div key={artisan.id} className="border rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start">
              {artisan.identityDocument && (
                <a href={artisan.identityDocument} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <img src={artisan.identityDocument} alt="Pièce d'identité" className="w-32 h-32 object-cover rounded-xl border" />
                </a>
              )}
              <div className="flex-1">
                <p className="font-semibold">{artisan.user.name}</p>
                <p className="text-sm text-muted-foreground">{artisan.user.email}</p>
                <p className="text-sm text-muted-foreground">{artisan.profession || 'Métier non renseigné'}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleDecision(artisan.id, 'approuve')}
                  disabled={processingId === artisan.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approuver
                </button>
                <button
                  onClick={() => handleDecision(artisan.id, 'refuse')}
                  disabled={processingId === artisan.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-200 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" /> Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {processed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Déjà traitées</h2>
          <div className="space-y-2">
            {processed.map((artisan) => (
              <div key={artisan.id} className="flex items-center justify-between text-sm py-2 border-b">
                <span>{artisan.user.name}</span>
                <span className={artisan.identityStatus === 'approuve' ? 'text-emerald-600' : 'text-red-500'}>
                  {artisan.identityStatus === 'approuve' ? 'Approuvé' : 'Refusé'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
