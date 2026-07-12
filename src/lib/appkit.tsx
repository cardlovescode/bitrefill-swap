'use client'

import { createAppKit } from '@reown/appkit/react'
import { base } from '@reown/appkit/networks'
import { wagmiAdapter, projectId } from './wagmi'

const metadata = {
  name: 'Bitrefill Swap',
  description: 'Swap crypto for Bitrefill gift cards',
  url: 'https://bitrefill-swap.vercel.app',
  icons: ['https://bitrefill.com/favicon.ico']
}

export const modal = projectId
  ? createAppKit({
      adapters: [wagmiAdapter],
      projectId,
      networks: [base],
      defaultNetwork: base,
      metadata,
      features: { analytics: false, email: false, socials: false },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-font-family': 'SFRounded, ui-rounded, SF Pro Rounded, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        '--w3m-accent': '#3898FF',
        '--w3m-color-mix': '#131313',
        '--w3m-color-mix-strength': 0,
        '--w3m-font-size-master': '10px',
        '--w3m-border-radius-master': '1px',
        '--w3m-z-index': 1000,
        '--w3m-qr-color': '#3898FF',
      }
    })
  : null
