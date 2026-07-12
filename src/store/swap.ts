import { create } from 'zustand'
import type { SwapState, Invoice, RedemptionCode } from '@/types/swap'

interface SwapStore {
  state: SwapState
  error?: string
  invoice?: Invoice
  redemptionCode?: RedemptionCode
  approvalTxHash?: string
  swapTxHash?: string
  sendTxHash?: string
  pollAttempts: number

  startQuote: () => void
  quoteSuccess: () => void
  quoteError: (error: string) => void

  startApproval: () => void
  approvalSuccess: (txHash: string) => void
  approvalError: (error: string) => void
  skipApproval: () => void

  startInvoice: () => void
  invoiceSuccess: (invoice: Invoice) => void
  invoiceError: (error: string) => void

  startSwap: () => void
  swapSuccess: (txHash: string) => void
  swapError: (error: string) => void

  startSendUsdc: () => void
  sendUsdcSuccess: (txHash: string) => void
  sendUsdcError: (error: string) => void

  pollComplete: (code: RedemptionCode) => void
  pollTimeout: () => void
  pollError: (error: string) => void

  reset: () => void
}

const initialState = {
  state: 'IDLE' as SwapState,
  error: undefined,
  invoice: undefined,
  redemptionCode: undefined,
  approvalTxHash: undefined,
  swapTxHash: undefined,
  sendTxHash: undefined,
  pollAttempts: 0,
}

export const useSwapStore = create<SwapStore>((set) => ({
  ...initialState,

  startQuote: () => set({ state: 'QUOTING', error: undefined }),
  quoteSuccess: () => set({ state: 'NEEDS_APPROVAL', error: undefined }),
  quoteError: (error) => set({ state: 'FAILED', error }),

  startApproval: () => set({ state: 'APPROVING', error: undefined }),
  approvalSuccess: (txHash) => set({ state: 'CREATING_INVOICE', approvalTxHash: txHash, error: undefined }),
  approvalError: (error) => set({ state: 'FAILED', error }),
  skipApproval: () => set({ state: 'CREATING_INVOICE', error: undefined }),

  startInvoice: () => set({ state: 'CREATING_INVOICE', error: undefined }),
  invoiceSuccess: (invoice) => set({ state: 'SWAPPING', invoice, error: undefined }),
  invoiceError: (error) => set({ state: 'FAILED', error }),

  startSwap: () => set({ state: 'SWAPPING', error: undefined }),
  swapSuccess: (txHash) => set({ state: 'SENDING_USDC', swapTxHash: txHash, error: undefined }),
  swapError: (error) => set({ state: 'FAILED', error }),

  startSendUsdc: () => set({ state: 'SENDING_USDC', error: undefined }),
  sendUsdcSuccess: (txHash) => set({ state: 'POLLING', sendTxHash: txHash, pollAttempts: 0, error: undefined }),
  sendUsdcError: (error) => set({ state: 'FAILED', error }),

  pollComplete: (code) => set({ state: 'COMPLETE', redemptionCode: code, error: undefined }),
  pollTimeout: () => set({ state: 'TIMEOUT', error: 'Invoice processing timed out. Your payment may still be processing.' }),
  pollError: (error) => set({ state: 'FAILED', error }),

  reset: () => set(initialState),
}))
