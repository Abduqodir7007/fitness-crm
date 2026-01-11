import { useState, memo, useCallback } from "react";

const AddGymModal = memo(function AddGymModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        admin_first_name: "",
        admin_last_name: "",
        admin_phone_number: "",
        admin_password: "",
        admin_date_of_birth: "",
        admin_gender: "male",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Format data to match backend GymAndAdminCreate schema
            const submitData = {
                name: formData.name,
                address: formData.address || null,
                user: {
                    first_name: formData.admin_first_name,
                    last_name: formData.admin_last_name,
                    phone_number: `+998${formData.admin_phone_number}`,
                    password: formData.admin_password,
                    date_of_birth: formData.admin_date_of_birth,
                    gender: formData.admin_gender,
                }
            };
            await onSubmit(submitData);
            setFormData({
                name: "",
                address: "",
                admin_first_name: "",
                admin_last_name: "",
                admin_phone_number: "",
                admin_password: "",
                admin_date_of_birth: "",
                admin_gender: "male",
            });
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || err.message || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Yangi zal qo'shish
                        </h2>
                        <p className="text-gray-600 text-xs sm:text-sm mt-1">
                            Zal va admin ma'lumotlarini to'ldiring
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
                    {/* Gym Info Section */}
                    <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: "#f0453f" }}>1</span>
                            Zal ma'lumotlari
                        </h3>

                        {/* Gym Name */}
                        <div className="mb-3">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Zal nomi <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Masalan: Fitness Club"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Gym Address */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Manzil
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Masalan: Toshkent, Chilonzor tumani"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Admin Info Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: "#f0453f" }}>2</span>
                            Admin ma'lumotlari
                        </h3>

                        {/* Admin First Name and Last Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Ismi <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="admin_first_name"
                                    value={formData.admin_first_name}
                                    onChange={handleChange}
                                    placeholder="Ism"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Familiyasi <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="admin_last_name"
                                    value={formData.admin_last_name}
                                    onChange={handleChange}
                                    placeholder="Familiya"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Admin Phone Number */}
                        <div className="mb-3">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Telefon raqami <span className="text-red-600">*</span>
                            </label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 font-medium text-sm">
                                    +998
                                </span>
                                <input
                                    type="tel"
                                    name="admin_phone_number"
                                    value={formData.admin_phone_number}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                                        setFormData((prev) => ({
                                            ...prev,
                                            admin_phone_number: value,
                                        }));
                                    }}
                                    placeholder="90 123 45 67"
                                    maxLength={9}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Admin Password */}
                        <div className="mb-3">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Parol <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="password"
                                name="admin_password"
                                value={formData.admin_password}
                                onChange={handleChange}
                                placeholder="Kamida 6 ta belgi"
                                minLength={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Date of Birth and Gender */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Tug'ilgan sana <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="admin_date_of_birth"
                                    value={formData.admin_date_of_birth}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Jinsi <span className="text-red-600">*</span>
                                </label>
                                <select
                                    name="admin_gender"
                                    value={formData.admin_gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                >
                                    <option value="male">Erkak</option>
                                    <option value="female">Ayol</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 px-4 rounded-lg text-white font-medium transition disabled:opacity-50"
                            style={{ backgroundColor: "#f0453f" }}
                        >
                            {loading ? "Yaratilmoqda..." : "Yaratish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default AddGymModal;
