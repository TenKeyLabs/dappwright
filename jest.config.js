module.exports = {
  globalSetup: './test/helpers/setup.ts',
  globalTeardown: './test/helpers/teardown.ts',
  testSequencer: './test/helpers/sequencer.js', // ts-jest doesn't transpile sequencers https://github.com/facebook/jest/issues/8810
  testTimeout: 20000,
  roots: ['<rootDir>/test', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
