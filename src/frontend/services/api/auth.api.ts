import type { ILoginPayload, IRegisterPayload, User } from "@/types/auth";

import { ApiPostData } from "./index";

const mainPath = "/auth";
export const AuthApi = {
  login: async (body: ILoginPayload) => {
    return ApiPostData<{ token: string; user: User }>(
      `${mainPath}/login`,
      body,
    );
  },

  register: async (body: IRegisterPayload) => {
    return ApiPostData<User>(`${mainPath}/register`, body);
  },

  refresh: async () => {
    return ApiPostData<null>(`${mainPath}/refresh`);
  },

  forgotPassword: async (email: string) => {
    return ApiPostData<null>(`${mainPath}/forgot-password`, { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return ApiPostData<null>(`${mainPath}/reset-password`, { token, newPassword });
  },
};
