import { useState, useEffect } from "react";
import { usersAPI } from "../api/users";

export default function DailySubscriptionModal({ isOpen, onClose, onSubmit }) {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [searchUser, setSearchUser] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const data = await usersAPI.getAll();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Foydalanuvchilarni yuklashda xato");
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const filteredUsers = users
        .filter((user) => user.role === "client") // Only show clients
        .filter((user) => {
            const query = searchUser.toLowerCase();
            return (
                user.first_name?.toLowerCase().includes(query) ||
                user.last_name?.toLowerCase().includes(query) ||
                user.phone_number?.toLowerCase().includes(query)
            );
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!selectedUser || !amount || !paymentMethod) {
            setError("Barcha maydonlarni to'ldiring");
            return;
        }

        if (isNaN(amount) || parseFloat(amount) <= 0) {
            setError("To'g'ri summa kiriting");
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit({
                userId: selectedUser,
                amount: parseFloat(amount),
                paymentMethod: paymentMethod,
            });
            // Reset form
            setSelectedUser("");
            setAmount("");
            setPaymentMethod("cash");
            setSearchUser("");
            setError(null);
            onClose();
        } catch (err) {
            const errorMessage =
                err.response?.data?.detail ||
                err.message ||
                "Kunlik abonement yaratishda xato";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedUserData = users.find((u) => u.id === selectedUser);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Kunlik abonement sotish
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Kunlik abonement ma'lumotlarini to'ldiring
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Selection with Search */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Mijoz <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Mijoz qidirish..."
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                                onFocus={() => setShowUserDropdown(true)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />

                            {showUserDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                    {isLoadingUsers ? (
                                        <div className="p-4 text-center text-gray-600">
                                            Yuklanmoqda...
                                        </div>
                                    ) : filteredUsers.length === 0 ? (
                                        <div className="p-4 text-center text-gray-600">
                                            Mijoz topilmadi
                                        </div>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedUser(user.id);
                                                    setSearchUser("");
                                                    setShowUserDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 transition"
                                            >
                                                <div className="font-medium text-gray-900">
                                                    {user.first_name}{" "}
                                                    {user.last_name}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {user.phone_number}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedUserData && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-600">
                                    Tanlangan mijoz:
                                </p>
                                <p className="font-medium text-gray-900">
                                    {selectedUserData.first_name}{" "}
                                    {selectedUserData.last_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {selectedUserData.phone_number}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Summa (so'm) <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Masalan: 50000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                            step="1000"
                            min="0"
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            To'lov usuli <span className="text-red-600">*</span>
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="cash">Naqd</option>
                            <option value="card">Karta</option>
                        </select>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-semibold transition disabled:opacity-50"
                            style={{
                                backgroundColor: isSubmitting
                                    ? "#ccc"
                                    : "#10b981",
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting)
                                    e.target.style.backgroundColor = "#059669";
                            }}
                            onMouseLeave={(e) => {
                                if (!isSubmitting)
                                    e.target.style.backgroundColor = "#10b981";
                            }}
                        >
                            {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
