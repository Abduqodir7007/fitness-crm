import client from "./client";

export const subscriptionAPI = {
    create: async (user_id, plan_id, payment_method) => {
        try {
            const response = await client.post("/admin/subscriptions/assign", {
                user_id,
                plan_id,
                payment_method,
            });
            return response.data;
        } catch (error) {
            console.error("Error creating subscription:", error);
            throw error;
        }
    },
    createDaily: async (user_id, amount, payment_method) => {
        try {
            const response = await client.post(
                "/admin/subscriptions/assign/daily",
                {
                    user_id,
                    amount,
                    payment_method,
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error creating daily subscription:", error);
            throw error;
        }
    },
};
