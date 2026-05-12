import { ApiDeleteData, ApiGetData, ApiPatchData, ApiPostData } from "./index";

export type UserRole =
  | "super_admin"
  | "admin"
  | "user"
  | "Admin"
  | "Superadmin"
  | "Guest";

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  fullname: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  username: string;
  fullname: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserPayload {
  email?: string;
  username?: string;
  fullname?: string;
  role?: UserRole;
  password?: string;
}

export type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
} & Record<string, string | number | boolean | undefined>;

export const UserApi = {
  getAll: (params?: GetUsersParams) =>
    ApiGetData<UserResponse[]>("/users", { params }),

  getById: (id: string) => ApiGetData<UserResponse>(`/users/${id}`),

  create: (body: CreateUserPayload) =>
    ApiPostData<UserResponse>("/users", body),

  update: (id: string, body: UpdateUserPayload) =>
    ApiPatchData<UserResponse>(`/users/${id}`, body),

  delete: (id: string) => ApiDeleteData(`/users/${id}`),
};
