"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ArrowLeft, MapPin, Phone, Globe, Clock, Tag, DollarSign, CheckCircle, MessageCircle, User, Wrench, Loader2, CalendarDays } from "lucide-react"

export default function MissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [mission, setMission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [messaging, setMessaging] = useState(false)

  useEffect(() => {
    fetch(`/api/missions/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setMission(data.mission)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleAccept = async () => {
    setAccepting(true)
    try {
      const res = await fetch(`/api/missions/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "assignee" }),
      })
      if (res.ok) {
        const data = await res.json()
        setMission(data.mission)
        alert("Mission acceptée ! Le client a été notifié.")
      }
    } catch {
      alert("Erreur")
    } finally {
      setAccepting(false)
    }
  }

  const handleSendMessage = async () => {
    setMessaging(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Bonjour, je suis intéressé par votre mission "${mission?.title}". Je suis disponible pour vous aider.`,
          receiverId: mission?.client?.id,
          missionId: mission?.id,
        }),
      })
      if (res.ok) {
        router.push(`/messages?userId=${mission?.client?.id}&missionId=${mission?.id}`)
      }
    } catch {
      alert("Erreur")
    } finally {
      setMessaging(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Mission non trouvée</p>
      </div>
    )
  }

  const isArtisan = session?.user?.role === "artisan"
  const isClient = session?.user?.id === mission.clientId

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux missions
        </button>

        {/* Mission */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mission.title}
            </h1>
            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
              {mission.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full text-sm font-medium">
              <Tag className="w-3.5 h-3.5" />
              {mission.category}
            </span>
            {mission.budget > 0 && (
              <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium">
                <DollarSign className="w-3.5 h-3.5" />
                {mission.budget.toLocaleString()} FCFA
              </span>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
            {mission.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            {mission.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                {mission.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-amber-500" />
              {new Date(mission.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Infos client - VISIBLE PAR L'ARTISAN */}
        {isArtisan && (
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 p-6 mb-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-amber-800 dark:text-amber-300 mb-4">
              <User className="w-5 h-5" />
              Informations du client
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md">
                  {mission.client?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {mission.client?.name || "Client"}
                  </p>
                  {mission.client?.location && (
                    <p className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {mission.client.location}
                    </p>
                  )}
                </div>
              </div>

              {mission.client?.phone && (
                <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
                    <p className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                      {mission.client.phone}
                    </p>
                  </div>
                </div>
              )}

              {mission.client?.country && (
                <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Globe className="w-4 h-4" />
                  {mission.client.country}
                </p>
              )}
            </div>

            {/* Actions artisan */}
            <div className="flex gap-3 mt-6">
              {mission.status === "ouverte" && (
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {accepting ? "Acceptation..." : "Accepter la mission"}
                </button>
              )}
              <button
                onClick={handleSendMessage}
                disabled={messaging}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {messaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                {messaging ? "Envoi..." : "Envoyer un message"}
              </button>
            </div>
          </div>
        )}

        {/* Infos artisan - VISIBLE PAR LE CLIENT */}
        {isClient && mission.artisan && (
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 mb-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-blue-800 dark:text-blue-300 mb-4">
              <Wrench className="w-5 h-5" />
              Artisan assigné
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md">
                {mission.artisan.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {mission.artisan.user?.name || "Artisan"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mission.artisan.profession}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/messages?userId=${mission.artisan?.userId}&missionId=${mission.id}`)}
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Contacter l'artisan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}