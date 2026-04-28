import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AuthTokenService } from "@/services/auth-token";
import type { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: async (user, token) => {
        // 1. Save to encrypted localStorage (for ApiClient)
        await AuthTokenService.setToken(token);

        // 2. Save to cookie (for SSR support)
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

        // 3. Update state
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        // 1. Remove from localStorage
        AuthTokenService.removeToken();

        // 2. Remove from cookie
        document.cookie = "token=; path=/; max-age=0";

        // 3. Reset state
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);