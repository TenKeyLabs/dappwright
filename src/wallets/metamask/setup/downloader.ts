import * as fs from 'fs';
import { IncomingMessage } from 'http';
import { get } from 'https';
import * as path from 'path';

import StreamZip from 'node-stream-zip';
import os from 'os';
import { OfficialOptions } from '../../../types';
import { isNewerVersion } from './isNewerVersion';

const defaultDirectory = path.resolve(os.tmpdir(), 'dappwright', 'metamask');

export type Path =
  | string
  | {
      download: string;
      extract: string;
    };

const isEmpty = (path): boolean => {
  const items = fs.readdirSync(path, { withFileTypes: true });
  const files = items.filter((item) => item.isFile() && !item.name.startsWith('.'));
  return files.length === 0;
};

export default (recommendedVersion: string, location?: Path) =>
  async (options: OfficialOptions): Promise<string> => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let METAMASK_PATH;

    const { version } = options;

    if (version) {
      /* eslint-disable no-console */
      console.log(); // new line
      if (version === 'latest')
        console.warn(
          '\x1b[33m%s\x1b[0m',
          `It is not recommended to run metamask with "latest" version. Use it at your own risk or set to the recommended version "${recommendedVersion}".`,
        );
      else if (isNewerVersion(recommendedVersion, version))
        console.warn(
          '\x1b[33m%s\x1b[0m',
          `Seems you are running newer version of MetaMask that recommended by dappwright team.
      Use it at your own risk or set to the recommended version "${recommendedVersion}".`,
        );
      else if (isNewerVersion(version, recommendedVersion))
        console.warn(
          '\x1b[33m%s\x1b[0m',
          `Seems you are running older version of MetaMask that recommended by dappwright team.
      Use it at your own risk or set the recommended version "${recommendedVersion}".`,
        );
      else console.log(`Running tests on MetaMask version ${version}`);

      console.log(); // new line

      METAMASK_PATH = await download(version, location);
    } else {
      console.log(`Running tests on local MetaMask build`);

      // METAMASK_PATH = (rest as CustomOptions).metamaskPath;
      /* eslint-enable no-console */
    }

    return METAMASK_PATH;
  };

const download = async (version?: string, location?: Path) => {
  const metamaskDirectory = typeof location === 'string' ? location : location?.extract || defaultDirectory;
  const downloadDirectory =
    typeof location === 'string' ? location : location?.download || path.resolve(defaultDirectory, 'download');

  if (version !== 'latest') {
    const extractDestination = path.resolve(metamaskDirectory, version.replace(/\./g, '_'));
    if (fs.existsSync(extractDestination) && !isEmpty(extractDestination)) return extractDestination;
  }

  const { filename, downloadUrl, tag } = await getMetamaskReleases(version);
  const extractDestination = path.resolve(metamaskDirectory, tag.replace(/\./g, '_'));

  // Clean if system tmp files are cleaned but dir structure can persist
  if (fs.existsSync(extractDestination) && isEmpty(extractDestination)) {
    fs.rmdirSync(extractDestination, { recursive: true });
  }

  if (!fs.existsSync(extractDestination) || isEmpty(extractDestination)) {
    const downloadedFile = await downloadMetamaskReleases(filename, downloadUrl, downloadDirectory);
    const zip = new StreamZip.async({ file: downloadedFile });
    fs.mkdirSync(extractDestination);
    await zip.extract(null, extractDestination);
  }
  return extractDestination;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const request = (url: string): Promise<IncomingMessage> =>
  new Promise((resolve) => {
    const request = get(url, (response) => {
      if (response.statusCode == 302) {
        const redirectRequest = get(response.headers.location, resolve);
        redirectRequest.on('error', (error) => {
          // eslint-disable-next-line no-console
          console.warn('request redirected error:', error.message);
          throw error;
        });
      } else {
        resolve(response);
      }
    });
    request.on('error', (error) => {
      // eslint-disable-next-line no-console
      console.warn('request error:', error.message);
      throw error;
    });
  });

const downloadMetamaskReleases = (name: string, url: string, location: string): Promise<string> =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (resolve) => {
    if (!fs.existsSync(location)) {
      fs.mkdirSync(location, { recursive: true });
    }
    const fileLocation = path.join(location, name);
    const file = fs.createWriteStream(fileLocation);
    const stream = await request(url);
    stream.pipe(file);
    stream.on('end', () => {
      resolve(fileLocation);
    });
  });

type MetamaskReleases = { downloadUrl: string; filename: string; tag: string };
const metamaskReleasesUrl = 'https://api.github.com/repos/metamask/metamask-extension/releases';
const getMetamaskReleases = (version: string): Promise<MetamaskReleases> =>
  new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const request = get(metamaskReleasesUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      let body = '';
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        const data = JSON.parse(body);
        if (data.message) return reject(data.message);
        for (const result of data) {
          if (result.draft) continue;
          if (version === 'latest' || result.name.includes(version) || result.tag_name.includes(version)) {
            for (const asset of result.assets) {
              if (asset.name.includes('chrome'))
                resolve({
                  downloadUrl: asset.browser_download_url,
                  filename: asset.name,
                  tag: result.tag_name,
                });
            }
          }
        }
        reject(`Version ${version} not found!`);
      });
    });
    request.on('error', (error) => {
      // eslint-disable-next-line no-console
      console.warn('getMetamaskReleases error:', error.message);
      throw error;
    });
  });
