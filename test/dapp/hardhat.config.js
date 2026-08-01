export default {
  networks: {
    // Hardhat 3 requires each network to declare how it is backed, and no longer reserves a
    // network named "hardhat" - the node is started with `--network chain`
    chain: {
      type: 'edr-simulated',
      chainId: 31337,
      accounts: {
        // This must stay in sync with the seed the wallets import in playwright.config.js -
        // the dapp and the wallets have to agree on which accounts exist and are funded.
        // Ganache derived this phrase from the seed string 'asd123', which left the two ends
        // coupled with nothing to point at.
        mnemonic: 'pioneer casual canoe gorilla embrace width fiction bounce spy exhibit another dog',
        // Ganache funded 1000 ETH per account and the balance assertions expect it
        accountsBalance: '1000000000000000000000',
      },
      loggingEnabled: false,
    },
  },
};
