import { useState } from "react";
import { usersAPI } from "../api/users";

export default function ChangePasswordModal({
    isOpen,
    onClose,
    onSuccess,
    userId,
}) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!password) {
            setError("Yangi parolni kiriting");
            return;
        }

        if (password.length < 6) {
            setError("Parol kamida 6 ta belgi bo'lishi kerak");
            return;
        }

        if (password !== confirmPassword) {
            setError("Parollar bir xil emas");
            return;
        }

        setLoading(true);
        try {
            await usersAPI.updatePassword(userId, password);
            setSuccess(true);
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                onClose();
                setSuccess(false);
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (err) {
            const errorMsg =
                err.response?.data?.detail || "Parolni o'zgartirishda xato";
            setError(errorMsg);
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
                    <h2 className="text-2xl font-bold text-gray-900">
                        Parolni o'zgartirish
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        ✓ Parol muvaffaqiyatli o'zgartirildi!
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Yangi Parol <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Kamida 6 ta belgi"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            disabled={loading}
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Parolni Tasdiqlang{" "}
                            <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Parolni qayta kiriting"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            disabled={loading}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                            disabled={loading}
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition"
                            style={{ backgroundColor: "#f0453f" }}
                            onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#d63a34")
                            }
                            onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#f0453f")
                            }
                            disabled={loading}
                        >
                            {loading
                                ? "Saqlanmoqda..."
                                : "Parolni o'zgartirish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
