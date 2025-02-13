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
