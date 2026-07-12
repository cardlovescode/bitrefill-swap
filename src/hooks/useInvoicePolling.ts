'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { getInvoice, getOrder } from '@/services/bitrefill'
import { INVOICE_POLL_INTERVAL, INVOICE_POLL_MAX_ATTEMPTS } from '@/lib/constants'
import type { Invoice, InvoiceStatus, RedemptionCode } from '@/types/swap'

export function useInvoicePolling() {
  const [isPolling, setIsPolling] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<InvoiceStatus | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [redemptionCode, setRedemptionCode] = useState<RedemptionCode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const abortRef = useRef(false)

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current)
      abortRef.current = true
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current)
      pollingRef.current = null
    }
    abortRef.current = true
    setIsPolling(false)
  }, [])

  const startPolling = useCallback((invoiceId: string) => {
    setIsPolling(true)
    setCurrentStatus(null)
    setAttempts(0)
    setInvoice(null)
    setRedemptionCode(null)
    setError(null)
    setTimedOut(false)
    abortRef.current = false

    const poll = async (attemptNumber: number) => {
      if (abortRef.current) return

      try {
        setAttempts(attemptNumber)
        const invoiceData = await getInvoice(invoiceId)
        if (abortRef.current) return

        setInvoice(invoiceData)
        setCurrentStatus(invoiceData.status)

        if (invoiceData.status === 'complete') {
          const orderId = invoiceData.orders[0]?.id
          if (orderId) {
            const order = await getOrder(orderId)
            if (order.redemptionInfo?.code) {
              setRedemptionCode({
                code: order.redemptionInfo.code,
                productName: 'Bitrefill Balance',
                value: 0,
                currency: 'USD',
              })
            }
          }
          stopPolling()
          return
        }

        if (invoiceData.status === 'failed' || invoiceData.status === 'expired') {
          setError(`Invoice ${invoiceData.status}`)
          stopPolling()
          return
        }

        if (attemptNumber >= INVOICE_POLL_MAX_ATTEMPTS) {
          setTimedOut(true)
          stopPolling()
          return
        }

        pollingRef.current = setTimeout(() => poll(attemptNumber + 1), INVOICE_POLL_INTERVAL)
      } catch (err) {
        if (abortRef.current) return
        setError(err instanceof Error ? err.message : 'Unknown error')
        stopPolling()
      }
    }

    poll(1)
  }, [stopPolling])

  return {
    isPolling,
    currentStatus,
    attempts,
    maxAttempts: INVOICE_POLL_MAX_ATTEMPTS,
    invoice,
    redemptionCode,
    error,
    timedOut,
    startPolling,
    stopPolling,
  }
}
