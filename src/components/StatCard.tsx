import { Card, CardContent } from './ui/card'

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="space-y-1">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
