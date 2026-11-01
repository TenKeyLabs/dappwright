---
'@tenkeylabs/dappwright': patch
---

fix: holds up on slow machines by waiting for what the wallets do rather than fixed windows, including MetaMask's home tab, form errors in `addNetwork` and Coinbase's optional prompts, and setup now recovers from MetaMask's "trouble starting" page. `getTokenBalance` now takes up to 5s to report a missing token, and `addToken` up to 5s when a contract's decimals can't be read
