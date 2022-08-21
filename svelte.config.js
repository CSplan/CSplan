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