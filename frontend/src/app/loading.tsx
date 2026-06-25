export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300">
          OracleX
        </div>
        <span className="text-sm text-zinc-600">Loading…</span>
      </div>
    </div>
  )
}
