import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import { PRESET_OPERATOR_PERSONAS } from './operatorsData';

const STORAGE_KEY_USER = 'cycloscope_operator_session';
const STORAGE_KEY_TOKEN = 'cycloscope_operator_token';

// Safely retrieve cached session
const getCachedSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (raw && token) {
      const user = JSON.parse(raw);
      return { user, token, isAuthenticated: true };
    }
  } catch (e) {
    console.warn('[authStore] Failed to restore session from localStorage', e);
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initialSession = getCachedSession();

export const useAuthStore = create((set, get) => ({
  user: initialSession.user,
  token: initialSession.token,
  isAuthenticated: initialSession.isAuthenticated,
  isLoading: false,
  error: null,

  // Active role accessor
  getActiveRole: () => get().user?.role || 'guest',

  /**
   * Login with username and passkey
   */
  login: async ({ username, password }) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.login({ username, password });
      if (result.success && result.user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(result.user));
        localStorage.setItem(STORAGE_KEY_TOKEN, result.token || 'session-active');
        set({
          user: result.user,
          token: result.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return result.user;
      } else {
        throw new Error(result.error || 'Authentication unsuccessful');
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err.message || 'Authentication failed. Please verify credentials.',
      });
      throw err;
    }
  },

  /**
   * 1-Click Quick Login by role preset
   */
  quickLogin: async (roleName) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.login({ role: roleName });
      if (result.success && result.user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(result.user));
        localStorage.setItem(STORAGE_KEY_TOKEN, result.token || 'session-active');
        set({
          user: result.user,
          token: result.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return result.user;
      }
    } catch (err) {
      // Direct fallback
      const fallbackOp = PRESET_OPERATOR_PERSONAS.find((op) => op.role === roleName) || PRESET_OPERATOR_PERSONAS[0];
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(fallbackOp));
      localStorage.setItem(STORAGE_KEY_TOKEN, `token-${fallbackOp.role}`);
      set({
        user: fallbackOp,
        token: `token-${fallbackOp.role}`,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return fallbackOp;
    }
  },

  /**
   * Switch operational role seamlessly without logging out
   */
  switchRole: (roleName) => {
    const targetOp = PRESET_OPERATOR_PERSONAS.find((op) => op.role === roleName);
    if (targetOp) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(targetOp));
      set({ user: targetOp });
    }
  },

  /**
   * Terminate session and lock workstation
   */
  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore
    }
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
