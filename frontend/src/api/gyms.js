import client from "./client";

export const gymsAPI = {
    getAll: async () => {
        try {
            const response = await client.get("/admin/gyms");
            return response.data;
        } catch (error) {
            console.error("Get gyms error:", error);
            throw error;
        }
    },

    create: async (gymData) => {
        try {
            const response = await client.post("/admin/gyms", gymData);
            return response.data;
        } catch (error) {
            console.error("Create gym error:", error);
            throw error;
        }
    },

    delete: async (gymId) => {
        try {
            const response = await client.delete(`/admin/gyms/${gymId}`);
            return response.data;
        } catch (error) {
            console.error("Delete gym error:", error);
            throw error;
        }
    },
};
