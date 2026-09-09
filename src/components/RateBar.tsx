export function RateBar({ rate }: { rate: number }) {
  const width = Math.max(0, Math.min(100, rate * 100))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-blue-600" style={{ width: `${width}%` }} />
    </div>
  )
}
