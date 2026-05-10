import {UserRole} from "@/services/api/user.api";

export interface User {
  id: string;
  fullname: string;
  username: string;
  email: string;
  role: UserRole;
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