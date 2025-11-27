import { motion } from 'framer-motion'
import { BarChart3, Clock } from 'lucide-react'
import { UserProfile, ProfileForm, Experience, EducationItem } from '../types'
import { InsightMetric } from '../components/InsightMetric'

interface InsightsTabProps {
  user: UserProfile | null
  profileForm: ProfileForm
  savedItemsCount: number
  articlesCount: number
  experiences: Experience[]
  education: EducationItem[]
}

export function InsightsTab({
  user,
  profileForm,
  savedItemsCount,
  articlesCount,
  experiences,
  education,
}: InsightsTabProps) {
  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <BarChart3 className="h-5 w-5 text-primary-500" />
          Engagement overview
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Track how you use AcademOra. These metrics update as you explore more tools and save additional resources.
        </p>
        <div className="mt-6 space-y-5">
          <InsightMetric label="Resources saved" value={savedItemsCount} target={12} />
          <InsightMetric label="Articles read" value={articlesCount} target={8} accent="emerald" />
          <InsightMetric
            label="Mentorship readiness"
            value={Math.min(100, experiences.length * 20 + education.length * 15)}
            target={100}
            accent="purple"
          />
          <InsightMetric
            label="Profile completeness"
            value={Math.min(100, Math.round((Object.values(profileForm).filter(Boolean).length / 20) * 100))}
            target={100}
            accent="amber"
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Clock className="h-5 w-5 text-primary-500" />
          Activity timeline
        </h3>
        <div className="mt-6 space-y-4">
          {[...experiences, ...education]
            .slice(0, 6)
            .sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''))
            .map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {'title' in item ? item.title : item.school}
                </p>
                <p className="text-sm text-slate-500">
                  {'company' in item ? (item.company || '') : ('degree' in item ? (item.degree || '') : 'Added to your journey')}
                </p>
              </motion.div>
            ))}
          {experiences.length === 0 && education.length === 0 && (
            <p className="text-sm text-slate-500">Add your experiences and education to unlock richer insights.</p>
          )}
        </div>
      </motion.section>
    </div>
  )
}

