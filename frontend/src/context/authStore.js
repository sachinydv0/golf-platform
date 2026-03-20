import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:    null,
      token:   null,
      loading: false,

      setUser:  (user)  => set({ user }),
      setToken: (token) => set({ token }),

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.token, loading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (err) {
          set({ loading: false });
          return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
      },

      register: async (payload) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/register', payload);
          set({ user: data.user, token: data.token, loading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return { success: true };
        } catch (err) {
          set({ loading: false });
          return { success: false, message: err.response?.data?.message || 'Registration failed' };
        }
      },

      logout: () => {
        set({ user: null, token: null });
        delete api.defaults.headers.common['Authorization'];
      },

      refreshUser: async () => {
        try {
          const { data } = await api.get('/users/me');
          set({ user: data.user });
        } catch {
          get().logout();
        }
      },

      isAuthenticated: () => !!get().token,
      isAdmin:         () => get().user?.role === 'admin',
      isSubscribed:    () => get().user?.subscription?.status === 'active',
    }),
    {
      name: 'golf-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

export default useAuthStore;
