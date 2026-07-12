'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { cn } from '@/lib/utils'
import { SwapCard } from '@/components/SwapCard'
import { Logo } from '@/components/ui/Logo'

function AddressAvatar({ address }: { address: string }) {
  const gradient = `linear-gradient(135deg, #${address.slice(2, 8)}, #${address.slice(8, 14)})`
  return <div className="w-5 h-5 rounded-full" style={{ background: gradient }} />
}

export default function Home() {
  const { open } = useAppKit()
  const { isConnected, address } = useAppKitAccount()

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4">
      <main className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Logo size="md" />
            <h1 className="text-lg font-bold text-white">Bitrefill Swap</h1>
          </div>

          <button
            onClick={() => open({ view: isConnected ? 'Account' : 'Connect' })}
            className={cn(
              'flex items-center gap-2 h-10 px-4 rounded-xl font-bold text-sm text-white',
              'transition-transform duration-[125ms] ease hover:scale-[1.02] active:scale-[0.98]',
              isConnected ? 'bg-white/8 border border-white/10' : 'bg-accent'
            )}
          >
            {isConnected && address ? (
              <>
                <AddressAvatar address={address} />
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </>
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>

        <SwapCard />
      </main>
    </div>
  )
}
