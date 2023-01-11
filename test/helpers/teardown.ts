import { stop } from '../dapp';

export default async function (): Promise<void> {
  globalThis.browserContext.close();
  await stop();
}
