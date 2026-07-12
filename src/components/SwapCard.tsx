'use client'

import { useState, useCallback } from 'react'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { useSendTransaction, useWriteContract, useSignTypedData } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/lib/wagmi'
import { base } from '@reown/appkit/networks'
import { parseUnits, erc20Abi } from 'viem'
import { motion } from 'framer-motion'
import { Wallet, AlertCircle } from 'lucide-react'

import { TokenSelector } from './TokenSelector'
import { GiftCardSelector } from './GiftCardSelector'
import { QuoteBreakdown } from './QuoteBreakdown'
import { TransactionProgress } from './TransactionProgress'
import { RedemptionCode } from './RedemptionCode'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { QuoteSkeleton } from './ui/Skeleton'

import { useSwapQuote } from '@/hooks/useSwapQuote'
import { useSwapStore } from '@/store/swap'
import { useInvoicePolling } from '@/hooks/useInvoicePolling'

import { checkApproval, createSwapTransaction } from '@/services/uniswap'
import { createInvoice } from '@/services/bitrefill'

import type { TokenBalance } from '@/types/token'
import { USDC_ADDRESS, NATIVE_ETH_ADDRESS, CHAIN_ID, INVOICE_POLL_MAX_ATTEMPTS } from '@/lib/constants'

const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3' as const

export function SwapCard() {
  const { isConnected, address } = useAppKitAccount()
  const { chainId, switchNetwork } = useAppKitNetwork()
  const isWrongNetwork = isConnected && chainId !== CHAIN_ID
  const [isSwitching, setIsSwitching] = useState(false)

  const [selectedToken, setSelectedToken] = useState<TokenBalance | undefined>()
  const [selectedDenomination, setSelectedDenomination] = useState<number | null>(null)
  const [showProgressModal, setShowProgressModal] = useState(false)

  const {
    state,
    error,
    invoice,
    redemptionCode,
    approvalTxHash,
    swapTxHash,
    sendTxHash,
    startQuote,
    quoteError,
    startApproval,
    approvalSuccess,
    approvalError,
    skipApproval,
    startInvoice,
    invoiceSuccess,
    invoiceError,
    startSwap,
    swapSuccess,
    swapError,
    startSendUsdc,
    sendUsdcSuccess,
    sendUsdcError,
    pollComplete,
    pollTimeout,
    pollError,
    reset,
  } = useSwapStore()
  const invoicePolling = useInvoicePolling()

  // Computed flags
  const isProcessing = !['IDLE', 'COMPLETE', 'FAILED', 'TIMEOUT'].includes(state)
  const isComplete = state === 'COMPLETE'
  const isFailed = state === 'FAILED'
  const isTimedOut = state === 'TIMEOUT'

  const shouldFetchQuote = !!(selectedToken && selectedDenomination && address && !isProcessing)

  const { quote, formattedQuote, isLoading: isQuoteLoading, isError: isQuoteError, isDirectUsdc } = useSwapQuote({
    inputToken: selectedToken?.token,
    outputAmount: selectedDenomination || 0,
    swapperAddress: address as `0x${string}` | undefined,
    enabled: shouldFetchQuote,
  })

  const { sendTransactionAsync } = useSendTransaction()
  const { writeContractAsync } = useWriteContract()
  const { signTypedDataAsync } = useSignTypedData()

  // Check if user has enough balance for the required input
  const requiredInput = formattedQuote ? parseFloat(formattedQuote.inputFormatted) : 0
  const userBalance = selectedToken ? parseFloat(selectedToken.balanceFormatted) : 0
  const hasEnoughBalance = userBalance >= requiredInput

  const handleTokenSelect = (token: TokenBalance) => {
    setSelectedToken(token)
  }

  const executeSwap = useCallback(async () => {
    if (!address || !selectedToken || !selectedDenomination || !formattedQuote) return
    // For non-USDC swaps, we need a quote
    if (!isDirectUsdc && !quote) return

    setShowProgressModal(true)
    const walletAddress = address as `0x${string}`
    const inputAmount = formattedQuote.inputFormatted

    try {
      // Direct USDC payment - skip approval and swap steps
      if (isDirectUsdc) {
        skipApproval()

        startInvoice()
        const invoice = await createInvoice({ value: selectedDenomination, refundAddress: walletAddress })
        invoiceSuccess(invoice)

        // Skip swap step for direct USDC (no tx hash needed)
        swapSuccess(undefined as unknown as `0x${string}`)

        startSendUsdc()
        // payment.price is already in smallest units (6 decimals for USDC)
        const usdcAmount = BigInt(invoice.payment.price)
        const sendTxHash = await writeContractAsync({
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [invoice.payment.address, usdcAmount],
          chainId: CHAIN_ID,
        })
        sendUsdcSuccess(sendTxHash)

        invoicePolling.startPolling(invoice.id)
        return
      }

      // Non-USDC flow: approval check + swap + send
      const isNativeEth = selectedToken.token.address === NATIVE_ETH_ADDRESS
      let needsApproval = false

      if (!isNativeEth) {
        startQuote()
        const approvalCheck = await checkApproval(
          selectedToken.token.address,
          parseUnits(inputAmount, selectedToken.token.decimals).toString(),
          walletAddress
        )
        needsApproval = !!approvalCheck.approval
      }

      if (needsApproval) {
        startApproval()
        const approvalTx = await writeContractAsync({
          address: selectedToken.token.address,
          abi: erc20Abi,
          functionName: 'approve',
          args: [PERMIT2_ADDRESS, parseUnits(inputAmount, selectedToken.token.decimals)],
          chainId: CHAIN_ID,
        })
        approvalSuccess(approvalTx)
      } else {
        skipApproval()
      }

      startInvoice()
      const invoice = await createInvoice({ value: selectedDenomination, refundAddress: walletAddress })
      invoiceSuccess(invoice)

      startSwap()

      let signature: string | undefined
      if (quote!.permitData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const permitData = quote!.permitData as any
        signature = await signTypedDataAsync({
          domain: permitData.domain,
          types: permitData.types,
          primaryType: 'PermitSingle',
          message: permitData.values,
        })
      }

      const swapTx = await createSwapTransaction(quote!, signature)
      const swapTxHash = await sendTransactionAsync({
        to: swapTx.swap.to,
        data: swapTx.swap.data,
        value: BigInt(swapTx.swap.value || '0'),
        chainId: CHAIN_ID,
      })
      // Wait for swap to confirm on-chain before proceeding
      await waitForTransactionReceipt(config, { hash: swapTxHash })
      swapSuccess(swapTxHash)

      startSendUsdc()
      // payment.price is already in smallest units (6 decimals for USDC)
      const usdcAmount = BigInt(invoice.payment.price)
      const sendTxHash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [invoice.payment.address, usdcAmount],
        chainId: CHAIN_ID,
      })
      // Wait for USDC transfer to confirm
      await waitForTransactionReceipt(config, { hash: sendTxHash })
      sendUsdcSuccess(sendTxHash)

      invoicePolling.startPolling(invoice.id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
      // Get current state from store (not stale React state)
      const currentState = useSwapStore.getState().state
      const errorHandlers: Record<string, () => void> = {
        QUOTING: () => quoteError(errorMessage),
        APPROVING: () => approvalError(errorMessage),
        CREATING_INVOICE: () => invoiceError(errorMessage),
        SWAPPING: () => swapError(errorMessage),
        SENDING_USDC: () => sendUsdcError(errorMessage),
        POLLING: () => pollError(errorMessage),
      }
      const handler = errorHandlers[currentState] || (() => quoteError(errorMessage))
      handler()
    }
  }, [address, selectedToken, selectedDenomination, quote, formattedQuote, isDirectUsdc, writeContractAsync, sendTransactionAsync, signTypedDataAsync, invoicePolling])

  if (invoicePolling.redemptionCode && state !== 'COMPLETE') {
    pollComplete(invoicePolling.redemptionCode)
  }
  if (invoicePolling.timedOut && state !== 'TIMEOUT') {
    pollTimeout()
  }
  if (invoicePolling.error && state !== 'FAILED') {
    pollError(invoicePolling.error)
  }

  const handleReset = () => {
    reset()
    invoicePolling.stopPolling()
    setShowProgressModal(false)
  }

  const canSwap = isConnected && selectedToken && selectedDenomination && formattedQuote && hasEnoughBalance && !isProcessing

  const getButtonText = () => {
    if (!selectedToken) return 'Select a token'
    if (!selectedDenomination) return 'Select gift card amount'
    if (isQuoteLoading) return 'Getting quote...'
    if (isQuoteError) return 'Quote failed - try again'
    if (!hasEnoughBalance) return 'Insufficient balance'
    if (isDirectUsdc) return 'Pay with USDC'
    return 'Swap & Get Gift Card'
  }

  return (
    <>
      <motion.div
        className="bg-card border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {isConnected ? (
          isWrongNetwork ? (
            <motion.div
              className="text-center py-12 space-y-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                <AlertCircle className="w-7 h-7 text-yellow-500" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-medium">Wrong Network</p>
                <p className="text-white/50 text-sm">Please switch to Base to continue</p>
              </div>
              <Button
                onClick={async () => {
                  setIsSwitching(true)
                  try {
                    await switchNetwork(base)
                  } finally {
                    setIsSwitching(false)
                  }
                }}
                isLoading={isSwitching}
                className="mx-auto"
              >
                Switch to Base
              </Button>
            </motion.div>
          ) : (
          <>
            {/* Token Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Pay with</span>
                {selectedToken && (
                  <span className="text-white/40">
                    Balance: {parseFloat(selectedToken.balanceFormatted).toFixed(4)} {selectedToken.token.symbol}
                  </span>
                )}
              </div>
              <TokenSelector selectedToken={selectedToken} onSelect={handleTokenSelect} />
            </div>

            {/* Gift Card Selection */}
            <GiftCardSelector selectedValue={selectedDenomination} onSelect={setSelectedDenomination} />

            {/* Quote Details */}
            {shouldFetchQuote && formattedQuote && (
              <motion.div
                className="p-4 pb-5 rounded-2xl bg-white/5 border border-white/10 space-y-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">You&apos;ll spend</span>
                  <span className="text-lg font-semibold text-white">
                    {parseFloat(formattedQuote.inputFormatted).toFixed(6)} {selectedToken?.token.symbol}
                  </span>
                </div>
                <QuoteBreakdown quote={formattedQuote} isLoading={isQuoteLoading} inputSymbol={selectedToken?.token.symbol || ''} />
              </motion.div>
            )}

            {shouldFetchQuote && isQuoteLoading && !formattedQuote && (
              <div className="p-4 pb-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                  <div className="h-5 w-28 bg-white/10 rounded animate-pulse" />
                </div>
                <QuoteSkeleton />
              </div>
            )}

            {/* Insufficient Balance Warning */}
            {formattedQuote && selectedDenomination && !hasEnoughBalance && (
              <motion.div
                className="p-4 rounded-xl bg-yellow-500/10 text-yellow-500 text-sm border border-yellow-500/20 flex items-start gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>
                  You need {requiredInput.toFixed(6)} {selectedToken?.token.symbol} but only have {userBalance.toFixed(6)}
                </span>
              </motion.div>
            )}

            {isQuoteError && (
              <motion.div
                className="p-4 rounded-xl bg-red-500/10 text-red-500 text-sm border border-red-500/20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Failed to fetch quote. Please try again.
              </motion.div>
            )}

            <Button className="w-full" size="lg" disabled={!canSwap} isLoading={isQuoteLoading} onClick={executeSwap}>
              {getButtonText()}
            </Button>
          </>
          )
        ) : (
          <motion.div
            className="text-center py-16 space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center border border-white/10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
            >
              <Wallet className="w-7 h-7 text-accent" />
            </motion.div>
            <motion.p className="text-white/50 text-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              Connect your wallet to get started
            </motion.p>
          </motion.div>
        )}
      </motion.div>

      <Modal
        isOpen={showProgressModal}
        onClose={() => !isProcessing && handleReset()}
        title={isComplete ? undefined : isFailed || isTimedOut ? 'Transaction Failed' : 'Processing Transaction'}
      >
        {isComplete && redemptionCode ? (
          <RedemptionCode redemptionCode={redemptionCode} denomination={selectedDenomination || 0} onNewSwap={handleReset} />
        ) : (
          <div className="space-y-6">
            <TransactionProgress
              currentState={state}
              approvalTxHash={approvalTxHash}
              swapTxHash={swapTxHash}
              sendTxHash={sendTxHash}
              error={error}
              pollAttempts={invoicePolling.attempts}
              maxPollAttempts={INVOICE_POLL_MAX_ATTEMPTS}
              isDirectUsdc={isDirectUsdc}
            />

            {(isFailed || isTimedOut) && (
              <div className="space-y-3">
                {isTimedOut && invoice && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-500 text-sm border border-yellow-500/20">
                    Payment may still be processing. Check your Bitrefill account or use refund address: {invoice.payment.address.slice(0, 10)}...
                  </div>
                )}
                <Button className="w-full" onClick={handleReset}>Try Again</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
