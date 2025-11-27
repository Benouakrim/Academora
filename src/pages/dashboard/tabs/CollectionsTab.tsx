import { motion } from 'framer-motion'
import { FolderClosed, GraduationCap, X } from 'lucide-react'
import { SavedItem } from '../types'
import { savedMatchesAPI } from '../../../lib/api'

interface CollectionsTabProps {
  savedItems: SavedItem[]
  savedUniversities: { id: string; university_id: string; note?: string; created_at: string }[]
  onUnsaveItem: (itemType: string, itemId: string) => void
  onRefreshUniversities: () => void
}

export function CollectionsTab({
  savedItems,
  savedUniversities,
  onUnsaveItem,
  onRefreshUniversities,
}: CollectionsTabProps) {
  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FolderClosed className="h-5 w-5 text-primary-500" />
          Saved items
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Everything you bookmark across AcademOra appears here. Organize your favorites and return whenever you need.
        </p>
        <div className="mt-6 space-y-3">
          {savedItems.length === 0 && <p className="text-sm text-slate-500">No saved items yet. Start exploring!</p>}
          {savedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary-600">
                  <span className="rounded-full bg-primary-100 px-2 py-0.5">
                    {item.item_type}
                  </span>
                  <span className="text-slate-400 font-mono">{item.item_id.slice(0, 10)}</span>
                </div>
                {(() => { const data = item.item_data as { title?: string; excerpt?: string } | undefined; return data?.title })() && (
                  <p className="mt-2 text-sm font-medium text-slate-900">{(item.item_data as { title?: string }).title}</p>
                )}
                {(() => { const data = item.item_data as { title?: string; excerpt?: string } | undefined; return data?.excerpt })() && (
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{(item.item_data as { excerpt?: string }).excerpt}</p>
                )}
              </div>
              <button
                onClick={() => onUnsaveItem(item.item_type, item.item_id)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
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
          Saved universities
        </h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {savedUniversities.length === 0 && <p>No universities saved yet.</p>}
          {savedUniversities.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="truncate font-medium text-slate-800">{entry.university_id}</span>
              <button
                onClick={async () => {
                  await savedMatchesAPI.unsave(entry.university_id)
                  onRefreshUniversities()
                }}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}

