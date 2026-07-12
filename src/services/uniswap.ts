import { CHAIN_ID } from '@/lib/constants'

const NATIVE_ETH_FOR_API = '0x0000000000000000000000000000000000000000'
const NATIVE_ADDRESSES = ['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', '0x0000000000000000000000000000000000000000']

interface QuoteRequest {
  tokenIn: `0x${string}`
  tokenOut: `0x${string}`
  amount: string
  swapper: `0x${string}`
  slippageTolerance?: number
  type?: 'EXACT_INPUT' | 'EXACT_OUTPUT'
}

interface QuoteResponse {
  quote: {
    input: { amount: string; token: string }
    output: { amount: string; token: string }
    priceImpact: number
    gasFee: string
    route: RouteStep[]
    routeString: string
  }
  permitData?: { domain: unknown; types: unknown; values: unknown }
  routing: 'CLASSIC' | 'UNISWAPX'
  requestId: string
}

interface RouteStep {
  type: string
  tokenIn: { address: string; symbol: string }
  tokenOut: { address: string; symbol: string }
  fee?: number
}

interface SwapResponse {
  requestId: string
  swap: {
    to: `0x${string}`
    from: `0x${string}`
    data: `0x${string}`
    value: string
    gasLimit: string
    chainId: number
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
    gasPrice?: string
  }
  gasFee: string
}

interface ApprovalResponse {
  approval?: { to: `0x${string}`; data: `0x${string}`; value: string; chainId: number }
  gasFee?: string
}

const isNativeEth = (address: string) =>
  NATIVE_ADDRESSES.some((native) => native.toLowerCase() === address.toLowerCase())

export async function checkApproval(tokenAddress: `0x${string}`, amount: string, walletAddress: `0x${string}`): Promise<ApprovalResponse> {
  if (isNativeEth(tokenAddress)) return {}

  const response = await fetch('/api/uniswap/check-approval', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: tokenAddress, amount, walletAddress, chainId: CHAIN_ID }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Approval check failed')
  }
  return response.json()
}

export async function getQuote({ tokenIn, tokenOut, amount, swapper, slippageTolerance = 0.5, type = 'EXACT_INPUT' }: QuoteRequest): Promise<QuoteResponse> {
  const apiTokenIn = isNativeEth(tokenIn) ? NATIVE_ETH_FOR_API : tokenIn

  const response = await fetch('/api/uniswap/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tokenIn: apiTokenIn,
      tokenOut,
      tokenInChainId: CHAIN_ID,
      tokenOutChainId: CHAIN_ID,
      amount,
      type,
      swapper,
      slippageTolerance,
      protocols: ['V3', 'V2'],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Quote failed')
  }
  return response.json()
}

export async function createSwapTransaction(quote: QuoteResponse, signature?: string): Promise<SwapResponse> {
  // Pass the entire quote response, not just quote.quote
  const body: Record<string, unknown> = {
    quote: quote,
    simulateTransaction: false,
  }

  if (signature && quote.permitData) {
    body.signature = signature
  }

  const response = await fetch('/api/uniswap/swap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Swap transaction creation failed')
  }
  return response.json()
}

export const formatQuoteForDisplay = (quote: QuoteResponse, inputDecimals: number, outputDecimals: number) => {
  const inputAmount = BigInt(quote.quote.input.amount)
  const outputAmount = BigInt(quote.quote.output.amount)
  const rate = Number(outputAmount) / Number(inputAmount) * Math.pow(10, inputDecimals - outputDecimals)

  // gasFee from API is in wei - convert to USD estimate (assuming ~$2000 ETH price)
  const gasFeeWei = Number(quote.quote.gasFee)
  const gasFeeEth = gasFeeWei / 1e18
  const gasFeeUSD = gasFeeEth * 2000 // Approximate ETH price

  // Format route to be more readable (truncate addresses)
  const formattedRoute = formatRouteString(quote.quote.routeString)

  return {
    inputAmount: quote.quote.input.amount,
    outputAmount: quote.quote.output.amount,
    priceImpact: quote.quote.priceImpact,
    gasFeeUSD: gasFeeUSD.toFixed(4),
    route: formattedRoute,
    rate: rate.toFixed(6),
    needsPermit: !!quote.permitData,
  }
}

function formatRouteString(routeString: string): string {
  const hasV3 = routeString.includes('[v3]') || routeString.includes('V3')
  const hasV2 = routeString.includes('[v2]') || routeString.includes('V2')

  if (hasV3 && hasV2) return 'Uniswap V2 + V3'
  if (hasV3) return 'Uniswap V3'
  if (hasV2) return 'Uniswap V2'
  return 'Direct'
}

export type { QuoteRequest, QuoteResponse, SwapResponse, ApprovalResponse }
