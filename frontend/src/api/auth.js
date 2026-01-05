import client from "./client";

export const authAPI = {
    login: async (phone_number, password) => {
        try {
            console.log("[AUTH] Attempting login with:", { phone_number });
            const response = await client.post("/auth/login", {
                phone_number,
                password,
            });
            console.log("[AUTH] Login response:", response.data);

            if (response.data.access_token) {
                console.log("[AUTH] Token received, storing in localStorage");
                localStorage.setItem(
                    "access_token",
                    response.data.access_token
                );
                localStorage.setItem(
                    "is_superuser",
                    response.data.is_superuser
                );
                // Set user_role based on is_superuser for ProtectedRoute
                const role = response.data.is_superuser ? "admin" : "client";
                console.log("[AUTH] Setting user_role:", role);
                localStorage.setItem("user_role", role);
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
            console.error("Signup error:", error);
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
            console.error("Get current user error:", error);
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
