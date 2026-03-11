export const environment = {
  production: false,
  apiUrl: 'https://api.unbrid.com/perps-back/api/',
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
    name: 'Perps Development',
    description: 'Wallet Connect For Perps Development',
    url: 'http://localhost:4200',
    icons: ['http://localhost:4200/'],
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
  FIERCECONTRACTADDRESS: '0x443f831eDC6e87044a6E9C18a06b159B447CA13C', // TODO: Replace with actual contract address
  VAULT_ADDRESS: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  USDTPolyABI: [
    {
      inputs: [],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'allowance',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'needed',
          type: 'uint256',
        },
      ],
      name: 'ERC20InsufficientAllowance',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'balance',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'needed',
          type: 'uint256',
        },
      ],
      name: 'ERC20InsufficientBalance',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'approver',
          type: 'address',
        },
      ],
      name: 'ERC20InvalidApprover',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'receiver',
          type: 'address',
        },
      ],
      name: 'ERC20InvalidReceiver',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
      ],
      name: 'ERC20InvalidSender',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
      ],
      name: 'ERC20InvalidSpender',
      type: 'error',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'Approval',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'Transfer',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
      ],
      name: 'allowance',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'approve',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'decimals',
      outputs: [
        {
          internalType: 'uint8',
          name: '',
          type: 'uint8',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'name',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalSupply',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'transfer',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'transferFrom',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
};
