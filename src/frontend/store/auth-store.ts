import { create } from "zustand";
import { persist } from "zustand/middleware"; 

import type { User } from "@/types/auth";

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setAuth: (user, token) => {
                document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`
                set({ user, token });
            },
            clearAuth: () => {
                document.cookie = "token=; path=/; max-age=0";
                set({ user: null, token: null });
            },
        }),
        { name: "auth-storage" } 
    )
);