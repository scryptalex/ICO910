export default function Page() {
  return (
    <main className="space-y-10">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Crypto Gaming Revolution</h1>
        <p className="text-zinc-300">Skill-based gaming with crypto rewards</p>
      </section>

      <section className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg bg-zinc-900">
          <h2 className="font-semibold mb-2">Funding Progress</h2>
          <div className="text-sm text-zinc-400">Raised: realtime from contract</div>
          <div className="text-sm text-zinc-400">Target: $15,000,000</div>
          <div className="text-sm text-zinc-400">Next price in: countdown</div>
        </div>
        <div className="p-6 rounded-lg bg-zinc-900">
          <h2 className="font-semibold mb-2">Buy GTK</h2>
          <a className="inline-block bg-primary text-white px-4 py-2 rounded" href="/buy">Join Presale</a>
        </div>
      </section>

      <section className="p-6 rounded-lg bg-zinc-900">
        <h2 className="font-semibold mb-4">Games</h2>
        <ul className="grid sm:grid-cols-3 gap-3 text-sm text-zinc-300">
          <li>Backgammon</li>
          <li>Tic-Tac-Toe</li>
          <li>Sea Battle</li>
          <li>Chess</li>
          <li>Poker</li>
        </ul>
      </section>

      <section className="p-6 rounded-lg bg-zinc-900">
        <h2 className="font-semibold mb-4">Tokenomics</h2>
        <ul className="list-disc ml-6 text-sm text-zinc-300 space-y-1">
          <li>2.1B total supply</li>
          <li>Distribution: ICO, team, rewards, etc.</li>
          <li>50% tournament revenue burn</li>
          <li>5-year deflationary schedule</li>
        </ul>
      </section>
    </main>
  )
}

