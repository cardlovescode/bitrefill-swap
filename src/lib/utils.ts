import { type ClassValue, clsx } from 'clsx'

export const cn = (...inputs: ClassValue[]) => clsx(inputs)

export const formatTokenAmount = (amount: bigint, decimals: number, displayDecimals = 4) => {
  const divisor = BigInt(10 ** decimals)
  const whole = amount / divisor
  const fraction = amount % divisor
  if (fraction === 0n) return whole.toString()
  const fractionStr = fraction.toString().padStart(decimals, '0')
  const trimmed = fractionStr.slice(0, displayDecimals).replace(/0+$/, '')
  return trimmed ? `${whole}.${trimmed}` : whole.toString()
}

export const parseTokenAmount = (amount: string, decimals: number) => {
  const [whole, fraction = ''] = amount.split('.')
  return BigInt(whole + fraction.padEnd(decimals, '0').slice(0, decimals))
}

export const formatUSD = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

export const truncateAddress = (address: string, chars = 4) =>
  `${address.slice(0, chars + 2)}...${address.slice(-chars)}`

export const getBasescanTxUrl = (txHash: string) => `https://basescan.org/tx/${txHash}`

export const getBasescanAddressUrl = (address: string) => `https://basescan.org/address/${address}`

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
