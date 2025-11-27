export function DashboardHighlight({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accent}`}>{value}</span>
    </div>
  )
}

