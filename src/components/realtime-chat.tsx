'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Send,
  Search,
  Smile,
  Check,
  CheckCheck,
  Phone,
  MoreVertical,
  MessageSquare,
  Wifi,
  WifiOff,
  Users,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  roomId: string
  timestamp: number
  read: boolean
}

interface ChatRoom {
  id: string
  name: string
  participants: string[]
  artisanName: string
  artisanId: string
  lastMessage: string
  lastMessageTime: number
  unreadCount: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  if (hours < 24) return `il y a ${hours}h`
  if (days === 1) return 'hier'
  if (days < 7) return `il y a ${days}j`
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Artisan avatar colors
const AVATAR_COLORS = [
  'bg-amber-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-rose-500',
]

function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// Simplified emoji set
const QUICK_EMOJIS = [
  '👍', '😊', '🙏', '✅', '⏰', '💪', '🏠', '🔧',
  '💡', '📞', '💼', '⭐', '🤝', '❤️', '🎉', '🔥',
]

const CURRENT_USER_ID = 'user-1'

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface RealtimeChatProps {
  onBack: () => void
  onCallArtisan?: (name: string, initials: string, color: string) => void
}

export function RealtimeChat({ onBack, onCallArtisan }: RealtimeChatProps) {
  // ── State ────────────────────────────────────────────────────────────────
  const [isConnected, setIsConnected] = useState(false)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const activeRoomIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep ref in sync with state
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId
  }, [activeRoomId])

  // ── Active room ──────────────────────────────────────────────────────────
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || null

  // ── Socket connection ────────────────────────────────────────────────────
  useEffect(() => {
    const socketInstance = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    socketRef.current = socketInstance

    socketInstance.on('connect', () => {
      setIsConnected(true)
      socketInstance.emit('authenticate', { userId: CURRENT_USER_ID })
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    socketInstance.on('rooms', (data: ChatRoom[]) => {
      setRooms(data)
    })

    socketInstance.on('room-messages', (data: { roomId: string; messages: ChatMessage[] }) => {
      if (data.roomId === activeRoomIdRef.current) {
        setMessages(data.messages)
      }
    })

    socketInstance.on('new-message', (message: ChatMessage) => {
      if (message.roomId === activeRoomIdRef.current) {
        setMessages((prev) => [...prev, message])
      }
    })

    socketInstance.on('user-typing', (data: { roomId: string; userId: string; userName: string }) => {
      if (data.roomId === activeRoomIdRef.current && data.userId !== CURRENT_USER_ID) {
        setTypingUsers((prev) => {
          const next = new Map(prev)
          next.set(data.userId, data.userName)
          return next
        })
        const existing = typingTimeoutRef.current.get(data.userId)
        if (existing) clearTimeout(existing)
        typingTimeoutRef.current.set(
          data.userId,
          setTimeout(() => {
            setTypingUsers((prev) => {
              const next = new Map(prev)
              next.delete(data.userId)
              return next
            })
          }, 3000)
        )
      }
    })

    socketInstance.on('user-stop-typing', (data: { roomId: string; userId: string }) => {
      if (data.roomId === activeRoomIdRef.current) {
        setTypingUsers((prev) => {
          const next = new Map(prev)
          next.delete(data.userId)
          return next
        })
      }
    })

    socketInstance.on('messages-read', (data: { roomId: string; readBy: string }) => {
      if (data.roomId === activeRoomIdRef.current) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === CURRENT_USER_ID ? { ...m, read: true } : m))
        )
      }
    })

    socketInstance.on('user-online', (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.add(data.userId)
        return next
      })
    })

    socketInstance.on('user-offline', (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.delete(data.userId)
        return next
      })
    })

    return () => {
      socketInstance.disconnect()
      socketRef.current = null
    }
  }, [])

  // Re-join active room when socket reconnects
  useEffect(() => {
    if (socketRef.current && isConnected && activeRoomId) {
      socketRef.current.emit('join-room', { roomId: activeRoomId })
    }
  }, [isConnected, activeRoomId])

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  // ── Join Room ────────────────────────────────────────────────────────────
  const handleJoinRoom = useCallback(
    (roomId: string) => {
      const sock = socketRef.current
      if (sock) {
        if (activeRoomId) {
          sock.emit('leave-room', { roomId: activeRoomId })
        }
        sock.emit('join-room', { roomId })
        setActiveRoomId(roomId)
        setMessages([])
        setTypingUsers(new Map())
        setMobileShowChat(true)
      }
    },
    [activeRoomId]
  )

  // ── Send Message ─────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(() => {
    const sock = socketRef.current
    if (!sock || !activeRoomId || !messageInput.trim()) return

    sock.emit('send-message', {
      roomId: activeRoomId,
      content: messageInput.trim(),
      senderId: CURRENT_USER_ID,
      senderName: 'Vous',
    })

    setMessageInput('')
    setShowEmojiPicker(false)

    sock.emit('stop-typing', {
      roomId: activeRoomId,
      userId: CURRENT_USER_ID,
    })

    inputRef.current?.focus()
  }, [activeRoomId, messageInput])

  // ── Typing Indicator ─────────────────────────────────────────────────────
  const handleInputChange = useCallback(
    (value: string) => {
      setMessageInput(value)

      const sock = socketRef.current
      if (sock && activeRoomId) {
        if (value.trim()) {
          sock.emit('typing', {
            roomId: activeRoomId,
            userId: CURRENT_USER_ID,
            userName: 'Vous',
          })
        } else {
          sock.emit('stop-typing', {
            roomId: activeRoomId,
            userId: CURRENT_USER_ID,
          })
        }
      }
    },
    [activeRoomId]
  )

  // ── Back to rooms list (mobile) ──────────────────────────────────────────
  const handleBackToRooms = useCallback(() => {
    setMobileShowChat(false)
    const sock = socketRef.current
    if (sock && activeRoomId) {
      sock.emit('leave-room', { roomId: activeRoomId })
    }
    setActiveRoomId(null)
    setMessages([])
  }, [activeRoomId])

  // ── Filter rooms ─────────────────────────────────────────────────────────
  const filteredRooms = rooms.filter(
    (r) =>
      r.artisanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Typing indicator text ────────────────────────────────────────────────
  const typingNames = Array.from(typingUsers.values())
  const typingText =
    typingNames.length === 1
      ? `${typingNames[0]} tape...`
      : typingNames.length > 1
        ? `${typingNames.join(', ')} tapent...`
        : ''

  // ── Unread total ─────────────────────────────────────────────────────────
  const totalUnread = rooms.reduce((sum, r) => sum + r.unreadCount, 0)

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 hover:bg-amber-50 dark:hover:bg-amber-950/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-amber-500" />
            Messages
          </h1>
          <p className="text-sm text-muted-foreground">
            Discutez avec vos artisans en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="outline" className="border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 gap-1">
              <Wifi className="h-3 w-3" />
              En ligne
            </Badge>
          ) : (
            <Badge variant="outline" className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 gap-1">
              <WifiOff className="h-3 w-3" />
              Hors ligne
            </Badge>
          )}
          {totalUnread > 0 && (
            <Badge className="bg-amber-500 text-white border-0">
              {totalUnread}
            </Badge>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <Card className="overflow-hidden border-border/50 shadow-lg" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* ──────── Room List (Left Panel) ──────── */}
          <div
            className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-border/50 flex flex-col ${
              mobileShowChat ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search */}
            <div className="p-3 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une conversation..."
                  className="pl-9 h-9 bg-muted/50 border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Rooms */}
            <ScrollArea className="flex-1">
              <div className="py-1">
                {filteredRooms.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground px-4">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucune conversation trouvée</p>
                  </div>
                ) : (
                  filteredRooms.map((room) => {
                    const isActive = room.id === activeRoomId
                    const isOnline = onlineUsers.has(room.artisanId)
                    const avatarColor = getAvatarColor(room.artisanId)

                    return (
                      <button
                        key={room.id}
                        onClick={() => handleJoinRoom(room.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${
                          isActive ? 'bg-amber-50 dark:bg-amber-950/30 border-l-2 border-l-amber-500' : ''
                        }`}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-11 w-11">
                            <AvatarFallback className={`${avatarColor} text-white font-semibold text-sm`}>
                              {getInitials(room.artisanName)}
                            </AvatarFallback>
                          </Avatar>
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm truncate">{room.artisanName}</span>
                            <span className="text-[11px] text-muted-foreground shrink-0">
                              {formatRelativeTime(room.lastMessageTime)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
                            {room.unreadCount > 0 && (
                              <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                                {room.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* ──────── Chat Area (Right Panel) ──────── */}
          <div
            className={`flex-1 flex flex-col ${
              mobileShowChat ? 'flex' : 'hidden md:flex'
            }`}
          >
            {activeRoom ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden shrink-0 h-8 w-8"
                    onClick={handleBackToRooms}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className={`${getAvatarColor(activeRoom.artisanId)} text-white font-semibold text-sm`}
                      >
                        {getInitials(activeRoom.artisanName)}
                      </AvatarFallback>
                    </Avatar>
                    {onlineUsers.has(activeRoom.artisanId) && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{activeRoom.artisanName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {onlineUsers.has(activeRoom.artisanId) ? (
                        <span className="text-emerald-600 dark:text-emerald-400">En ligne</span>
                      ) : (
                        'Hors ligne'
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-500" onClick={() => {
                      if (onCallArtisan && activeRoom) {
                        onCallArtisan(activeRoom.artisanName, getInitials(activeRoom.artisanName), getAvatarColor(activeRoom.artisanId).replace('bg-', '#').replace(/-\d+$/, '') || '#f59e0b')
                      }
                    }}>
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 px-4 py-3">
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isOwn = msg.senderId === CURRENT_USER_ID

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] sm:max-w-[65%] ${
                              isOwn
                                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl rounded-br-md'
                                : 'bg-muted dark:bg-neutral-800 rounded-2xl rounded-bl-md'
                            } px-4 py-2.5 shadow-sm`}
                          >
                            <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 ${
                                isOwn ? 'text-white/70' : 'text-muted-foreground'
                              }`}
                            >
                              <span className="text-[10px]">{formatMessageTime(msg.timestamp)}</span>
                              {isOwn && (
                                msg.read ? (
                                  <CheckCheck className="h-3.5 w-3.5 text-blue-200" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Typing indicator */}
                    {typingText && (
                      <div className="flex justify-start">
                        <div className="bg-muted dark:bg-neutral-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-xs text-muted-foreground">{typingText}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="px-4 py-2 border-t border-border/50 bg-muted/30">
                    <div className="flex flex-wrap gap-1">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setMessageInput((prev) => prev + emoji)
                            inputRef.current?.focus()
                          }}
                          className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <Separator />
                <div className="px-3 py-2 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-9 w-9 text-muted-foreground hover:text-amber-500"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Input
                    ref={inputRef}
                    placeholder="Écrire un message..."
                    className="flex-1 h-10 bg-muted/50 border-0 focus-visible:ring-1"
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={!isConnected}
                  />
                  <Button
                    size="icon"
                    className="shrink-0 h-10 w-10 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 rounded-full shadow-md"
                    onClick={handleSendMessage}
                    disabled={!isConnected || !messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 mb-4">
                    <MessageSquare className="h-10 w-10 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Vos messages</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Sélectionnez une conversation pour commencer à discuter avec vos artisans
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
