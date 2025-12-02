import client from "./client";

export const usersAPI = {
    getAll: async (page = 1, limit = 10) => {
        try {
            const response = await client.get("/users", {
                params: { page, limit },
            });
            return response.data;
        } catch (error) {
            console.error("Get users error:", error);
            throw error;
        }
    },

    getById: async (userId) => {
        try {
            const response = await client.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Get user error:", error);
            throw error;
        }
    },

    create: async (userData) => {
        try {
            const response = await client.post("/users", userData);
            return response.data;
        } catch (error) {
            console.error("Create user error:", error);
            throw error;
        }
    },

    update: async (userId, userData) => {
        try {
            const response = await client.put(`/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            console.error("Update user error:", error);
            throw error;
        }
    },

    delete: async (userId) => {
        try {
            const response = await client.delete(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Delete user error:", error);
            throw error;
        }
    },
};
