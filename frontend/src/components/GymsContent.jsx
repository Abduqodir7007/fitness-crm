import { useState, useEffect } from "react";
import AddGymModal from "./AddGymModal";
import { gymsAPI } from "../api/gyms";

export default function GymsContent() {
    const [gyms, setGyms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchGyms();
    }, []);

    const fetchGyms = async () => {
        setIsLoading(true);
        try {
            const data = await gymsAPI.getAll();
            setGyms(data);
        } catch (err) {
            console.error("Error fetching gyms:", err);
            setError("Zallarni yuklashda xato");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddGym = async (formData) => {
        await gymsAPI.create(formData);
        await fetchGyms();
        setIsModalOpen(false);
    };

    const handleDeleteGym = async (gymId) => {
        if (!window.confirm("Haqiqatan ham bu zalni o'chirishni xohlaysizmi? Zal admini ham o'chiriladi.")) {
            return;
        }

        try {
            await gymsAPI.delete(gymId);
            await fetchGyms();
        } catch (err) {
            const errorMessage = err.response?.data?.detail || "Zalni o'chirishda xato";
            setError(errorMessage);
            console.error("Error deleting gym:", err);
        }
    };

    // Filter gyms based on search query
    const filteredGyms = gyms.filter((gym) => {
        const query = searchQuery.toLowerCase();
        return (
            gym.name?.toLowerCase().includes(query) ||
            gym.address?.toLowerCase().includes(query) ||
            gym.admin?.first_name?.toLowerCase().includes(query) ||
            gym.admin?.last_name?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Zallar
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Barcha fitness zallarini boshqaring
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#f0453f" }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Yangi zal
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Zal qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 sm:py-3 pl-10 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 underline">
                        Yopish
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(240, 69, 63, 0.1)" }}>
                            <span className="text-2xl">🏋️</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Jami zallar</p>
                            <p className="text-2xl font-bold text-gray-900">{gyms.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
                            <span className="text-2xl">✅</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Faol zallar</p>
                            <p className="text-2xl font-bold text-gray-900">{gyms.filter(g => g.is_active).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
                            <span className="text-2xl">👤</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Adminlar</p>
                            <p className="text-2xl font-bold text-gray-900">{gyms.filter(g => g.admin).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gyms List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Zallar ro'yxati
                    </h3>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-gray-600">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: "#f0453f" }}></div>
                        Yuklanmoqda...
                    </div>
                ) : filteredGyms.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">
                        {searchQuery ? "Qidiruv bo'yicha zal topilmadi" : "Hozircha zallar yo'q"}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Zal nomi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Manzil
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Admin
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Telefon
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Holat
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Amallar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredGyms.map((gym) => (
                                        <tr key={gym.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(240, 69, 63, 0.1)" }}>
                                                        <span className="text-lg">🏋️</span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">{gym.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {gym.address || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {gym.admin ? `${gym.admin.first_name} ${gym.admin.last_name}` : "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {gym.admin?.phone_number || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${gym.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                    {gym.is_active ? "Faol" : "Nofaol"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleDeleteGym(gym.id)}
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                                                    title="O'chirish"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-gray-200">
                            {filteredGyms.map((gym) => (
                                <div key={gym.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(240, 69, 63, 0.1)" }}>
                                                <span className="text-xl">🏋️</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{gym.name}</h4>
                                                <p className="text-sm text-gray-600">{gym.address || "Manzil ko'rsatilmagan"}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${gym.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {gym.is_active ? "Faol" : "Nofaol"}
                                        </span>
                                    </div>
                                    
                                    {gym.admin && (
                                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                            <p className="text-xs text-gray-500 mb-1">Admin</p>
                                            <p className="font-medium text-gray-900">{gym.admin.first_name} {gym.admin.last_name}</p>
                                            <p className="text-sm text-gray-600">{gym.admin.phone_number}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleDeleteGym(gym.id)}
                                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition flex items-center gap-1 text-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            O'chirish
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Add Gym Modal */}
            <AddGymModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddGym}
            />
        </div>
    );
}
