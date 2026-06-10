'use client';

import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Briefcase,
  MessageSquare,
  Star,
  CreditCard,
  Info,
  Check,
  Trash2,
  BellOff,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useAppStore } from '@/lib/store';
import type { Notification, NotificationType } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_ICON_MAP: Record<NotificationType, React.ElementType> = {
  mission: Briefcase,
  message: MessageSquare,
  review: Star,
  payment: CreditCard,
  system: Info,
};

const TYPE_COLOR_MAP: Record<NotificationType, string> = {
  mission: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
  message: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400',
  review: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/40 dark:text-yellow-400',
  payment: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
  system: 'text-slate-600 bg-slate-50 dark:bg-slate-950/40 dark:text-slate-400',
};

function formatTimeAgo(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr,
    });
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Demo seed data
// ---------------------------------------------------------------------------

const DEMO_NOTIFICATIONS: Omit<Notification, 'userId'>[] = [
  {
    id: 'demo-mission-1',
    title: 'Nouvelle mission',
    message: 'Un client recherche un plombier à Dakar',
    type: 'mission',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-review-1',
    title: 'Nouvel avis',
    message: 'Vous avez reçu un avis 5 étoiles !',
    type: 'review',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-message-1',
    title: 'Nouveau message',
    message: 'Amadou Diallo vous a envoyé un message',
    type: 'message',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  const Icon = TYPE_ICON_MAP[notification.type];
  const colorClasses = TYPE_COLOR_MAP[notification.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`group relative flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-accent/50 ${
        !notification.isRead ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''
      }`}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <span className="absolute left-1.5 top-4 h-2 w-2 rounded-full bg-amber-500" />
      )}

      {/* Icon */}
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${colorClasses}`}>
        <Icon className="size-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-snug ${!notification.isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Mark as read button */}
      {!notification.isRead && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
          aria-label="Marquer comme lu"
        >
          <Check className="size-3.5 text-amber-600" />
        </Button>
      )}
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-2 px-4 py-10"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <BellOff className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">Aucune notification</p>
      <p className="text-xs text-muted-foreground/70">Vous êtes à jour !</p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function NotificationBell() {
  const notifications = useAppStore((s) => s.notifications);
  const addNotification = useAppStore((s) => s.addNotification);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);
  const clearNotifications = useAppStore((s) => s.clearNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // Seed demo notifications on first mount if none exist
  useEffect(() => {
    if (notifications.length === 0) {
      DEMO_NOTIFICATIONS.forEach((demo) => {
        addNotification({
          ...demo,
          userId: 'demo-user',
        });
      });
    }
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30"
          aria-label={`Notifications${unreadCount > 0 ? ` – ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : ''}`}
        >
          <Bell className="size-5 text-foreground" />

          {/* Unread badge */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="absolute -right-0.5 -top-0.5"
              >
                <Badge
                  className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-amber-500 text-white border-0 px-1 text-[10px] font-bold shadow-sm"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 gap-0 rounded-xl shadow-lg border-amber-200/50 dark:border-amber-800/30"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] px-1.5"
              >
                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={clearNotifications}
              aria-label="Effacer toutes les notifications"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>

        <Separator />

        {/* Notification list */}
        {notifications.length > 0 ? (
          <>
            <ScrollArea className="max-h-80">
              <div className="px-1 py-1">
                <AnimatePresence mode="popLayout">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markNotificationRead}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Footer */}
            {unreadCount > 0 && (
              <>
                <Separator />
                <div className="px-3 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-amber-700 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30 text-xs"
                    onClick={markAllNotificationsRead}
                  >
                    <Check className="mr-1.5 size-3.5" />
                    Tout marquer comme lu
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </PopoverContent>
    </Popover>
  );
}
