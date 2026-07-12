'use client'

import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-white/10', className)} />
}

export function TokenRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

function RowSkeleton({ labelWidth, valueWidth }: { labelWidth: string; valueWidth: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className={`h-4 ${labelWidth}`} />
      </div>
      <Skeleton className={`h-4 ${valueWidth}`} />
    </div>
  )
}

export function QuoteSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-24" />
      <RowSkeleton labelWidth="w-10" valueWidth="w-36" />
      <RowSkeleton labelWidth="w-20" valueWidth="w-12" />
      <RowSkeleton labelWidth="w-20" valueWidth="w-14" />
      <RowSkeleton labelWidth="w-12" valueWidth="w-20" />
    </div>
  )
}
