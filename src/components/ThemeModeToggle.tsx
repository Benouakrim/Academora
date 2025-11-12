import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

interface Props {
  className?: string
}

export default function ThemeModeToggle({ className = '' }: Props) {
  const { mode, toggleMode } = useTheme()
  const isDark = mode === 'dark'

  return (
    <motion.button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      onClick={toggleMode}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
        isDark 
          ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' 
          : 'bg-yellow-100 border border-yellow-300 hover:bg-yellow-200'
      } ${className}`}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDark ? 0 : 180,
          scale: isDark ? 1 : 1.1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-yellow-400" />
        ) : (
          <Moon className="h-5 w-5 text-slate-700" />
        )}
      </motion.div>
    </motion.button>
  )
}
