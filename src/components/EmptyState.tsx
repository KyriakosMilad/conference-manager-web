import type { ReactNode } from 'react'

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <p className="text-slate-600">{title}</p>
      {action}
    </div>
  )
}
