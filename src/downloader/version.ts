import { WalletIdOptions } from '../wallets/wallets';

export const printVersion = (walletId: WalletIdOptions, version: string, recommendedVersion: string): void => {
  /* eslint-disable no-console */
  console.log(''); // new line
  if (version === 'latest')
    console.warn(
      '\x1b[33m%s\x1b[0m',
      // eslint-disable-next-line max-len
      `It is not recommended to run ${walletId} with "latest" version. Use it at your own risk or set to the recommended version "${recommendedVersion}".`,
    );
  else if (isNewerVersion(recommendedVersion, version))
    console.warn(
      '\x1b[33m%s\x1b[0m',
      `Seems you are running a newer version (${version}) of ${walletId} than recommended by the Dappwright team.
      Use it at your own risk or set to the recommended version "${recommendedVersion}".`,
    );
  else if (isNewerVersion(version, recommendedVersion))
    console.warn(
      '\x1b[33m%s\x1b[0m',
      `Seems you are running an older version (${version}) of ${walletId} than recommended by the Dappwright team.
      Use it at your own risk or set the recommended version "${recommendedVersion}".`,
    );
  else console.log(`Using ${walletId} v${version}`);

  console.log(''); // new line
};

const isNewerVersion = (current: string, comparingWith: string): boolean => {
  if (current === comparingWith) return false;

  const currentFragments = current.replace(/[^\d.-]/g, '').split('.');
  const comparingWithFragments = comparingWith.replace(/[^\d.-]/g, '').split('.');

  const length =
    currentFragments.length > comparingWithFragments.length ? currentFragments.length : comparingWithFragments.length;
  for (let i = 0; i < length; i++) {
    if ((Number(currentFragments[i]) || 0) === (Number(comparingWithFragments[i]) || 0)) continue;
    return (Number(comparingWithFragments[i]) || 0) > (Number(currentFragments[i]) || 0);
  }
  return true;
};
