import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../api/users";
import { authAPI } from "../api/auth";
import { capitalize } from "../utils/capitalize";

export default function TrainerDashboardPage() {
    const navigate = useNavigate();
    const [trainerDetails, setTrainerDetails] = useState(null);
    const [clientsData, setClientsData] = useState([]);
    const [totalClients, setTotalClients] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTrainerData();
    }, []);

    const fetchTrainerData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Get current logged-in trainer's info using /users/me endpoint
            const currentUser = await usersAPI.getCurrentUser();
            setTrainerDetails(currentUser);

            // Get trainer's assigned clients using the trainer's ID
            // The backend returns {total_clients, clients} structure
            try {
                const response = await usersAPI.getTrainerClients(currentUser.id);
                setClientsData(response?.clients || []);
                setTotalClients(response?.total_clients || 0);
            } catch {
                // If endpoint fails, set empty
                setClientsData([]);
                setTotalClients(0);
            }
        } catch (err) {
            setError("Ma'lumotlarni yuklashda xato");
            console.error("Error fetching trainer data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authAPI.logout();
        navigate("/login");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString("uz-UZ");
    };

    const getDaysRemaining = (endDate) => {
        if (!endDate) return 0;
        const today = new Date();
        const end = new Date(endDate);
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    // Count active subscriptions (end_date is in future)
    const getActiveSubscriptions = () => {
        return clientsData.filter((client) => getDaysRemaining(client.end_date) > 0).length;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div
                        className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-4 animate-pulse"
                        style={{ backgroundColor: "#f0453f" }}
                    >
                        <svg
                            className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-700 font-medium text-sm sm:text-base">
                        Ma'lumot yuklanmoqda...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: "#f0453f" }}
                        >
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                                Fitness CRM
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500">
                                Trener paneli
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-100 text-red-600 rounded-lg text-sm sm:text-base font-medium hover:bg-red-200 transition"
                    >
                        Chiqish
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {error && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm sm:text-base flex items-center justify-between">
                        <span>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-2 text-red-700 hover:text-red-900 font-bold"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Trainer Info Card */}
                {trainerDetails && (
                    <div
                        className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-8"
                        style={{ borderTop: "4px solid #f0453f" }}
                    >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                            <div
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0"
                                style={{ backgroundColor: "#f0453f" }}
                            >
                                {trainerDetails.first_name?.charAt(0)?.toUpperCase() || "T"}
                                {trainerDetails.last_name?.charAt(0)?.toUpperCase() || ""}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {capitalize(trainerDetails.first_name || "")}{" "}
                                    {capitalize(trainerDetails.last_name || "")}
                                </h2>
                                <p className="text-gray-600 text-sm sm:text-base mt-1">
                                    {trainerDetails.phone_number}
                                </p>
                                <span
                                    className="inline-block mt-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-white"
                                    style={{ backgroundColor: "#f0453f" }}
                                >
                                    💪 Trener
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
                    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Jami mijozlar
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {totalClients}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Faol obunalar
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {getActiveSubscriptions()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600"
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
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Bugungi sana
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {new Date().toLocaleDateString("uz-UZ")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clients List */}
                <div className="bg-white rounded-xl shadow">
                    <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                Mening mijozlarim
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                                Sizga biriktirilgan mijozlar ro'yxati
                            </p>
                        </div>
                        <button
                            onClick={fetchTrainerData}
                            className="self-start sm:self-auto px-3 py-1.5 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
                        >
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
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Yangilash
                        </button>
                    </div>

                    {clientsData.length === 0 ? (
                        <div className="p-8 sm:p-12 text-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Hozircha sizga biriktirilgan mijoz yo'q
                            </p>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">
                                Mijozlar biriktirilganda bu yerda ko'rinadi
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                Mijoz
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                Telefon
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                Tarif
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                Boshlanish
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                Tugash
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                Qolgan kun
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {clientsData.map((client, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                                                            style={{ backgroundColor: "#f0453f" }}
                                                        >
                                                            {client.client_name?.charAt(0)?.toUpperCase() || "?"}
                                                        </div>
                                                        <p className="font-medium text-gray-900">
                                                            {capitalize(client.client_name || "")}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {client.phone_number || "—"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                                        {client.subscription_type || "Standard"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {formatDate(client.start_date)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {formatDate(client.end_date)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded text-sm font-medium ${getDaysRemaining(client.end_date) <= 0
                                                                ? "bg-gray-100 text-gray-800"
                                                                : getDaysRemaining(client.end_date) <= 3
                                                                    ? "bg-red-100 text-red-800"
                                                                    : getDaysRemaining(client.end_date) <= 7
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-green-100 text-green-800"
                                                            }`}
                                                    >
                                                        {getDaysRemaining(client.end_date) <= 0
                                                            ? "Tugagan"
                                                            : `${getDaysRemaining(client.end_date)} kun`}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-gray-200">
                                {clientsData.map((client, index) => (
                                    <div key={index} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                                                style={{ backgroundColor: "#f0453f" }}
                                            >
                                                {client.client_name?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                                            {capitalize(client.client_name || "")}
                                                        </h4>
                                                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                                            {client.phone_number || "—"}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getDaysRemaining(client.end_date) <= 0
                                                                ? "bg-gray-100 text-gray-800"
                                                                : getDaysRemaining(client.end_date) <= 3
                                                                    ? "bg-red-100 text-red-800"
                                                                    : getDaysRemaining(client.end_date) <= 7
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-green-100 text-green-800"
                                                            }`}
                                                    >
                                                        {getDaysRemaining(client.end_date) <= 0
                                                            ? "Tugagan"
                                                            : `${getDaysRemaining(client.end_date)} kun`}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                        {client.subscription_type || "Standard"}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        {formatDate(client.start_date)} - {formatDate(client.end_date)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
