import http from 'http';
import { AddressInfo } from 'net';

type Rpc = { url: string; close: () => Promise<void> };

// Just enough of a JSON-RPC node for a wallet to ask which chain it is on
export const startRpc = async ({ chainId, delayMs = 0 }: { chainId: number; delayMs?: number }): Promise<Rpc> => {
  const server = http.createServer((request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', '*');
    if (request.method === 'OPTIONS') {
      response.end();
      return;
    }

    let body = '';
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => {
      const { id } = JSON.parse(body) as { id: unknown };
      setTimeout(() => {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ jsonrpc: '2.0', id, result: `0x${chainId.toString(16)}` }));
      }, delayMs);
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    close: async (): Promise<void> => {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    },
  };
};
