import { usersAPI } from '../api'

// Lightweight cookie helpers
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, ttlMinutes: number) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + ttlMinutes * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

export type EnsureUserOptions = {
  force?: boolean // ignore cache and always sync once
  ttlMinutes?: number // cache TTL in minutes (default 30)
}

// Ensures the authenticated Clerk user exists in Neon with simple cookie caching
// Safe to call on app boot or protected route entry; non-blocking recommended.
export async function ensureUserExists(options: EnsureUserOptions = {}) {
  const { force = false, ttlMinutes = 30 } = options
  const FLAG = 'ao_user_synced'

  try {
    if (!force && getCookie(FLAG) === '1') return
    await usersAPI.sync()
    setCookie(FLAG, '1', ttlMinutes)
  } catch (e) {
    // Non-fatal: swallow to avoid blocking UX; next page load can retry
    // Optionally, shorten TTL to retry soon
    setCookie(FLAG, '0', 5)
  }
}

export function clearEnsureUserFlag() {
  setCookie('ao_user_synced', '0', -1)
}
