import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../api/users";
import { capitalize } from "../utils/capitalize";

export default function AttendanceContent() {
    const [attendances, setAttendances] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await usersAPI.getTodayAttendance();
            setAttendances(data);
        } catch (err) {
            setError("Davomatni yuklashda xato");
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewUser = (userId) => {
        navigate(`/user/${userId}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("uz-UZ", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">
                        Bugungi Davomat
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        {formatDate(new Date())} - Jami: {attendances.length} ta
                        mijoz
                    </p>
                </div>
                <button
                    onClick={fetchAttendance}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2 self-start sm:self-auto"
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

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-700 hover:text-red-900 font-bold text-xl ml-4"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600">Davomat yuklanmoqda...</p>
                </div>
            ) : attendances.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📝</div>
                    <p className="text-gray-600 text-lg">
                        Bugun hali hech kim kelmadi
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                        Mijozlar kelganda bu yerda ko'rinadi
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        #
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Ism Familiya
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Telefon
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                                        Ko'rish
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {attendances.map((attendance, index) => (
                                    <tr
                                        key={attendance.user?.id || index}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                                    style={{
                                                        backgroundColor:
                                                            "#f0453f",
                                                    }}
                                                >
                                                    {attendance.user?.first_name?.[0]?.toUpperCase()}
                                                    {attendance.user?.last_name?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {capitalize(
                                                        attendance.user
                                                            ?.first_name || ""
                                                    )}{" "}
                                                    {capitalize(
                                                        attendance.user
                                                            ?.last_name || ""
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {attendance.user?.phone_number ||
                                                "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() =>
                                                        handleViewUser(
                                                            attendance.user?.id
                                                        )
                                                    }
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                    title="Ko'rish"
                                                >
                                                    <svg
                                                        className="w-5 h-5 text-gray-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="sm:hidden space-y-3">
                        {attendances.map((attendance, index) => (
                            <div
                                key={attendance.user?.id || index}
                                className="bg-white rounded-lg shadow p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                                            style={{
                                                backgroundColor: "#f0453f",
                                            }}
                                        >
                                            {attendance.user?.first_name?.[0]?.toUpperCase()}
                                            {attendance.user?.last_name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {capitalize(
                                                    attendance.user
                                                        ?.first_name || ""
                                                )}{" "}
                                                {capitalize(
                                                    attendance.user
                                                        ?.last_name || ""
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {attendance.user
                                                    ?.phone_number || "-"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleViewUser(attendance.user?.id)
                                        }
                                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                                        title="Ko'rish"
                                    >
                                        <svg
                                            className="w-6 h-6 text-gray-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                                    <span className="text-gray-500">
                                        #{index + 1}
                                    </span>
                                    <span className="text-gray-500">
                                        {attendance.user?.gender === "male"
                                            ? "Erkak"
                                            : attendance.user?.gender ===
                                              "female"
                                            ? "Ayol"
                                            : "-"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
