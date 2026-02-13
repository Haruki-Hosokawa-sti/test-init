import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
      },
    },
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      clean: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '**/__mocks__/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@back': resolve(__dirname, './src'),
    },
  },
})
