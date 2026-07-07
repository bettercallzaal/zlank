import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'app/**/*.test.ts', 'app/**/*.test.tsx'],
    // kv.ts captures Boolean(process.env.REDIS_URL) at module load. Setting it
    // here lets KV-backed code take its real path against a mocked redis client
    // in tests. Only kv.ts reads this var, so other test files are unaffected.
    env: {
      REDIS_URL: 'redis://fake-redis-for-tests',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
