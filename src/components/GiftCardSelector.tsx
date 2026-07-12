'use client'

import { cn } from '@/lib/utils'
import { GIFT_CARD_DENOMINATIONS } from '@/lib/constants'
import { Logo } from './ui/Logo'

interface GiftCardSelectorProps {
  selectedValue: number | null
  onSelect: (value: number) => void
}

export function GiftCardSelector({ selectedValue, onSelect }: GiftCardSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {GIFT_CARD_DENOMINATIONS.map((d) => (
          <button
            key={d.value}
            onClick={() => onSelect(d.value)}
            className={cn(
              'w-full h-12 rounded-xl font-semibold text-sm text-white border border-white/10',
              'transition-transform duration-[125ms] ease hover:scale-[1.02] active:scale-[0.98]',
              selectedValue === d.value
                ? 'bg-white/15 border-accent/50'
                : 'bg-white/5'
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {selectedValue && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-white/10">
          <div className="flex items-center gap-3">
            <Logo size="xl" className="shadow-lg" />
            <div>
              <div className="font-bold text-white">Bitrefill Balance</div>
              <div className="text-sm text-white/60">Gift Card</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-white">${selectedValue}</div>
        </div>
      )}
    </div>
  )
}
