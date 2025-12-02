import client from "./client";

export const authAPI = {
    login: async (login, password) => {
        try {
            // For now, accept any login/password and create a mock token
            if (login && password) {
                const mockToken = btoa(`${login}:${password}:${Date.now()}`);
                localStorage.setItem("access_token", mockToken);
                localStorage.setItem("user_login", login);
                return { access_token: mockToken, user: login };
            }
            throw new Error("Login and password required");
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },

    signup: async (email, password, name) => {
        try {
            if (email && password && name) {
                const mockToken = btoa(`${email}:${password}:${Date.now()}`);
                localStorage.setItem("access_token", mockToken);
                localStorage.setItem("user_login", email);
                return { access_token: mockToken, user: email };
            }
            throw new Error("All fields required");
        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        }
    logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_login");
    },

    getCurrentUser: async () => {
        try {
            const userLogin = localStorage.getItem("user_login");
            return { user: userLogin || "Admin" };
        } catch (error) {
            console.error("Get current user error:", error);
            throw error;
        }
    },
};
