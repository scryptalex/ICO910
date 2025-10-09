"use client"
import { useMemo, useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { ICO_ABI, ICO_ADDRESS, ERC20_ABI, USDT_ADDRESS } from '@/lib/contracts'
import { parseUnits, formatUnits } from 'viem'

export default function BuyWidget() {
  const { address, isConnected } = useAccount()
  const [usdt, setUsdt] = useState<string>('')
  const { data: phase } = useReadContract({ address: ICO_ADDRESS, abi: ICO_ABI, functionName: 'currentPhase' })
  const { data: cfg } = useReadContract({ address: ICO_ADDRESS, abi: ICO_ABI, functionName: 'phaseConfigs', args: [Number(phase ?? 0)] }) as { data: any }

  const price = cfg?.[0] ? BigInt(cfg[0]) : undefined // 6 decimals
  const bonus = cfg?.[3] ? Number(cfg[3]) : 0
  const minPurchase = cfg?.[1] ? BigInt(cfg[1]) : undefined
  const maxPurchase = cfg?.[2] ? BigInt(cfg[2]) : undefined

  const tokensOut = useMemo(() => {
    if (!price || !usdt) return '0'
    try {
      const usdtAmt = parseUnits(usdt, 6)
      const base = (usdtAmt * 10n ** 18n) / price
      const total = base + (base * BigInt(bonus)) / 100n
      return formatUnits(total, 18)
    } catch {
      return '0'
    }
  }, [price, bonus, usdt])

  const { writeContract, isPending } = useWriteContract()

  const onBuy = async () => {
    if (!isConnected || !price) return
    const usdtAmt = parseUnits(usdt || '0', 6)
    // optional front validation against min/max
    if (minPurchase && usdtAmt < minPurchase) return
    if (maxPurchase && usdtAmt > maxPurchase) return

    // Approve USDT then buy
    await writeContract({
      address: USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ICO_ADDRESS, usdtAmt]
    })
    // We rely on wallet UIs to wait for approval; then call buy
    await writeContract({
      address: ICO_ADDRESS,
      abi: ICO_ABI,
      functionName: 'buyTokens',
      args: [usdtAmt]
    })
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-zinc-400">Phase: {typeof phase === 'number' ? phase : Number(phase ?? 0)}</div>
      <label className="block text-sm">USDT Amount</label>
      <input
        className="w-full bg-zinc-800 rounded px-3 py-2"
        placeholder="1000"
        value={usdt}
        onChange={(e) => setUsdt(e.target.value)}
      />
      <div className="text-sm text-zinc-400">GTK Received (est): {tokensOut}</div>
      <button
        onClick={onBuy}
        disabled={!isConnected || isPending || !usdt}
        className="bg-primary px-4 py-2 rounded disabled:opacity-50"
      >
        {isPending ? 'Processing...' : 'Purchase Tokens'}
      </button>
    </div>
  )
}
