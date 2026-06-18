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

export function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  removeSessionPolicyStorage();
}
