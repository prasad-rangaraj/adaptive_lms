import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates },
      })),

      // Helpers
      isStudent: () => get().user?.role === 'student',
      isTeacher: () => get().user?.role === 'teacher',
      isAdmin: () => ['super_admin', 'tenant_admin'].includes(get().user?.role),
      isSuperAdmin: () => get().user?.role === 'super_admin',
    }),
    {
      name: 'lms-auth-storage', // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
