import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        name: 'client',
        test: {
          environment: 'jsdom',
          include: ['client/src/**/*.test.{ts,tsx}'],
        },
        resolve: {
          alias: {
            '@shared': path.resolve(__dirname, 'shared'),
            '@': path.resolve(__dirname, 'client/src'),
          },
        },
        esbuild: { jsx: 'automatic' },
      },
      {
        name: 'server',
        test: {
          environment: 'node',
          include: ['server/src/**/*.test.{ts,tsx}'],
          testTimeout: 30000,
        },
        resolve: {
          alias: {
            '@shared': path.resolve(__dirname, 'shared'),
          },
        },
        esbuild: { jsx: 'automatic' },
      },
    ],
  },
})