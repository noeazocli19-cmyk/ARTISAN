'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Wrench } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [devCode, setDevCode] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur')
        return
      }
      if (data.devCode) setDevCode(data.devCode)
      setSent(true)
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-white text-xl font-semibold">Artisan Connect</h1>
          </div>
          <p className="text-white/80 text-sm mt-2">Mot de passe oublie</p>
        </div>
        <div className="p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h2 className="text-lg font-semibold mb-2">Code envoye !</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Si un compte existe avec <span className="font-medium">{email}</span>, vous recevrez un code a 6 chiffres.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Le code expire dans 15 minutes.
              </p>
              {devCode && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">
                    Envoi d&apos;email non configuré — voici votre code (visible uniquement en développement) :
                  </p>
                  <p className="text-2xl font-bold tracking-widest text-amber-700 dark:text-amber-400">{devCode}</p>
                </div>
              )}
              <Link href="/reset-password">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
                  Entrer le code
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Entrez votre email pour recevoir un code de reinitialisation.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-sm text-red-600">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 h-11"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                  Envoyer le code
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-amber-600 hover:text-amber-700 hover:underline">
                  Retour a la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}