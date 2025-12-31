import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersAPI } from "../api/users";
import { capitalize } from "../utils/capitalize";
import ChangePasswordModal from "../components/ChangePasswordModal";
import EditUserModal from "../components/EditUserModal";

export default function ViewUserPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const details = await usersAPI.getById(userId);
            console.log("User Details Received:", details);
            console.log("Subscriptions:", details?.subscriptions);
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

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("uz-UZ");
    };

    const calculateDaysRemaining = (daysLeft) => {
        if (daysLeft === undefined || daysLeft === null) return "-";

        if (daysLeft < 0) return "Tugagan";
        if (daysLeft === 0) return "Bugun tugaydi";
        return `${daysLeft} kun qoldi`;
    };

    const getCurrentSubscription = () => {
        if (
            !userDetails?.subscriptions ||
            userDetails.subscriptions.length === 0
        ) {
            return null;
        }

        // Get the most recent active subscription or the last one
        const activeSubscription = userDetails.subscriptions.find(
            (sub) => sub.status === "active"
        );
        return activeSubscription || userDetails.subscriptions[0];
    };

    const handleDelete = async () => {
        if (
            window.confirm(
                "Haqiqatan ham bu foydalanuvchini o'chirishni xohlaysizmi?"
            )
        ) {
            try {
                await usersAPI.delete(userDetails.id);
                navigate("/dashboard/users");
            } catch (err) {
                setError("Foydalanuvchini o'chirishda xato");
                console.error("Error deleting user:", err);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600 text-lg">
                    Ma'lumotlar yuklanmoqda...
                </p>
            </div>
        );
    }

    if (error || !userDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">
                        {error || "Foydalanuvchi topilmadi"}
                    </p>
                    <button
                        onClick={() => navigate("/dashboard/users")}
                        className="px-6 py-2 rounded-lg text-white font-semibold transition"
                        style={{ backgroundColor: "#f0453f" }}
                    >
                        Ortga qaytish
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with back button and actions */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <button
                        onClick={() => navigate("/dashboard/users")}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium self-start"
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

                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                        >
                            <svg
                                className="w-4 h-4 sm:w-5 sm:h-5"
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
                            <span className="hidden sm:inline">Tahrirlash</span>
                        </button>
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                        >
                            <svg
                                className="w-4 h-4 sm:w-5 sm:h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            <span className="hidden sm:inline">Parol</span>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-white transition text-sm"
                            style={{ backgroundColor: "#f0453f" }}
                            onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#d63a34")
                            }
                            onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#f0453f")
                            }
                        >
                            <svg
                                className="w-4 h-4 sm:w-5 sm:h-5"
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
                            <span className="hidden sm:inline">O'chirish</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
                {/* User Profile Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center sm:items-start">
                        {/* Avatar */}
                        <div
                            className="w-20 h-20 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-white text-2xl sm:text-4xl font-bold flex-shrink-0"
                            style={{ backgroundColor: "#e8eaed" }}
                        >
                            <span className="text-gray-600">
                                {getInitials(
                                    userDetails.first_name,
                                    userDetails.last_name
                                )}
                            </span>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
                                {capitalize(userDetails.first_name)}{" "}
                                {capitalize(userDetails.last_name)}
                            </h1>
                            <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4 text-gray-600">
                                <div className="flex items-center justify-center sm:justify-start gap-3">
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
                                    <span className="text-sm sm:text-base">
                                        {userDetails.phone_number}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center sm:justify-start gap-3">
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
                                    <span className="text-sm sm:text-base">
                                        {userDetails.date_of_birth}
                                    </span>
                                </div>
                            </div>

                            {/* Gender and Status */}
                            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 justify-center sm:justify-start">
                                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-medium">
                                    {userDetails.gender === "male"
                                        ? "Erkak"
                                        : "Ayol"}
                                </span>
                                <span
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-white ${
                                        userDetails.is_active
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                    }`}
                                >
                                    {userDetails.is_active ? "Faol" : "Nofa'ol"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Info Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Current Subscription */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8">
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                            Joriy abonement
                        </p>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {getCurrentSubscription()?.plan?.type ||
                                "Abonement yo'q"}
                        </h3>
                    </div>

                    {/* End Date */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8">
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                            Tugash sanasi
                        </p>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {getCurrentSubscription()
                                ? formatDate(getCurrentSubscription().end_date)
                                : "-"}
                        </h3>
                        <p
                            className="text-xs sm:text-sm font-semibold mt-2 sm:mt-3"
                            style={{ color: "#f0453f" }}
                        >
                            {getCurrentSubscription()
                                ? calculateDaysRemaining(
                                      getCurrentSubscription().days_left
                                  )
                                : "-"}
                        </p>
                    </div>
                </div>

                {/* Subscription History Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                        <svg
                            className="w-5 h-5 sm:w-6 sm:h-6"
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

                    {userDetails?.subscriptions &&
                    userDetails.subscriptions.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-4 text-gray-600 font-semibold">
                                                Turi
                                            </th>
                                            <th className="text-left py-4 text-gray-600 font-semibold">
                                                Boshlanish
                                            </th>
                                            <th className="text-left py-4 text-gray-600 font-semibold">
                                                Tugash
                                            </th>
                                            <th className="text-left py-4 text-gray-600 font-semibold">
                                                Summa
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {userDetails.subscriptions.map(
                                            (sub, index) => (
                                                <tr key={index}>
                                                    <td className="py-4 text-gray-900 font-medium">
                                                        {sub.plan?.type || "-"}
                                                    </td>
                                                    <td className="py-4 text-gray-600">
                                                        {formatDate(
                                                            sub.start_date
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-gray-600">
                                                        {formatDate(
                                                            sub.end_date
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-gray-900 font-medium">
                                                        {sub.plan?.price?.toLocaleString(
                                                            "uz-UZ"
                                                        ) || "-"}{" "}
                                                        so'm
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="sm:hidden space-y-3">
                                {userDetails.subscriptions.map((sub, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-lg p-3"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-gray-900">
                                                {sub.plan?.type || "-"}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {sub.plan?.price?.toLocaleString(
                                                    "uz-UZ"
                                                ) || "-"}{" "}
                                                so'm
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDate(sub.start_date)} -{" "}
                                            {formatDate(sub.end_date)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-600 text-center py-6 sm:py-8 text-sm sm:text-base">
                            Abonement tarixi yo'q
                        </p>
                    )}
                </div>

                {/* Payment History Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                        <svg
                            className="w-5 h-5 sm:w-6 sm:h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        To'lovlar tarixi
                    </h3>

                    {userDetails?.payments &&
                    userDetails.payments.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Sana
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Summa
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                To'lov Usuli
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {userDetails.payments.map(
                                            (payment, index) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(
                                                            payment.payment_date
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                        {payment.amount?.toLocaleString(
                                                            "uz-UZ"
                                                        ) || 0}{" "}
                                                        so'm
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                                payment.payment_method ===
                                                                "cash"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-blue-100 text-blue-800"
                                                            }`}
                                                        >
                                                            {payment.payment_method ===
                                                            "cash"
                                                                ? "Naqd"
                                                                : "Karta"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="sm:hidden space-y-3">
                                {userDetails.payments.map((payment, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-lg p-3"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">
                                                {formatDate(
                                                    payment.payment_date
                                                )}
                                            </span>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    payment.payment_method ===
                                                    "cash"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}
                                            >
                                                {payment.payment_method ===
                                                "cash"
                                                    ? "Naqd"
                                                    : "Karta"}
                                            </span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 mt-1">
                                            {payment.amount?.toLocaleString(
                                                "uz-UZ"
                                            ) || 0}{" "}
                                            so'm
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-600 text-center py-6 sm:py-8 text-sm sm:text-base">
                            To'lovlar tarixi yo'q
                        </p>
                    )}
                </div>

                {/* Password Modal */}
                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    userId={userId}
                    onSuccess={() => {
                        setError("Parol muvaffaqiyatli o'zgartirildi!");
                        setTimeout(() => setError(null), 3000);
                    }}
                />

                {/* Edit User Modal */}
                <EditUserModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={{ ...userDetails, id: userId }}
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
