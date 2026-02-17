# Running in CI / Headless Environments

This guide explains how to run dAppwright tests in Continuous Integration (CI) environments, particularly GitHub Actions and other headless Linux systems.

## Table of Contents

- [Why `headless: true` Doesn't Work](#why-headless-true-doesnt-work)
- [The Recommended Approach](#the-recommended-approach)
- [GitHub Actions Example](#github-actions-example)
- [Local Development](#local-development)
- [Troubleshooting](#troubleshooting)
- [Reference](#reference)

## Why `headless: true` Doesn't Work

**TL;DR**: Chromium's headless mode does not reliably support browser extensions, especially extension popup windows.

### The Technical Details

Wallet extensions like MetaMask and Coinbase Wallet rely heavily on popup windows for critical user flows:
- Initial wallet connection (`window.open` triggered by extension)
- Transaction approval dialogs
- Network switching confirmations
- Signature request prompts

Even with Chromium's newer `--headless=new` mode (which dAppwright uses by default when `headless: true`), these extension-triggered popups fail to open properly. This causes tests to hang indefinitely, waiting for user interactions that can never occur because the popup window never appears.

**This is a fundamental limitation of Chromium/Playwright**, not a dAppwright bug. Browser extensions were designed to work in headed (visible) browser mode, and headless mode does not provide the full rendering and window management that extensions expect.

## The Recommended Approach

The solution is to use **`headless: false`** (headed mode) combined with a **virtual framebuffer** in CI environments.

### What is a Virtual Framebuffer?

A virtual framebuffer (Xvfb) provides a virtual display server on Linux systems that don't have a physical display. This allows "headed" browsers to run as if they had a real display, even in CI environments.

The `xvfb-run` command is a wrapper that automatically:
1. Starts an Xvfb server
2. Runs your command with the DISPLAY variable set
3. Cleans up the Xvfb server when done

### Configuration Steps

#### 1. Set `headless: false` in Your Test Code

Always configure dAppwright with `headless: false`:

```typescript
const [wallet, _, context] = await bootstrap("", {
  wallet: "metamask",
  version: MetaMaskWallet.recommendedVersion,
  seed: "test test test test test test test test test test test junk",
  headless: false, // ← REQUIRED for extension support
});
```

Or in your Playwright configuration:

```javascript
// playwright.config.js
export default defineConfig({
  use: {
    headless: false, // Required for browser extensions
  },
  // ... rest of config
});
```

#### 2. Use `xvfb-run` in CI

Wrap your test command with `xvfb-run` when running in a Linux CI environment:

```bash
xvfb-run --auto-servernum --server-args="-screen 0 1280x1024x24" npx playwright test
```

**Command breakdown:**
- `--auto-servernum`: Automatically finds an available display number (prevents conflicts in parallel CI jobs)
- `--server-args="-screen 0 1280x1024x24"`: Sets the virtual screen resolution
  - `1280x1024`: Resolution (width x height)
  - `24`: Color depth in bits

## GitHub Actions Example

Here's a complete GitHub Actions workflow for running dAppwright tests, based on dAppwright's own CI setup:

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  e2e:
    runs-on: ubuntu-latest
    container:
      # Use official Playwright image with Chromium and system dependencies pre-installed
      image: mcr.microsoft.com/playwright:v1.56.1-jammy
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm  # or 'yarn' if using Yarn

      - name: Install dependencies
        run: npm ci  # or 'yarn install --frozen-lockfile'

      - name: Run E2E tests
        run: xvfb-run --auto-servernum --server-args="-screen 0 1280x1024x24" npx playwright test

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-traces
          path: test-results/
```

### Key Points

1. **Use Playwright's official Docker image**: The `mcr.microsoft.com/playwright` images come with:
   - All required browsers (Chromium, Firefox, WebKit)
   - System dependencies for running browsers
   - Xvfb pre-installed

2. **Match Playwright versions**: Use the same Playwright version in your Docker image as in your `package.json`:
   ```json
   {
     "devDependencies": {
       "@playwright/test": "^1.56.1"
     }
   }
   ```
   Then use `mcr.microsoft.com/playwright:v1.56.1-jammy`

3. **Upload artifacts on failure**: Always upload test artifacts (traces, screenshots, videos) to help debug CI failures

## Local Development

### macOS and Windows

On macOS and Windows, simply use `headless: false` without xvfb:

```bash
# macOS/Windows - xvfb not needed
npx playwright test
```

These platforms have native display servers, so headed browsers work without additional setup.

### Linux Desktop

On Linux desktop environments (Ubuntu Desktop, Fedora Workstation, etc.), you typically don't need xvfb either since you have an active X server:

```bash
# Linux with GUI - xvfb not needed
npx playwright test
```

However, if you're on a Linux system without a GUI or encounter display issues, use xvfb:

```bash
# Linux without GUI
xvfb-run --auto-servernum npx playwright test
```

## Troubleshooting

### Tests Hang at Wallet Popup

**Symptom**: Tests hang when trying to interact with the wallet (connection, transaction approval, etc.)

**Causes**:
- `headless: true` is set (or defaulting to true)
- Running on Linux without xvfb
- The wallet extension popup window cannot open

**Solution**:
1. Ensure `headless: false` is explicitly set in your test configuration
2. Use `xvfb-run` when running tests in Linux CI environments
3. Check that the Playwright container image includes xvfb (official images do)

### Screen Resolution Issues

**Symptom**: UI elements are cut off, overlapping, or positioned incorrectly

**Cause**: The virtual display resolution is too small for your application

**Solution**: Increase the resolution in the xvfb-run command:

```bash
# Larger resolution for high-DPI or complex UIs
xvfb-run --server-args="-screen 0 1920x1080x24" npx playwright test
```

### Container Network Access Issues

**Symptom**: Tests cannot reach external services (e.g., Vercel deployments, RPC nodes)

**Causes**:
- DNS resolution failures in containers
- Network isolation in container environment
- Firewall rules blocking outbound connections

**Solutions**:

1. **Add DNS configuration to container** (if using custom containers):
   ```yaml
   container:
     image: mcr.microsoft.com/playwright:v1.56.1-jammy
     options: --dns 8.8.8.8 --dns 8.8.4.4
   ```

2. **Use host network mode** (less isolated, but can solve connectivity issues):
   ```yaml
   container:
     image: mcr.microsoft.com/playwright:v1.56.1-jammy
     options: --network host
   ```

3. **Test connectivity before running tests**:
   ```yaml
   - name: Test network connectivity
     run: |
       curl -I https://your-app.vercel.app
       ping -c 3 8.8.8.8
   ```

### Timeout Issues in CI

**Symptom**: Tests timeout in CI but pass locally

**Cause**: CI environments can be slower than local machines

**Solution**: Increase timeouts in `playwright.config.js`:

```javascript
export default defineConfig({
  timeout: process.env.CI ? 120000 : 60000, // 2 minutes in CI, 1 minute locally
  retries: process.env.CI ? 1 : 0, // Retry once in CI
  // ...
});
```

### Extension Installation Failures

**Symptom**: Errors about extension not loading or "Extension not found"

**Cause**: Missing system dependencies or insufficient permissions

**Solution**:
1. Use official Playwright Docker images (they have all dependencies)
2. If using custom images, ensure these packages are installed:
   ```dockerfile
   RUN apt-get update && apt-get install -y \
       xvfb \
       libgtk-3-0 \
       libnotify4 \
       libnss3 \
       libxss1 \
       libasound2
   ```

### Parallel Test Execution

**Symptom**: Tests fail when running in parallel

**Cause**: Multiple tests trying to use the same display server

**Solution**: The `--auto-servernum` flag handles this automatically:

```bash
xvfb-run --auto-servernum npx playwright test --workers=4
```

Each worker will get its own virtual display, preventing conflicts.

## Reference

### dAppwright's Own CI Setup

The dAppwright project uses the exact setup described in this guide:

- **GitHub Actions workflow**: [`.github/workflows/test.yaml`](../.github/workflows/test.yaml)
- **Playwright configuration**: [`playwright.config.js`](../playwright.config.js)

Key takeaways from the dAppwright CI setup:
- Uses `headless: false` in `playwright.config.js`
- Runs tests with `xvfb-run --auto-servernum` in CI
- Uses `mcr.microsoft.com/playwright:v1.56.1-jammy` container
- Uploads test artifacts on failure for debugging

### Related Issues

- [Issue #491](https://github.com/TenKeyLabs/dappwright/issues/491): Original report about headless mode issues

### Further Reading

- [Playwright Docker Images](https://playwright.dev/docs/docker)
- [Chromium Headless Mode Documentation](https://developer.chrome.com/docs/chromium/headless)
- [Xvfb Manual](https://www.x.org/releases/X11R7.6/doc/man/man1/Xvfb.1.xhtml)
