import { defineChain } from 'viem'

export const SetTestnet = /*#__PURE__*/ defineChain({
  id: 1_328,
  name: 'Sei Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sei',
    symbol: 'SEI',
  },
  rpcUrls: {
    default: { http: ['https://evm-rpc-testnet.sei-apis.com'] },
  }
})


export const sonicBlazeTestnet = /*#__PURE__*/ defineChain({
  id: 57054,
  name: 'Sonic Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.blaze.soniclabs.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Testnet Explorer',
      url: 'https://testnet.sonicscan.org',
    },
  },
  testnet: true,
})
