import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersAPI } from "../api/users";

export default function TrainerDetailPage() {
    const { trainerId } = useParams();
    const navigate = useNavigate();
    const [trainerDetails, setTrainerDetails] = useState(null);
    const [clientsData, setClientsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTrainerData();
    }, [trainerId]);

    const fetchTrainerData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [trainerInfo, clientsInfo] = await Promise.all([
                usersAPI.getTrainerById(trainerId),
                usersAPI.getTrainerClients(trainerId),
            ]);
            setTrainerDetails(trainerInfo);
            setClientsData(clientsInfo);
        } catch (err) {
            console.error("Error fetching trainer data:", err);
            setError("Murabbiy ma'lumotini yuklashda xato");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const getDaysRemaining = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                >
                    ← Orqaga
                </button>

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

                {/* Trainer Info Card */}
                {trainerDetails && (
                    <div
                        className="bg-white rounded-2xl shadow-lg p-8 mb-8"
                        style={{ borderTop: "4px solid #f0453f" }}
                    >
                        <div className="flex items-start gap-6">
                            <div
                                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                                style={{ backgroundColor: "#f0453f" }}
                            >
                                {trainerDetails.first_name?.[0]}
                                {trainerDetails.last_name?.[0]}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {trainerDetails.first_name}{" "}
                                    {trainerDetails.last_name}
                                </h1>
                                <p className="text-gray-600 mb-4">Murabbiy</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Telefon Raqami
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {trainerDetails.phone_number}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Jins
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {trainerDetails.gender === "male"
                                                ? "Erkak"
                                                : trainerDetails.gender ===
                                                  "female"
                                                ? "Ayol"
                                                : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Tug'ilgan Sana
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {trainerDetails.date_of_birth
                                                ? formatDate(
                                                      trainerDetails.date_of_birth
                                                  )
                                                : "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Clients Overview */}
                {clientsData && (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Mijozlar
                            </h2>
                            <div
                                className="px-4 py-2 rounded-lg text-white font-bold text-lg"
                                style={{ backgroundColor: "#f0453f" }}
                            >
                                {clientsData.total_clients}
                            </div>
                        </div>

                        {clientsData.total_clients === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600">
                                    Bu murabbiyga bog'langan mijoz yo'q
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Mijoz Ismi
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Telefon
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Tarif
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Boshlanish Sanasi
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Tugash Sanasi
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Qolgan Kun
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {clientsData.clients.map(
                                            (client, index) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {client.client_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {client.phone_number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {
                                                            client.subscription_type
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(
                                                            client.start_date
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(
                                                            client.end_date
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                                                            style={{
                                                                backgroundColor:
                                                                    getDaysRemaining(
                                                                        client.end_date
                                                                    ) <= 7
                                                                        ? "#f0453f"
                                                                        : "#10b981",
                                                            }}
                                                        >
                                                            {getDaysRemaining(
                                                                client.end_date
                                                            )}{" "}
                                                            kun
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
