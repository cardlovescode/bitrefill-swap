export type SwapState =
  | 'IDLE'
  | 'QUOTING'
  | 'NEEDS_APPROVAL'
  | 'APPROVING'
  | 'CREATING_INVOICE'
  | 'SWAPPING'
  | 'SENDING_USDC'
  | 'POLLING'
  | 'TIMEOUT'
  | 'COMPLETE'
  | 'FAILED'

export interface SwapQuote {
  inputToken: `0x${string}`
  outputToken: `0x${string}`
  inputAmount: string
  outputAmount: string
  priceImpact: string
  route: RouteStep[]
  gasFeeUSD: string
  quoteId?: string
  calldata?: string
  to?: `0x${string}`
  value?: string
}

export interface RouteStep {
  protocol: string
  tokenIn: `0x${string}`
  tokenOut: `0x${string}`
  fee?: number
}

export interface Invoice {
  id: string
  status: InvoiceStatus
  payment: {
    address: `0x${string}`
    price: string
    currency: string
  }
  orders: Array<{ id: string }>
}

export type InvoiceStatus =
  | 'pending'
  | 'not_delivered'
  | 'payment_received'
  | 'processing'
  | 'complete'
  | 'all_delivered'
  | 'partially_delivered'
  | 'expired'
  | 'failed'

export interface RedemptionCode {
  code: string
  productName: string
  value: number
  currency: string
}
