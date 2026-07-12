'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal } from './ui/Modal'
import { TokenRowSkeleton } from './ui/Skeleton'
import { useBalances } from '@/hooks/useBalances'
import type { TokenBalance } from '@/types/token'

interface TokenSelectorProps {
  selectedToken?: TokenBalance
  onSelect: (token: TokenBalance) => void
  excludeToken?: `0x${string}`
}

const ICON_COLORS = ['bg-accent', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']

function formatBalance(balance: string) {
  const n = parseFloat(balance)
  if (n === 0) return '0'
  if (n < 0.0001) return '<0.0001'
  if (n < 1) return n.toFixed(4)
  return n < 1000 ? n.toFixed(2) : n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function TokenIcon({ token, size = 'md' }: { token: { symbol: string; logoURI?: string }; size?: 'sm' | 'md' }) {
  const [error, setError] = useState(false)
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-9 h-9 text-sm'
  const colorClass = ICON_COLORS[token.symbol.charCodeAt(0) % ICON_COLORS.length]

  if (!token.logoURI || error) {
    return (
      <div className={cn(sizeClass, colorClass, 'rounded-full flex items-center justify-center text-white font-semibold shrink-0')}>
        {token.symbol.slice(0, 2)}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={token.logoURI}
      alt={token.symbol}
      className={cn(sizeClass, 'rounded-full shrink-0')}
      onError={() => setError(true)}
    />
  )
}

export function TokenSelector({ selectedToken, onSelect, excludeToken }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { balances, isLoading } = useBalances()

  const filteredBalances = balances.filter((b) => {
    if (excludeToken && b.token.address.toLowerCase() === excludeToken.toLowerCase()) return false
    if (!search) return true
    const s = search.toLowerCase()
    return b.token.symbol.toLowerCase().includes(s) || b.token.name.toLowerCase().includes(s)
  })

  const handleSelect = (token: TokenBalance) => {
    onSelect(token)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between gap-3 h-16 px-4 rounded-2xl bg-white/5 border border-white/10 transition-all duration-[125ms] ease hover:bg-white/8 active:scale-[0.99]"
      >
        {selectedToken ? (
          <div className="flex items-center gap-3">
            <TokenIcon token={selectedToken.token} />
            <div className="text-left">
              <div className="font-semibold text-white">{selectedToken.token.symbol}</div>
              <div className="text-sm text-white/50">{selectedToken.token.name}</div>
            </div>
          </div>
        ) : (
          <span className="text-white/60">Select a token</span>
        )}
        <ChevronDown className="w-5 h-5 text-white/40" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Select a token">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by name or symbol"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-card border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50"
          />
        </div>

        <div className="max-h-80 overflow-y-auto space-y-1">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <TokenRowSkeleton key={i} />)
          ) : filteredBalances.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/60">{search ? 'No tokens found' : 'No tokens with balance'}</p>
            </div>
          ) : (
            filteredBalances.map((t) => (
              <button
                key={t.token.address}
                onClick={() => handleSelect(t)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-[125ms] ease hover:bg-white/8 active:scale-[0.97]',
                  selectedToken?.token.address === t.token.address && 'bg-white/10'
                )}
              >
                <TokenIcon token={t.token} />
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-white truncate">{t.token.symbol}</div>
                  <div className="text-sm text-white/60 truncate">{t.token.name}</div>
                </div>
                <div className="font-medium text-sm text-white">{formatBalance(t.balanceFormatted)}</div>
              </button>
            ))
          )}
        </div>
      </Modal>
    </>
  )
}
