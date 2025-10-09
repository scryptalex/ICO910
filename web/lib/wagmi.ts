import { http, createConfig } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { injected } from '@wagmi/connectors'

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 137)
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com'

export const wagmiConfig = createConfig({
  chains: [polygon],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [polygon.id]: http(rpcUrl)
  }
})
