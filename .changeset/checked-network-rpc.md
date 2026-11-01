---
'@tenkeylabs/dappwright': patch
---

fix: MetaMask's `addNetwork` no longer risks saving a network whose RPC is on another chain, and fails with a `SyntaxError` rather than hanging when the RPC can't be reached
