export interface AvailableMenu {
  name: string;
  icon: object | null;
  href: string;
  index: number;
  children: AvailableMenu[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullname: string;
  role: "super_admin" | "admin" | "user";
  createdAt: string;
  updatedAt: string;
  availableMenus: AvailableMenu[];
}

export interface ILoginPayload {
  usernameOrEmail: string;
  password: string;
}
export interface IRegisterPayload {
  email: string;
  username: string;
  fullname: string;
  password: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  newPassword: string;
}