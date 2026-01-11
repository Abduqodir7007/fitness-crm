import { useState, useEffect } from "react";

export default function AdminsContent() {
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // TODO: Fetch admins when API is ready
    // useEffect(() => {
    //     fetchAdmins();
    // }, []);

    // Filter admins based on search query
    const filteredAdmins = admins.filter((admin) => {
        const query = searchQuery.toLowerCase();
        return (
            admin.first_name?.toLowerCase().includes(query) ||
            admin.last_name?.toLowerCase().includes(query) ||
            admin.phone_number?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Adminlar
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Barcha zal adminlarini boshqaring
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Admin qidirish..."
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(240, 69, 63, 0.1)" }}>
                            <span className="text-2xl">👤</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Jami adminlar</p>
                            <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
                            <span className="text-2xl">✅</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Faol adminlar</p>
                            <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admins List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Adminlar ro'yxati
                    </h3>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-gray-600">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: "#f0453f" }}></div>
                        Yuklanmoqda...
                    </div>
                ) : filteredAdmins.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(240, 69, 63, 0.1)" }}>
                            <span className="text-3xl">👤</span>
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-1">Adminlar yo'q</p>
                        <p className="text-sm text-gray-500">
                            {searchQuery ? "Qidiruv bo'yicha admin topilmadi" : "Zal yaratganingizda admin avtomatik qo'shiladi"}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Admin
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Telefon
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Zal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Holat
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredAdmins.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(240, 69, 63, 0.1)" }}>
                                                        <span className="text-lg">👤</span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">{admin.first_name} {admin.last_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {admin.phone_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {admin.gym_name || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                    Faol
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-gray-200">
                            {filteredAdmins.map((admin) => (
                                <div key={admin.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(240, 69, 63, 0.1)" }}>
                                            <span className="text-xl">👤</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{admin.first_name} {admin.last_name}</h4>
                                            <p className="text-sm text-gray-600">{admin.phone_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">{admin.gym_name || "Zal belgilanmagan"}</span>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                            Faol
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
