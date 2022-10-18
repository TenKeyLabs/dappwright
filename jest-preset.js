module.exports = {
  globalSetup: `@chainsafe/dappwright/dist/jest/setup.js`,
  globalTeardown: `@chainsafe/dappwright/dist/jest/teardown.js`,
  testEnvironment: `@chainsafe/dappwright/dist/jest/DappwrightEnvironment.js`,
};
