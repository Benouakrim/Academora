import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Palette, MoonStar, Sun, Save } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeSettingsPage() {
  // Attempt to use ThemeContext hook
  const themeApi = useTheme()

  const [theme, setTheme] = useState<string>('default')
  const [mode, setMode] = useState<'dark' | 'light'>('dark')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // hydrate from document/body classes or localStorage
    setTheme(themeApi.theme)
    setMode(themeApi.mode)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Persist selection for all users (simple localStorage for now; backend could be wired later)
      localStorage.setItem('ao_admin_theme', theme)
      localStorage.setItem('ao_admin_mode', mode)
      // Apply via ThemeContext API if present
  themeApi.setTheme(theme as any)
  themeApi.setMode(mode)
      // Ensure body classes updated in case
      document.body.classList.forEach(c => {
        if (c.startsWith('theme-') || c.startsWith('mode-')) document.body.classList.remove(c)
      })
      document.body.classList.add(`theme-${theme}`)
      document.body.classList.add(`mode-${mode}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Palette className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Theme Settings</h1>
          <p className="text-sm text-gray-600">Choose the global site theme. Layout/spacing remain unchanged.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              className={`p-4 rounded-lg border text-left transition-colors ${theme === 'default' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setTheme('default')}
            >
              <div className="font-semibold text-gray-900">Default</div>
              <div className="text-sm text-gray-600">Current brand blues and purples</div>
            </button>
            <button
              className={`p-4 rounded-lg border text-left transition-colors ${theme === 'verdant' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setTheme('verdant')}
            >
              <div className="font-semibold text-gray-900">Verdant</div>
              <div className="text-sm text-gray-600">Green-forward palette (light/dark)</div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
          <div className="flex items-center gap-3">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${mode === 'dark' ? 'border-gray-800 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setMode('dark')}
            >
              <MoonStar className="w-4 h-4" /> Dark
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${mode === 'light' ? 'border-amber-400 bg-white text-gray-900' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setMode('light')}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
          </div>
        </div>

        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={!saving ? { scale: 1.02 } : {}}
          whileTap={!saving ? { scale: 0.98 } : {}}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </motion.button>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Note: This page sets the global site theme. Users can still toggle dark/light mode; the theme selection stays under admin control.
      </div>
    </div>
  )
}
