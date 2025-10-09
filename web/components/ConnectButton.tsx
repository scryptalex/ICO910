"use client"
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from '@wagmi/connectors'

export default function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <button className="text-sm bg-zinc-800 px-3 py-1.5 rounded" onClick={() => disconnect()}>
        {address?.slice(0, 6)}...{address?.slice(-4)} Disconnect
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        className="text-sm bg-primary px-3 py-1.5 rounded"
        onClick={() => connect({ connector: injected() })}
      >
        Connect Wallet
      </button>
    </div>
  )
}
