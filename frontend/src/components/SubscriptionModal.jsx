import { useState, useEffect } from "react";
import { usersAPI } from "../api/users";
import { pricingAPI } from "../api/pricing";

export default function SubscriptionModal({ isOpen, onClose, onSubmit }) {
    const [users, setUsers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedPlan, setSelectedPlan] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [searchUser, setSearchUser] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            fetchPlans();
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

    const fetchPlans = async () => {
        setIsLoadingPlans(true);
        try {
            const data = await pricingAPI.getAll();
            setPlans(data);
        } catch (err) {
            console.error("Error fetching plans:", err);
            setError("Tariflarni yuklashda xato");
        } finally {
            setIsLoadingPlans(false);
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
        if (!selectedUser || !selectedPlan) {
            setError("Iltimos, mijoz va tarifni tanlang");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                userId: selectedUser,
                planId: selectedPlan,
                paymentMethod,
            });
            // Reset form
            setSelectedUser("");
            setSelectedPlan("");
            setPaymentMethod("cash");
            setSearchUser("");
            setError(null);
            onClose();
        } catch (err) {
            // Handle backend error message
            const errorMessage =
                err.response?.data?.detail ||
                err.message ||
                "Obuna yaratishda xato";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedUserData = users.find((u) => u.id === selectedUser);
    const selectedPlanData = plans.find((p) => p.id === selectedPlan);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Abonement sotish
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Mijoz tanlang va abonement sotib oling
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
                    {/* User Dropdown */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Mijoz <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                            <div
                                onClick={() =>
                                    setShowUserDropdown(!showUserDropdown)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer flex items-center justify-between bg-white"
                            >
                                <span>
                                    {selectedUserData
                                        ? `${selectedUserData.first_name} ${selectedUserData.last_name}`
                                        : "Mijozni tanlang"}
                                </span>
                                <span>▼</span>
                            </div>
                            {showUserDropdown && (
                                <div className="absolute z-10 w-full mt-1 border border-gray-300 bg-white rounded-lg shadow-lg">
                                    <input
                                        type="text"
                                        placeholder="Qidirish..."
                                        value={searchUser}
                                        onChange={(e) =>
                                            setSearchUser(e.target.value)
                                        }
                                        className="w-full px-4 py-2 border-b border-gray-200 outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                    <div className="max-h-60 overflow-y-auto">
                                        {isLoadingUsers ? (
                                            <div className="px-4 py-2 text-gray-600">
                                                Yuklanmoqda...
                                            </div>
                                        ) : filteredUsers.length === 0 ? (
                                            <div className="px-4 py-2 text-gray-600">
                                                Mijoz topilmadi
                                            </div>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => {
                                                        setSelectedUser(
                                                            user.id
                                                        );
                                                        setShowUserDropdown(
                                                            false
                                                        );
                                                        setSearchUser("");
                                                    }}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                                                >
                                                    <div className="font-medium text-gray-900">
                                                        {user.first_name}{" "}
                                                        {user.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {user.phone_number}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            To'lov turi <span className="text-red-600">*</span>
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cash"
                                    checked={paymentMethod === "cash"}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                    className="w-4 h-4"
                                />
                                <span className="ml-3 text-sm text-gray-700">
                                    🟢 Naqd pul
                                </span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={paymentMethod === "card"}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                    className="w-4 h-4"
                                />
                                <span className="ml-3 text-sm text-gray-700">
                                    🔵 Bank kartasi
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Plan Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Tarif <span className="text-red-600">*</span>
                        </label>
                        <div className="space-y-2">
                            {isLoadingPlans ? (
                                <div className="text-gray-600">
                                    Tariflar yuklanmoqda...
                                </div>
                            ) : plans.length === 0 ? (
                                <div className="text-gray-600">
                                    Tarif topilmadi
                                </div>
                            ) : (
                                plans.map((plan) => (
                                    <label
                                        key={plan.id}
                                        className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                                    >
                                        <input
                                            type="radio"
                                            name="plan"
                                            value={plan.id}
                                            checked={selectedPlan === plan.id}
                                            onChange={(e) =>
                                                setSelectedPlan(e.target.value)
                                            }
                                            className="w-4 h-4 mt-1"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="font-medium text-gray-900">
                                                {plan.name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {plan.price?.toLocaleString(
                                                    "uz-UZ"
                                                )}{" "}
                                                so'm
                                            </div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-semibold transition"
                            style={{ backgroundColor: "#f0453f" }}
                            onMouseEnter={(e) =>
                                !isSubmitting &&
                                (e.target.style.backgroundColor = "#d63a34")
                            }
                            onMouseLeave={(e) =>
                                !isSubmitting &&
                                (e.target.style.backgroundColor = "#f0453f")
                            }
                        >
                            {isSubmitting ? "Saqlanmoqda..." : "Sotish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
