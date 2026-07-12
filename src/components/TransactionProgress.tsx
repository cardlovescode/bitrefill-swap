'use client'

import { Check, Loader2, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getBasescanTxUrl } from '@/lib/utils'
import type { SwapState } from '@/types/swap'

function parseErrorMessage(error: string): string {
  const lowerError = error.toLowerCase()

  if (lowerError.includes('user rejected') || lowerError.includes('user denied')) {
    return 'Transaction was rejected in wallet'
  }
  if (lowerError.includes('insufficient funds') || lowerError.includes('insufficient balance')) {
    return 'Insufficient funds for transaction'
  }
  if (lowerError.includes('network') || lowerError.includes('disconnected')) {
    return 'Network connection error. Please try again.'
  }
  if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
    return 'Request timed out. Please try again.'
  }
  if (lowerError.includes('nonce')) {
    return 'Transaction nonce error. Please reset your wallet or try again.'
  }
  if (lowerError.includes('gas')) {
    return 'Gas estimation failed. The transaction may fail.'
  }

  // If message is too long, truncate it
  if (error.length > 100) {
    return error.slice(0, 100) + '...'
  }

  return error
}

interface Step {
  id: string
  label: string
  activeLabel: string
  states: SwapState[]
}

const STEPS: Step[] = [
  { id: 'approval', label: 'Token Approval', activeLabel: 'Approving token...', states: ['NEEDS_APPROVAL', 'APPROVING'] },
  { id: 'invoice', label: 'Create Invoice', activeLabel: 'Creating invoice...', states: ['CREATING_INVOICE'] },
  { id: 'swap', label: 'Swap Tokens', activeLabel: 'Swapping to USDC...', states: ['SWAPPING'] },
  { id: 'send', label: 'Send Payment', activeLabel: 'Sending USDC...', states: ['SENDING_USDC'] },
  { id: 'confirm', label: 'Confirm Payment', activeLabel: 'Confirming payment...', states: ['POLLING'] },
]

const statusStyles = {
  pending: { icon: 'bg-white/8 text-white/40', label: 'text-white/40' },
  active: { icon: 'bg-accent/15 text-accent ring-2 ring-accent/30', label: 'text-white' },
  complete: { icon: 'bg-green-500/15 text-green-500', label: 'text-green-500' },
  error: { icon: 'bg-red-500/15 text-red-500', label: 'text-red-500' },
}

interface TransactionProgressProps {
  currentState: SwapState
  approvalTxHash?: string
  swapTxHash?: string
  sendTxHash?: string
  error?: string
  pollAttempts?: number
  maxPollAttempts?: number
  isDirectUsdc?: boolean
}

export function TransactionProgress({
  currentState,
  approvalTxHash,
  swapTxHash,
  sendTxHash,
  error,
  pollAttempts = 0,
  maxPollAttempts = 45,
  isDirectUsdc = false,
}: TransactionProgressProps) {
  // Filter out swap step for direct USDC payments
  const visibleSteps = isDirectUsdc ? STEPS.filter(s => s.id !== 'swap') : STEPS
  const getStepStatus = (step: Step): keyof typeof statusStyles => {
    if (currentState === 'FAILED' || currentState === 'TIMEOUT') {
      const isActiveStep = step.states.some((s) => {
        const stepIndex = visibleSteps.findIndex((st) => st.states.includes(s))
        const currentIndex = visibleSteps.findIndex((st) => st.states.includes(currentState as SwapState))
        return stepIndex === currentIndex
      })
      if (isActiveStep) return 'error'
    }

    if (step.states.includes(currentState)) return 'active'

    const stepIndex = visibleSteps.indexOf(step)
    const currentStepIndex = visibleSteps.findIndex((s) => s.states.includes(currentState))

    if (currentStepIndex > stepIndex || currentState === 'COMPLETE') return 'complete'

    return 'pending'
  }

  const getTxHash = (stepId: string) => {
    const hashes: Record<string, string | undefined> = {
      approval: approvalTxHash,
      swap: swapTxHash,
      send: sendTxHash,
    }
    return hashes[stepId]
  }

  // Check if tx hash is valid (not undefined, not empty, not just '0x')
  const isValidTxHash = (hash: string | undefined): boolean => {
    return !!hash && hash.length > 10
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {visibleSteps.map((step, index) => {
          const status = getStepStatus(step)
          const txHash = getTxHash(step.id)
          const isLast = index === visibleSteps.length - 1
          const styles = statusStyles[status]

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all', styles.icon)}>
                {status === 'pending' && <span className="text-[13px] font-semibold">{index + 1}</span>}
                {status === 'active' && <Loader2 className="w-4 h-4 animate-spin" />}
                {status === 'complete' && <Check className="w-4 h-4" />}
                {status === 'error' && <X className="w-4 h-4" />}
              </div>

              <div className="flex-1 pt-1.5">
                <div className="flex items-center justify-between">
                  <span className={cn('font-semibold text-sm', styles.label)}>
                    {status === 'active' ? step.activeLabel : step.label}
                  </span>

                  {isValidTxHash(txHash) && status === 'complete' && (
                    <a
                      href={getBasescanTxUrl(txHash!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {step.id === 'confirm' && status === 'active' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-white/60 mb-1.5">
                      <span>Waiting for confirmation</span>
                      <span>{pollAttempts}/{maxPollAttempts}</span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${(pollAttempts / maxPollAttempts) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {!isLast && (
                  <div className={cn('w-px h-4 ml-4 mt-2', status === 'complete' ? 'bg-green-500/40' : 'bg-white/10')} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm break-words">
          {parseErrorMessage(error)}
        </div>
      )}
    </div>
  )
}
