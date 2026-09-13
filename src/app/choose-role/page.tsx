'use client'

import { useRouter } from 'next/navigation'
import { User, Wrench } from 'lucide-react'

export default function ChooseRolePage() {
  const router = useRouter()

  // Le compte est déjà créé avec role="client" par défaut : il suffit d'aller
  // au dashboard client. Devenir artisan se fait via la page /become-artisan
  // déjà existante, qui met à jour le rôle et complète le profil pro.
  const handleChooseClient = () => {
    router.push('/dashboard/client')
  }

  const handleChooseArtisan = () => {
    router.push('/become-artisan')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-lg text-center">
        <h1 className="text-2xl font-bold mb-2">Bienvenue sur FINDA !</h1>
        <p className="mb-8" style={{ color: 'var(--muted-foreground)' }}>
          Que souhaitez-vous faire sur la plateforme ?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleChooseClient}
            className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 transition-all hover:scale-[1.02]"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ backgroundColor: '#2596BE' }}>
              <User className="h-7 w-7 text-white" />
            </div>
            <span className="font-semibold text-lg">Je suis client</span>
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Je cherche un artisan pour un service
            </span>
          </button>

          <button
            onClick={handleChooseArtisan}
            className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 transition-all hover:scale-[1.02]"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ backgroundColor: '#2596BE' }}>
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <span className="font-semibold text-lg">Je suis artisan</span>
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Je propose mes services et je reçois des missions
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
