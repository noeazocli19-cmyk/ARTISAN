export function getOnlineStatus(lastActiveAt: string | Date | null | undefined): { online: boolean; label: string } {
  if (!lastActiveAt) return { online: false, label: 'Jamais connecte' };
  const last = new Date(lastActiveAt);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 5) return { online: true, label: 'En ligne' };
  if (diffMin < 60) return { online: false, label: `Vu il y a ${diffMin} min` };
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return { online: false, label: `Vu il y a ${diffH} h` };
  const diffJ = Math.floor(diffH / 24);
  if (diffJ < 7) return { online: false, label: `Vu il y a ${diffJ} j` };
  return { online: false, label: 'Vu il y a longtemps' };
}