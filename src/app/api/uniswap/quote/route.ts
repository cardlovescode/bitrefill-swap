import { NextResponse } from 'next/server'

const UNISWAP_API_URL = 'https://trade-api.gateway.uniswap.org/v1'
const API_KEY = process.env.NEXT_PUBLIC_UNISWAP_API_KEY || ''

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${UNISWAP_API_URL}/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-universal-router-version': '2.0',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Uniswap quote error:', response.status, errorText)
      return NextResponse.json({ error: `Uniswap API error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
