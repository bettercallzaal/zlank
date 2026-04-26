import { createClient, type RedisClientType } from 'redis';
import { nanoid } from 'nanoid';
import type { SnapDoc } from './blocks';

// Vercel marketplace Redis injects REDIS_URL (TCP connection string).
// Node-redis client maintained as a module-level singleton across warm
// serverless invocations.

const HAS_REDIS = Boolean(process.env.REDIS_URL);

let client: RedisClientType | null = null;
let connectPromise: Promise<RedisClientType> | null = null;

async function getClient(): Promise<RedisClientType | null> {
  if (!HAS_REDIS) return null;
  if (client?.isOpen) return client;
  if (connectPromise) return connectPromise;
  connectPromise = (async () => {
    const c = createClient({ url: process.env.REDIS_URL });
    c.on('error', (err) => {
      console.error('redis error', err);
    });
    await c.connect();
    client = c as RedisClientType;
    return client;
  })();
  try {
    return await connectPromise;
  } finally {
    connectPromise = null;
  }
}

export function isKvAvailable(): boolean {
  return HAS_REDIS;
}

const KEY_PREFIX = 'snap:';
const SNAPDOC_PREFIX = 'snapdoc:';
const SHORT_ID_LEN = 6;

export async function saveSnap(doc: SnapDoc): Promise<string> {
  const c = await getClient();
  if (!c) throw new Error('Redis not configured');
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = nanoid(SHORT_ID_LEN);
    const key = KEY_PREFIX + id;
    const exists = await c.exists(key);
    if (exists) continue;
    await c.set(key, JSON.stringify(doc));
    // Also store the original SnapDoc for editing
    await c.set(SNAPDOC_PREFIX + id, JSON.stringify(doc));
    return id;
  }
  const id = nanoid(SHORT_ID_LEN + 4);
  await c.set(KEY_PREFIX + id, JSON.stringify(doc));
  await c.set(SNAPDOC_PREFIX + id, JSON.stringify(doc));
  return id;
}

function migrateLoadedDoc(raw: unknown): SnapDoc | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;
  if (d.version !== 1 || typeof d.title !== 'string') return null;

  // Old single-page format: has blocks array on root
  if (Array.isArray(d.blocks)) {
    return {
      version: 1,
      title: d.title,
      theme: (d.theme as SnapDoc['theme']) ?? 'purple',
      pages: [{ id: 'home', blocks: d.blocks as SnapDoc['pages'][number]['blocks'] }],
      confetti: d.confetti as boolean | undefined,
      coin: d.coin as SnapDoc['coin'],
    };
  }

  // New multi-page format
  if (Array.isArray(d.pages)) {
    return {
      version: 1,
      title: d.title,
      theme: (d.theme as SnapDoc['theme']) ?? 'purple',
      pages: d.pages as SnapDoc['pages'],
      confetti: d.confetti as boolean | undefined,
      coin: d.coin as SnapDoc['coin'],
    };
  }

  return null;
}

export async function setSnapCoin(
  id: string,
  coin: { caip19: string; symbol?: string } | null,
): Promise<boolean> {
  const c = await getClient();
  if (!c) return false;
  for (const prefix of [KEY_PREFIX, SNAPDOC_PREFIX]) {
    const raw = await c.get(prefix + id);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (coin) parsed.coin = coin;
      else delete parsed.coin;
      await c.set(prefix + id, JSON.stringify(parsed));
    } catch {
      // skip malformed
    }
  }
  return true;
}

export async function loadSnap(id: string): Promise<SnapDoc | null> {
  const c = await getClient();
  if (!c) return null;
  const raw = await c.get(KEY_PREFIX + id);
  if (!raw) return null;
  try {
    return migrateLoadedDoc(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function loadSnapDoc(id: string): Promise<SnapDoc | null> {
  const c = await getClient();
  if (!c) return null;
  const raw = await c.get(SNAPDOC_PREFIX + id);
  if (!raw) return null;
  try {
    return migrateLoadedDoc(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function isShortId(idOrEncoded: string): boolean {
  return idOrEncoded.length <= 20 && /^[A-Za-z0-9_-]+$/.test(idOrEncoded);
}

const VOTE_PREFIX = 'vote:';

function voteKey(snapId: string, blockIdx: number): string {
  return `${VOTE_PREFIX}${snapId}:${blockIdx}`;
}

export async function recordVote(
  snapId: string,
  blockIdx: number,
  option: string,
): Promise<Record<string, number>> {
  const c = await getClient();
  if (!c) return {};
  const key = voteKey(snapId, blockIdx);
  await c.hIncrBy(key, option, 1);
  await c.expire(key, 60 * 60 * 24 * 30); // 30 day TTL
  const tallies = await c.hGetAll(key);
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(tallies)) out[k] = Number(v);
  return out;
}

export async function getVotes(
  snapId: string,
  blockIdx: number,
): Promise<Record<string, number>> {
  const c = await getClient();
  if (!c) return {};
  const tallies = await c.hGetAll(voteKey(snapId, blockIdx));
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(tallies)) out[k] = Number(v);
  return out;
}

const CHATLOG_PREFIX = 'chatlog:';
const CHATLOG_MAX = 500;

export interface ChatLogEntry {
  ts: number;
  fid?: number;
  text: string;
  reply?: string | null;
}

export async function appendChatLog(
  snapId: string,
  entry: ChatLogEntry,
): Promise<void> {
  const c = await getClient();
  if (!c) return;
  const key = CHATLOG_PREFIX + snapId;
  await c.lPush(key, JSON.stringify(entry));
  await c.lTrim(key, 0, CHATLOG_MAX - 1);
  await c.expire(key, 60 * 60 * 24 * 90);
}

const STATS_PREFIX = 'stats:';

export interface SnapStats {
  views: number;
  interactions: number;
  lastViewAt: number | null;
  lastInteractionAt: number | null;
}

export async function bumpStat(
  snapId: string,
  field: 'views' | 'interactions',
): Promise<void> {
  const c = await getClient();
  if (!c) return;
  const key = STATS_PREFIX + snapId;
  const tsField = field === 'views' ? 'lastViewAt' : 'lastInteractionAt';
  await Promise.all([
    c.hIncrBy(key, field, 1),
    c.hSet(key, tsField, String(Date.now())),
    c.expire(key, 60 * 60 * 24 * 365),
  ]);
}

export async function getStats(snapId: string): Promise<SnapStats> {
  const c = await getClient();
  const empty: SnapStats = {
    views: 0,
    interactions: 0,
    lastViewAt: null,
    lastInteractionAt: null,
  };
  if (!c) return empty;
  const raw = await c.hGetAll(STATS_PREFIX + snapId);
  return {
    views: Number(raw.views ?? 0),
    interactions: Number(raw.interactions ?? 0),
    lastViewAt: raw.lastViewAt ? Number(raw.lastViewAt) : null,
    lastInteractionAt: raw.lastInteractionAt ? Number(raw.lastInteractionAt) : null,
  };
}

export async function getChatLog(
  snapId: string,
  limit = 50,
): Promise<ChatLogEntry[]> {
  const c = await getClient();
  if (!c) return [];
  const raw = await c.lRange(
    CHATLOG_PREFIX + snapId,
    0,
    Math.min(limit, CHATLOG_MAX) - 1,
  );
  const out: ChatLogEntry[] = [];
  for (const r of raw) {
    try {
      out.push(JSON.parse(r) as ChatLogEntry);
    } catch {
      // skip malformed
    }
  }
  return out;
}
