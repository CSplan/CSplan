// eslint-disable-next-line no-undef
module.exports =  {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    node: true,
    es2020: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module'
  },
  plugins: [
    'svelte3'
  ],
  overrides: [{
    files: ['*.svelte'],
    processor: 'svelte3/svelte3'
  }],
  rules: {
    // General
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'brace-style': ['error', '1tbs'],
    // Object/array formatting
    'quote-props': ['error', 'as-needed'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'], // Single line objects should be spaced
    'array-bracket-spacing': ['error', 'never'], // But not arrays
    // Function formatting
    'space-before-function-paren': ['warn', {
      named: 'never',
      anonymous: 'never',
      asyncArrow: 'always'
    }],
    'no-return-await': 'error'
  }
}
