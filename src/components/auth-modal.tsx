'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import type { UserRole } from '@/lib/types'
import { PhotoUploader } from '@/components/photo-uploader'
import { Loader2, AlertCircle, Wrench, User } from 'lucide-react'

const COUNTRIES = [
  'Sénégal', 'Côte d\'Ivoire', 'Ghana', 'Togo', 'Mali',
  'Guinée', 'Bénin', 'Burkina Faso', 'Cameroun', 'Gabon',
  'Congo', 'RDC', 'Niger', 'Mauritanie', 'Cap-Vert',
]

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'register'
}

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  const { login, isLoading } = useAppStore()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regRole, setRegRole] = useState<UserRole>('client')
  const [regPhone, setRegPhone] = useState('')
  const [regLocation, setRegLocation] = useState('')
  const [regCountry, setRegCountry] = useState('')
  const [regAvatarUrl, setRegAvatarUrl] = useState<string | null>(null)
  const [regError, setRegError] = useState('')

  const [activeTab, setActiveTab] = useState(defaultTab)

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState('')

  // Reset password state
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      await login(loginEmail, loginPassword)
      onOpenChange(false)
      setLoginEmail('')
      setLoginPassword('')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Erreur de connexion')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')

    if (regPassword !== regConfirmPassword) {
      setRegError('Les mots de passe ne correspondent pas')
      return
    }

    if (regPassword.length < 6) {
      setRegError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          phone: regPhone || undefined,
          location: regLocation || undefined,
          country: regCountry || undefined,
          avatar: regAvatarUrl || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erreur d\'inscription')
      }

      // CONNEXION AUTOMATIQUE : On utilise directement le token retourné par l'API
      // Sans rappeler login() pour éviter les conflits
      useAppStore.setState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      })

      // Fermer la modale
      onOpenChange(false)

      // Reset des champs
      setRegName('')
      setRegEmail('')
      setRegPassword('')
      setRegConfirmPassword('')
      setRegPhone('')
      setRegLocation('')
      setRegCountry('')
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'Erreur d\'inscription')
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError('')
    setForgotLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi')
      }
      setForgotSuccess(true)
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError('')
    if (newPassword !== confirmNewPassword) {
      setResetError('Les mots de passe ne correspondent pas')
      return
    }
    if (newPassword.length < 6) {
      setResetError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setResetLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: resetToken, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la réinitialisation')
      }
      setResetSuccess(true)
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Erreur lors de la réinitialisation')
    } finally {
      setResetLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('reset_token')
      if (token) {
        setResetToken(token)
        setShowResetPassword(true)
        onOpenChange(true)
        window.history.replaceState({}, '', '/')
      }
    }
  }, [])

  return (
    <>
      {/* ====== DIALOGUE PRINCIPAL (Login / Register) ====== */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-6 pb-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <DialogHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <DialogTitle className="text-white text-xl">Artisan Connect</DialogTitle>
              </div>
              <p className="text-white/80 text-sm">Connectez-vous ou créez votre compte</p>
            </DialogHeader>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full">
            <TabsList className="w-full rounded-none border-b bg-transparent h-12 p-0">
              <TabsTrigger value="login" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none h-12 font-medium">
                Se connecter
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none h-12 font-medium">
                S&apos;inscrire
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="p-6 mt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {loginError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="votre@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input id="login-password" type="password" placeholder="••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 h-11" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Se connecter
                </Button>
                <button type="button" onClick={() => { onOpenChange(false); setTimeout(() => { setShowForgotPassword(true); setForgotError('') }, 300) }} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mot de passe oublié ?
                </button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="p-6 mt-0 max-h-[60vh] overflow-y-auto">
              <form onSubmit={handleRegister} className="space-y-4">
                {regError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {regError}
                  </div>
                )}
                <div className="flex flex-col items-center py-2">
                  <PhotoUploader currentAvatar={regAvatarUrl} userName={regName || undefined} size="lg" type="avatars" onUploadComplete={(url) => setRegAvatarUrl(url)} />
                </div>
                <div className="space-y-2">
                  <Label>Vous êtes</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setRegRole('client')} className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${regRole === 'client' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' : 'border-border hover:border-amber-300'}`}>
                      <User className={`h-6 w-6 ${regRole === 'client' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${regRole === 'client' ? 'text-amber-600' : 'text-muted-foreground'}`}>Client</span>
                    </button>
                    <button type="button" onClick={() => setRegRole('artisan')} className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${regRole === 'artisan' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' : 'border-border hover:border-amber-300'}`}>
                      <Wrench className={`h-6 w-6 ${regRole === 'artisan' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${regRole === 'artisan' ? 'text-amber-600' : 'text-muted-foreground'}`}>Artisan</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nom complet</Label>
                  <Input id="reg-name" placeholder="Votre nom" value={regName} onChange={e => setRegName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" placeholder="votre@email.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Mot de passe</Label>
                    <Input id="reg-password" type="password" placeholder="••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirmer</Label>
                    <Input id="reg-confirm" type="password" placeholder="••••••" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Téléphone (optionnel)</Label>
                  <Input id="reg-phone" placeholder="+221 77 123 45 67" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="reg-location">Localisation</Label>
                    <Input id="reg-location" placeholder="Dakar, Abidjan..." value={regLocation} onChange={e => setRegLocation(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Pays</Label>
                    <Select value={regCountry} onValueChange={setRegCountry}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 h-11" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Créer mon compte
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* ====== DIALOGUE MOT DE PASSE OUBLIÉ ====== */}
      <Dialog open={showForgotPassword} onOpenChange={(open) => { setShowForgotPassword(open); if (!open) { setForgotSuccess(false); setForgotError('') } }}>
        <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-6 pb-8">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Mot de passe oublié</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            {forgotSuccess ? (
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold mb-2">Email envoyé !</h3>
                <p className="text-sm text-muted-foreground mb-4">Si un compte existe avec l&apos;adresse <strong>{forgotEmail}</strong>, vous recevrez un code pour réinitialiser votre mot de passe.</p>
                <Button onClick={() => { setShowForgotPassword(false); setForgotSuccess(false); setShowResetPassword(true) }} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
                  J&apos;ai mon code, je réinitialise
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-sm text-red-600">{forgotError}</div>}
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Adresse email</Label>
                  <Input id="forgot-email" type="email" placeholder="votre@email.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 h-11" disabled={forgotLoading}>
                  {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Envoyer le code
                </Button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ====== DIALOGUE RÉINITIALISATION MOT DE PASSE ====== */}
      <Dialog open={showResetPassword} onOpenChange={(open) => { setShowResetPassword(open); if (!open) { setResetSuccess(false); setResetError('') } }}>
        <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-6 pb-8">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Nouveau mot de passe</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            {resetSuccess ? (
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold mb-2">Mot de passe mis à jour !</h3>
                <p className="text-sm text-muted-foreground mb-4">Vous pouvez maintenant vous connecter.</p>
                <Button onClick={() => { setShowResetPassword(false); setResetSuccess(false); setActiveTab('login'); onOpenChange(true) }} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
                  Se connecter
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {resetError && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-sm text-red-600">{resetError}</div>}
                <div className="space-y-2">
                  <Label htmlFor="reset-code">Code reçu par email</Label>
                  <Input id="reset-code" placeholder="000000" value={resetToken} onChange={e => setResetToken(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input id="new-password" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirmer</Label>
                  <Input id="confirm-new-password" type="password" placeholder="••••••••" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 h-11" disabled={resetLoading}>
                  {resetLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Réinitialiser
                </Button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}