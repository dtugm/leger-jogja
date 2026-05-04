export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
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