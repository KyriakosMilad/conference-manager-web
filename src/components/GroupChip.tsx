export function GroupChip({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-800 ring-1 ring-slate-200">
      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  )
}
