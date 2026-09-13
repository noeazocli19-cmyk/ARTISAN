"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<any[]>([])

  const load = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (e) {
      console.error('load notifications panel', e)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Notifications</h3>
        <Button variant="ghost" size="sm" onClick={load}>Rafraîchir</Button>
      </div>
      <ScrollArea className="max-h-48">
        <ul className="space-y-2">
          {notifications.length === 0 && <li className="text-sm text-muted-foreground">Aucune notification</li>}
          {notifications.slice(0,6).map((n) => (
            <li key={n.id} className={`p-2 rounded-md ${!n.isRead ? 'bg-brand-50' : ''}`}>
              <a href={n.link || '#'} className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.message}</div>
                </div>
                <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}</div>
              </a>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </Card>
  )
}
