'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, Loader2, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface ReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  artisanName: string
  missionTitle: string
  artisanId: string
  missionId: string
  onSubmit: (rating: number, comment: string) => Promise<void>
}

const RATING_LABELS: Record<number, string> = {
  1: 'Très mauvais',
  2: 'Mauvais',
  3: 'Moyen',
  4: 'Bien',
  5: 'Excellent',
}

export function ReviewDialog({
  open,
  onOpenChange,
  artisanName,
  missionTitle,
  artisanId,
  missionId,
  onSubmit,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({})

  const displayRating = hoverRating || rating

  const handleStarHover = useCallback((starValue: number) => {
    setHoverRating(starValue)
  }, [])

  const handleStarLeave = useCallback(() => {
    setHoverRating(0)
  }, [])

  const handleStarClick = useCallback((starValue: number) => {
    setRating(starValue)
    setErrors((prev) => ({ ...prev, rating: undefined }))
  }, [])

  const handleCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setComment(e.target.value)
      if (e.target.value.length >= 10) {
        setErrors((prev) => ({ ...prev, comment: undefined }))
      }
    },
    []
  )

  const validate = useCallback(() => {
    const newErrors: { rating?: string; comment?: string } = {}

    if (rating === 0) {
      newErrors.rating = 'Veuillez sélectionner une note'
    }

    if (comment.trim().length < 10) {
      newErrors.comment = 'Le commentaire doit contenir au moins 10 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [rating, comment])

  const handleSubmit = useCallback(async () => {
    if (!validate()) return

    setIsSubmitting(true)

    try {
      await onSubmit(rating, comment.trim())

      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating,
            comment: comment.trim(),
            artisanId,
            missionId,
            authorId: '',
          }),
        })

        if (!response.ok) {
          throw new Error('Erreur lors de l\'envoi de l\'avis')
        }
      } catch {
        // The parent onSubmit is the primary handler; API call is supplementary
      }

      toast.success('Avis envoyé avec succès !', {
        description: `Votre avis pour ${artisanName} a été enregistré.`,
      })

      // Reset form and close dialog
      setRating(0)
      setHoverRating(0)
      setComment('')
      setErrors({})
      onOpenChange(false)
    } catch {
      toast.error('Erreur', {
        description: 'Impossible d\'envoyer votre avis. Veuillez réessayer.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [validate, rating, comment, artisanId, missionId, artisanName, onSubmit, onOpenChange])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // Reset state when dialog closes
        setRating(0)
        setHoverRating(0)
        setComment('')
        setErrors({})
      }
      onOpenChange(newOpen)
    },
    [onOpenChange]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Laisser un avis</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Partagez votre expérience avec{' '}
            <span className="font-semibold text-foreground">{artisanName}</span>{' '}
            pour la mission{' '}
            <span className="font-semibold text-foreground">&ldquo;{missionTitle}&rdquo;</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* Star Rating */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium">Note</Label>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isFilled = starValue <= displayRating
                  return (
                    <motion.button
                      key={starValue}
                      type="button"
                      onClick={() => handleStarClick(starValue)}
                      onMouseEnter={() => handleStarHover(starValue)}
                      onMouseLeave={handleStarLeave}
                      className="relative cursor-pointer rounded-md p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: isFilled && hoverRating > 0 ? 1.1 : 1,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 17,
                      }}
                      aria-label={`Noter ${starValue} sur 5`}
                    >
                      <Star
                        className={`size-8 transition-colors duration-150 ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-transparent text-muted-foreground/40'
                        }`}
                      />
                    </motion.button>
                  )
                })}
              </div>

              <AnimatePresence mode="wait">
                {displayRating > 0 && (
                  <motion.p
                    key={displayRating}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium text-amber-600"
                  >
                    {RATING_LABELS[displayRating]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {errors.rating && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm text-destructive"
              >
                {errors.rating}
              </motion.p>
            )}
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="review-comment" className="text-sm font-medium">
              Commentaire
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Décrivez votre expérience avec cet artisan (minimum 10 caractères)..."
              value={comment}
              onChange={handleCommentChange}
              disabled={isSubmitting}
              rows={4}
              className="resize-none"
              aria-invalid={!!errors.comment}
            />
            <div className="flex items-center justify-between">
              {errors.comment ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-destructive"
                >
                  {errors.comment}
                </motion.p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs ${
                  comment.trim().length < 10
                    ? 'text-muted-foreground'
                    : 'text-emerald-600'
                }`}
              >
                {comment.trim().length}/10 min.
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-500 text-white shadow-xs hover:bg-amber-600 focus-visible:ring-amber-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Envoyer l&apos;avis
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
