import { ComponentType } from 'react'
import { Link } from 'react-router-dom'

export function QuickAction({
  icon: Icon,
  title,
  description,
  to,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  to: string
}) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-1 hover:border-primary-500 hover:bg-primary-50/80"
    >
      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </Link>
  )
}

