import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/auth";

export default function LoginPage() {
    const [phone_number, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Prepend +998 to the phone number
            const fullPhoneNumber = `+998${phone_number}`;
            const response = await authAPI.login(fullPhoneNumber, password);

            // Redirect based on user role
            switch (response.role) {
                case "admin":
                    navigate("/dashboard");
                    break;
                case "trainer":
                    navigate("/trainer-dashboard");
                    break;
                case "client":
                default:
                    navigate("/attendance");
                    break;
            }
        } catch (err) {
            setError(
                err.response?.data?.detail || "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{ backgroundColor: "#f0453f" }}
                    >
                        <svg
                            className="w-8 h-8 text-white"
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
                    <h1 className="text-3xl font-bold text-gray-900">
                        Fitness CRM
                    </h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Tizimga kirish uchun login ma'lumotlarini kiriting
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Login Field */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Telefon raqam
                        </label>
                        <div className="flex">
                            <span
                                className="inline-flex items-center px-4 py-3 border border-r-0 rounded-l-lg bg-gray-50 text-gray-600 font-medium"
                                style={{ borderColor: "#f0453f" }}
                            >
                                +998
                            </span>
                            <input
                                type="tel"
                                value={phone_number}
                                onChange={(e) => {
                                    // Only allow digits and limit to 9 characters
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                                    setPhoneNumber(value);
                                }}
                                placeholder="90 123 45 67"
                                maxLength={9}
                                className="flex-1 px-4 py-3 border rounded-r-lg outline-none transition focus:ring-2 focus:border-transparent"
                                style={{
                                    borderColor: "#f0453f",
                                    boxShadow: "var(--shadow)",
                                }}
                                onFocus={(e) =>
                                (e.target.style.boxShadow =
                                    "0 0 0 2px rgba(240, 69, 63, 0.2)")
                                }
                                onBlur={(e) => (e.target.style.boxShadow = "none")}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Parol
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 pr-12 border rounded-lg outline-none transition focus:ring-2 focus:border-transparent"
                                style={{
                                    borderColor: "#f0453f",
                                    boxShadow: "var(--shadow)",
                                }}
                                onFocus={(e) =>
                                (e.target.style.boxShadow =
                                    "0 0 0 2px rgba(240, 69, 63, 0.2)")
                                }
                                onBlur={(e) =>
                                    (e.target.style.boxShadow = "none")
                                }
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? (
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
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                        />
                                    </svg>
                                ) : (
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
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
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
                        {loading ? "Kirish..." : "Kirish"}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                    >
                        Parolni unutdingizmi?
                    </button>
                </div>
            </div>
        </div>
    );
}
