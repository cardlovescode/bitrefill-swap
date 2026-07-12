import { NextResponse } from 'next/server'

const BITREFILL_API_URL = 'https://api-bitrefill.com/v2'
const API_KEY = process.env.BITREFILL_API_KEY || ''

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const response = await fetch(`${BITREFILL_API_URL}/invoices/${id}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Bitrefill API error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
