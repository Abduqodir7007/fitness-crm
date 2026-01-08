import { useState } from "react";

export default function AddPricingModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        duration_days: "",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.name || !formData.price || !formData.duration_days) {
            setError("Barcha maydonlarni to'ldiring");
            return;
        }

        setLoading(true);

        try {
            await onSubmit({
                name: formData.name,
                price: parseInt(formData.price),
                duration_days: parseInt(formData.duration_days),
            });
            setFormData({
                name: "",
                price: "",
                duration_days: "",
            });
            onClose();
        } catch (err) {
            setError(err.message || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Yangi Tarif Qo'shish
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Tarifning ma'lumotlarini to'ldiring
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
                    {/* Plan Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Tarifning nomi{" "}
                            <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Masalan: Standart, Premium"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Narx (so'm) <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Masalan: 150000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Duration (Days) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Davomiyligi (kunlar){" "}
                            <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="number"
                            name="duration_days"
                            value={formData.duration_days}
                            onChange={handleChange}
                            placeholder="Masalan: 30 (1 oy uchun)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                        />
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
                            disabled={loading}
                            className="flex-1 px-4 py-2 rounded-lg text-white font-semibold transition"
                            style={{ backgroundColor: "#f0453f" }}
                            onMouseEnter={(e) =>
                                !loading &&
                                (e.target.style.backgroundColor = "#d63a34")
                            }
                            onMouseLeave={(e) =>
                                !loading &&
                                (e.target.style.backgroundColor = "#f0453f")
                            }
                        >
                            {loading ? "Saqlanmoqda..." : "Qo'shish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
