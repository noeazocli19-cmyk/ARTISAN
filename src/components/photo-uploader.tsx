'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Camera, Upload, X, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

interface PhotoUploaderProps {
  /** Current avatar URL (if any) */
  currentAvatar?: string | null
  /** User name for fallback initials */
  userName?: string
  /** Upload type: avatars or portfolio */
  type?: 'avatars' | 'portfolio'
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Called after successful upload */
  onUploadComplete?: (url: string) => void
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
  xl: 'h-32 w-132',
}

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
}

export function PhotoUploader({
  currentAvatar,
  userName,
  type = 'avatars',
  size = 'lg',
  onUploadComplete,
}: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { updateAvatar } = useAppStore()

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const uploadFile = useCallback(async (file: File) => {
    // Validate
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez JPG, PNG, WebP ou GIF.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux. Maximum 5 Mo.')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Show preview immediately
      const localPreview = URL.createObjectURL(file)
      setPreview(localPreview)

      // Upload to server
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Erreur lors du téléchargement')
        setPreview(currentAvatar || null)
        return
      }

      // Update avatar in store if it's an avatar upload
      if (type === 'avatars') {
        await updateAvatar(data.url)
      }

      // Call the callback
      onUploadComplete?.(data.url)
    } catch (err) {
      setError('Erreur de connexion. Réessayez.')
      setPreview(currentAvatar || null)
    } finally {
      setIsUploading(false)
    }
  }, [currentAvatar, onUploadComplete, type, updateAvatar])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    // Reset input so the same file can be selected again
    e.target.value = ''
  }, [uploadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }, [uploadFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleRemove = useCallback(() => {
    setPreview(null)
    setError(null)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar display area */}
      <div
        className={`relative group ${sizeClasses[size]} rounded-full overflow-hidden ${
          isDragOver ? 'ring-4 ring-amber-400 ring-offset-2' : ''
        } ${!preview ? 'bg-gradient-to-br from-amber-500 to-orange-600' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <Image
            src={preview}
            alt={userName || 'Photo de profil'}
            fill
            className="object-cover"
            sizes={size === 'sm' ? '40px' : size === 'md' ? '64px' : size === 'lg' ? '96px' : '128px'}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-white font-bold">
            {size === 'sm' ? (
              <span className="text-xs">{getInitials(userName)}</span>
            ) : (
              <span>{getInitials(userName)}</span>
            )}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          {isUploading ? (
            <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
          ) : (
            <Camera className={`${iconSizes[size]} text-white`} />
          )}
        </div>

        {/* Remove button */}
        {preview && !isUploading && (
          <button
            onClick={handleRemove}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Upload buttons */}
      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-3 w-3" />
          {isUploading ? 'Envoi...' : 'Choisir une photo'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-xs text-amber-600 hover:text-amber-700"
          disabled={isUploading}
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera className="h-3 w-3" />
          Prendre une photo
        </Button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 text-center max-w-[200px]">{error}</p>
      )}

      {/* Helper text */}
      <p className="text-[10px] text-muted-foreground text-center">
        JPG, PNG, WebP ou GIF — 5 Mo max
      </p>
    </div>
  )
}
