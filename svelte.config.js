import node from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'
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
        __APP_VERSION__: `'Public Beta ${pkg.version}'`
      }
    }
  },
  preprocess: preprocess({
    scss: {
      prependData: `@import "${path.resolve('src/scss')}/index.scss";`
    }
  })
}

export default config