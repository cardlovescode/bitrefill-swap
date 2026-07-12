import { INVOICE_POLL_INTERVAL, INVOICE_POLL_MAX_ATTEMPTS } from '@/lib/constants'
import { delay } from '@/lib/utils'
import type { Invoice, InvoiceStatus, RedemptionCode } from '@/types/swap'

interface CreateInvoiceRequest {
  value: number
  refundAddress: `0x${string}`
}

interface CreateInvoiceResponse {
  id: string
  status: InvoiceStatus
  payment: { address: string; price: number | string; currency: string }
  orders: Array<{ id: string }>
}

interface OrderResponse {
  id: string
  status: string
  redemptionInfo?: { code: string; pin?: string; instructions?: string }
}

export async function createInvoice({ value, refundAddress }: CreateInvoiceRequest): Promise<Invoice> {
  const response = await fetch('/api/bitrefill/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value, refundAddress }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create invoice')
  }

  const json = await response.json()
  // API returns { meta, data } structure - extract the data field
  const data: CreateInvoiceResponse = json.data || json

  return {
    id: data.id,
    status: data.status,
    payment: {
      address: data.payment.address as `0x${string}`,
      price: String(data.payment.price),
      currency: data.payment.currency
    },
    orders: data.orders,
  }
}

export async function getInvoice(invoiceId: string): Promise<Invoice> {
  const response = await fetch(`/api/bitrefill/invoices/${invoiceId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get invoice')
  }

  const json = await response.json()
  // API returns { meta, data } structure - extract the data field
  const data: CreateInvoiceResponse = json.data || json

  return {
    id: data.id,
    status: data.status,
    payment: {
      address: data.payment.address as `0x${string}`,
      price: String(data.payment.price),
      currency: data.payment.currency
    },
    orders: data.orders,
  }
}

export async function getOrder(orderId: string): Promise<OrderResponse> {
  const response = await fetch(`/api/bitrefill/orders/${orderId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get order')
  }

  const json = await response.json()
  // API returns { meta, data } structure - extract the data field
  const data = json.data || json
  // Transform snake_case to camelCase for redemption_info
  return {
    id: data.id,
    status: data.status,
    redemptionInfo: data.redemption_info ? {
      code: data.redemption_info.code,
      pin: data.redemption_info.pin,
      instructions: data.redemption_info.instructions,
    } : undefined,
  }
}

export async function pollInvoiceUntilComplete(
  invoiceId: string,
  onStatusChange?: (status: InvoiceStatus, attempt: number) => void
): Promise<{ invoice: Invoice; redemptionCode?: RedemptionCode; timedOut: boolean }> {
  let attempts = 0

  while (attempts < INVOICE_POLL_MAX_ATTEMPTS) {
    attempts++
    const invoice = await getInvoice(invoiceId)
    onStatusChange?.(invoice.status, attempts)

    if (invoice.status === 'complete' || invoice.status === 'all_delivered') {
      const orderId = invoice.orders[0]?.id
      if (orderId) {
        const order = await getOrder(orderId)
        if (order.redemptionInfo?.code) {
          return {
            invoice,
            redemptionCode: { code: order.redemptionInfo.code, productName: 'Bitrefill Balance', value: 0, currency: 'USD' },
            timedOut: false,
          }
        }
      }
      return { invoice, timedOut: false }
    }

    if (invoice.status === 'failed' || invoice.status === 'expired') {
      throw new Error(`Invoice ${invoice.status}`)
    }

    await delay(INVOICE_POLL_INTERVAL)
  }

  return { invoice: await getInvoice(invoiceId), timedOut: true }
}

export const calculateTotalCost = (denomination: number) => ({ subtotal: denomination, fee: 0, total: denomination })

export type { CreateInvoiceRequest, CreateInvoiceResponse, OrderResponse }
