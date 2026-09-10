'use client';

import { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const {
    user,
    profile,
    loading,
    isAuthenticated,
    login,
    register,
    logout: storeLogout,
    refreshProfile,
    fetchCurrentUser,
  } = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const logout = () => {
    storeLogout();
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  // If rendered inside AuthProvider, use context; otherwise direct Zustand store
  if (!context) {
    return useAuthStore();
  }
  return context;
}
