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

export async function loadSnap(id: string): Promise<SnapDoc | null> {
  const c = await getClient();
  if (!c) return null;
  const raw = await c.get(KEY_PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SnapDoc;
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
    return JSON.parse(raw) as SnapDoc;
  } catch {
    return null;
  }
}

export function isShortId(idOrEncoded: string): boolean {
  return idOrEncoded.length <= 20 && /^[A-Za-z0-9_-]+$/.test(idOrEncoded);
}
