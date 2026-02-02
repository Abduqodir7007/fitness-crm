import { useState } from "react";

export default function ViewGymModal({ isOpen, onClose, gym, onToggleStatus, onToggleMarketplace }) {
    const [loading, setLoading] = useState(false);
    const [marketplaceLoading, setMarketplaceLoading] = useState(false);

    if (!isOpen || !gym) return null;

    const handleToggleStatus = async () => {
        const confirmMessage = gym.is_active
            ? "Haqiqatan ham bu zalni nofaol qilmoqchimisiz?"
            : "Haqiqatan ham bu zalni faollashtirmoqchimisiz?";

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setLoading(true);
        try {
            await onToggleStatus(gym.id);
            onClose();
        } catch (err) {
            console.error("Error toggling gym status:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleMarketplace = async () => {
        const confirmMessage = gym.marketplace_enabled
            ? "Haqiqatan ham bu zal uchun marketplace ni o'chirmoqchimisiz?"
            : "Haqiqatan ham bu zal uchun marketplace ni yoqmoqchimisiz?";

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setMarketplaceLoading(true);
        try {
            await onToggleMarketplace(gym.id);
            onClose();
        } catch (err) {
            console.error("Error toggling marketplace:", err);
        } finally {
            setMarketplaceLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Zal ma'lumotlari</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Gym Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="w-16 h-16 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "rgba(240, 69, 63, 0.1)" }}
                            >
                                <span className="text-3xl">🏋️</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{gym.name}</h3>
                                <p className="text-gray-600">{gym.address || "Manzil ko'rsatilmagan"}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Holat:</span>
                                <span
                                    className={`px-3 py-1 text-sm font-medium rounded-full ${gym.is_active
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {gym.is_active ? "Faol" : "Nofaol"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Marketplace:</span>
                                <span
                                    className={`px-3 py-1 text-sm font-medium rounded-full ${gym.marketplace_enabled
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {gym.marketplace_enabled ? "Yoqilgan" : "O'chirilgan"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Info */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-xl">👤</span>
                            Admin ma'lumotlari
                        </h4>

                        {gym.admin ? (
                            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Ism</p>
                                        <p className="font-medium text-gray-900">
                                            {gym.admin.first_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Familiya</p>
                                        <p className="font-medium text-gray-900">
                                            {gym.admin.last_name}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Telefon raqam</p>
                                    <p className="font-medium text-gray-900">
                                        {gym.admin.phone_number}
                                    </p>
                                </div>

                                {gym.admin.date_of_birth && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">
                                            Tug'ilgan sana
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(gym.admin.date_of_birth).toLocaleDateString(
                                                "uz-UZ"
                                            )}
                                        </p>
                                    </div>
                                )}

                                {gym.admin.gender && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Jinsi</p>
                                        <p className="font-medium text-gray-900">
                                            {gym.admin.gender === "male" ? "Erkak" : "Ayol"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-yellow-50 rounded-lg p-4 text-center">
                                <p className="text-yellow-700">
                                    Bu zalga admin biriktirilmagan
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Marketplace Toggle */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-xl">🛒</span>
                            Marketplace sozlamalari
                        </h4>

                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Marketplace</p>
                                    <p className="text-sm text-gray-600">
                                        {gym.marketplace_enabled
                                            ? "Zal admini mahsulotlarni boshqara oladi"
                                            : "Marketplace o'chirilgan"}
                                    </p>
                                </div>
                                <button
                                    onClick={handleToggleMarketplace}
                                    disabled={marketplaceLoading}
                                    className={`px-4 py-2 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2 ${gym.marketplace_enabled
                                        ? "bg-gray-500 hover:bg-gray-600"
                                        : "bg-blue-500 hover:bg-blue-600"
                                        }`}
                                >
                                    {marketplaceLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        </>
                                    ) : gym.marketplace_enabled ? (
                                        "O'chirish"
                                    ) : (
                                        "Yoqish"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Yopish
                    </button>
                    <button
                        onClick={handleToggleStatus}
                        disabled={loading}
                        className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 ${gym.is_active
                            ? "bg-orange-500 hover:bg-orange-600"
                            : "bg-green-500 hover:bg-green-600"
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Yuklanmoqda...
                            </>
                        ) : gym.is_active ? (
                            <>
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
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                    />
                                </svg>
                                Nofaol qilish
                            </>
                        ) : (
                            <>
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
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Faollashtirish
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
