import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // We are using happydom to fix so many issues regarding
  // events and missing dom apis.
  testEnvironment: "@happy-dom/jest-environment",
  verbose: true,
  transform: {
    '^.+\\.ts$': ['@swc/jest', {

    }],
    '^.+\\.svelte$': [
      './node_modules/svelte-jester/dist/transformer.mjs',
      {
        preprocess: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.svelte', '.ts'],
  moduleFileExtensions: ['js', 'ts', 'svelte'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@rs(.*)$': '<rootDir>/resources$1',
    '^@src(.*)$': '<rootDir>/src$1',
  },
  testPathIgnorePatterns: ['node_modules'],
  transformIgnorePatterns: ['node_modules'],
  bail: false,
  setupFiles: ['./setupJest.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};

module.exports = config;
