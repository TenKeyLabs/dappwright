import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import { fileURLToPath } from 'url';

import handler from 'serve-handler';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { compileContracts } from './contract/index.js';

const RPC_URL = 'http://127.0.0.1:8545';
const CHAIN_NODE_TIMEOUT_MS = 60000;

// Hardhat 3 only runs in ESM projects, so this package has no __dirname
const dappDir = path.dirname(fileURLToPath(import.meta.url));

const counterContract: { address: string } | null = null;

let httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
let chainNode: ChildProcess;

export function getCounterContract(): { address: string } | null {
  return counterContract;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function start(): Promise<Contract<any>> {
  await startChainNode();
  await startTestServer();
  return await deployContract();
}

export async function stop(): Promise<void> {
  await new Promise<void>((resolve) => {
    httpServer.close(() => {
      resolve();
    });
  });
  chainNode.kill();
}

export async function startChainNode(): Promise<void> {
  console.log('Starting hardhat node...');

  // Hardhat's node is a CLI rather than an embeddable server, so it runs as a child process.
  // It binds 0.0.0.0 because the wallets reach it under different hosts - MetaMask's network is
  // added as localhost:8545, while Coinbase's built-in local network uses 127.0.0.1:8545.
  chainNode = spawn(
    path.resolve(dappDir, 'node_modules', '.bin', 'hardhat'),
    ['node', '--network', 'chain', '--hostname', '0.0.0.0', '--port', '8545'],
    { cwd: dappDir, stdio: ['ignore', 'ignore', 'inherit'] },
  );

  chainNode.on('exit', (code) => {
    if (code) console.error(`hardhat node exited with code ${code}`);
  });

  await waitForChainNode();
}

async function waitForChainNode(): Promise<void> {
  const deadline = Date.now() + CHAIN_NODE_TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(RPC_URL, {
        method: 'POST',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
      });
      if (response.ok) return;
    } catch {
      // Node isn't listening yet
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`hardhat node did not start within ${CHAIN_NODE_TIMEOUT_MS}ms`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deployContract(): Promise<Contract<any>> {
  console.log('Deploying test contract...');
  const web3 = new Web3(RPC_URL);
  const compiledContracts = compileContracts();
  const counterContractInfo = compiledContracts['Counter.sol']['Counter'];
  const counterContractDef = new web3.eth.Contract(counterContractInfo.abi);

  // deploy contract
  const accounts = await web3.eth.getAccounts();
  const counterContract = await counterContractDef
    .deploy({ data: counterContractInfo.evm.bytecode.object })
    .send({ from: accounts[0], gas: String(4000000) });
  console.log('Contract deployed at', counterContract.options.address);

  // export contract spec
  const dataJsPath = path.join(dappDir, 'public', 'Counter.js');
  const data = `const ContractInfo = ${JSON.stringify(
    { ...counterContractInfo, ...counterContract.options },
    null,
    2,
  )}`;
  await new Promise((resolve) => {
    fs.writeFile(dataJsPath, data, resolve);
  });
  console.log('path:', dataJsPath);

  return counterContract;
}

async function startTestServer(): Promise<void> {
  console.log('Starting test server...');
  httpServer = http.createServer((request, response) => {
    return handler(request, response, {
      public: path.join(dappDir, 'public'),
      cleanUrls: true,
    });
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(8080, 'localhost', () => {
      console.log('Server running at http://localhost:8080');
      resolve();
    });
  });
}
