/**
 * ThemeContext
 *
 * Architecture layer for multi-theme & mode system.
 * Only concerns: color & font family tokens. No spacing, layout, animation changes allowed.
 *
 * Model:
 *  theme: 'default' | 'verdant'
 *  mode: 'dark' | 'light'
 * Classes applied to <body>:
 *    theme-<theme> mode-<mode>
 * Example: <body class="theme-default mode-dark"> (current baseline)
 *
 * CSS variable overrides will be provided in scoped stylesheets using:
 *    body.theme-default.mode-light { ... }
 *    body.theme-verdant.mode-dark { ... }
 *    body.theme-verdant.mode-light { ... }
 *
 * Persistence:
 *  - LocalStorage key: 'ao_theme_pref' -> { theme, mode }
 *  - Cookie (optional fallback): 'theme_pref' -> theme|mode (simple pipe or JSON)
 *    (Added later in task Integrate persistence logic.)
 *
 * FOUC Prevention:
 *  - A tiny inline script (later) will read persisted preference BEFORE React mounts and set body classes.
 *
 * This initial scaffold focuses ONLY on runtime state & body class management.
 */
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

export type ThemeName = 'default' | 'verdant'
export type ThemeMode = 'dark' | 'light'

export interface ThemeState {
  theme: ThemeName
  mode: ThemeMode
  setTheme: (theme: ThemeName) => void
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeState | undefined>(undefined)

// Initial baseline: existing implementation is effectively default dark.
const DEFAULT_THEME: ThemeName = 'default'
const DEFAULT_MODE: ThemeMode = 'dark'
const LS_KEY = 'ao_theme_pref'

function applyBodyClasses(theme: ThemeName, mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const body = document.body
  // Remove previous theme/mode classes
  body.classList.forEach(cls => {
    if (cls.startsWith('theme-') || cls.startsWith('mode-')) {
      body.classList.remove(cls)
    }
  })
  body.classList.add(`theme-${theme}`)
  body.classList.add(`mode-${mode}`)
}

function readPersisted(): { theme: ThemeName; mode: ThemeMode } {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { theme: DEFAULT_THEME, mode: DEFAULT_MODE }
    const parsed = JSON.parse(raw)
    if (parsed && (parsed.theme === 'default' || parsed.theme === 'verdant') && (parsed.mode === 'dark' || parsed.mode === 'light')) {
      return parsed
    }
  } catch (_) {
    // ignore parse errors, fall back
  }
  return { theme: DEFAULT_THEME, mode: DEFAULT_MODE }
}

function persist(theme: ThemeName, mode: ThemeMode) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ theme, mode }))
  } catch (_) {
    // Will add cookie fallback in a later task.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME)
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE)

  // Hydrate from storage once (architecture step; improves later to pre-body script)
  useEffect(() => {
    const { theme: t, mode: m } = readPersisted()
    setThemeState(t)
    setModeState(m)
    applyBodyClasses(t, m)
  }, [])

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(prev => {
      if (prev === next) return prev
      applyBodyClasses(next, mode)
      persist(next, mode)
      return next
    })
  }, [mode])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(prev => {
      if (prev === next) return prev
      applyBodyClasses(theme, next)
      persist(theme, next)
      return next
    })
  }, [theme])

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }, [mode, setMode])

  const value: ThemeState = {
    theme,
    mode,
    setTheme,
    setMode,
    toggleMode
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

// Helper hook for quick class derivation (future extension for dynamic gradients)
export function useThemeClasses() {
  const { theme, mode } = useTheme()
  return {
    bodyThemeClass: `theme-${theme}`,
    bodyModeClass: `mode-${mode}`
  }
}

// TODO (Task 7): Add cookie fallback + pre-render hydration script.
// TODO (Task 9): Implement ThemeModeToggle component using useTheme().
// TODO (Task 12): AdminThemesPage uses setTheme() to change active theme.
// TODO (Task 3/4/5): Populate CSS variable overrides for each theme/mode.
