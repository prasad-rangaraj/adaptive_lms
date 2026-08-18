import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      originalUser: null,
      originalToken: null,

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false, originalUser: null, originalToken: null }),

      impersonate: (user, token) => set((state) => ({
        originalUser: state.user,
        originalToken: state.token,
        user,
        token,
      })),

      stopImpersonating: () => set((state) => ({
        user: state.originalUser,
        token: state.originalToken,
        originalUser: null,
        originalToken: null,
      })),

      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates },
      })),

      // Helpers
      isStudent: () => get().user?.role === 'student',
      isTeacher: () => get().user?.role === 'teacher',
      isAdmin: () => ['super_admin', 'tenant_admin'].includes(get().user?.role),
      isSuperAdmin: () => get().user?.role === 'super_admin',
      isImpersonating: () => !!get().originalToken,
    }),
    {
      name: 'lms-auth-storage', // localStorage key
      partialize: (state) => ({ 
        user: state.user, token: state.token, isAuthenticated: state.isAuthenticated,
        originalUser: state.originalUser, originalToken: state.originalToken,
      }),
    }
  )
);
