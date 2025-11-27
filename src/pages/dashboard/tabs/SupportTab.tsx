import { motion } from 'framer-motion'
import { LifeBuoy, Mail, BookOpen, Compass, Crown, LogOut } from 'lucide-react'
import SupportCard from '../../../components/dashboard/SupportCard'

interface SupportTabProps {
  onSignOut: () => void
}

export function SupportTab({ onSignOut }: SupportTabProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-100 bg-white p-8 shadow-md"
    >
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <LifeBuoy className="h-5 w-5 text-primary-500" />
        Need a hand?
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Reach out anytime. We're here to help make your academic journey easier.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SupportCard
          icon={Mail}
          title="Message us"
          description="Send a message and we'll reply within 24 hours."
          action={{ label: 'Contact support', href: '/contact' }}
        />
        <SupportCard
          icon={BookOpen}
          title="Docs & guides"
          description="Learn how to use AcademOra with step-by-step tutorials."
          action={{ label: 'View guides', href: '/our-company?tab=docs' }}
        />
        <SupportCard
          icon={Compass}
          title="Upgrade options"
          description="Unlock premium mentoring, analytics, and concierge onboarding."
          action={{ label: 'Explore plans', href: '/pricing' }}
        />
        <SupportCard
          icon={Crown}
          title="Feature roadmap"
          description="See what's coming next and vote on new features."
          action={{ label: 'Roadmap', href: '/blog' }}
        />
      </div>
      <button
        onClick={onSignOut}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-100"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </motion.section>
  )
}

