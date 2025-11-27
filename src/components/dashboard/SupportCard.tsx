import { ComponentType } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface SupportCardProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  action: { label: string; href: string }
}

export function SupportCard({ icon: Icon, title, description, action }: SupportCardProps) {
  return (
    <motion.div whileHover={{ y: -3 }} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
          <Icon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <Link to={action.href} className="mt-4 inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700">
        {action.label} →
      </Link>
    </motion.div>
  )
}

export default SupportCard
