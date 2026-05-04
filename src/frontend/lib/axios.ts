import axios from "axios";
import { AuthTokenService } from "@/services/auth-token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach token otomatis di setiap request
api.interceptors.request.use(async (config) => {
  // Get token from secure storage
  const token = await AuthTokenService.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      document.cookie = "token=; max-age=0; path=/";
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

export default api;
