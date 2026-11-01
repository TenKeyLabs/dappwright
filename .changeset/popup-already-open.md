---
'@tenkeylabs/dappwright': patch
---

fix: wallet actions that use a popup, such as `approve`, `reject`, `sign` and `confirmTransaction`, no longer hang when the popup opened before the action was called, and now fail with an error if no popup opens within 120s
