/**
 * User Verification and Self-Healing System
 * 
 * Verifies user exists in both Clerk and Neon databases.
 * If user exists in Clerk but not in Neon, attempts to restore from:
 * 1. Clerk data (primary source)
 * 2. Local storage/cookies (fallback)
 * 
 * Throws user-facing errors if data is lost and cannot be restored.
 */

import { usersAPI } from '../api';

interface CachedUserData {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  clerkId?: string;
  accountType?: string;
  [key: string]: unknown;
}

const CACHE_KEY = 'academora_user_cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Debouncing: Track in-flight verification calls
let verificationInProgress = false;
let verificationPromise: Promise<{
  verified: boolean;
  healed: boolean;
  user?: unknown;
  error?: string;
  dataLost?: boolean;
}> | null = null;
let verificationTimeoutId: ReturnType<typeof setTimeout> | null = null;
let verificationStartTime: number | null = null;

/**
 * Try to get token from Clerk session object directly (Solution 2 fallback)
 * @param clerkUser - Clerk user object that may have sessions
 * @returns Valid token or null if not available
 */
async function getTokenFromSession(clerkUser?: {
  id?: string;
  emailAddresses?: Array<{ emailAddress: string }>;
  sessions?: Array<{ getToken: () => Promise<string | null> }>;
  getSessions?: () => Promise<Array<{ getToken: () => Promise<string | null> }>>;
}): Promise<string | null> {
  if (!clerkUser) return null;

  try {
    // Try to get sessions from user object
    let sessions: Array<{ getToken: () => Promise<string | null> }> | undefined;

    // Method 1: Check if sessions array exists directly
    if (clerkUser.sessions && Array.isArray(clerkUser.sessions) && clerkUser.sessions.length > 0) {
      sessions = clerkUser.sessions;
    }
    // Method 2: Try getSessions() method if available
    else if (typeof clerkUser.getSessions === 'function') {
      sessions = await clerkUser.getSessions();
    }

    // If we have sessions, try to get token from the first active session
    if (sessions && sessions.length > 0) {
      const firstSession = sessions[0];
      if (firstSession && typeof firstSession.getToken === 'function') {
        // Note: session.getToken() doesn't support skipCache option
        // This is a fallback when getToken() from useAuth() fails
        const token = await firstSession.getToken();
        if (token && typeof token === 'string' && token.trim().length > 0 && token.includes('.')) {
          console.log('[VerifyHeal] ✅ Token obtained from Clerk session object directly');
          return token;
        }
      }
    }
  } catch (error) {
    console.warn('[VerifyHeal] Failed to get token from session object:', error);
  }

  return null;
}

/**
 * Wait for Clerk session to be ready and return a valid token
 * Uses Solution 1 (polling getTokenFn) with Solution 2 (session object) as fallback
 * @param getTokenFn - Function to get token (Solution 1)
 * @param clerkUser - Clerk user object for session fallback (Solution 2)
 * @param maxWaitMs - Maximum time to wait in milliseconds (default: 3000ms)
 * @param checkIntervalMs - Interval between checks in milliseconds (default: 200ms)
 * @returns Valid token or null if session not ready within timeout
 */
async function waitForSessionReady(
  getTokenFn: () => Promise<string | null>,
  clerkUser?: {
    id?: string;
    emailAddresses?: Array<{ emailAddress: string }>;
    sessions?: Array<{ getToken: () => Promise<string | null> }>;
    getSessions?: () => Promise<Array<{ getToken: () => Promise<string | null> }>>;
  },
  maxWaitMs: number = 3000,
  checkIntervalMs: number = 200
): Promise<string | null> {
  const startTime = Date.now();
  let attempt = 0;
  const maxAttempts = Math.ceil(maxWaitMs / checkIntervalMs);

  while (Date.now() - startTime < maxWaitMs) {
    attempt++;
    try {
      // Solution 1: Try getTokenFn first
      const token = await getTokenFn();
      
      // Check if token is valid (non-empty string)
      if (token && typeof token === 'string' && token.trim().length > 0) {
        // Additional validation: token should be a JWT (contains at least one dot)
        if (token.includes('.')) {
          // CRITICAL: Validate token is not expired (with 5 second buffer)
          // If token is expired, don't return it - wait for refresh
          if (isTokenExpiredOrExpiringSoon(token, 5000)) {
            console.log(`[VerifyHeal] Token obtained but expired, waiting for refresh... (attempt ${attempt}/${maxAttempts})`);
            // Token is expired, wait a bit and try again
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
              continue;
            }
            // If we've exhausted attempts, return null
            console.warn('[VerifyHeal] ⚠️ All tokens obtained were expired');
            return null;
          }
          console.log(`[VerifyHeal] ✅ Session ready, token obtained via getToken() (attempt ${attempt}/${maxAttempts})`);
          return token;
        }
      }
      
      // Solution 2: Fallback to session object if getTokenFn didn't work
      if (clerkUser && attempt >= 2) {
        // Try session object after first attempt fails
        const sessionToken = await getTokenFromSession(clerkUser);
        if (sessionToken) {
          console.log(`[VerifyHeal] ✅ Token obtained from session object (attempt ${attempt}/${maxAttempts})`);
          return sessionToken;
        }
      }
      
      if (attempt < maxAttempts) {
        console.log(`[VerifyHeal] Session not ready yet, waiting ${checkIntervalMs}ms... (attempt ${attempt}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
      }
    } catch (error) {
      console.warn(`[VerifyHeal] Error checking session (attempt ${attempt}):`, error);
      
      // Try session object fallback on error
      if (clerkUser) {
        const sessionToken = await getTokenFromSession(clerkUser);
        if (sessionToken) {
          console.log(`[VerifyHeal] ✅ Token obtained from session object (fallback after error)`);
          return sessionToken;
        }
      }
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
      }
    }
  }

  // Final attempt: Try session object one more time before giving up
  if (clerkUser) {
    const sessionToken = await getTokenFromSession(clerkUser);
    if (sessionToken) {
      console.log('[VerifyHeal] ✅ Token obtained from session object (final fallback)');
      return sessionToken;
    }
  }

  console.warn(`[VerifyHeal] ⚠️ Session not ready after ${maxWaitMs}ms (tried both getToken() and session object)`);
  return null;
}

/**
 * Get cached user data from localStorage
 */
function getCachedUserData(): CachedUserData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsed = JSON.parse(cached);
    const { data, timestamp } = parsed;
    
    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('[VerifyHeal] Failed to read cached user data:', error);
    return null;
  }
}

/**
 * Save user data to localStorage cache
 */
function cacheUserData(userData: CachedUserData): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cache = {
      data: userData,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('[VerifyHeal] Failed to cache user data:', error);
  }
}

/**
 * Clear cached user data
 */
function clearCachedUserData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('[VerifyHeal] Failed to clear cached user data:', error);
  }
}

/**
 * Decode JWT token to check expiration (without verification)
 * Returns expiration timestamp in milliseconds, or null if invalid/expired
 */
function getTokenExpiration(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp) {
      // exp is in seconds, convert to milliseconds
      return payload.exp * 1000;
    }
    return null;
  } catch (error) {
    console.warn('[VerifyHeal] Failed to decode token expiration:', error);
    return null;
  }
}

/**
 * Check if token is expired or will expire soon (within bufferMs)
 */
function isTokenExpiredOrExpiringSoon(token: string, bufferMs: number = 5000): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true; // Invalid token, treat as expired
  
  const now = Date.now();
  const timeUntilExpiration = expiration - now;
  
  // Token is expired or will expire within bufferMs
  return timeUntilExpiration <= bufferMs;
}

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Verify user exists in Neon database
 * @param token - Initial token to use
 * @param getFreshTokenFn - Function to get fresh token for retry (optional)
 * @param retryCount - Current retry attempt (internal use)
 */
async function verifyUserInNeon(
  token: string,
  getFreshTokenFn?: () => Promise<string | null>,
  retryCount: number = 0
): Promise<{ exists: boolean; user?: unknown; error?: string }> {
  const maxRetries = 2; // Retry up to 2 times with fresh token
  
  try {
    // Check if token is expired or expiring soon before making request
    if (isTokenExpiredOrExpiringSoon(token, 10000)) {
      console.log('[VerifyHeal] Token expired or expiring soon, getting fresh token...');
      if (getFreshTokenFn) {
        const freshToken = await getFreshTokenFn();
        if (freshToken && freshToken !== token) {
          console.log('[VerifyHeal] Using fresh token for verification');
          return verifyUserInNeon(freshToken, getFreshTokenFn, retryCount);
        }
      }
    }
    
    console.log('[VerifyHeal] verifyUserInNeon - Token length:', token.length, 'at', new Date().toISOString());
    // Use fetch directly with token to ensure it's passed correctly
    // Handle both cases: VITE_API_URL with or without /api suffix
    let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    // Remove trailing /api if present, we'll add it explicitly
    apiUrl = apiUrl.replace(/\/api\/?$/, '');
    
    const requestStartTime = Date.now();
    const response = await fetchWithTimeout(
      `${apiUrl}/api/auth/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
      5000 // 5 second timeout
    );
    
    const requestDuration = Date.now() - requestStartTime;
    console.log('[VerifyHeal] /api/auth/me response after', requestDuration, 'ms, status:', response.status);
    
    if (response.ok) {
      const user = await response.json();
      if (user && user.id) {
        return { exists: true, user };
      }
    } else if (response.status === 401 || response.status === 403) {
      // Auth error - try to get fresh token and retry if we haven't exceeded max retries
      if (retryCount < maxRetries && getFreshTokenFn) {
        console.log(`[VerifyHeal] 401/403 error, retrying with fresh token (attempt ${retryCount + 1}/${maxRetries})...`);
        const freshToken = await getFreshTokenFn();
        if (freshToken && freshToken !== token) {
          // Small delay before retry to ensure token is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          return verifyUserInNeon(freshToken, getFreshTokenFn, retryCount + 1);
        }
      }
      
      // Auth error - token might be invalid or session not ready
      const errorData = await response.json().catch(() => ({ error: 'Authentication required' }));
      const errorMessage = errorData?.error || 'Authentication required';
      return { 
        exists: false, 
        error: `Authentication failed: ${errorMessage}. Token may be invalid, expired, or session not fully established.` 
      };
    } else if (response.status === 404) {
      // User doesn't exist
      return { exists: false };
    }
    
    return { exists: false };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    
    // Network errors and timeouts
    if (
      errorMessage.includes('fetch') || 
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('ERR_CONNECTION_REFUSED') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('Request timeout')
    ) {
      return { exists: false, error: 'Network error or timeout. Please check your connection and ensure the backend server is running.' };
    }
    
    // 404 means user doesn't exist
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return { exists: false };
    }
    
    // Other errors
    return { exists: false, error: errorMessage };
  }
}

/**
 * Attempt to heal user by syncing from Clerk
 * @param token - Initial token to use
 * @param getFreshTokenFn - Function to get fresh token for retry (optional)
 * @param retryCount - Current retry attempt (internal use)
 */
async function healUserFromClerk(
  token: string,
  getFreshTokenFn?: () => Promise<string | null>,
  retryCount: number = 0
): Promise<{ success: boolean; user?: unknown; error?: string }> {
  const maxRetries = 2; // Retry up to 2 times with fresh token
  
  try {
    // Check if token is expired or expiring soon before making request
    if (isTokenExpiredOrExpiringSoon(token, 10000)) {
      console.log('[VerifyHeal] Token expired or expiring soon, getting fresh token...');
      if (getFreshTokenFn) {
        const freshToken = await getFreshTokenFn();
        if (freshToken && freshToken !== token) {
          console.log('[VerifyHeal] Using fresh token for healing');
          return healUserFromClerk(freshToken, getFreshTokenFn, retryCount);
        }
      }
    }
    
    console.log('[VerifyHeal] Attempting to sync user from Clerk...');
    console.log('[VerifyHeal] Token info:', {
      length: token.length,
      startsWith: token.substring(0, 20) + '...',
      endsWith: '...' + token.substring(token.length - 20),
    });
    
    // Use fetchAPI directly with explicit token to ensure it's passed
    // Handle both cases: VITE_API_URL with or without /api suffix
    let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    // Remove trailing /api if present, we'll add it explicitly
    apiUrl = apiUrl.replace(/\/api\/?$/, '');
    
    const requestStartTime = Date.now();
    console.log('[VerifyHeal] Making POST request to /api/users/sync at', new Date().toISOString());
    
    const response = await fetchWithTimeout(
      `${apiUrl}/api/users/sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
      5000 // 5 second timeout
    );
    
    const requestDuration = Date.now() - requestStartTime;
    console.log('[VerifyHeal] Response received after', requestDuration, 'ms, status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      const errorMessage = errorData?.error || `HTTP ${response.status}`;
      
      if (response.status === 401 || response.status === 403) {
        // Try to get fresh token and retry if we haven't exceeded max retries
        if (retryCount < maxRetries && getFreshTokenFn) {
          console.log(`[VerifyHeal] 401/403 error, retrying with fresh token (attempt ${retryCount + 1}/${maxRetries})...`);
          const freshToken = await getFreshTokenFn();
          if (freshToken && freshToken !== token) {
            // Small delay before retry to ensure token is ready
            await new Promise(resolve => setTimeout(resolve, 100));
            return healUserFromClerk(freshToken, getFreshTokenFn, retryCount + 1);
          }
        }
        
        return { success: false, error: `Authentication failed: ${errorMessage}. Token may be invalid or session not fully established.` };
      }
      
      return { success: false, error: errorMessage };
    }
    
    const result = await response.json();
    
    if (result && result.user) {
      console.log('[VerifyHeal] ✅ User successfully synced from Clerk');
      // Cache the restored user data
      cacheUserData(result.user as CachedUserData);
      return { success: true, user: result.user };
    }
    
    return { success: false, error: 'Sync completed but no user data returned' };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown sync error';
    console.error('[VerifyHeal] ❌ Failed to sync from Clerk:', errorMessage);
    
    // Check if it's a network error or timeout
    if (
      errorMessage.includes('fetch') || 
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('Request timeout')
    ) {
      return { success: false, error: 'Network error or timeout. Please check your connection and ensure the backend server is running.' };
    }
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Attempt to restore user from cached data
 */
async function restoreFromCache(token: string, cachedData: CachedUserData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[VerifyHeal] Attempting to restore from cache...');
    
    // Try to sync with cached data as metadata
    const syncPayload: Record<string, unknown> = {
      firstName: cachedData.firstName,
      lastName: cachedData.lastName,
      primaryEmail: cachedData.email,
      accountType: cachedData.accountType,
    };
    
    // Remove undefined values
    Object.keys(syncPayload).forEach(key => {
      if (syncPayload[key] === undefined) {
        delete syncPayload[key];
      }
    });
    
    if (Object.keys(syncPayload).length === 0) {
      return { success: false, error: 'No valid cached data to restore' };
    }
    
    const result = await usersAPI.dualSync(syncPayload, token);
    
    if (result && result.user) {
      console.log('[VerifyHeal] ✅ User restored from cache');
      return { success: true };
    }
    
    return { success: false, error: 'Restore completed but no user data returned' };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown restore error';
    console.error('[VerifyHeal] ❌ Failed to restore from cache:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Main verification and healing function
 * 
 * @param token - Clerk authentication token (can be null/undefined, will be retrieved if needed)
 * @param clerkUser - Clerk user object (optional, for additional context)
 * @param getTokenFn - Function to get token if not provided (optional)
 * @returns Object with verification result and any errors
 */
export async function verifyAndHealUser(
  token: string | null | undefined,
  clerkUser?: {
    id?: string;
    emailAddresses?: Array<{ emailAddress: string }>;
    sessions?: Array<{ getToken: () => Promise<string | null> }>;
    getSessions?: () => Promise<Array<{ getToken: () => Promise<string | null> }>>;
  },
  getTokenFn?: () => Promise<string | null>
): Promise<{
  verified: boolean;
  healed: boolean;
  user?: unknown;
  error?: string;
  dataLost?: boolean;
}> {
  // Debouncing: If verification is already in progress, return the existing promise
  // But only if it's been less than 10 seconds (prevent infinite blocking)
  if (verificationInProgress && verificationPromise && verificationStartTime !== null) {
    // Check if promise has been stuck for too long
    const promiseAge = Date.now() - verificationStartTime;
    if (promiseAge < 10000) {
      console.log('[VerifyHeal] Verification already in progress, returning existing promise...');
      return verificationPromise;
    } else {
      console.warn('[VerifyHeal] Previous verification stuck, resetting and starting new one...');
      verificationInProgress = false;
      verificationPromise = null;
      verificationStartTime = null;
      if (verificationTimeoutId) {
        clearTimeout(verificationTimeoutId);
        verificationTimeoutId = null;
      }
    }
  }

  // Mark verification as in progress and create promise
  verificationInProgress = true;
  verificationStartTime = Date.now();
  verificationPromise = (async () => {
    try {
      console.log('[VerifyHeal] Starting user verification and healing...');
      
      // Wrap the entire verification in a timeout to prevent infinite hanging
      const verificationWork = Promise.race([
        (async () => {
          // Helper function to get a fresh token right before use (tokens expire quickly)
      // Uses skipCache to force Clerk to refresh the token if needed
      const getFreshToken = async (): Promise<string | null> => {
        if (getTokenFn) {
          try {
            // CRITICAL: Use skipCache: true to force Clerk to get a fresh token
            // This ensures Clerk will attempt to refresh using the refresh cookie if available
            // If refresh cookie is missing, Clerk will return null or expired token
            const freshToken = await getTokenFn();
            
            // getTokenFn should already be called with skipCache from the caller
            // But if it returns null/undefined, the token might be expired or refresh cookie missing
            let token = freshToken;
            
            if (token && token.trim().length > 0 && token.includes('.')) {
              // CRITICAL: Validate token is not expired before using it (with 5 second buffer)
              // If token is expired, getToken() might return it anyway if refresh cookie is missing
              // Use 5 second buffer to account for clock skew and processing time
              if (isTokenExpiredOrExpiringSoon(token, 5000)) {
                console.warn('[VerifyHeal] ⚠️ Token from getToken() is expired or expiring soon, trying session fallback...');
                // Token is expired, try session fallback
                if (clerkUser) {
                  const sessionToken = await getTokenFromSession(clerkUser);
                  if (sessionToken && !isTokenExpiredOrExpiringSoon(sessionToken, 5000)) {
                    console.log('[VerifyHeal] ✅ Got valid token from session fallback');
                    return sessionToken;
                  }
                }
                // If session fallback also fails, return null (don't use expired token)
                console.warn('[VerifyHeal] ⚠️ All token sources returned expired tokens - refresh cookie may be missing');
                return null;
              }
              return token;
            }
          } catch (error) {
            console.warn('[VerifyHeal] Failed to get token via getTokenFn:', error);
          }
        }
        
        // Fallback to session object
        if (clerkUser) {
          const sessionToken = await getTokenFromSession(clerkUser);
          if (sessionToken) {
            // Validate session token too (with 5 second buffer)
            if (isTokenExpiredOrExpiringSoon(sessionToken, 5000)) {
              console.warn('[VerifyHeal] ⚠️ Session token is also expired or expiring soon');
              return null;
            }
            return sessionToken;
          }
        }
        
        return null;
      };
      
      // Step 0: Get a fresh token right before verification (tokens expire quickly)
      console.log('[VerifyHeal] Getting fresh token for verification...');
      let validToken = await getFreshToken();
      
      // If no token yet, try using the provided token parameter as fallback
      if (!validToken && token && typeof token === 'string' && token.trim().length > 0 && token.includes('.')) {
        // Validate the provided token is not expired (with 5 second buffer)
        if (!isTokenExpiredOrExpiringSoon(token, 5000)) {
          console.log('[VerifyHeal] Using provided token parameter as fallback');
          validToken = token;
        } else {
          console.warn('[VerifyHeal] Provided token parameter is expired or expiring soon');
        }
      }
      
      // If still no token, try once more with waitForSessionReady (reduced timeout)
      if (!validToken && getTokenFn) {
        console.log('[VerifyHeal] Token not available, waiting for session to be ready...');
        validToken = await waitForSessionReady(getTokenFn, clerkUser, 1000, 200); // Reduced to 1 second
      }
      
      // FINAL CHECK: If we still don't have a valid token, skip verification gracefully
      // This prevents infinite loops when refresh cookies are missing
      if (!validToken || validToken.trim().length === 0 || !validToken.includes('.')) {
        const errorMessage = 'Authentication token not available. Verification skipped. This is normal if your session is still initializing.';
        console.log('[VerifyHeal] ℹ️', errorMessage);
        // Return success=false but dataLost=false - this is not an error, just skipped
        return {
          verified: false,
          healed: false,
          dataLost: false,
          error: errorMessage,
        };
      }
      
      // CRITICAL: Double-check token is not expired (even after getFreshToken validation)
      // Use 5 second buffer to account for clock skew and processing time
      if (isTokenExpiredOrExpiringSoon(validToken, 5000)) {
        const expiration = getTokenExpiration(validToken);
        const expirationDate = expiration ? new Date(expiration) : null;
        const now = new Date();
        const timeUntilExpiration = expiration ? expiration - now.getTime() : null;
        
        // If token is expired, skip verification gracefully instead of erroring
        const errorMessage = 'Authentication token has expired. Verification skipped. Please refresh the page if you continue to see issues.';
        console.log('[VerifyHeal] ℹ️', errorMessage);
        console.log('[VerifyHeal] Token expiration info:', {
          tokenLength: validToken.length,
          expiration: expirationDate?.toISOString() || 'unknown',
          now: now.toISOString(),
          timeUntilExpiration: timeUntilExpiration ? `${Math.round(timeUntilExpiration / 1000)}s` : 'unknown',
        });
        // Return success=false but dataLost=false - this is not an error, just skipped
        return {
          verified: false,
          healed: false,
          dataLost: false, // Not data loss, just expired session - skip verification
          error: errorMessage,
        };
      }
      
      console.log('[VerifyHeal] ✅ Fresh token obtained (length:', validToken.length, 'chars)');
  
      // Step 1: Verify user exists in Neon - get fresh token right before call
      console.log('[VerifyHeal] Getting fresh token for /api/auth/me call...');
      const tokenForVerification = await getFreshToken() || validToken;
      console.log('[VerifyHeal] Token for verification obtained at', new Date().toISOString(), 'length:', tokenForVerification.length);
      const verification = await verifyUserInNeon(tokenForVerification, getFreshToken);
  
      if (verification.exists && verification.user) {
        console.log('[VerifyHeal] ✅ User exists in Neon database');
        // Cache the verified user data
        cacheUserData(verification.user as CachedUserData);
        return {
          verified: true,
          healed: false,
          user: verification.user,
        };
      }
  
      // Step 2: User doesn't exist in Neon - attempt healing
      console.log('[VerifyHeal] ⚠️ User not found in Neon, attempting to heal...');
  
      // Try healing from Clerk first (most reliable) - get fresh token right before call
      console.log('[VerifyHeal] Getting fresh token for /api/users/sync call...');
      const tokenForHealing = await getFreshToken() || validToken;
      console.log('[VerifyHeal] Token for healing obtained at', new Date().toISOString(), 'length:', tokenForHealing.length);
      // Use token immediately - no delay, pass getFreshToken for retry logic
      const clerkHeal = await healUserFromClerk(tokenForHealing, getFreshToken);
  
      if (clerkHeal.success && clerkHeal.user) {
        return {
          verified: true,
          healed: true,
          user: clerkHeal.user,
        };
      }
  
      // Step 3: Clerk sync failed - try restoring from cache
      console.log('[VerifyHeal] ⚠️ Clerk sync failed, checking cache...');
      const cachedData = getCachedUserData();
  
      if (cachedData) {
        // Get fresh token for cache restore too
        const tokenForCache = await getFreshToken() || validToken;
        const cacheRestore = await restoreFromCache(tokenForCache, cachedData);
        
        if (cacheRestore.success) {
          return {
            verified: true,
            healed: true,
            user: cachedData,
          };
        }
      }
  
      // Step 4: All healing attempts failed - determine if it's data loss or auth issue
      const errorReason = clerkHeal.error || verification.error || 'User data not found in Clerk or cache';
      
      // Enhanced error classification: Check if the error is authentication-related (not actual data loss)
      const isAuthError = 
        errorReason.toLowerCase().includes('authentication') || 
        errorReason.toLowerCase().includes('authentication required') ||
        errorReason.includes('401') || 
        errorReason.includes('403') ||
        errorReason.toLowerCase().includes('unauthorized') ||
        errorReason.toLowerCase().includes('forbidden') ||
        errorReason.toLowerCase().includes('token') ||
        errorReason.toLowerCase().includes('session') ||
        errorReason.toLowerCase().includes('invalid token') ||
        errorReason.toLowerCase().includes('expired');
      
      if (isAuthError) {
        // This is an authentication issue, not data loss
        const authErrorMessage = `Authentication failed: ${errorReason}. Your session may still be initializing. Please wait a moment and refresh the page.`;
        console.warn('[VerifyHeal] ⚠️ Authentication issue (not data loss):', authErrorMessage);
        
        return {
          verified: false,
          healed: false,
          dataLost: false, // Not data loss, just auth issue
          error: authErrorMessage,
        };
      }
      
      // Actual data loss
      const errorMessage = `Data Loss Detected: Your account exists in Clerk but your profile data could not be restored in our database. Reason: ${errorReason}. Please contact support or try signing up again.`;
      
      console.error('[VerifyHeal] ❌ DATA LOST:', errorMessage);
      
      // Show error to user
      if (typeof window !== 'undefined') {
        // Use console.error for visibility
        console.error('%c⚠️ DATA LOST ⚠️', 'color: red; font-size: 16px; font-weight: bold;');
        console.error('%c' + errorMessage, 'color: red; font-size: 12px;');
        
        // Also show a user-friendly alert
        setTimeout(() => {
          alert(
            '⚠️ Data Loss Warning\n\n' +
            'Your account exists but your profile data could not be restored.\n\n' +
            `Reason: ${errorReason}\n\n` +
            'Please contact support or try signing up again.\n\n' +
            'Check the browser console for more details.'
          );
        }, 1000);
      }
      
      return {
        verified: false,
        healed: false,
        dataLost: true,
        error: errorMessage,
      };
        })(),
        // Timeout promise - resolves after 10 seconds (reduced from 15)
        new Promise<{
          verified: boolean;
          healed: boolean;
          error?: string;
          dataLost?: boolean;
        }>((resolve) => {
          verificationTimeoutId = setTimeout(() => {
            console.warn('[VerifyHeal] ⚠️ Verification timeout after 10 seconds, aborting...');
            resolve({
              verified: false,
              healed: false,
              dataLost: false,
              error: 'Verification timed out. Please try refreshing the page.',
            });
          }, 10000); // Reduced to 10 seconds
        }),
      ]);

      const result = await verificationWork;
      
      // Clear timeout if verification completed before timeout
      if (verificationTimeoutId) {
        clearTimeout(verificationTimeoutId);
        verificationTimeoutId = null;
      }
      
      return result;
    } catch (error: any) {
      console.error('[VerifyHeal] ❌ Unexpected error in verification:', error);
      
      // Clear timeout on error
      if (verificationTimeoutId) {
        clearTimeout(verificationTimeoutId);
        verificationTimeoutId = null;
      }
      
      return {
        verified: false,
        healed: false,
        dataLost: false,
        error: error?.message || 'Unexpected error during verification. Please try again.',
      };
    } finally {
      // Always reset debouncing flags, even on timeout or error
      verificationInProgress = false;
      verificationPromise = null;
      verificationStartTime = null;
      if (verificationTimeoutId) {
        clearTimeout(verificationTimeoutId);
        verificationTimeoutId = null;
      }
    }
  })();

  return verificationPromise;
}

/**
 * Clear cached user data (call on logout)
 */
export function clearUserCache(): void {
  clearCachedUserData();
}

/**
 * Cache current user data (call after successful operations)
 */
export function updateUserCache(userData: CachedUserData): void {
  cacheUserData(userData);
}

