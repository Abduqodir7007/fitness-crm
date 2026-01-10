import client from "./client";

export const notificationsAPI = {
    getNotifications: async () => {
        try {
            const response = await client.get("/dashboard/notifications");
            return response.data;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            throw error;
        }
    },
};
