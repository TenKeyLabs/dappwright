module.exports = {
  globalSetup: './test/helpers/setup.ts',
  globalTeardown: './test/helpers/teardown.ts',
  testTimeout: 15000,
  roots: ['<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
