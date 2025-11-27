import { motion } from 'framer-motion'
import { Users, GraduationCap } from 'lucide-react'
import { Experience, EducationItem } from '../types'

const inputLightClass = 'rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200'

interface ActivityTabProps {
  experiences: Experience[]
  education: EducationItem[]
  newExperience: {
    title: string
    company: string
    location: string
    start_date: string
    end_date: string
    current: boolean
    description: string
  }
  newEducation: {
    school: string
    degree: string
    field: string
    start_year: string
    end_year: string
    description: string
  }
  onAddExperience: () => void
  onRemoveExperience: (id: string) => void
  onAddEducation: () => void
  onRemoveEducation: (id: string) => void
  onUpdateNewExperience: (updates: Partial<ActivityTabProps['newExperience']>) => void
  onUpdateNewEducation: (updates: Partial<ActivityTabProps['newEducation']>) => void
}

export function ActivityTab({
  experiences,
  education,
  newExperience,
  newEducation,
  onAddExperience,
  onRemoveExperience,
  onAddEducation,
  onRemoveEducation,
  onUpdateNewExperience,
  onUpdateNewEducation,
}: ActivityTabProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Users className="h-5 w-5 text-primary-500" />
          Experience
        </h3>
        <div className="mt-4 space-y-3">
          {experiences.length === 0 && <p className="text-sm text-slate-500">No experiences added yet.</p>}
          {experiences.map((exp) => (
            <div key={exp.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {exp.title} {exp.company ? `• ${exp.company}` : ''}
                  </p>
                  <p className="text-xs text-slate-500">{exp.location}</p>
                  <p className="text-xs text-slate-500">
                    {exp.start_date} {exp.end_date ? `– ${exp.end_date}` : exp.current ? '– Present' : ''}
                  </p>
                  {exp.description && (
                    <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveExperience(exp.id)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-3 rounded-2xl bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Add experience</p>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className={inputLightClass}
              placeholder="Title"
              value={newExperience.title}
              onChange={(e) => onUpdateNewExperience({ title: e.target.value })}
            />
            <input
              className={inputLightClass}
              placeholder="Company"
              value={newExperience.company}
              onChange={(e) => onUpdateNewExperience({ company: e.target.value })}
            />
            <input
              className={inputLightClass}
              placeholder="Location"
              value={newExperience.location}
              onChange={(e) => onUpdateNewExperience({ location: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputLightClass}
                type="date"
                value={newExperience.start_date}
                onChange={(e) => onUpdateNewExperience({ start_date: e.target.value })}
              />
              <input
                className={inputLightClass}
                type="date"
                value={newExperience.end_date}
                onChange={(e) => onUpdateNewExperience({ end_date: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={newExperience.current}
                onChange={(e) => onUpdateNewExperience({ current: e.target.checked })}
              />
              Current role
            </label>
            <textarea
              className={`${inputLightClass} md:col-span-2`}
              placeholder="Description"
              value={newExperience.description}
              onChange={(e) => onUpdateNewExperience({ description: e.target.value })}
              rows={3}
            />
          </div>
          <button onClick={onAddExperience} className="btn-primary text-sm">
            Add experience
          </button>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <GraduationCap className="h-5 w-5 text-primary-500" />
          Education
        </h3>
        <div className="mt-4 space-y-3">
          {education.length === 0 && <p className="text-sm text-slate-500">No education added yet.</p>}
          {education.map((ed) => (
            <div key={ed.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{ed.school}</p>
                  <p className="text-xs text-slate-500">
                    {ed.degree} {ed.field ? `— ${ed.field}` : ''}
                  </p>
                  <p className="text-xs text-slate-500">
                    {ed.start_year} {ed.end_year ? `– ${ed.end_year}` : ''}
                  </p>
                  {ed.description && (
                    <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{ed.description}</p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveEducation(ed.id)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-3 rounded-2xl bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Add education</p>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className={inputLightClass}
              placeholder="School"
              value={newEducation.school}
              onChange={(e) => onUpdateNewEducation({ school: e.target.value })}
            />
            <input
              className={inputLightClass}
              placeholder="Degree"
              value={newEducation.degree}
              onChange={(e) => onUpdateNewEducation({ degree: e.target.value })}
            />
            <input
              className={inputLightClass}
              placeholder="Field"
              value={newEducation.field}
              onChange={(e) => onUpdateNewEducation({ field: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputLightClass}
                placeholder="Start year"
                value={newEducation.start_year}
                onChange={(e) => onUpdateNewEducation({ start_year: e.target.value })}
              />
              <input
                className={inputLightClass}
                placeholder="End year"
                value={newEducation.end_year}
                onChange={(e) => onUpdateNewEducation({ end_year: e.target.value })}
              />
            </div>
            <textarea
              className={`${inputLightClass} md:col-span-2`}
              placeholder="Description"
              value={newEducation.description}
              onChange={(e) => onUpdateNewEducation({ description: e.target.value })}
              rows={3}
            />
          </div>
          <button onClick={onAddEducation} className="btn-primary text-sm">
            Add education
          </button>
        </div>
      </motion.section>
    </div>
  )
}

