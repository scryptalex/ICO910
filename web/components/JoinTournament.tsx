"use client"
import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { TOURNAMENT_ABI, TOURNAMENT_ADDRESS, GTK_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts'
import { parseUnits, formatUnits } from 'viem'

export default function JoinTournament() {
  const { isConnected, address } = useAccount()
  const [id, setId] = useState<string>('1')
  const [tx, setTx] = useState<`0x${string}` | undefined>()
  const { data: t } = useReadContract({ address: TOURNAMENT_ADDRESS, abi: TOURNAMENT_ABI, functionName: 'tournaments', args: [BigInt(Number(id || 1))] }) as { data: any }
  const entryFee = t?.entryFee ? BigInt(t.entryFee) : undefined
  const name = t?.name || ''
  const active = t?.isActive

  const { writeContract, isPending } = useWriteContract()
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({ hash: tx })

  const onJoin = async () => {
    if (!isConnected || !entryFee) return
    await writeContract({ address: GTK_TOKEN_ADDRESS, abi: ERC20_ABI, functionName: 'approve', args: [TOURNAMENT_ADDRESS, entryFee] })
    const hash = await writeContract({ address: TOURNAMENT_ADDRESS, abi: TOURNAMENT_ABI, functionName: 'joinTournament', args: [BigInt(Number(id))] })
    setTx(hash as `0x${string}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm">Tournament ID</label>
        <input className="bg-zinc-800 rounded px-2 py-1 w-24" value={id} onChange={(e) => setId(e.target.value)} />
      </div>
      <div className="text-sm text-zinc-400">Name: {name || '-'}</div>
      <div className="text-sm text-zinc-400">Entry Fee: {entryFee ? formatUnits(entryFee, 18) : '-' } GTK</div>
      <div className="text-sm text-zinc-400">Active: {String(active)}</div>
      <button disabled={!isConnected || isPending || mining || !entryFee} onClick={onJoin} className="bg-primary px-4 py-2 rounded disabled:opacity-50">
        {isPending || mining ? 'Joining...' : 'Join Tournament'}
      </button>
      {isSuccess && <div className="text-green-400 text-sm">Joined! Tx: {tx?.slice(0,10)}...</div>}
    </div>
  )
}

