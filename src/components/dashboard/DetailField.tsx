import React from 'react'

export function DetailField({ label, value }: { label: string; value?: string | null }) {
  const display = typeof value === 'string' ? value.trim() : value
  if (!display) return null
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{display}</p>
    </div>
  )
}

export default DetailField
