import { readFileSync } from 'fs'
import path from 'path'
import pkg from './package.json'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

// Manual chunks containing modules excluded from build transforms and code-splitting
const manualChunks = {
  'cs-crypto': ['cs-crypto'],
  'argon2-wasm': ['@very-amused/argon2-wasm'],
  'ed25519-wasm': ['@very-amused/ed25519-wasm']
}
const flatManualChunks = Object.values(manualChunks).flat()

export default defineConfig(({ mode }) => {
  const dev = mode === 'development'
  console.log(`\x1b[1mManual chunks: ${flatManualChunks.join(', ')}\x1b[0m`)

  /** @type {import('vite').UserConfig} */
  const config = {
    server: {
      proxy: dev ? {
        '/api': {
          target: `http://${process.env.CSPLAN_HOSTNAME}:3000`,
          rewrite: path => path.replace(/^\/api/, ''),
          ws: true
        }
      } : {},
      https: process.env.CSPLAN_CERTSDIR != null ? {
        cert: readFileSync(`${process.env.CSPLAN_CERTSDIR}/fullchain.pem`),
        key: readFileSync(`${process.env.CSPLAN_CERTSDIR}/privkey.pem`)
      } : false,
      host: process.env.CSPLAN_HOSTNAME
    },
    resolve: {
      alias: {
        '$stores': path.resolve('src/stores'),
        '$components': path.resolve('src/components'),
        '$db': path.resolve('src/db'),
        '$hooks': path.resolve('src/hooks')
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks
        }
      }
    },
    ssr: {
      noExternal: flatManualChunks
    },
    optimizeDeps: {
      exclude: flatManualChunks
    },
    define: {
      __APP_VERSION__: `'Public Beta ${pkg.version}'`,
      __DEV_HOSTNAME__: dev ? `'${process.env.CSPLAN_HOSTNAME}'` : '\'\'',
      __STRIPE_API_KEY__: mode === 'production' // Use live stripe key in production
      ? '\'pk_live_51LIAg3ICwE4UU9tPEjBV2UgYKPMBZFhDQOhIdczYRrGfy7RKJuk6YzPCswRuYRG78A9XOCJug4ovmNvzn24VqOCj00oXJeQQo2\''
      : '\'pk_test_51LIAg3ICwE4UU9tPvxBl94I8xrulhvCunTU7wu6l6PU0FqS2N6gAqKG4x7pV7AOD5qGqGwKf2DWobbP8gXYAClsr00Rm6KBzHP\''
    },
    plugins: [sveltekit()]
  }
  return config
})
