---
'@tenkeylabs/dappwright': patch
---

fix: approval popups now open in headless mode

Wallets position their approval popup relative to the browser window, which placed it outside
headless Chromium's default 800x600 virtual screen. Chromium rejected the `chrome.windows.create`
call with "Bounds must be at least 50% within visible screen space", so the approval never opened
and every popup-driven action hung until the test timed out. dAppwright now passes `--screen-info`
in headless mode. Running under `xvfb-run` with `headless: false` is no longer necessary.
