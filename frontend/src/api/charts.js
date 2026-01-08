import client from "./client";

export const chartAPI = {
    getSubscriptionPieChart: async () => {
        try {
            const response = await client.get("/admin/subscription/pie-chart");
            return response.data;
        } catch (error) {
            console.error("Error fetching pie chart data:", error);
            throw error;
        }
    },
};
