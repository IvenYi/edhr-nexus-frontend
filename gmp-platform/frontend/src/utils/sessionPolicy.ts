import { clearSessionQueryCache, getSessionGeneration } from './queryClient';

export const AUTH_USER_CHANGE_EVENT = 'edhr:auth-user-change';
export const AUTH_SESSION_ID_KEY = 'authSessionId';

function sharedSession() {
  return {
    token: typeof localStorage === 'undefined' ? null : localStorage.getItem('token'),
    id: typeof localStorage === 'undefined' ? null : localStorage.getItem(AUTH_SESSION_ID_KEY),
  };
}

let acceptedSession = sharedSession();
let sessionChanged = false;
const sessionListeners = new Set<() => void>();

export const hasSessionChanged = () => sessionChanged;
export const getPageAuthToken = () => acceptedSession.token;
export function subscribeSessionChange(listener: () => void) {
  sessionListeners.add(listener);
  return () => { sessionListeners.delete(listener); };
}

function notifySessionChange() {
  sessionListeners.forEach((listener) => listener());
  window.dispatchEvent(new Event(AUTH_USER_CHANGE_EVENT));
}

export function isCurrentAuthSession() {
  if (sessionChanged) return false;
  const current = sharedSession();
  if (current.token === acceptedSession.token && current.id === acceptedSession.id) return true;
  sessionChanged = true;
  clearSessionQueryCache();
  notifySessionChange();
  return false;
}

// This identifies a login occurrence, not an authorization credential. JWTs can repeat within a second.
export function acceptNewAuthSession() {
  const id = Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16)).join('-');
  localStorage.setItem(AUTH_SESSION_ID_KEY, id);
  acceptedSession = sharedSession();
  sessionChanged = false;
  notifySessionChange();
}

export function returnToLogin() {
  window.location.href = '/login';
}

if (typeof window !== 'undefined') {
  const checkSession = () => { isCurrentAuthSession(); };
  const handleStorage = (event: StorageEvent) => {
    if (event.storageArea && event.storageArea !== localStorage) return;
    if (event.key === null || ['token', 'user', AUTH_SESSION_ID_KEY].includes(event.key)) {
      if (isCurrentAuthSession() && event.key === 'user') notifySessionChange();
    }
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener('focus', checkSession);
  window.addEventListener('pageshow', checkSession);
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', checkSession);
      window.removeEventListener('pageshow', checkSession);
    });
  }
}

export const SESSION_STORAGE_KEYS = {
  sessionStartedAt: 'sessionStartedAt',
  lastActivityAt: 'lastActivityAt',
  idleLogoutMinutes: 'idleLogoutMinutes',
  tokenValidityMinutes: 'tokenValidityMinutes',
  forcePasswordChange: 'forcePasswordChange',
  forceSignatureVerification: 'forceSignatureVerification',
} as const;

export const DEFAULT_IDLE_LOGOUT_MINUTES = 30;
export const DEFAULT_TOKEN_VALIDITY_MINUTES = 480;

export function readStoredPositiveNumber(key: string, fallback: number): number {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) && value >= 1 ? value : fallback;
}

export function removeSessionPolicyStorage() {
  Object.values(SESSION_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function clearAuthStorage(expectedGeneration = getSessionGeneration()) {
  if (expectedGeneration !== getSessionGeneration() || !isCurrentAuthSession()) return false;
  clearSessionQueryCache();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem(AUTH_SESSION_ID_KEY);
  removeSessionPolicyStorage();
  acceptedSession = sharedSession();
  notifySessionChange();
  return true;
}
