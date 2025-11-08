import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut } from 'lucide-react'

type LogoutConfirmDialogProps = {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

export default function LogoutConfirmDialog({ open, onCancel, onConfirm }: LogoutConfirmDialogProps) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md px-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
        >
          <motion.div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950/90 p-8 shadow-2xl text-white relative overflow-hidden"
            variants={dialogVariants}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />
            <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-white/10 mb-6">
              <LogOut className="h-6 w-6 text-rose-300" />
            </div>
            <h2 className="relative text-2xl font-semibold tracking-tight mb-3">Ready to sign out?</h2>
            <p className="relative text-sm text-slate-300 leading-relaxed mb-8">
              You&apos;ll be logged out from AcademOra and any unsaved changes will be lost. You can sign back in at any time to continue exploring.
            </p>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:border-white/20"
              >
                Stay Signed In
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:from-rose-600 hover:to-rose-700"
              >
                Log Out Anyway
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}


