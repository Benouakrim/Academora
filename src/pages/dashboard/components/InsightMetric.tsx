import { motion } from 'framer-motion'

export function InsightMetric({
  label,
  value,
  target,
  accent = 'primary',
}: {
  label: string
  value: number
  target: number
  accent?: 'primary' | 'emerald' | 'purple' | 'amber'
}) {
  const percentage = Math.min(100, Math.round((value / target) * 100))
  const accentClass = {
    primary: 'from-primary-500 to-primary-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
  }[accent]

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full rounded-full bg-gradient-to-r ${accentClass}`}
        />
      </div>
    </div>
  )
}

