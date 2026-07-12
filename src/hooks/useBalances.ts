'use client'

import { useAccount, useBalance, useReadContracts } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import { useMemo } from 'react'
import type { TokenBalance } from '@/types/token'
import { CHAIN_ID, USDC_ADDRESS, BASE_TOKENS, NATIVE_ETH } from '@/lib/constants'

export function useBalances() {
  const { address, isConnected } = useAccount()

  const { data: ethBalance, isLoading: isEthLoading } = useBalance({ address, chainId: CHAIN_ID })

  const contracts = useMemo(() => {
    if (!address) return []
    return BASE_TOKENS.map((token) => ({
      address: token.address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
      chainId: CHAIN_ID,
    }))
  }, [address])

  const { data: tokenBalances, isLoading: isTokensLoading } = useReadContracts({
    contracts,
    query: { enabled: isConnected && !!address, refetchInterval: 30000 },
  })

  const balances = useMemo<TokenBalance[]>(() => {
    const result: TokenBalance[] = []

    if (ethBalance && ethBalance.value > 0n) {
      result.push({ token: NATIVE_ETH, balance: ethBalance.value, balanceFormatted: formatUnits(ethBalance.value, 18) })
    }

    tokenBalances?.forEach((res, i) => {
      if (res.status === 'success' && res.result) {
        const balance = res.result as bigint
        if (balance > 0n) {
          const token = BASE_TOKENS[i]
          result.push({ token, balance, balanceFormatted: formatUnits(balance, token.decimals) })
        }
      }
    })

    return result
  }, [ethBalance, tokenBalances])

  const usdcBalance = useMemo(() => balances.find((b) => b.token.address === USDC_ADDRESS), [balances])

  return { balances, usdcBalance, isLoading: isEthLoading || isTokensLoading, isConnected }
}
