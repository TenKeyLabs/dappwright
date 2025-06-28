import fs from 'fs';
import * as http from 'http';
import * as path from 'path';

import ganache, { Provider, Server } from 'ganache';
import handler from 'serve-handler';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { compileContracts } from './contract';

const counterContract: { address: string } | null = null;

let httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
let chainNode: Server;

export function getCounterContract(): { address: string } | null {
  return counterContract;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function start(): Promise<Contract<any>> {
  const provider = await waitForGanache();
  await startTestServer();
  return await deployContract(provider);
}

export async function stop(): Promise<void> {
  await new Promise<void>((resolve) => {
    httpServer.close(() => {
      resolve();
    });
  });
  await chainNode.close();
}

export async function waitForGanache(): Promise<Provider> {
  console.log('Starting ganache...');
  chainNode = ganache.server({
    chain: { chainId: 31337 },
    wallet: { seed: 'asd123' },
    logging: { quiet: true },
    flavor: 'ethereum',
  });
  await chainNode.listen(8545);
  return chainNode.provider;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deployContract(provider: Provider): Promise<Contract<any>> {
  console.log('Deploying test contract...');
  const web3 = new Web3(provider as unknown as Web3['currentProvider']);
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
  const dataJsPath = path.join(__dirname, 'public', 'Counter.js');
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
      public: path.join(__dirname, 'public'),
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
