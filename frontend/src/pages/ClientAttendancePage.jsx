import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../api/users";

export default function ClientAttendancePage() {
    const [clientInfo, setClientInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClientInfo();
    }, []);

    const fetchClientInfo = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await usersAPI.getCurrentUser();
            setClientInfo(response);
        } catch (err) {
            setError("Ma'lumot yuklanishda xato");
            console.error("Error fetching client info:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async () => {
        try {
            setAttendanceLoading(true);
            setError(null);
            await usersAPI.markAttendance();
            setAttendanceMarked(true);
            setTimeout(() => {
                setAttendanceMarked(false);
            }, 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || "Xato yuz berdi";
            setError(errorMsg);
            console.error("Error marking attendance:", err);
        } finally {
            setAttendanceLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("token_type");
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500 mb-4">
                        <svg
                            className="w-8 h-8 text-white animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-700 font-medium">
                        Ma'lumot yuklanmoqda...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
            {/* Header */}
            <div className="max-w-2xl mx-auto mb-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: "#f0453f" }}
                        >
                            {clientInfo?.first_name?.[0]}
                            {clientInfo?.last_name?.[0]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Fitness CRM
                            </h1>
                            <p className="text-sm text-gray-600">
                                Xush kelibsiz, {clientInfo?.first_name}!
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                    >
                        Chiqish
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
                        <span>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-700 hover:text-red-900"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Success Message */}
                {attendanceMarked && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-pulse">
                        ✓ Bugungi davom hisob qilindi!
                    </div>
                )}

                {/* Client Info Card */}
                <div
                    className="bg-white rounded-2xl shadow-lg p-8 mb-8"
                    style={{ borderTop: "4px solid #f0453f" }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Shaxsiy Ma'lumotlar
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                F.I.Sh
                            </label>
                            <p className="text-lg text-gray-900">
                                {clientInfo?.first_name} {clientInfo?.last_name}
                            </p>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                Telefon Raqami
                            </label>
                            <p className="text-lg text-gray-900">
                                {clientInfo?.phone_number}
                            </p>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                Jins
                            </label>
                            <p className="text-lg text-gray-900">
                                {clientInfo?.gender === "male"
                                    ? "Erkak"
                                    : clientInfo?.gender === "female"
                                    ? "Ayol"
                                    : "—"}
                            </p>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                Tug'ilgan Sana
                            </label>
                            <p className="text-lg text-gray-900">
                                {clientInfo?.date_of_birth
                                    ? new Date(
                                          clientInfo.date_of_birth
                                      ).toLocaleDateString("uz-UZ")
                                    : "—"}
                            </p>
                        </div>

                        {/* Active Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                Holat
                            </label>
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-3 h-3 rounded-full ${
                                        clientInfo?.is_active
                                            ? "bg-green-500"
                                            : "bg-gray-400"
                                    }`}
                                />
                                <p className="text-lg text-gray-900">
                                    {clientInfo?.is_active
                                        ? "Faol"
                                        : "Faol emas"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Active Subscription Info */}
                    {clientInfo?.subscriptions &&
                        clientInfo.subscriptions.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Faol Obuna
                                </h3>
                                {clientInfo.subscriptions.map((sub, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-red-200 mb-3"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {sub.plan?.type}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Narxi:{" "}
                                                    <span className="font-semibold">
                                                        {sub.plan?.price?.toLocaleString(
                                                            "uz-UZ"
                                                        )}{" "}
                                                        so'm
                                                    </span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Muddati:{" "}
                                                    <span className="font-semibold">
                                                        {
                                                            sub.plan
                                                                ?.duration_days
                                                        }{" "}
                                                        kun
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                    Qolgan vaqt
                                                </p>
                                                <p className="text-2xl font-bold text-red-600">
                                                    {Math.max(0, sub.days_left)}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    kun
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </div>

                {/* Attendance Button */}
                <button
                    onClick={handleMarkAttendance}
                    disabled={attendanceLoading || attendanceMarked}
                    className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg text-xl mb-4"
                >
                    {attendanceLoading
                        ? "Davom hisob qilinmoqda..."
                        : attendanceMarked
                        ? "✓ Davom hisob qilindi"
                        : "Bugun Keldi Deb Belgilash"}
                </button>

                {/* Info Message */}
                <p className="text-center text-gray-600 text-sm">
                    Kuniga faqat bir marta davom hisob qila olasiz
                </p>
            </div>
        </div>
    );
}
