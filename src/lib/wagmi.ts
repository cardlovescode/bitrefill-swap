import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base } from '@reown/appkit/networks'

export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || ''

if (!projectId && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_REOWN_PROJECT_ID is not set')
}

export const networks = [base]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
  transports: { [base.id]: http() }
})

export const config = wagmiAdapter.wagmiConfig
