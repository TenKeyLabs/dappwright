import { FullConfig } from '@playwright/test';
import { OfficialOptions } from '../../src';
import { getWalletType } from '../../src/wallets/wallets';

/**
 * Download every project's wallet extension before any worker starts.
 *
 * Workers can download on demand, but a cold cache then has to finish inside a test's timeout
 * while the rest of the suite competes for the machine. Fetching up front keeps that cost out
 * of the tests, and leaves each worker with nothing to do but read the cache.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const downloads = config.projects.map(async (project) => {
    const options = project.metadata as OfficialOptions;
    const wallet = getWalletType(options.wallet);
    if (wallet) await wallet.download(options);
  });

  await Promise.all(downloads);
}
