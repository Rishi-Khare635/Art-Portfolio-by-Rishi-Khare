const STORAGE_KEY_CUSTOM_HASH = 'rk_art_pass_hash_v3';
const STORAGE_KEY_FAILED_ATTEMPTS = 'rk_art_auth_failed_v3';
const STORAGE_KEY_LOCKOUT_UNTIL = 'rk_art_auth_lockout_v3';
const SESSION_KEY_OWNER = 'rk_art_active_session_v3';

// SHA-256 hash of the exact master password with leading space
// Plaintext password is NEVER stored or displayed in code or bundle!
const DEFAULT_HASH = '6a134d2aa755c327536694ba438ac66f728acb229ab444f1077cbfbe51d265a3';

/**
 * Compute SHA-256 hex string using Web Crypto API
 */
export async function computeSha256(str: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if the user is currently locked out due to too many failed attempts
 */
export function getLockoutRemainingSeconds(): number {
  try {
    const lockoutUntil = localStorage.getItem(STORAGE_KEY_LOCKOUT_UNTIL);
    if (!lockoutUntil) return 0;
    const remaining = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}

/**
 * Record a failed attempt and enforce a 5-minute lockout after 5 consecutive failures
 */
function recordFailedAttempt(): number {
  try {
    const current = parseInt(localStorage.getItem(STORAGE_KEY_FAILED_ATTEMPTS) || '0', 10) + 1;
    localStorage.setItem(STORAGE_KEY_FAILED_ATTEMPTS, current.toString());
    if (current >= 5) {
      // Lock out for 5 minutes
      localStorage.setItem(STORAGE_KEY_LOCKOUT_UNTIL, (Date.now() + 5 * 60 * 1000).toString());
    }
    return current;
  } catch {
    return 1;
  }
}

function resetFailedAttempts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_FAILED_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEY_LOCKOUT_UNTIL);
  } catch {}
}

/**
 * Verify entered password against current hash (exact match, case-sensitive, preserves spaces)
 */
export async function verifyArtistPassword(password: string): Promise<{ success: boolean; error?: string }> {
  const lockoutSeconds = getLockoutRemainingSeconds();
  if (lockoutSeconds > 0) {
    return {
      success: false,
      error: `Too many failed attempts. Try again in ${Math.ceil(lockoutSeconds / 60)} minutes.`
    };
  }

  if (!password) {
    return { success: false, error: 'Please enter a password.' };
  }

  // Exact password verification without trimming to preserve leading space and exact characters
  const enteredHash = await computeSha256(password);
  const targetHash = localStorage.getItem(STORAGE_KEY_CUSTOM_HASH) || DEFAULT_HASH;

  if (enteredHash === targetHash) {
    resetFailedAttempts();
    try {
      sessionStorage.setItem(SESSION_KEY_OWNER, 'active');
    } catch {}
    return { success: true };
  } else {
    const count = recordFailedAttempt();
    const remainingAttempts = Math.max(0, 5 - count);
    if (remainingAttempts === 0) {
      return {
        success: false,
        error: 'Too many failed attempts. System locked for 5 minutes.'
      };
    }
    return {
      success: false,
      error: `Incorrect password. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
    };
  }
}

/**
 * Change the artist password
 */
export async function updateArtistPassword(
  currentPass: string, 
  newPass: string
): Promise<{ success: boolean; error?: string }> {
  const verify = await verifyArtistPassword(currentPass);
  if (!verify.success) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  if (!newPass || newPass.length < 4) {
    return { success: false, error: 'New password must be at least 4 characters long.' };
  }

  const newHash = await computeSha256(newPass);
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_HASH, newHash);
  } catch (e: any) {
    return { success: false, error: 'Failed to save new password in browser storage.' };
  }

  return { success: true };
}

/**
 * Check if active owner session exists in this browser tab
 */
export function hasActiveOwnerSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY_OWNER) === 'active';
  } catch {
    return false;
  }
}

/**
 * Clear the active owner session
 */
export function endOwnerSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY_OWNER);
  } catch {}
}
