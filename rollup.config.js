import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import svelte from 'rollup-plugin-svelte'
import { terser } from 'rollup-plugin-terser'
import sapper from 'sapper/config/rollup.js'
import pkg from './package.json'
import preprocess from 'svelte-preprocess'

const mode = process.env.NODE_ENV
const dev = mode === 'development'

const onwarn = (warning, onwarn) => ((warning.code === 'CIRCULAR_DEPENDENCY' && /[/\\]@sapper[/\\]/.test(warning.message)) ||
warning.code === 'THIS_IS_UNDEFINED') || onwarn(warning)

export default {
  client: {
    input: sapper.client.input(),
    output: sapper.client.output(),
    plugins: [
      replace({
        'process.browser': true,
        'process.env.NODE_ENV': JSON.stringify(mode)
      }),
      svelte({
        dev,
        hydratable: true,
        emitCss: true,
        preprocess: preprocess()
      }),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),

      !dev && terser({
        module: true
      })
    ],

    preserveEntrySignatures: false,
    onwarn
  },

  server: {
    input: sapper.server.input(),
    output: sapper.server.output(),
    plugins: [
      replace({
        'process.browser': false,
        'process.env.NODE_ENV': JSON.stringify(mode)
      }),
      svelte({
        generate: 'ssr',
        dev,
        preprocess: preprocess()
      }),
      resolve({
        dedupe: ['svelte']
      })
    ],
    // Dyncamically detect external modules
    external: Object.keys(pkg.dependencies).concat(require('module').builtinModules),

    preserveEntrySignatures: 'strict',
    onwarn
  }
}
