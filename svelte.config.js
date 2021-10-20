import node from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'
import path from 'path'

const dev = process.env.NODE_ENV === 'development'

/** @type {import('@sveltejs/kit').Config} */
export default {
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
        } : {}
      },
      resolve: {
        alias: {
          '$stores': path.resolve('src/stores'),
          '$components': path.resolve('src/components')
        }
      }
    }
  },
  preprocess: preprocess(),
}
