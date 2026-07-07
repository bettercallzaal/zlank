// In-memory stand-in for the node-redis client, scoped to the subset of
// commands lib/kv.ts uses. Lets KV-backed code be unit tested without a real
// Redis. Not exhaustive - extend as new commands are needed.

type SetOptions = { NX?: boolean; EX?: number };

export interface FakeRedis {
  isOpen: boolean;
  on(event: string, handler: (...args: unknown[]) => void): FakeRedis;
  connect(): Promise<FakeRedis>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, opts?: SetOptions): Promise<string | null>;
  exists(key: string): Promise<number>;
  del(key: string): Promise<number>;
  incr(key: string): Promise<number>;
  sAdd(key: string, member: string): Promise<number>;
  sMembers(key: string): Promise<string[]>;
  expire(key: string, _sec: number): Promise<boolean>;
  /** Test-only: wipe all keys between tests. */
  __reset(): void;
}

export function makeFakeRedis(): FakeRedis {
  const strings = new Map<string, string>();
  const sets = new Map<string, Set<string>>();

  const fake: FakeRedis = {
    isOpen: true,
    on() {
      return fake;
    },
    async connect() {
      fake.isOpen = true;
      return fake;
    },
    async get(key) {
      return strings.has(key) ? (strings.get(key) as string) : null;
    },
    async set(key, value, opts) {
      if (opts?.NX && strings.has(key)) return null;
      strings.set(key, value);
      return 'OK';
    },
    async exists(key) {
      return strings.has(key) || sets.has(key) ? 1 : 0;
    },
    async del(key) {
      const had = strings.delete(key) || sets.delete(key);
      return had ? 1 : 0;
    },
    async incr(key) {
      const next = Number(strings.get(key) ?? 0) + 1;
      strings.set(key, String(next));
      return next;
    },
    async sAdd(key, member) {
      let s = sets.get(key);
      if (!s) {
        s = new Set<string>();
        sets.set(key, s);
      }
      const had = s.has(member);
      s.add(member);
      return had ? 0 : 1;
    },
    async sMembers(key) {
      return [...(sets.get(key) ?? [])];
    },
    async expire() {
      return true;
    },
    __reset() {
      strings.clear();
      sets.clear();
    },
  };

  return fake;
}
