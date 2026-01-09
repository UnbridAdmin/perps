export const environment = {
  production: true,
  apiUrl: 'https://api.unbrid.com/api',
  MATIC: {
    chainId: 80002,
    name: 'Polygon Testnet',
    currency: 'MATIC',
    explorerUrl: 'https://amoy.polygonscan.com/',
    rpcUrl: 'https://rpc-amoy.polygon.technology/',
  },
  ETHEREUM: {
    chainId: 11155111,
    name: 'Sepolia test network',
    currency: 'SepoliaETH',
    explorerUrl: 'https://sepolia.etherscan.io/',
    rpcUrl: 'https://eth-sepolia.api.onfinality.io/public',
  },
  WALLETCONNEC: {
    name: 'Perps',
    description: 'Wallet Connect For Perps',
    url: 'https://app.unbrid.com',
    icons: ['https://app.unbrid.com/'],
    projectId: 'f3f854530d520e7e0480a24ac2bf79c7',
    chains: [80002],
  },
  VALIDCHAINS: [80002],
  NAMECHAINS: [
    {
      chainId: 11155111,
      hexChainId: '0xaa36a7',
      name: 'ETH',
    },
    {
      chainId: 80002,
      hexChainId: '0x13882',
      name: 'MATIC',
    },
  ],
  CHAINPOSITION: 1,
  DECIMALSUSDT: 18,
  DECIMALFIERCE: 18,
  FIERCECONTRACTADDRESS: '0x1234567890123456789012345678901234567890', // TODO: Replace with actual contract address
  USDTPolyABI: [
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "type": "function"
    }
  ],
};
