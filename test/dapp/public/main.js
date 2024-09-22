async function start() {
  const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  let counterContract;
  let accounts = await provider.listAccounts();

  window.ethereum.on('chainChanged', function (chainId) {
    const switchNetwork = document.createElement('div');
    switchNetwork.id = 'switchNetwork';
    switchNetwork.textContent = `switchNetwork - ${parseInt(chainId, 16)}`;
    document.body.appendChild(switchNetwork);
  });

  const connectButton = document.querySelector('.connect-button');
  connectButton.addEventListener('click', async function () {
    try {
      accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      counterContract = new ethers.Contract(ContractInfo.address, ContractInfo.abi, provider.getSigner(accounts[0]));
    } catch {
      const connectRejected = document.createElement('div');
      connectRejected.id = 'connect-rejected';
      connectRejected.textContent = 'connect rejected';
      document.body.appendChild(connectRejected);
      return;
    }

    const connected = document.createElement('div');
    connected.id = 'connected';
    connected.textContent = 'connected';
    document.body.appendChild(connected);
  });

  const personalSign = async function (message) {
    try {
      accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      const from = accounts[0];
      const msg = `0x${btoa(message, 'utf8').toString('hex')}`;
      await ethereum.request({
        method: 'personal_sign',
        params: [msg, from],
      });
      const signedIn = document.createElement('div');
      signedIn.id = 'signedIn';
      signedIn.textContent = 'signed in';
      document.body.appendChild(signedIn);
    } catch (err) {
      console.error(err);
    }
  };

  const signinButton = document.querySelector('.signin-button');
  signinButton.addEventListener('click', async function () {
    const domain = window.location.host;
    const from = accounts[0];
    const message = `${domain} wants you to sign in with your Ethereum account:\n${from}\n\nI accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\nURI: https://${domain}\nVersion: 1\nChain ID: 1\nNonce: 32891757\nIssued At: 2021-09-30T16:25:24.000Z`;
    personalSign(message);
  });

  const switchNetworkButton = document.querySelector('.switch-network-button');
  switchNetworkButton.addEventListener('click', async function () {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x7A69' }],
    });
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
    try {
      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ to: accounts[0], from: accounts[0], value: '10000000000000000' }],
      });
    } catch {
      const transferRejected = document.createElement('div');
      transferRejected.id = 'transfer-rejected';
      transferRejected.textContent = 'transfer rejected';
      document.body.appendChild(transferRejected);
      return;
    }
    const transfer = document.createElement('div');
    transfer.id = 'transferred';
    transfer.textContent = 'transferred';
    document.body.appendChild(transfer);
  });

  const ready = document.createElement('div');
  ready.id = 'ready';
  ready.textContent = 'ready';
  document.body.appendChild(ready);
}

start();
