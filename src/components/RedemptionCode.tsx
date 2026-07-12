'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Copy, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/Button'
import type { RedemptionCode as RedemptionCodeType } from '@/types/swap'

interface RedemptionCodeProps {
  redemptionCode: RedemptionCodeType
  denomination: number
  onNewSwap: () => void
}

const CONFETTI_COLORS = ['#3898FF', '#4BD166', '#FF983D', '#FF7AB8', '#7A70FF', '#30E000']

const CONFETTI_PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: (i * 2) % 100,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: (i % 10) * 0.05,
  duration: 1 + (i % 3),
  rotate: ((i * 37) % 720) - 360,
}))

function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {CONFETTI_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{ left: `${p.x}%`, backgroundColor: p.color }}
          initial={{ y: -20, opacity: 1, scale: 1 }}
          animate={{ y: 400, opacity: 0, scale: 0, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

export function RedemptionCode({ redemptionCode, denomination, onNewSwap }: RedemptionCodeProps) {
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(redemptionCode.code)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = redemptionCode.code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 relative">
      {showConfetti && <Confetti />}

      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10, delay: 0.2 }}
        >
          <motion.div animate={{ rotate: [0, 10, -10, 10, 0] }} transition={{ duration: 0.5, delay: 0.5 }}>
            <Sparkles className="w-10 h-10 text-green-500" />
          </motion.div>
        </motion.div>
        <motion.h2
          className="text-2xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Success!
        </motion.h2>
        <motion.p
          className="text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your gift card is ready
        </motion.p>
      </motion.div>

      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent via-purple-500 to-pink-500 p-6 text-white shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, delay: 0.3 }}
      >
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute -right-4 -top-4 w-32 h-32 rounded-full border-4 border-white"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full border-4 border-white"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6" />
              <span className="font-bold text-lg">Bitrefill</span>
            </div>
            <span className="text-sm opacity-80">Balance Card</span>
          </div>

          <motion.div
            className="text-5xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            ${denomination}
          </motion.div>

          <div className="space-y-2">
            <span className="text-sm opacity-80">Redemption Code</span>
            <div className="flex items-center gap-2">
              <motion.code
                className="flex-1 bg-white/20 backdrop-blur rounded-lg px-4 py-3 font-mono text-lg tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {redemptionCode.code}
              </motion.code>
              <motion.button
                onClick={handleCopy}
                className={cn('p-3 rounded-lg transition-all', copied ? 'bg-green-500/30' : 'bg-white/20 hover:bg-white/30')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Copy className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {copied && (
          <motion.div
            className="text-center text-sm text-green-500 font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            Code copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button size="lg" className="w-full" onClick={onNewSwap}>
          Make Another Swap
        </Button>
      </motion.div>
    </div>
  )
}
