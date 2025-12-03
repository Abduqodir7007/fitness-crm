import { useState } from "react";

export default function AddUserModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        password: "",
        date_of_birth: "",
        gender: "male",
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
        setLoading(true);

        try {
            await onSubmit(formData);
            setFormData({
                first_name: "",
                last_name: "",
                phone_number: "",
                password: "",
                date_of_birth: "",
                gender: "male",
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
                            Yangi mijoz qo'shish
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Mijoz ma'lumotlarini to'ldiring
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
                    {/* First Name and Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                F.I.O <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="Ism"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Familiya <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Familiya"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Telefon <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="+998 90 123 45 67"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Parol <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Parol kiriting"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Date of Birth and Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Tug'ilgan sana
                            </label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Jins
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-white font-semibold rounded-lg transition"
                            style={{
                                backgroundColor: "#f0453f",
                                opacity: loading ? 0.8 : 1,
                            }}
                            onMouseEnter={(e) =>
                                !loading &&
                                (e.target.style.backgroundColor = "#d63a34")
                            }
                            onMouseLeave={(e) =>
                                !loading &&
                                (e.target.style.backgroundColor = "#f0453f")
                            }
                        >
                            {loading ? "Saqlash..." : "Saqlash"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
