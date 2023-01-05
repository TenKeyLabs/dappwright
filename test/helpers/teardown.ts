import { BrowserContext } from 'playwright-core';
import { stop } from '../dapp/server';

export default async function (): Promise<void> {
  await Promise.all([global.browserContexts.map((context: BrowserContext) => context.close())]);
  await stop();
}
