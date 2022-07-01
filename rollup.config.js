import svelte from 'rollup-plugin-svelte';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import sveltePreprocess from 'svelte-preprocess';
import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';

const backendConfig = {
  input: 'src/routes/routes.ts',
  output: {
    file: 'dist/routes.js',
    format: 'es',
  },
  plugins: [
    typescript(),
    json(),
    svelte({
      preprocess: sveltePreprocess(),
      emitCss: false,
      compilerOptions: {
        generate: 'ssr',
      },
    }),
  ],
  external: ['@hapi/boom', 'ajv', 'd3-format', 'joi', 'module', 'path', 'simple-statistics', 'svelte/internal', 'uglify-js', 'url'],
};

const frontendConfig = {
  input: 'src/components/Table.svelte',
  output: {
    name: 'window.q_table',
    file: 'dist/Q-Table.js',
    format: 'iife',
  },
  plugins: [
    typescript(),
    json(),
    svelte({
      preprocess: sveltePreprocess(),
      emitCss: false,
      compilerOptions: {},
    }),
    nodeResolve({ browser: true }),
    terser(),
  ],
};

export default [frontendConfig, backendConfig];
