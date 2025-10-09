export default function BuyPage() {
  return (
    <main className="space-y-8">
      <h1 className="text-2xl font-bold">Purchase GTK</h1>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 rounded bg-zinc-900">
          <h2 className="font-semibold mb-2">Wallet</h2>
          <ul className="text-sm text-zinc-400 list-disc ml-5">
            <li>Connect MetaMask / WalletConnect</li>
            <li>Ensure Polygon network</li>
            <li>Show USDT/MATIC balance</li>
          </ul>
        </div>
        <div className="p-6 rounded bg-zinc-900">
          <h2 className="font-semibold mb-2">Purchase</h2>
          <ul className="text-sm text-zinc-400 list-disc ml-5">
            <li>Phase display and price</li>
            <li>USDT amount input with validation</li>
            <li>GTK calculation with bonus</li>
            <li>Gas estimate and transaction status</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

