import svelte from 'rollup-plugin-svelte';

export default {
	input: 'src/components/Table.svelte',
  // input: 'src/routes/routes.ts',
	output: {
    file: 'dist/components/Table.js',
    // file: 'dist/routes.js',
    format: 'es',
  },
	plugins: [
		svelte({
      emitCss: false,
      compilerOptions: {
        generate: 'ssr'
      }
		})
	]
};
