"use client"
import { Suspense } from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { MessageCircle, Send, Loader2, MessagesSquare, ArrowLeft, Mic, Square, Trash2, Play, Pause, ImagePlus, X } from "lucide-react"

function AudioBubble({ src, isMe }: { src: string; isMe: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      />
      <button
        onClick={togglePlay}
        className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
          isMe ? "bg-white/25 text-white" : "bg-amber-500 text-white"
        }`}
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className={`h-1.5 rounded-full ${isMe ? "bg-white/25" : "bg-amber-200 dark:bg-amber-900"}`}>
          <div
            className={`h-1.5 rounded-full ${isMe ? "bg-white" : "bg-amber-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <span className={`text-[10px] shrink-0 ${isMe ? "text-white/80" : "text-gray-500"}`}>
        {Math.floor((duration || 0) / 60)}:{String(Math.floor((duration || 0) % 60)).padStart(2, "0")}
      </span>
    </div>
  )
}

function MessagesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const [conversations, setConversations] = useState<any[]>([])
  const [activePartner, setActivePartner] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const partnerIdFromUrl = searchParams.get("userId")
  const missionIdFromUrl = searchParams.get("missionId")

  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/messages/conversations")
      .then((r) => r.json())
      .then((data) => {
        setConversations(data.conversations || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session?.user?.id])

  useEffect(() => {
    if (partnerIdFromUrl) setActivePartner(partnerIdFromUrl)
  }, [partnerIdFromUrl])

  useEffect(() => {
    if (!activePartner) return
    fetch(`/api/messages?receiverId=${activePartner}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || [])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
      })
      .catch(() => {})
  }, [activePartner])

  const handleSend = async () => {
    if (!newMessage.trim() || !activePartner) return
    setSending(true)

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          receiverId: activePartner,
          missionId: missionIdFromUrl || undefined,
        }),
      })

      if (res.ok) {
        setNewMessage("")
        const data = await fetch(`/api/messages?receiverId=${activePartner}`).then((r) => r.json())
        setMessages(data.messages || [])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
      }
    } catch {
      alert("Erreur d'envoi")
    } finally {
      setSending(false)
    }
  }

  const activePartnerInfo = conversations.find((c) => c.partnerId === activePartner)?.partner

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.start()
      setIsRecording(true)
      setRecordingSeconds(0)
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1)
      }, 1000)
    } catch {
      alert("Impossible d'accéder au micro. Vérifie les autorisations de ton navigateur.")
    }
  }

  const cancelRecording = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== "inactive") {
      recorder.stream.getTracks().forEach((t) => t.stop())
      recorder.stop()
    }
    audioChunksRef.current = []
    setIsRecording(false)
    setRecordingSeconds(0)
  }

  const stopAndSendRecording = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)

    recorder.onstop = async () => {
      recorder.stream.getTracks().forEach((t) => t.stop())
      setIsRecording(false)

      if (audioChunksRef.current.length === 0 || !activePartner) return
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
      if (blob.size < 500) {
        setRecordingSeconds(0)
        return
      }

      setUploadingAudio(true)
      try {
        const formData = new FormData()
        formData.append("file", blob, "voice-message.webm")
        formData.append("type", "audio")
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        const rawText = await uploadRes.text()
        let uploadData: any = {}
        try {
          uploadData = rawText ? JSON.parse(rawText) : {}
        } catch {
          uploadData = { error: 'Réponse serveur invalide', details: { message: rawText.slice(0, 200) } }
        }

        if (uploadRes.ok && uploadData.url) {
          const res = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: uploadData.url,
              type: "audio",
              receiverId: activePartner,
              missionId: missionIdFromUrl || undefined,
            }),
          })
          if (res.ok) {
            const data = await fetch(`/api/messages?receiverId=${activePartner}`).then((r) => r.json())
            setMessages(data.messages || [])
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
          }
        } else {
          console.error('Upload audio error details:', uploadRes.status, uploadData)
          const detailMsg = uploadData?.details?.error?.message || uploadData?.details?.message
          alert(`Statut HTTP ${uploadRes.status} — ` + (uploadData.error || "Erreur lors de l'envoi du message vocal") + (detailMsg ? `\n\nDétail : ${detailMsg}` : ''))
        }
      } catch {
        alert("Erreur lors de l'envoi du message vocal")
      } finally {
        setUploadingAudio(false)
        setRecordingSeconds(0)
      }
    }

    recorder.stop()
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Merci de choisir une image.')
      return
    }
    const url = URL.createObjectURL(file)
    setImagePreview({ file, url })
    e.target.value = ''
  }

  const cancelImagePreview = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview.url)
    setImagePreview(null)
  }

  const sendImage = async () => {
    if (!imagePreview || !activePartner) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', imagePreview.file)
      formData.append('type', 'portfolio')
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()

      if (uploadRes.ok && uploadData.url) {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: uploadData.url,
            type: 'image',
            receiverId: activePartner,
            missionId: missionIdFromUrl || undefined,
          }),
        })
        if (res.ok) {
          const data = await fetch(`/api/messages?receiverId=${activePartner}`).then((r) => r.json())
          setMessages(data.messages || [])
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        }
      } else {
        alert(uploadData.error || "Erreur lors de l'envoi de la photo")
      }
    } catch {
      alert("Erreur lors de l'envoi de la photo")
    } finally {
      setUploadingImage(false)
      cancelImagePreview()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <MessagesSquare className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              Aucune conversation
            </div>
          ) : (
            conversations.map((conv: any) => (
              <button
                key={conv.partnerId}
                onClick={() => {
                  setActivePartner(conv.partnerId)
                  router.push(`/messages?userId=${conv.partnerId}`)
                }}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50 ${
                  activePartner === conv.partnerId ? "bg-amber-50 dark:bg-amber-900/20" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm">
                    {conv.partner?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                      {conv.partner?.name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conv.lastMessage?.type === "audio" ? "🎤 Message vocal" : conv.lastMessage?.type === "image" ? "📷 Photo" : conv.lastMessage?.content}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {activePartner ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-white text-sm">
                {activePartnerInfo?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {activePartnerInfo?.name || "Utilisateur"}
                </p>
                {missionIdFromUrl && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    Mission liée
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
              {messages.map((msg: any) => {
                const isMe = msg.senderId === session?.user?.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl shadow-sm overflow-hidden ${
                      msg.type === "image" ? "p-1" : "px-4 py-2.5"
                    } ${
                      isMe
                        ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-br-md"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700"
                    }`}>
                      {msg.type === "audio" ? (
                        <AudioBubble src={msg.content} isMe={isMe} />
                      ) : msg.type === "image" ? (
                        <a href={msg.content} target="_blank" rel="noopener noreferrer">
                          <img
                            src={msg.content}
                            alt="Photo envoyée"
                            className="rounded-xl max-h-64 w-auto object-cover"
                          />
                        </a>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                      <p className={`text-[10px] mt-1 ${msg.type === "image" ? "px-2 pb-1" : ""} ${isMe ? "text-amber-200" : "text-gray-400 dark:text-gray-500"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {imagePreview ? (
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img src={imagePreview.url} alt="Aperçu" className="h-16 w-16 rounded-xl object-cover" />
                    <button
                      onClick={cancelImagePreview}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-gray-800 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="flex-1 text-sm text-gray-500 dark:text-gray-400">Envoyer cette photo ?</span>
                  <button
                    onClick={sendImage}
                    disabled={uploadingImage}
                    className="h-11 w-11 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
                    title="Envoyer"
                  >
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              ) : isRecording ? (
                <div className="flex items-center gap-3 px-2">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <span className="flex-1 text-sm text-gray-600 dark:text-gray-300">
                    Enregistrement… {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, "0")}
                  </span>
                  <button
                    onClick={cancelRecording}
                    className="h-11 w-11 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    title="Annuler"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={stopAndSendRecording}
                    className="h-11 w-11 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md hover:from-amber-600 hover:to-orange-700 transition-all"
                    title="Envoyer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingAudio}
                    className="h-11 w-11 shrink-0 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                    title="Envoyer une photo"
                  >
                    <ImagePlus className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Écrire un message..."
                    disabled={uploadingAudio}
                    className="flex-1 px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all disabled:opacity-60"
                  />
                  {newMessage.trim() ? (
                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className="px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 transition-all shadow-md flex items-center gap-1.5"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      disabled={uploadingAudio}
                      className="px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 transition-all shadow-md flex items-center gap-1.5"
                      title="Message vocal"
                    >
                      {uploadingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            <MessagesSquare className="w-16 h-16 mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-lg">Sélectionnez une conversation</p>
            <p className="text-sm">Ou contactez un artisan depuis une mission</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <MessagesPageContent />
    </Suspense>
  )
}