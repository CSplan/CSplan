import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import svelte from 'rollup-plugin-svelte'
import preprocess from 'svelte-preprocess'
import typescript from '@rollup/plugin-typescript'
import scss from 'rollup-plugin-scss'
import gzip from 'rollup-plugin-gzip'
import { terser } from 'rollup-plugin-terser'
import sapper from 'sapper/config/rollup.js'
import pkg from './package.json'
import progress from 'rollup-plugin-progress'

const mode = process.env.NODE_ENV
const dev = mode === 'development'

const onwarn = (warning, onwarn) => ((warning.code === 'CIRCULAR_DEPENDENCY' && /[/\\]@sapper[/\\]/.test(warning.message))) || onwarn(warning)

export default {
  client: {
    input: sapper.client.input(),
    output: sapper.client.output(),
    plugins: [
      progress(),
      replace({
        'process.browser': true,
        'process.env.NODE_ENV': JSON.stringify(mode)
      }),
      svelte({
        compilerOptions: {
          dev,
          hydratable: true, 
          sourcemap: true
        },
        preprocess: preprocess(),
        emitCss: true
      }),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      typescript(),
      json(),

      !dev && terser({
        module: true
      }),
      !dev && gzip()
    ],

    preserveEntrySignatures: false,
    onwarn
  },

  server: {
    input: sapper.server.input(),
    output: sapper.server.output(),
    plugins: [
      progress(),
      replace({
        'process.browser': false,
        'process.env.NODE_ENV': JSON.stringify(mode)
      }),
      svelte({
        compilerOptions: {
          generate: 'ssr',
          hydratable: true,
          dev
        },
        preprocess: preprocess(),
        emitCss: false
      }),
      resolve({
        dedupe: ['svelte']
      }),
      typescript(),
      json()
    ],
    // Dyncamically detect external modules
    external: Object.keys(pkg.dependencies).concat(require('module').builtinModules),

    preserveEntrySignatures: 'strict',
    onwarn
  }
}
