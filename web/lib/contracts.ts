export const GTK_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_GTK_TOKEN_ADDRESS as `0x${string}`
export const ICO_ADDRESS = process.env.NEXT_PUBLIC_ICO_CONTRACT_ADDRESS as `0x${string}`
export const TOURNAMENT_ADDRESS = process.env.NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS as `0x${string}`
export const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS as `0x${string}`

export const ERC20_ABI = [
  { inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], name: 'approve', outputs: [{ type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], name: 'allowance', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'decimals', outputs: [{ type: 'uint8' }], stateMutability: 'view', type: 'function' }
]

export const ICO_ABI = [
  { inputs: [], name: 'currentPhase', outputs: [{ type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: '', type: 'uint8' }], name: 'phaseConfigs', outputs: [
    { name: 'tokenPrice', type: 'uint256' },
    { name: 'minPurchase', type: 'uint256' },
    { name: 'maxPurchase', type: 'uint256' },
    { name: 'bonusPercent', type: 'uint256' },
    { name: 'allocation', type: 'uint256' },
    { name: 'sold', type: 'uint256' },
    { name: 'active', type: 'bool' }
  ], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'usdtAmount', type: 'uint256' }], name: 'buyTokens', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'claimTokens', outputs: [], stateMutability: 'nonpayable', type: 'function' },
]

export const TOURNAMENT_ABI = [
  { inputs: [{ name: '', type: 'uint256' }], name: 'tournaments', outputs: [
    { name: 'id', type: 'uint256' },
    { name: 'name', type: 'string' },
    { name: 'entryFee', type: 'uint256' },
    { name: 'prizePool', type: 'uint256' },
    { name: 'maxParticipants', type: 'uint256' },
    { name: 'currentParticipants', type: 'uint256' },
    { name: 'startTime', type: 'uint256' },
    { name: 'endTime', type: 'uint256' },
    { name: 'isActive', type: 'bool' },
    { name: 'isCompleted', type: 'bool' }
  ], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: '_tournamentId', type: 'uint256' }], name: 'joinTournament', outputs: [], stateMutability: 'nonpayable', type: 'function' }
]
