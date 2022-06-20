import svelte from 'rollup-plugin-svelte';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

export default {
  input: 'src/routes/routes.ts',
	output: {
    file: 'dist/routes.js',
    format: 'es',
  },
	plugins: [
    typescript(),
    json(),
		svelte({
      emitCss: false,
      compilerOptions: {
        generate: 'ssr'
      }
		})
	],
  external: [
    '@hapi/boom',
    'ajv',
    'd3-format',
    'joi',
    'module',
    'path',
    'simple-statistics',,
    'svelte/internal',
    'uglify-js',
    'url',
  ]
};
