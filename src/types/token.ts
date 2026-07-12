export interface Token {
  address: `0x${string}`
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  balance?: bigint
  balanceFormatted?: string
}

export interface TokenBalance {
  token: Token
  balance: bigint
  balanceFormatted: string
  balanceUSD?: number
}
