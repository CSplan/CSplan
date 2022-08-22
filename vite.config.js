import { readFileSync } from 'fs'
import path from 'path'
import pkg from './package.json'
import { sveltekit } from '@sveltejs/kit/vite'
const dev = process.env.NODE_ENV === 'development'

/** @type {import('vite').UserConfig} */
export default {
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
  optimizeDeps: {
    exclude: ['cs-crypto']
  },
  define: {
    __APP_VERSION__: `'Public Beta ${pkg.version}'`,
    __DEV_HOSTNAME__: dev ? `'${process.env.CSPLAN_HOSTNAME}'` : '\'\'',
    __STRIPE_API_KEY__: dev
    ? '\'pk_test_51LIAg3ICwE4UU9tPvxBl94I8xrulhvCunTU7wu6l6PU0FqS2N6gAqKG4x7pV7AOD5qGqGwKf2DWobbP8gXYAClsr00Rm6KBzHP\''
    : '\'pk_live_51LIAg3ICwE4UU9tPEjBV2UgYKPMBZFhDQOhIdczYRrGfy7RKJuk6YzPCswRuYRG78A9XOCJug4ovmNvzn24VqOCj00oXJeQQo2\''
  },
  plugins: [sveltekit()]
}