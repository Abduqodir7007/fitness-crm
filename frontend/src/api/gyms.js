import client from "./client";

export const gymsAPI = {
    getAll: async () => {
        try {
            const response = await client.get("/superadmin/gyms");
            return response.data;
        } catch (error) {
            console.error("Get gyms error:", error);
            throw error;
        }
    },

    create: async (gymData) => {
        try {
            const response = await client.post("/superadmin/create-gym", gymData);
            return response.data;
        } catch (error) {
            console.error("Create gym error:", error);
            throw error;
        }
    },

    toggleStatus: async (gymId) => {
        try {
            const response = await client.patch(`/superadmin/gym/${gymId}`);
            return response.data;
        } catch (error) {
            console.error("Toggle gym status error:", error);
            throw error;
        }
    },

    delete: async (gymId) => {
        try {
            const response = await client.delete(`/superadmin/gyms/${gymId}`);
            return response.data;
        } catch (error) {
            console.error("Delete gym error:", error);
            throw error;
        }
    },
};
