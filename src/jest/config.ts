import { existsSync } from 'node:fs';
import { cwd } from 'node:process';
import path from 'path';
import { RECOMMENDED_METAMASK_VERSION } from '../setup/constants';
import { DappwrightConfig, LaunchOptions } from '../types';

export const DAPPWRIGHT_DEFAULT_CONFIG: LaunchOptions = { metamaskVersion: RECOMMENDED_METAMASK_VERSION };

export async function getDappwrightConfig(): Promise<DappwrightConfig> {
  const configPath = 'dappwright.config.js';
  const filePath = path.resolve(cwd(), configPath);

  if (!existsSync(filePath))
    return {
      dappwright: DAPPWRIGHT_DEFAULT_CONFIG,
      metamask: {},
    };

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const config = await require(filePath);

  return {
    dappwright: {
      ...DAPPWRIGHT_DEFAULT_CONFIG,
      ...config.dappwright,
    },
    metamask: {
      ...config.metamask,
    },
  };
}
