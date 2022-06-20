import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  verbose: true,
  transform: {
    '^.+\\.svelte$': [
      'svelte-jester',
      {
        'preprocess': true
      }
    ],
    '^.+\\.tsx?$': 'ts-jest',
  },
  extensionsToTreatAsEsm: ['.svelte', '.ts'],
};

config.globals = {
  'ts-jest': {
    useESM: true,
  }
};

export default config;
