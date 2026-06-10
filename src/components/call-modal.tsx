'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

type CallState = 'ringing' | 'connected' | 'ended'

interface CallModalProps {
  isOpen: boolean
  onClose: () => void
  artisanName: string
  artisanInitials: string
  artisanColor?: string
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function CallModal({
  isOpen,
  onClose,
  artisanName,
  artisanInitials,
  artisanColor = '#f59e0b',
}: CallModalProps) {
  const [callState, setCallState] = useState<CallState>('ringing')
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const [finalDuration, setFinalDuration] = useState(0)

  const prevIsOpenRef = useRef(false)
  const connectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset state and start connect timer when modal opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Reset via timeout to avoid synchronous setState in effect
      const resetTimer = setTimeout(() => {
        setCallState('ringing')
        setDuration(0)
        setIsMuted(false)
        setIsSpeaker(false)
        setFinalDuration(0)
      }, 0)

      // Auto-connect after 3 seconds
      connectTimerRef.current = setTimeout(() => {
        setCallState('connected')
      }, 3000)

      return () => {
        clearTimeout(resetTimer)
        if (connectTimerRef.current) clearTimeout(connectTimerRef.current)
      }
    }

    prevIsOpenRef.current = isOpen
  }, [isOpen])

  // Track previous isOpen
  useEffect(() => {
    prevIsOpenRef.current = isOpen
  })

  // Duration timer when connected
  useEffect(() => {
    if (callState !== 'connected') return

    const interval = setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [callState])

  const handleEndCall = useCallback(() => {
    setFinalDuration(duration)
    setCallState('ended')
  }, [duration])

  const handleCallback = useCallback(() => {
    setCallState('ringing')
    setDuration(0)
    setIsMuted(false)
    setIsSpeaker(false)

    setTimeout(() => {
      setCallState('connected')
    }, 3000)
  }, [])

  const handleClose = useCallback(() => {
    setCallState('ringing')
    setDuration(0)
    setIsMuted(false)
    setIsSpeaker(false)
    setFinalDuration(0)
    onClose()
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Call Card */}
          <motion.div
            className="relative z-10 w-[90vw] max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Gradient Background */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-6 pt-10 pb-8 text-white text-center relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-20 -left-10 w-52 h-52 rounded-full bg-white/5" />

              <AnimatePresence mode="wait">
                {/* RINGING STATE */}
                {callState === 'ringing' && (
                  <motion.div
                    key="ringing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    {/* Pulsing Avatar Ring */}
                    <div className="relative mb-6">
                      {/* Outer pulse rings */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white/30"
                        animate={{
                          scale: [1, 1.6, 1],
                          opacity: [0.6, 0, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        style={{ margin: -12 }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white/20"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.4, 0, 0.4],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0.4,
                        }}
                        style={{ margin: -8 }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white/10"
                        animate={{
                          scale: [1, 1.8, 1],
                          opacity: [0.3, 0, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0.8,
                        }}
                        style={{ margin: -16 }}
                      />

                      {/* Avatar */}
                      <motion.div
                        className="relative w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                        style={{ backgroundColor: artisanColor }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        {artisanInitials}
                      </motion.div>
                    </div>

                    <h2 className="text-xl font-semibold mb-1">{artisanName}</h2>
                    <motion.p
                      className="text-white/80 text-sm"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      Appel en cours...
                    </motion.p>
                  </motion.div>
                )}

                {/* CONNECTED STATE */}
                {callState === 'connected' && (
                  <motion.div
                    key="connected"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    {/* Avatar */}
                    <motion.div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg mb-4"
                      style={{ backgroundColor: artisanColor }}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      {artisanInitials}
                    </motion.div>

                    <h2 className="text-xl font-semibold mb-1">{artisanName}</h2>

                    {/* Duration Timer */}
                    <motion.p
                      className="text-white/90 text-2xl font-mono tracking-wider mb-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {formatDuration(duration)}
                    </motion.p>

                    {/* Sound Wave Animation */}
                    <div className="flex items-center justify-center gap-1.5 h-8 mb-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-white/70 rounded-full"
                          animate={{
                            height: [8, 28, 12, 24, 8],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>

                    <p className="text-white/60 text-xs">Appel en cours</p>
                  </motion.div>
                )}

                {/* ENDED STATE */}
                {callState === 'ended' && (
                  <motion.div
                    key="ended"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    {/* Avatar with desaturated overlay */}
                    <motion.div
                      className="relative w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white/70 shadow-lg mb-4"
                      style={{ backgroundColor: artisanColor, filter: 'saturate(0.5) brightness(0.8)' }}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      {artisanInitials}
                    </motion.div>

                    <h2 className="text-xl font-semibold mb-1">{artisanName}</h2>
                    <p className="text-white/80 text-sm mb-2">Appel terminé</p>
                    <p className="text-white/60 text-sm">
                      Durée : {formatDuration(finalDuration)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls Section */}
            <div className="bg-white dark:bg-zinc-900 px-6 py-6">
              <AnimatePresence mode="wait">
                {/* Ringing Controls */}
                {callState === 'ringing' && (
                  <motion.div
                    key="ringing-controls"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    {/* End Call Button */}
                    <motion.button
                      onClick={handleEndCall}
                      className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <PhoneOff className="w-6 h-6" />
                    </motion.button>
                  </motion.div>
                )}

                {/* Connected Controls */}
                {callState === 'connected' && (
                  <motion.div
                    key="connected-controls"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center justify-center gap-6"
                  >
                    {/* Mute Button */}
                    <motion.button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-md ${
                        isMuted
                          ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </motion.button>

                    {/* End Call Button */}
                    <motion.button
                      onClick={handleEndCall}
                      className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <PhoneOff className="w-6 h-6" />
                    </motion.button>

                    {/* Speaker Button */}
                    <motion.button
                      onClick={() => setIsSpeaker(!isSpeaker)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-md ${
                        isSpeaker
                          ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </motion.button>
                  </motion.div>
                )}

                {/* Ended Controls */}
                {callState === 'ended' && (
                  <motion.div
                    key="ended-controls"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex flex-col items-center gap-3"
                  >
                    {/* Callback Button */}
                    <motion.button
                      onClick={handleCallback}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone className="w-4 h-4" />
                      Rappeler
                    </motion.button>

                    {/* Close Button */}
                    <motion.button
                      onClick={handleClose}
                      className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Fermer
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
