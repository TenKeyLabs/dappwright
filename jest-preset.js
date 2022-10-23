module.exports = {
  globalSetup: `@tenkeylabs/dappwright/dist/jest/setup.js`,
  globalTeardown: `@tenkeylabs/dappwright/dist/jest/teardown.js`,
  testEnvironment: `@tenkeylabs/dappwright/dist/jest/DappwrightEnvironment.js`,
};
