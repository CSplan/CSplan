import node from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'
import { mdsvex } from 'mdsvex'
import path from 'path'
import { readFileSync } from 'fs'
const pkg = JSON.parse(readFileSync('./package.json'))

/**
 * @typedef {import('@sveltejs/kit').Config} SvelteKitConfig
 */

const dev = process.env.NODE_ENV === 'development'

/** @type {SvelteKitConfig} */
const config = {
  compilerOptions: {
    dev,
    sourcemap: true
  },
  kit: {
    adapter: node(),
    files: {
      assets: 'static'
      // TODO: add hooks
    },
    vite: {
      server: {
        proxy: dev ? {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            rewrite: path => path.replace(/^\/api/, '')
          }
        } : {},
        https: process.env.CSPLAN_CERTSDIR != null ? {
          cert: readFileSync(`${process.env.CSPLAN_CERTSDIR}/fullchain.pem`),
          key: readFileSync(`${process.env.CSPLAN_CERTSDIR}/privkey.pem`)
        } : false
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
        __STRIPE_API_KEY__: dev
        ? '\'pk_test_51LIAg3ICwE4UU9tPvxBl94I8xrulhvCunTU7wu6l6PU0FqS2N6gAqKG4x7pV7AOD5qGqGwKf2DWobbP8gXYAClsr00Rm6KBzHP\''
        : '\'\''
      }
    }
  },
  extensions: ['.svelte', '.md'],
  preprocess: [
    preprocess({
      scss: {
        prependData: `@import "${path.resolve('src/scss')}/index.scss";`
      }
    }),
    mdsvex({
      extensions: ['.md']
    })
  ]
}

export default config