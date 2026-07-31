import { IncomingMessage } from 'http';
import { get } from 'https';

const MAX_REDIRECTS = 5;

export const request = (url: string, redirectsLeft: number = MAX_REDIRECTS): Promise<IncomingMessage> =>
  new Promise((resolve, reject) => {
    const pending = get(url, (response) => {
      const statusCode = response.statusCode ?? 0;
      const location = response.headers.location;

      // Release downloads redirect to a CDN, and the status used for it varies (301/302/307/308).
      // Following only one of them leaves the redirect page itself to be written out as the
      // download, which then fails to unzip.
      if (statusCode >= 300 && statusCode < 400 && location) {
        response.resume();

        if (redirectsLeft === 0) return reject(new Error(`Too many redirects downloading ${url}`));
        return resolve(request(location, redirectsLeft - 1));
      }

      if (statusCode !== 200) {
        response.resume();
        return reject(new Error(`Request for ${url} failed with status ${statusCode}`));
      }

      resolve(response);
    });

    pending.on('error', reject);
  });
