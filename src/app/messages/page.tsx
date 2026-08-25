"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { MessageCircle, Send, Loader2, MessagesSquare, ArrowLeft } from "lucide-react"

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const [conversations, setConversations] = useState<any[]>([])
  const [activePartner, setActivePartner] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
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
                      {conv.lastMessage?.content}
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
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${
                      isMe
                        ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-br-md"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700"
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-amber-200" : "text-gray-400 dark:text-gray-500"}`}>
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Écrire un message..."
                  className="flex-1 px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 transition-all shadow-md flex items-center gap-1.5"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
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