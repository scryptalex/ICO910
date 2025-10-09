import BuyWidget from '@/components/BuyWidget'

export default function BuyPage() {
  return (
    <main className="space-y-8">
      <h1 className="text-2xl font-bold">Purchase GTK</h1>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 rounded bg-zinc-900">
          <h2 className="font-semibold mb-4">Wallet</h2>
          <p className="text-sm text-zinc-400">Connect your wallet and ensure Polygon network.</p>
        </div>
        <div className="p-6 rounded bg-zinc-900">
          <h2 className="font-semibold mb-4">Buy</h2>
          <BuyWidget />
        </div>
      </div>
    </main>
  )
}
