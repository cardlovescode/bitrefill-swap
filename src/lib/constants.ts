import type { Token } from '@/types/token'

export const CHAIN_ID = 8453

export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const
export const WETH_ADDRESS = '0x4200000000000000000000000000000000000006' as const
export const NATIVE_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const

export const NATIVE_ETH: Token = {
  address: NATIVE_ETH_ADDRESS,
  symbol: 'ETH',
  name: 'Ether',
  decimals: 18,
  logoURI: '/tokens/eth.png',
}

export const BASE_TOKENS: Token[] = [
  // Stablecoins
  { address: USDC_ADDRESS, symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: '/tokens/usdc.png' },
  { address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', symbol: 'USDbC', name: 'USD Base Coin', decimals: 6, logoURI: '/tokens/usdbc.png' },
  { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, logoURI: '/tokens/dai.png' },

  // ETH derivatives
  { address: WETH_ADDRESS, symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logoURI: '/tokens/weth.png' },
  { address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', symbol: 'cbETH', name: 'Coinbase Wrapped Staked ETH', decimals: 18, logoURI: '/tokens/cbeth.png' },
  { address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452', symbol: 'wstETH', name: 'Wrapped stETH', decimals: 18, logoURI: '/tokens/wsteth.png' },

  // DeFi & Popular
  { address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', symbol: 'AERO', name: 'Aerodrome', decimals: 18, logoURI: '/tokens/aero.png' },
  { address: '0x532f27101965dd16442E59d40670FaF5eBB142E4', symbol: 'BRETT', name: 'Brett', decimals: 18, logoURI: '/tokens/brett.png' },
  { address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', symbol: 'DEGEN', name: 'Degen', decimals: 18, logoURI: '/tokens/degen.png' },
  { address: '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4', symbol: 'TOSHI', name: 'Toshi', decimals: 18, logoURI: '/tokens/toshi.png' },
  { address: '0xA88594D404727625A9437C3f886C7643872296AE', symbol: 'WELL', name: 'Moonwell', decimals: 18, logoURI: '/tokens/well.png' },
  { address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', symbol: 'cbBTC', name: 'Coinbase Wrapped BTC', decimals: 8, logoURI: '/tokens/cbbtc.png' },
]

export const UNISWAP_API_URL = 'https://api.uniswap.org/v2'

export const GIFT_CARD_DENOMINATIONS = [
  { value: 10, label: '$10' },
  { value: 20, label: '$20' },
  { value: 50, label: '$50' },
  { value: 100, label: '$100' },
] as const

export const INVOICE_POLL_INTERVAL = 4000
export const INVOICE_POLL_MAX_ATTEMPTS = 45
export const QUOTE_REFRESH_INTERVAL = 15000
export const DEFAULT_SLIPPAGE_BPS = 50
