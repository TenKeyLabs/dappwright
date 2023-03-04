import { BrowserContext, FullConfig } from '@playwright/test';
import * as dappwright from '../../src/index';
import { start } from '../dapp/server';

async function globalSetup(config: FullConfig): Promise<void> {
  // Start test dapp
  await start();

  // Setup wallets
  const values = await Promise.all(
    config.projects.flatMap((projectConfig) => {
      const metadata = projectConfig.metadata;
      return dappwright.bootstrap('', {
        wallet: metadata.wallet,
        version: metadata.version,
        password: metadata.password,
        seed: metadata.seed,
        headless: projectConfig.use.headless,
      });
    }),
  );

  // Collect contexts
  const browserContexts: BrowserContext[] = values.map((value) => value[2]);

  // Close browsers when it's all done
  await Promise.all([browserContexts.map((context) => context.close())]);
}

export default globalSetup;
