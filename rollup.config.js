import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import svelte from 'rollup-plugin-svelte'
import { terser } from 'rollup-plugin-terser'
import sapper from 'sapper/config/rollup.js'
import pkg from './package.json'

const mode = process.env.NODE_ENV
const dev = mode === 'development'

const onwarn = (warning, onwarn) => ((warning.code === 'CIRCULAR_DEPENDENCY' && /[/\\]@sapper[/\\]/.test(warning.message))) || onwarn(warning)

module.exports = {
  client: {
    input: sapper.client.input(),
    output: sapper.client.output(),
    plugins: [
      replace({
        'process.browser': true,
        'process.env.NODE_ENV': JSON.stringify(mode)
      }),
      svelte({
        compilerOptions: {
          dev,
          hydratable: true  
        },
        emitCss: true
      }),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      json(),

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
        compilerOptions: {
          generate: 'ssr',
          dev  
        }
      }),
      resolve({
        dedupe: ['svelte']
      }),
      json()
    ],
    // Dyncamically detect external modules
    external: Object.keys(pkg.dependencies).concat(require('module').builtinModules),

    preserveEntrySignatures: 'strict',
    onwarn
  }
}
