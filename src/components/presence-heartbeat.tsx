'use client';

import { useEffect } from 'react';

export function PresenceHeartbeat() {
  useEffect(() => {
    const sendHeartbeat = () => {
      fetch('/api/user/heartbeat', { method: 'POST' }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
