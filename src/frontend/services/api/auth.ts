import api from "@/lib/axios";
import type { SignInFormData, SignUpFormData } from "@/lib/validations/auth";
import type { User } from "@/types/auth";

export const authService = {
  signIn: (data: SignInFormData) =>
    api.post<{ user: User; token: string }>("/auth/sign-in", data),

  signUp: (data: SignUpFormData) =>
    api.post("/auth/sign-up", data),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
};