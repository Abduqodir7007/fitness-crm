import client from "./client";

export const pricingAPI = {
    getAll: async () => {
        try {
            const response = await client.get("/admin/subscription_plans");
            return response.data;
        } catch (error) {
            console.error("Error fetching pricing plans:", error);
            throw error;
        }
    },

    create: async (name, price, duration_days) => {
        try {
            const response = await client.post("/admin/subscription_plans", {
                name,
                price,
                duration_days,
            });
            return response.data;
        } catch (error) {
            console.error("Error creating pricing plan:", error);
            throw error;
        }
    },

    deactivate: async (planId) => {
        try {
            const response = await client.put(
                `/admin/subscription_plans/deactivate/${planId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error deactivating pricing plan:", error);
            throw error;
        }
    },

    delete: async (planId) => {
        try {
            const response = await client.delete(
                `/admin/subscription_plans/${planId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting pricing plan:", error);
            throw error;
        }
    },
};
