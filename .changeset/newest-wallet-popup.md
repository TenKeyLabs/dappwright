---
'@tenkeylabs/dappwright': patch
---

fix: wallet actions that use a popup take the newest popup if another extension page is open, and fail straight away if the wallet page closes while they wait for one
