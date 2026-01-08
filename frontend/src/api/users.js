import client from "./client";

export const usersAPI = {
    getAll: async (page = 1, limit = 10, search = "") => {
        try {
            const params = { page, limit };
            if (search) params.q = search;
            const response = await client.get("/users", { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getById: async (userId) => {
        try {
            const response = await client.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    create: async (userData) => {
        try {
            const response = await client.post("/users", userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    update: async (userId, userData) => {
        try {
            const response = await client.put(`/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (userId) => {
        try {
            const response = await client.delete(`/users/delete/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await client.get("/users/me");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    markAttendance: async () => {
        try {
            const response = await client.post("/users/attendance");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getTodayAttendance: async () => {
        try {
            const response = await client.get("/users/attendance/list/");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getTrainers: async () => {
        try {
            const response = await client.get("/users/trainers");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getTrainerById: async (trainerId) => {
        try {
            const response = await client.get(`/users/trainer/${trainerId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getTrainerClients: async (trainerId) => {
        try {
            const response = await client.get(
                `/users/trainers/${trainerId}/clients/`
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updatePassword: async (userId, password) => {
        try {
            const data = {
                user_id: userId,
                password,
                confirm_password: password,
            };
            const response = await client.patch("/users/update/password", data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateUserInfo: async (userId, firstName, lastName, phoneNumber) => {
        try {
            const data = {
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
            };
            const response = await client.patch("/users/update/info", data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
