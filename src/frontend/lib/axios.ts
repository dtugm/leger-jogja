import axios from "axios";

import { useAuthStore } from "@/store/auth-store";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
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
    }
);

export default api;