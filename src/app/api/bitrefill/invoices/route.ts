import { NextResponse } from 'next/server'

const BITREFILL_API_URL = 'https://api-bitrefill.com/v2'
const BITREFILL_PRODUCT_ID = 'test-gift-card-code'
const BITREFILL_PAYMENT_METHOD = 'usdc_base'
const API_KEY = process.env.BITREFILL_API_KEY || ''

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { value, refundAddress } = body

    if (!value || !refundAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const response = await fetch(`${BITREFILL_API_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        products: [{ product_id: BITREFILL_PRODUCT_ID, value }],
        payment_method: BITREFILL_PAYMENT_METHOD,
        refund_address: refundAddress,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Bitrefill API error:', response.status, errorText)
      return NextResponse.json({ error: `Bitrefill API error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
