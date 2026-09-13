import webpush from 'web-push'
import { db } from '@/lib/db'

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(`mailto:${process.env.SUPPORT_EMAIL || 'support@example.com'}`, VAPID_PUBLIC, VAPID_PRIVATE)
}

export async function sendWebPushToUser(userId: string, payload: any) {
  const subs = await db.pushSubscription.findMany({ where: { userId } })
  const results: any[] = []

  for (const s of subs) {
    try {
      const pushPayload = typeof payload === 'string' ? payload : JSON.stringify(payload)
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } } as any, pushPayload)
      results.push({ endpoint: s.endpoint, ok: true })
    } catch (err: any) {
      results.push({ endpoint: s.endpoint, ok: false, error: err?.message || String(err) })
      // If subscription is gone, delete it
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        await db.pushSubscription.deleteMany({ where: { endpoint: s.endpoint } })
      }
    }
  }

  return results
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC
}

export default webpush
