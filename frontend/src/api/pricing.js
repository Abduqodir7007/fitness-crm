import client from "./client";

export const pricingAPI = {
    getAll: async () => {
        try {
            const response = await client.get("/admin/subscription-plans");
            return response.data;
        } catch (error) {
            console.error("Error fetching pricing plans:", error);
            throw error;
        }
    },

    create: async (name, price, duration_days) => {
        try {
            const response = await client.post("/admin/subscription-plans", {
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
                `/admin/subscription-plans/deactivate/${planId}`
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
                `/admin/subscription-plans/${planId}`
            );
            return response.data;
        } catch (error) {
            console.error("Error deleting pricing plan:", error);
            throw error;
        }
    },

    update: async (planId, name, price, duration_days) => {
        try {
            const response = await client.put(
                `/admin/subscription-plans/update/${planId}`,
                {
                    name,
                    price,
                    duration_days,
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error updating pricing plan:", error);
            throw error;
        }
    },

    partialUpdate: async (planId, data) => {
        try {
            const response = await client.patch(
                `/admin/subscription-plans/update/${planId}`,
                data
            );
            return response.data;
        } catch (error) {
            console.error("Error patching pricing plan:", error);
            throw error;
        }
    },
};
