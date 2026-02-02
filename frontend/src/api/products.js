import client from "./client";

export const productsAPI = {
    // Get marketplace status
    getStatus: async () => {
        try {
            const response = await client.get("/market/status");
            return response.data;
        } catch (error) {
            console.error("Error fetching marketplace status:", error);
            throw error;
        }
    },

    // Get all products
    getAll: async () => {
        try {
            const response = await client.get("/market/products");
            return response.data;
        } catch (error) {
            console.error("Error fetching products:", error);
            throw error;
        }
    },

    // Create product with optional image
    create: async (productData, imageFile = null) => {
        try {
            const formData = new FormData();
            formData.append("name", productData.name);
            formData.append("selling_price", productData.selling_price);
            formData.append("purchase_price", productData.purchase_price);
            formData.append("total_amount", productData.total_amount);
            if (productData.supplier_name) {
                formData.append("supplier_name", productData.supplier_name);
            }
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await client.post("/market/products", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    },

    // Update product
    update: async (productId, productData, imageFile = null) => {
        try {
            const formData = new FormData();
            if (productData.name !== undefined) {
                formData.append("name", productData.name);
            }
            if (productData.selling_price !== undefined) {
                formData.append("selling_price", productData.selling_price);
            }
            if (productData.purchase_price !== undefined) {
                formData.append("purchase_price", productData.purchase_price);
            }
            if (productData.total_amount !== undefined) {
                formData.append("total_amount", productData.total_amount);
            }
            if (productData.current_amount !== undefined) {
                formData.append("current_amount", productData.current_amount);
            }
            if (productData.supplier_name !== undefined) {
                formData.append("supplier_name", productData.supplier_name);
            }
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await client.put(`/market/products/${productId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    },

    // Delete product
    delete: async (productId) => {
        try {
            const response = await client.delete(`/market/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    },

    // Sell product
    sell: async (productId, quantity, paymentMethod) => {
        try {
            const response = await client.post("/market/products/sell", {
                product_id: productId,
                quantity: quantity,
                payment_method: paymentMethod,
            });
            return response.data;
        } catch (error) {
            console.error("Error selling product:", error);
            throw error;
        }
    },

    // Restock product
    restock: async (productId, amount) => {
        try {
            const response = await client.post(`/market/products/${productId}/restock?amount=${amount}`);
            return response.data;
        } catch (error) {
            console.error("Error restocking product:", error);
            throw error;
        }
    },

    // Get sales history
    getSales: async () => {
        try {
            const response = await client.get("/market/sales");
            return response.data;
        } catch (error) {
            console.error("Error fetching sales:", error);
            throw error;
        }
    },
};
