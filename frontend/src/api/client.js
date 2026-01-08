import axios from "axios";
import { authAPI } from "./auth";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const client = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor to include auth token if available
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for error handling and token refresh
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refresh_token");
                if (refreshToken) {
                    // Call refresh endpoint to get new access token
                    const newTokens = await authAPI.refreshToken(refreshToken);

                    if (newTokens.access_token) {
                        localStorage.setItem(
                            "access_token",
                            newTokens.access_token
                        );

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
                        return client(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                // Refresh failed, clear auth and redirect to login
                authAPI.logout();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        // If still 401 after refresh attempt or no refresh token, clear and redirect
        if (error.response?.status === 401) {
            authAPI.logout();
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default client;
