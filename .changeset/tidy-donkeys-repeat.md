---
'@tenkeylabs/dappwright': patch
---

fix: waits for the downloaded extension archive to be flushed to disk before extracting it. Also follows all redirect statuses rather than only 302, and fails loudly on a non-200 response instead of writing the error body out as the archive
fix: follows all redirect statuses rather than only 302, and fails loudly on a non-200 response instead of writing the error body out as the archive
