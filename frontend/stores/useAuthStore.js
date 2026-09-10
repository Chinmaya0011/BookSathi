import { create } from 'zustand';
import { authService } from '@/services/auth.service';

const getInitialUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('bs_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const hasInitialToken = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('bs_token');
};

const initialUser = getInitialUser();
const initialHasToken = hasInitialToken();

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  profile: null,
  loading: initialHasToken && !initialUser,
  isAuthenticated: !!initialUser || initialHasToken,

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('bs_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('bs_user');
      }
    }
    set({ user, isAuthenticated: !!user, loading: false });
  },
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  fetchCurrentUser: async () => {
    try {
      if (authService.isAuthenticated()) {
        const res = await authService.getMe();
        if (res.data) {
          if (typeof window !== 'undefined' && res.data.user) {
            localStorage.setItem('bs_user', JSON.stringify(res.data.user));
          }
          set({
            user: res.data.user,
            profile: res.data.profile,
            isAuthenticated: true,
            loading: false,
          });
          return res.data;
        }
      }
      set({ user: null, profile: null, isAuthenticated: false, loading: false });
    } catch (err) {
      if (err.response?.status === 401) {
        authService.logout();
        set({ user: null, profile: null, isAuthenticated: false, loading: false });
      } else {
        // Keep cached user if only a network glitch
        set({ loading: false });
      }
    }
  },

  login: async (email, password) => {
    const res = await authService.login(email, password);
    const loggedUser = res.data?.user || null;
    const loggedProfile = res.data?.profile || null;
    if (typeof window !== 'undefined' && loggedUser) {
      localStorage.setItem('bs_user', JSON.stringify(loggedUser));
    }
    set({
      user: loggedUser,
      profile: loggedProfile,
      isAuthenticated: true,
      loading: false,
    });
    return res.data;
  },

  register: async (data) => {
    const res = await authService.register(data);
    const registeredUser = res.data?.user || null;
    const registeredProfile = res.data?.profile || null;
    if (typeof window !== 'undefined' && registeredUser) {
      localStorage.setItem('bs_user', JSON.stringify(registeredUser));
    }
    set({
      user: registeredUser,
      profile: registeredProfile,
      isAuthenticated: true,
      loading: false,
    });
    return res.data;
  },

  logout: () => {
    authService.logout();
    set({ user: null, profile: null, isAuthenticated: false, loading: false });
  },

  refreshProfile: async () => {
    try {
      const res = await authService.getMe();
      if (res.data) {
        if (typeof window !== 'undefined' && res.data.user) {
          localStorage.setItem('bs_user', JSON.stringify(res.data.user));
        }
        set({
          user: res.data.user,
          profile: res.data.profile,
          isAuthenticated: true,
        });
      }
    } catch (e) {}
  },
}));
