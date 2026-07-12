'use client'

import { useQuery } from '@tanstack/react-query'
import { parseUnits } from 'viem'
import { getQuote, formatQuoteForDisplay } from '@/services/uniswap'
import { USDC_ADDRESS, QUOTE_REFRESH_INTERVAL } from '@/lib/constants'
import type { Token } from '@/types/token'

interface UseSwapQuoteParams {
  inputToken?: Token
  outputAmount: number
  swapperAddress?: `0x${string}`
  enabled?: boolean
}

export function useSwapQuote({ inputToken, outputAmount, swapperAddress, enabled = true }: UseSwapQuoteParams) {
  const isDirectUsdc = inputToken?.address.toLowerCase() === USDC_ADDRESS.toLowerCase()

  const parsedOutputAmount = outputAmount > 0
    ? parseUnits(outputAmount.toString(), 6).toString()
    : null

  // Skip query if paying with USDC directly (no swap needed)
  const queryEnabled = enabled && !!inputToken && !!parsedOutputAmount && !!swapperAddress && outputAmount > 0 && !isDirectUsdc

  const { data: quote, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['swapQuote', inputToken?.address, parsedOutputAmount, swapperAddress],
    queryFn: async () => {
      if (!inputToken || !parsedOutputAmount || !swapperAddress) throw new Error('Missing required parameters')
      return getQuote({
        tokenIn: inputToken.address,
        tokenOut: USDC_ADDRESS,
        amount: parsedOutputAmount,
        swapper: swapperAddress,
        slippageTolerance: 0.5,
        type: 'EXACT_OUTPUT',
      })
    },
    enabled: queryEnabled,
    refetchInterval: QUOTE_REFRESH_INTERVAL,
    staleTime: 10000,
    retry: 2,
  })

  // For direct USDC payment, create a simple "quote"
  // Add ~10% buffer for Bitrefill fees (actual price comes from invoice)
  if (isDirectUsdc && inputToken && outputAmount > 0) {
    const estimatedPrice = outputAmount * 1.1 // ~10% markup for fees
    const directQuote = {
      inputFormatted: estimatedPrice.toFixed(6),
      outputFormatted: outputAmount.toFixed(2),
      priceImpact: 0,
      gasFeeUSD: '0.01',
      route: 'Direct USDC',
      rate: '1.00',
      isEstimate: true, // Flag to show this is an estimate
    }
    return {
      quote: null, // No swap quote needed
      formattedQuote: directQuote,
      isLoading: false,
      isError: false,
      error: null,
      refetch,
      isDirectUsdc: true,
    }
  }

  const formattedQuote = quote && inputToken
    ? {
        ...formatQuoteForDisplay(quote, inputToken.decimals, 6),
        inputFormatted: (Number(BigInt(quote.quote.input.amount)) / Math.pow(10, inputToken.decimals)).toFixed(6),
        outputFormatted: (Number(BigInt(quote.quote.output.amount)) / 1e6).toFixed(2),
      }
    : null

  return {
    quote: quote ?? null,
    formattedQuote,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    isDirectUsdc: false,
  }
}
