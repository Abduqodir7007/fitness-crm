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

    getDailyStats: async () => {
        try {
            const response = await client.get("/dashboard/profit");
            return response.data;
        } catch (error) {
            console.error("Get daily stats error:", error);
            throw error;
        }
    },

    getPaymentHistory: async () => {
        try {
            const response = await client.get("/dashboard/payments/history");
            return response.data;
        } catch (error) {
            console.error("Get payment history error:", error);
            throw error;
        }
    },

    getMonthlyPayment: async () => {
        try {
            const response = await client.get("/dashboard/monthly/payment");
            return response.data;
        } catch (error) {
            console.error("Get monthly payment error:", error);
            throw error;
        }
    },

    getProfit: async () => {
        try {
            const response = await client.get("/dashboard/profit");
            return response.data;
        } catch (error) {
            console.error("Get profit error:", error);
            throw error;
        }
    },

    getSubscriptionPayment: async () => {
        try {
            const response = await client.get(
                "/dashboard/subscription/payment"
            );
            return response.data;
        } catch (error) {
            console.error("Get subscription payment error:", error);
            throw error;
        }
    },

    downloadStats: async () => {
        try {
            const response = await client.get("/dashboard/download/stats", {
                responseType: "blob",
            });
            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "dashboard_stats.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            return response.data;
        } catch (error) {
            console.error("Download stats error:", error);
            throw error;
        }
    },
};
