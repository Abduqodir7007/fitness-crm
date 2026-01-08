import client from "./client";

export const authAPI = {
    login: async (phone_number, password) => {
        try {
            const response = await client.post("/auth/login", {
                phone_number,
                password,
            });

            if (response.data.access_token) {
                localStorage.setItem(
                    "access_token",
                    response.data.access_token
                );
                localStorage.setItem(
                    "is_superuser",
                    response.data.is_superuser
                );
                // Store role from backend response
                localStorage.setItem("user_role", response.data.role);
                localStorage.setItem("token_type", response.data.token_type);
                if (response.data.refresh_token) {
                    localStorage.setItem(
                        "refresh_token",
                        response.data.refresh_token
                    );
                }
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    signup: async (
        first_name,
        last_name,
        phone_number,
        password,
        date_of_birth,
        gender,
        role = "client"
    ) => {
        try {
            const response = await client.post("/auth/register", {
                first_name,
                last_name,
                phone_number,
                password,
                date_of_birth,
                gender,
                role,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("token_type");
    },

    getCurrentUser: async () => {
        try {
            const response = await client.get("/auth/me");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    refreshToken: async (refresh_token) => {
        try {
            const response = await client.post("/auth/refresh", {
                token: refresh_token,
            });

            if (response.data.access_token) {
                localStorage.setItem(
                    "access_token",
                    response.data.access_token
                );
            }

            return response.data;
        } catch (error) {
            console.error("Refresh token error:", error);
            throw error;
        }
    },
};
