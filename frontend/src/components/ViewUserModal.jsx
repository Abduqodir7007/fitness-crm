import { useEffect, useState } from "react";
import { usersAPI } from "../api/users";
import { capitalize } from "../utils/capitalize";
import ChangePasswordModal from "./ChangePasswordModal";
import EditUserModal from "./EditUserModal";

export default function ViewUserModal({ isOpen, onClose, user, onDelete }) {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Mock subscription data - replace with API data later
    const mockSubscription = {
        plan_name: "Premium (1 oy)",
        start_date: "10.10.2025",
        end_date: "12.11.2025",
        days_remaining: "5 kun qoldi",
        status: "Faol",
    };

    // Mock subscription history - replace with API data later
    const mockSubscriptionHistory = [
        {
            id: 1,
            plan_name: "Premium 1 oy",
            start_date: "10.10.2025",
            end_date: "10.11.2025",
            price: "300,000 so'm",
        },
        {
            id: 2,
            plan_name: "Standart 3 oy",
            start_date: "10.07.2025",
            end_date: "10.10.2025",
            price: "700,000 so'm",
        },
    ];

    // Mock payment history
    const mockPaymentHistory = [
        {
            id: 1,
            date: "10.10.2025",
            price: "300,000 so'm",
            method: "Naqd",
            status: "-",
        },
        {
            id: 2,
            date: "10.07.2025",
            price: "700,000 so'm",
            method: "Karta",
            status: "-50,000 so'm",
        },
    ];

    useEffect(() => {
        if (isOpen && user) {
            fetchUserDetails();
        }
    }, [isOpen, user]);

    const fetchUserDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const details = await usersAPI.getById(user.id);
            setUserDetails(details);
        } catch (err) {
            console.error("Error fetching user details:", err);
            setError("Foydalanuvchi ma'lumotlarini yuklashda xato");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    };

    const handleDelete = async () => {
        if (
            window.confirm(
                "Haqiqatan ham bu foydalanuvchini o'chirishni xohlaysizmi?"
            )
        ) {
            if (onDelete) {
                await onDelete(user.id);
                onClose();
            }
        }
    };

    if (!isOpen || !user) return null;

    const displayUser = userDetails || user;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 my-8">
                {/* Header with back button and actions */}
                <div className="border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 bg-white rounded-t-lg">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Orqaga
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            Tahrirlash
                        </button>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition hidden"
                        >
                            {/* Duplicate button for layout - actual one above is used */}
                        </button>
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                />
                            </svg>
                            Parolni o'zgartiirish
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition"
                            style={{ backgroundColor: "#f0453f" }}
                            onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#d63a34")
                            }
                            onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#f0453f")
                            }
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                            O'chirish
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">
                            Ma'lumotlar yuklanmoqda...
                        </p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* User Profile Section */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex gap-6 items-start">
                                {/* Avatar */}
                                <div
                                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                                    style={{ backgroundColor: "#e8eaed" }}
                                >
                                    <span className="text-gray-600">
                                        {getInitials(
                                            displayUser.first_name,
                                            displayUser.last_name
                                        )}
                                    </span>
                                </div>

                                {/* User Info */}
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {capitalize(displayUser.first_name)}{" "}
                                        {capitalize(displayUser.last_name)}
                                    </h2>
                                    <div className="space-y-2 mt-3 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                />
                                            </svg>
                                            {displayUser.phone_number}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            {displayUser.date_of_birth}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            Tashkent, Uzbekistan
                                        </div>
                                    </div>

                                    {/* Gender and Status */}
                                    <div className="flex gap-2 mt-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                                            {displayUser.gender === "male"
                                                ? "Erkak"
                                                : "Ayol"}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded text-sm font-medium text-white ${
                                                displayUser.is_active
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                            }`}
                                        >
                                            {displayUser.is_active
                                                ? "Faol"
                                                : "Nofa'ol"}
                                        </span>
                                    </div>
                                </div>

                                {/* QR Code */}
                                <div className="flex flex-col items-center gap-3 flex-shrink-0">
                                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                                        <svg
                                            className="w-24 h-24"
                                            viewBox="0 0 100 100"
                                            fill="black"
                                        >
                                            <rect
                                                x="10"
                                                y="10"
                                                width="15"
                                                height="15"
                                            />
                                            <rect
                                                x="75"
                                                y="10"
                                                width="15"
                                                height="15"
                                            />
                                            <rect
                                                x="10"
                                                y="75"
                                                width="15"
                                                height="15"
                                            />
                                            <rect
                                                x="30"
                                                y="30"
                                                width="10"
                                                height="10"
                                            />
                                            <rect
                                                x="60"
                                                y="30"
                                                width="10"
                                                height="10"
                                            />
                                            <rect
                                                x="30"
                                                y="60"
                                                width="10"
                                                height="10"
                                            />
                                            <rect
                                                x="60"
                                                y="60"
                                                width="10"
                                                height="10"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                />
                                            </svg>
                                            Yuklab olish
                                        </button>
                                        <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                />
                                            </svg>
                                            Telegram
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Info Section */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Current Subscription */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <p className="text-sm text-gray-600 mb-2">
                                    Joriy abonement
                                </p>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {mockSubscription.plan_name}
                                </h3>
                            </div>

                            {/* End Date */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <p className="text-sm text-gray-600 mb-2">
                                    Tugash sanasi
                                </p>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {mockSubscription.end_date}
                                </h3>
                                <p
                                    className="text-sm font-semibold mt-2"
                                    style={{ color: "#f0453f" }}
                                >
                                    {mockSubscription.days_remaining}
                                </p>
                            </div>

                            {/* Status Badge */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center">
                                <span
                                    className="px-4 py-2 rounded-full text-white font-semibold"
                                    style={{ backgroundColor: "#f0453f" }}
                                >
                                    {mockSubscription.status}
                                </span>
                            </div>
                        </div>

                        {/* Subscription History Section */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                Abonement tarixi
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-3 text-gray-600 font-semibold">
                                                Turi
                                            </th>
                                            <th className="text-left py-3 text-gray-600 font-semibold">
                                                Boshlanish
                                            </th>
                                            <th className="text-left py-3 text-gray-600 font-semibold">
                                                Tugash
                                            </th>
                                            <th className="text-left py-3 text-gray-600 font-semibold">
                                                Summa
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {mockSubscriptionHistory.map((sub) => (
                                            <tr key={sub.id}>
                                                <td className="py-3 text-gray-900 font-medium">
                                                    {sub.plan_name}
                                                </td>
                                                <td className="py-3 text-gray-600">
                                                    {sub.start_date}
                                                </td>
                                                <td className="py-3 text-gray-600">
                                                    {sub.end_date}
                                                </td>
                                                <td className="py-3 text-gray-900 font-medium">
                                                    {sub.price}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment History Section */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                To'lovlar tarixi
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-3 text-gray-600 font-semibold">
                                                Sana
                                            </th>
                                            <th className="text-left py-3 text-gray-600 font-semibold">
                                                Summa
                                            </th>
                                            <th className="text-left py-3 text-gray-600 font-semibold">
                                                Usul
                                            </th>
                                            <th className="text-left py-3 text-gray-600 font-semibold">
                                                Chequirma
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {mockPaymentHistory.map((payment) => (
                                            <tr key={payment.id}>
                                                <td className="py-3 text-gray-600">
                                                    {payment.date}
                                                </td>
                                                <td className="py-3 text-gray-900 font-medium">
                                                    {payment.price}
                                                </td>
                                                <td className="py-3 text-gray-600">
                                                    {payment.method}
                                                </td>
                                                <td className="py-3 text-gray-600">
                                                    {payment.status}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password Modal */}
                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    userId={user?.id}
                    onSuccess={() => {
                        setError("Parol muvaffaqiyatli o'zgartirildi!");
                        setTimeout(() => setError(null), 3000);
                    }}
                />

                {/* Edit User Modal */}
                <EditUserModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={userDetails || user}
                    onSuccess={() => {
                        fetchUserDetails();
                        setError("Ma'lumotlar muvaffaqiyatli o'zgartirildi!");
                        setTimeout(() => setError(null), 3000);
                    }}
                />
            </div>
        </div>
    );
}
