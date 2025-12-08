import client from "./client";

export const dashboardAPI = {
    getUserStats: async () => {
        try {
            const response = await client.get("/dashboard/user-stats");
            return response.data;
        } catch (error) {
            console.error("Get user stats error:", error);
            throw error;
        }
    },

    getSubscriptionStats: async () => {
        try {
            const response = await client.get("/dashboard/subscription/stats");
            return response.data;
        } catch (error) {
            console.error("Get subscription stats error:", error);
            throw error;
        }
    },
};
