'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, Loader2 } from 'lucide-react'

const PROFESSIONS = [
  'Plombier', 'Electricien', 'Menuisier', 'Peintre', 'Serrurier', 'Macon',
  'Climatiseur', 'Agent de nettoyage', 'Soudeur', 'Carreleur', 'Couturier',
  'Couvreur', 'Plâtrier', 'Pâtissier', 'Mechanicien', 'Coiffeur',
  'Paysagiste', 'Vitrier', 'Ferronnier', 'Photographe', 'Autre',
]

export default function BecomeArtisanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    profession: '',
    experience: '',
    phone: '',
    location: '',
    bio: '',
    diploma: '',
    qualification: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.profession || !form.location) {
      setError('Merci de renseigner au moins ton métier et ta localisation.')
      return
    }
    setLoading(true)
    try {
      const profileRes = await fetch('/api/artisans/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profession: form.profession,
          specialties: [form.profession],
          experience: parseInt(form.experience) || 0,
          phone: form.phone,
          location: form.location,
          address: form.location,
          bio: form.bio,
          skills: [form.profession],
          certifications: [form.diploma, form.qualification].filter(Boolean),
        }),
      })
      if (!profileRes.ok) {
        setError("Erreur lors de la création du profil artisan.")
        return
      }

      const roleRes = await fetch('/api/user/become-artisan', { method: 'POST' })
      if (!roleRes.ok) {
        setError("Erreur lors du passage en compte artisan.")
        return
      }

      router.push('/dashboard/artisan')
    } catch {
      setError('Erreur réseau, réessaie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md rounded-2xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: '#2596BE' }}>
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">Je veux devenir artisan</h1>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
          Ton compte reste le même — complète juste ton profil professionnel pour commencer à recevoir des missions.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Métier *</label>
            <select
              name="profession"
              value={form.profession}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
              style={{ borderColor: 'var(--border)' }}
            >
              <option value="">Choisis ton métier</option>
              {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Années d'expérience</label>
            <input
              type="number" min="0" name="experience" value={form.experience} onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Téléphone</label>
            <input
              type="tel" name="phone" value={form.phone} onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Localisation (quartier, ville) *</label>
            <input
              type="text" name="location" value={form.location} onChange={handleChange} required
              placeholder="ex: Fidjrossè, Cotonou"
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Diplôme</label>
            <input
              type="text" name="diploma" value={form.diploma} onChange={handleChange}
              placeholder="ex: CAP Plomberie, Bac Pro Électrotechnique..."
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Qualification / Certification</label>
            <input
              type="text" name="qualification" value={form.qualification} onChange={handleChange}
              placeholder="ex: Habilitation électrique, Certificat de soudure..."
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Présentation courte</label>
            <textarea
              name="bio" value={form.bio} onChange={handleChange} rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-white font-semibold rounded-full py-2.5 text-sm disabled:opacity-60"
            style={{ backgroundColor: '#2596BE' }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Création...' : 'Devenir artisan'}
          </button>
        </form>
      </div>
    </div>
  )
}