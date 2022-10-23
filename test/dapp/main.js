async function start() {
  const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');

  const increaseButton = document.querySelector('.increase-button');
  increaseButton.addEventListener('click', async function () {
    const accounts = await provider.send('eth_requestAccounts', []);
    const counterContract = new ethers.Contract(
      ContractInfo.address,
      ContractInfo.abi,
      provider.getSigner(accounts[0]),
    );
    await counterContract.increase();
    const txSent = document.createElement('div');
    txSent.id = 'txSent';
    document.body.appendChild(txSent);
  });

  const increaseFeesButton = document.querySelector('.increase-fees-button');
  increaseFeesButton.addEventListener('click', async function () {
    const accounts = await provider.send('eth_requestAccounts', []);
    await counterContract.methods.increase().send({ from: accounts[0] });
    const txSent = document.createElement('div');
    txSent.id = 'feesTxSent';
    document.body.appendChild(txSent);
  });

  const connectButton = document.querySelector('.connect-button');
  connectButton.addEventListener('click', async function () {
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });
    const connected = document.createElement('div');
    connected.id = 'connected';
    document.body.appendChild(connected);
  });

  const signButton = document.querySelector('.sign-button');
  signButton.addEventListener('click', async function () {
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner(accounts[0]);
    await signer.signMessage('TEST');
    const signed = document.createElement('div');
    signed.id = 'signed';
    document.body.appendChild(signed);
  });

  const transferButton = document.querySelector('.transfer-button');
  transferButton.addEventListener('click', async function () {
    const accounts = await provider.send('eth_requestAccounts', []);
    await counterContract.methods.increase().send();
    await web3.eth.sendTransaction({ to: accounts[0], from: accounts[0], value: web3.utils.toWei('0.01') });
    const transfer = document.createElement('div');
    transfer.id = 'transferred';
    document.body.appendChild(transfer);
  });
}

start();
