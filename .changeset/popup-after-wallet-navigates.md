---
'@tenkeylabs/dappwright': patch
---

fix: wallet actions that use a popup find it again when the page returned by `bootstrap` has been navigated to a dapp, rather than failing after 120s
