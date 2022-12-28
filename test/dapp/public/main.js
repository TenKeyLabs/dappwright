async function start() {
  const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  let counterContract;
  let accounts;

  const connectButton = document.querySelector('.connect-button');
  connectButton.addEventListener('click', async function () {
    accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });
    counterContract = new ethers.Contract(ContractInfo.address, ContractInfo.abi, provider.getSigner(accounts[0]));
    const connected = document.createElement('div');
    connected.id = 'connected';
    connected.textContent = 'connected';
    document.body.appendChild(connected);
  });

  const increaseButton = document.querySelector('.increase-button');
  increaseButton.addEventListener('click', async function () {
    await counterContract.increase({ from: accounts[0] });
    const increase = document.createElement('div');
    increase.id = 'increased';
    increase.textContent = 'increased';
    document.body.appendChild(increase);
  });

  const increaseFeesButton = document.querySelector('.increase-fees-button');
  increaseFeesButton.addEventListener('click', async function () {
    await counterContract.increase({ from: accounts[0] });
    const increaseFees = document.createElement('div');
    increaseFees.id = 'increasedFees';
    increaseFees.textContent = 'increasedFees';
    document.body.appendChild(increaseFees);
  });

  const signButton = document.querySelector('.sign-button');
  signButton.addEventListener('click', async function () {
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner(accounts[0]);
    await signer.signMessage('TEST');
    const signed = document.createElement('div');
    signed.id = 'signed';
    signed.textContent = 'signed';
    document.body.appendChild(signed);
  });

  const transferButton = document.querySelector('.transfer-button');
  transferButton.addEventListener('click', async function () {
    const accounts = await provider.send('eth_requestAccounts', []);
    // await counterContract.increase().send();
    await ethereum.request({
      method: 'eth_sendTransaction',
      params: [{ to: accounts[0], from: accounts[0], value: '10000000000000000' }],
    });
    const transfer = document.createElement('div');
    transfer.id = 'transferred';
    transfer.textContent = 'transferred';
    document.body.appendChild(transfer);
  });
}

start();
