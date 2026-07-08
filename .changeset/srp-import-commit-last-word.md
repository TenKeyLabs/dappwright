---
"@tenkeylabs/dappwright": patch
---

fix(metamask): commit the final SRP word during import so the Continue button enables on MetaMask 13.17. After `pressSequentially(seed)` the last word could stay uncommitted, leaving `import-srp-confirm` disabled and timing out the click. Press Space on the SRP input to validate the full phrase.
