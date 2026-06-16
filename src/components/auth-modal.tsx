'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { Badge } from '@/components/ui/badge'
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
import { Mail, Lock, User, Phone, MapPin, Globe, Loader2, AlertCircle, Wrench, Eye, EyeOff, KeyRound } from 'lucide-react'

const COUNTRIES = [
  'Sénégal', 'Côte d\'Ivoire', 'Ghana', 'Togo', 'Mali',
  'Guinée', 'Bénin', 'Burkina Faso', 'Cameroun', 'Gabon',
  'Congo', 'RDC', 'Niger', 'Mauritanie', 'Cap-Vert',
]

const CATEGORY_OPTIONS = [
  'Plomberie', 'Électricité', 'Menuiserie', 'Peinture',
  'Serrurerie', 'Maçonnerie', 'Climatisation', 'Nettoyage',
]

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'register'
}

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  const { login, register, isLoading } = useAppStore()

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regRole, setRegRole] = useState<UserRole>('client')
  const [regPhone, setRegPhone] = useState('')
  const [regLocation, setRegLocation] = useState('')
  const [regCountry, setRegCountry] = useState('')
  const [regSpecialties, setRegSpecialties] = useState<string[]>([])
  const [regHourlyRate, setRegHourlyRate] = useState('')
  const [regExperience, setRegExperience] = useState('')
  const [regAvatarUrl, setRegAvatarUrl] = useState<string | null>(null)
  const [regError, setRegError] = useState('')

  const [activeTab, setActiveTab] = useState(defaultTab)

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)

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
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      await login(loginEmail, loginPassword)
      onOpenChange(false)
      resetLoginFields()
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
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        phone: regPhone || undefined,
        location: regLocation || undefined,
        country: regCountry || undefined,
      })
      onOpenChange(false)
      resetRegisterFields()
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'Erreur d\'inscription')
    }
  }

  const resetLoginFields = () => {
    setLoginEmail('')
    setLoginPassword('')
    setLoginError('')
  }

  const resetRegisterFields = () => {
    setRegName('')
    setRegEmail('')
    setRegPassword('')
    setRegConfirmPassword('')
    setRegRole('client')
    setRegPhone('')
    setRegLocation('')
    setRegCountry('')
    setRegSpecialties([])
    setRegHourlyRate('')
    setRegExperience('')
    setRegError('')
  }

  const toggleSpecialty = (spec: string) => {
    setRegSpecialties(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    )
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
        body: JSON.stringify({ token: resetToken, password: newPassword }),
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

  // Check for reset token in URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('reset_token')
      if (token) {
        setResetToken(token)
        setShowResetPassword(true)
        onOpenChange(true)
        // Clean URL
        window.history.replaceState({}, '', '/')
      }
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        {/* Header with gradient */}
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
            <TabsTrigger
              value="login"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none h-12 font-medium"
            >
              Se connecter
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none h-12 font-medium"
            >
              S&apos;inscrire
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="p-6 mt-0">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {loginError}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true)
                    setForgotEmail(loginEmail)
                  }}
                  className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Se connecter
              </Button>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="p-6 mt-0 max-h-[60vh] overflow-y-auto">
            <form onSubmit={handleRegister} className="space-y-4">
              {regError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {regError}
                </motion.div>
              )}

              {/* Photo de profil */}
              <div className="flex flex-col items-center py-2">
                <PhotoUploader
                  currentAvatar={regAvatarUrl}
                  userName={regName || undefined}
                  size="lg"
                  type="avatars"
                  onUploadComplete={(url) => setRegAvatarUrl(url)}
                />
              </div>

              {/* Role selector */}
              <div className="space-y-2">
                <Label>Vous êtes</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegRole('client')}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      regRole === 'client'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                        : 'border-border hover:border-amber-300'
                    }`}
                  >
                    <User className={`h-6 w-6 ${regRole === 'client' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-medium ${regRole === 'client' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      Client
                    </span>
                    {regRole === 'client' && (
                      <motion.div
                        layoutId="role-indicator"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center"
                      >
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('artisan')}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      regRole === 'artisan'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                        : 'border-border hover:border-amber-300'
                    }`}
                  >
                    <Wrench className={`h-6 w-6 ${regRole === 'artisan' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-medium ${regRole === 'artisan' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      Artisan
                    </span>
                    {regRole === 'artisan' && (
                      <motion.div
                        layoutId="role-indicator"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center"
                      >
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-name">Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-name"
                    placeholder="Votre nom"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Confirmer</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-confirm"
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showRegConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-phone">Téléphone (optionnel)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-phone"
                    placeholder="+221 77 123 45 67"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-location">Localisation</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-location"
                      placeholder="Dakar, Abidjan..."
                      value={regLocation}
                      onChange={e => setRegLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Select value={regCountry} onValueChange={setRegCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Artisan-specific fields */}
              <AnimatePresence>
                {regRole === 'artisan' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-3">
                        Informations artisan
                      </p>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Spécialités</Label>
                          <div className="flex flex-wrap gap-2">
                            {CATEGORY_OPTIONS.map(spec => (
                              <Badge
                                key={spec}
                                variant={regSpecialties.includes(spec) ? 'default' : 'outline'}
                                className={`cursor-pointer transition-all ${
                                  regSpecialties.includes(spec)
                                    ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                                    : 'hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                                }`}
                                onClick={() => toggleSpecialty(spec)}
                              >
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="reg-rate">Tarif horaire (FCFA)</Label>
                            <Input
                              id="reg-rate"
                              type="number"
                              placeholder="5 000"
                              value={regHourlyRate}
                              onChange={e => setRegHourlyRate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reg-exp">Expérience (années)</Label>
                            <Input
                              id="reg-exp"
                              type="number"
                              placeholder="5"
                              value={regExperience}
                              onChange={e => setRegExperience(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Créer mon compte
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={(open) => {
        setShowForgotPassword(open)
        if (!open) {
          setForgotSuccess(false)
          setForgotError('')
        }
      }}>
        <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-6 pb-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <DialogHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <KeyRound className="h-5 w-5 text-white" />
                </div>
                <DialogTitle className="text-white text-xl">Mot de passe oublié</DialogTitle>
              </div>
              <p className="text-white/80 text-sm">Recevez un lien de réinitialisation par email</p>
            </DialogHeader>
          </div>

          <div className="p-6">
            {forgotSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 mx-auto mb-4">
                  <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email envoyé !</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Si un compte existe avec l&apos;adresse <strong>{forgotEmail}</strong>,
                  vous recevrez un lien pour réinitialiser votre mot de passe.
                </p>
                <Button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotSuccess(false)
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                >
                  Retour à la connexion
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {forgotError}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Adresse email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 h-11"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Envoyer le lien
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotError('')
                  }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Retour à la connexion
                </button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPassword} onOpenChange={(open) => {
        setShowResetPassword(open)
        if (!open) {
          setResetSuccess(false)
          setResetError('')
        }
      }}>
        <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 p-6 pb-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <DialogHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <KeyRound className="h-5 w-5 text-white" />
                </div>
                <DialogTitle className="text-white text-xl">Nouveau mot de passe</DialogTitle>
              </div>
              <p className="text-white/80 text-sm">Créez votre nouveau mot de passe</p>
            </DialogHeader>
          </div>

          <div className="p-6">
            {resetSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 mx-auto mb-4">
                  <Lock className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Mot de passe mis à jour !</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
                </p>
                <Button
                  onClick={() => {
                    setShowResetPassword(false)
                    setResetSuccess(false)
                    setActiveTab('login')
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                >
                  Se connecter
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {resetError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {resetError}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-new-password"
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 h-11"
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Réinitialiser le mot de passe
                </Button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
