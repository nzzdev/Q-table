const eslintSveltePreprocess = require('eslint-svelte3-preprocess');
const path = require('path');
const svelteConfigPath = path.resolve('../svelte.config');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@ota-meshi/svelte/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    tsconfigRootDir: __dirname + '/..',
    project: ['tsconfig.json'],
    extraFileExtensions: ['.svelte'],
  },
  env: {
    es6: true,
    browser: true,
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  ],
  settings: {
    'svelte3/typescript': require('typescript'),
    // ignore style tags in Svelte because of Tailwind CSS
    // See https://github.com/sveltejs/eslint-plugin-svelte3/issues/70
    'svelte3/ignore-styles': () => false,
    'svelte3/preprocess': eslintSveltePreprocess(svelteConfigPath),
  },
  plugins: [
    // 'svelte3',
    '@ota-meshi/svelte',
    '@typescript-eslint',
  ],
  ignorePatterns: ['.eslintrc.cjs', 'node_modules'],
  rules: {
    quotes: [2, 'single'],
    '@typescript-eslint/no-explicit-any': 2,
    '@typescript-eslint/no-unused-vars': 2,
    '@typescript-eslint/triple-slash-reference': 0,
    '@typescript-eslint/no-for-in-array': 0,
    '@typescript-eslint/explicit-function-return-type': 2,
  },
};
