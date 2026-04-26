// localStorage-backed helpers for My Snaps feature (no auth required)

export interface MySnapEntry {
  id: string;
  title: string;
  theme: string;
  blockCount: number;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'zlank:my-snaps';
const MAX_SNAPS = 50;

export function getMySnaps(): MySnapEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MySnapEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMySnap(entry: MySnapEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const snaps = getMySnaps();
    const existing = snaps.findIndex((s) => s.id === entry.id);
    if (existing >= 0) {
      snaps[existing] = { ...snaps[existing], ...entry, updatedAt: Date.now() };
    } else {
      snaps.unshift(entry);
    }
    const trimmed = snaps.slice(0, MAX_SNAPS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // silently fail
  }
}

export function removeMySnap(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const snaps = getMySnaps().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snaps));
  } catch {
    // silently fail
  }
}

export function clearMySnaps(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function getThemeColor(theme: string): string {
  const themeColors: Record<string, string> = {
    purple: '#a855f7',
    amber: '#f59e0b',
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    pink: '#ec4899',
    teal: '#14b8a6',
    gray: '#6b7280',
  };
  return themeColors[theme] || '#f5a623';
}
