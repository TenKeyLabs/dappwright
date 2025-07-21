import fs from 'fs';
import StreamZip from 'node-stream-zip';
import os from 'os';
import path from 'path';
import { WalletIdOptions } from '../wallets/wallets';
import { EXTENSION_PUB_KEY } from './constants';

export const downloadDir = (walletId: WalletIdOptions, version: string): string => {
  return path.resolve(os.tmpdir(), 'dappwright', walletId, version.replace(/\./g, '_'));
};

export const extractZip = async (zipData: string, destination: string): Promise<void> => {
  const zip = new StreamZip.async({ file: zipData });
  fs.mkdirSync(destination, { recursive: true });
  await zip.extract(null, destination);
};

// Set the chrome extension public key
export const editExtensionPubKey = (extensionPath: string): void => {
  const manifestPath = path.resolve(extensionPath, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  manifest.key = EXTENSION_PUB_KEY;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
};
