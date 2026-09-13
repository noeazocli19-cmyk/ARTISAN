"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export default function PushSubscribe() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window)
    ;(async () => {
      if (!('serviceWorker' in navigator)) return
      const reg = await navigator.serviceWorker.getRegistration('/sw.js')
      const existing = reg ? await reg.pushManager.getSubscription() : null
      setSubscribed(!!existing)
    })()
  }, [])

  const subscribe = async () => {
    try {
      const res = await fetch('/api/push/vapid')
      const data = await res.json()
      const publicKey = data.publicKey

      const reg = await navigator.serviceWorker.register('/sw.js')
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      const body = { subscription: sub.toJSON(), ua: navigator.userAgent }
      await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      setSubscribed(true)
    } catch (err) {
      console.error('subscribe error', err)
      alert('Impossible d\'activer les notifications push')
    }
  }

  const unsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js')
      if (!reg) return
      const sub = await reg.pushManager.getSubscription()
      if (!sub) return
      await sub.unsubscribe()
      await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}`, { method: 'DELETE' })
      setSubscribed(false)
    } catch (err) {
      console.error('unsubscribe error', err)
    }
  }

  if (!supported) return null

  return subscribed ? (
    <Button variant="outline" size="sm" onClick={unsubscribe}>Désactiver push</Button>
  ) : (
    <Button variant="ghost" size="sm" onClick={subscribe}>Activer push</Button>
  )
}
