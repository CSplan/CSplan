import node from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'
import path from 'path'
import { readFileSync } from 'fs'

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
          '$db': path.resolve('src/db')
        }
      },
      optimizeDeps: {
        exclude: ['cs-crypto']
      },
    }
  },
  preprocess: preprocess({
    scss: {
      prependData: `@import "${path.resolve('src/scss')}/index.scss";`
    }
  })
}

export default config