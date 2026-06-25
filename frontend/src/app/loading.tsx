export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <img
          src="https://i.postimg.cc/L5JYWbGf/file-0000000056407209b18554695378658b.png"
          alt="OracleX"
          className="h-12 w-auto rounded-lg object-contain"
        />
        <span className="text-sm text-zinc-600">Loading OracleX…</span>
      </div>
    </div>
  )
}
