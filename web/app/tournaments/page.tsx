import JoinTournament from '@/components/JoinTournament'

export default function TournamentsPage() {
  return (
    <main className="space-y-8">
      <h1 className="text-2xl font-bold">Tournaments</h1>
      <div className="p-6 rounded bg-zinc-900">
        <h2 className="font-semibold mb-4">Join</h2>
        <JoinTournament />
      </div>
    </main>
  )
}
