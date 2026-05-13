import type { AvailableMenu, ILoginPayload, IRegisterPayload, User } from "@/types/auth";

import { ApiPostData } from "./index";

const mainPath = "/auth";
export const AuthApi = {
  login: async (body: ILoginPayload) => {
    return ApiPostData<{ accessToken: string; refreshToken: string; expiresIn: string; tokenType: string; user: User; availableMenus: AvailableMenu[] }>(
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
