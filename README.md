GTK ICO Project (Spec-Based Scaffold)

Overview
- Implements the ICO and gaming-token ecosystem described in `docs/complete-ico-specification.md`.
- Includes upgradeable ERC-20 token (GTK), ICO presale contract, and Tournament manager with 50% revenue burn.
- Frontend scaffold with Next.js 14 (TS) and Tailwind, plus Hardhat setup for contracts.

Monorepo Structure
- `contracts/` – Solidity contracts + Hardhat config and deploy script
- `web/` – Next.js 14 TypeScript frontend scaffold
- `docs/` – Project specifications and diagrams

Prerequisites
- Node.js 18+
- pnpm or yarn or npm
- For contracts: Hardhat + plugins (@openzeppelin, upgrades); install via package.json

Setup (Contracts)
1) `cd contracts`
2) Install deps (requires network):
   - pnpm: `pnpm install`
   - yarn: `yarn`
   - npm: `npm install`
3) Compile: `npx hardhat compile`
4) Run tests: `npx hardhat test`
5) Deploy (example): `npx hardhat run scripts/deploy.ts --network polygon`

Setup (Frontend)
1) `cd web`
2) Install deps: `pnpm install` (or yarn/npm)
3) Copy `.env.example` to `.env.local` and fill in values
4) Dev server: `pnpm dev`

Environment Variables
- See `web/.env.example` for frontend
- See `contracts/hardhat.config.ts` for network config placeholders

Notes
- Network installs are not executed in this environment; only scaffolding is provided.
- Solidity code aligns with the spec but fixes practical burn mechanics (burning from the holder contract’s balance using ERC20Burnable).

