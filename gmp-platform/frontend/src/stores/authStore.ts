import { create } from 'zustand';
import { AUTH_USER_CHANGE_EVENT, clearAuthStorage } from '@/utils/sessionPolicy';
import { clearSessionQueryCache } from '@/utils/queryClient';

export interface User {
  id: string | number; // Fresh Snowflake IDs are strings; retain legacy cached numeric IDs.
  username: string;
  displayName: string;
  email: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasPermission: (code: string) => boolean;
}

function readAuthSnapshot() {
  const token = typeof localStorage === 'undefined' ? null : localStorage.getItem('token');
  let user: User | null = null;
  try { user = token ? JSON.parse(localStorage.getItem('user') || 'null') : null; }
  catch { /* A damaged display cache must not keep another user's identity. */ }
  return { token, user, isAuthenticated: Boolean(token) };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...readAuthSnapshot(),
  login: (token, user) => {
    clearSessionQueryCache();
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
    window.dispatchEvent(new Event(AUTH_USER_CHANGE_EVENT));
  },
  logout: () => {
    clearAuthStorage();
    set({ token: null, user: null, isAuthenticated: false });
  },
  hasPermission: (code) => {
    const { user } = get();
    return user?.permissions?.includes(code) || false;
  },
}));

// The shell and personal-settings page already announce same-tab user refreshes.
// Keep dashboard identity and its user-scoped query keys on that same snapshot.
const refreshAuthSnapshot = () => useAuthStore.setState(readAuthSnapshot());
if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_USER_CHANGE_EVENT, refreshAuthSnapshot);
  if (import.meta.hot) {
    import.meta.hot.dispose(() => window.removeEventListener(AUTH_USER_CHANGE_EVENT, refreshAuthSnapshot));
  }
}
