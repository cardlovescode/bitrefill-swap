'use client'

import { Info, Route, Fuel, TrendingDown, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QuoteSkeleton } from './ui/Skeleton'

interface Quote {
  outputFormatted: string
  priceImpact: number
  gasFeeUSD: string
  route: string
  rate: string
}

interface QuoteBreakdownProps {
  quote: Quote | null
  isLoading: boolean
  inputSymbol: string
}

interface RowProps {
  icon: LucideIcon
  label: string
  value: string
  color?: string
}

function Row({ icon: Icon, label, value, color }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-white/60 shrink-0">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <span className={cn('text-sm font-medium text-white text-right break-all', color)}>{value}</span>
    </div>
  )
}

function getImpactColor(impact: number) {
  if (impact > 3) return 'text-red-500'
  if (impact > 1) return 'text-yellow-500'
  return undefined
}

export function QuoteBreakdown({ quote, isLoading, inputSymbol }: QuoteBreakdownProps) {
  if (isLoading) {
    return (
      <div className="p-4 rounded-2xl bg-card border border-white/10">
        <QuoteSkeleton />
      </div>
    )
  }

  if (!quote) return null

  const impactColor = getImpactColor(quote.priceImpact)

  return (
    <div className="p-4 pb-6 rounded-2xl bg-card border border-white/10 space-y-4">
      <span className="text-sm font-semibold text-white/60 block mb-4!">Quote Details</span>

      <Row icon={Info} label="Rate" value={`1 ${inputSymbol} = ${parseFloat(quote.rate).toFixed(2)} USDC`} />
      <Row icon={TrendingDown} label="Price Impact" value={`${quote.priceImpact.toFixed(2)}%`} color={impactColor} />
      <Row icon={Fuel} label="Network Fee" value={`~$${parseFloat(quote.gasFeeUSD).toFixed(2)}`} />
      <Row icon={Route} label="Route" value={quote.route} />

      {quote.priceImpact > 1 && (
        <div className={cn(
          'p-3 rounded-xl text-sm border',
          quote.priceImpact > 3
            ? 'bg-red-500/10 text-red-500 border-red-500/20'
            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        )}>
          {quote.priceImpact > 3 ? 'High price impact!' : 'Price impact is elevated.'}
        </div>
      )}

    </div>
  )
}
