export default function DashboardPage() {
  return (
    <main className="space-y-8">
      <h1 className="text-2xl font-bold">Your Dashboard</h1>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 rounded bg-zinc-900">
          <h2 className="font-semibold mb-2">Portfolio</h2>
          <ul className="text-sm text-zinc-400 list-disc ml-5">
            <li>GTK balance and USD value</li>
            <li>Purchases and vesting schedule</li>
          </ul>
        </div>
        <div className="p-6 rounded bg-zinc-900">
          <h2 className="font-semibold mb-2">Gaming</h2>
          <ul className="text-sm text-zinc-400 list-disc ml-5">
            <li>Tournament history and winnings</li>
            <li>Rankings and achievements</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

