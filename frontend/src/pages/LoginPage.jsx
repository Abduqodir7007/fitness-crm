import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/auth";

export default function LoginPage() {
    const [phone_number, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await authAPI.login(phone_number, password);

            // Redirect based on role
            if (response.role === "admin") {
                navigate("/dashboard");
            } else if (response.role === "client") {
                navigate("/attendance");
            } else if (response.role === "trainer") {
                navigate("/trainer-dashboard");
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
                            Login (telefon/username)
                        </label>
                        <input
                            type="tel"
                            value={phone_number}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+998 90 123 45 67"
                            className="w-full px-4 py-3 border rounded-lg outline-none transition focus:ring-2 focus:border-transparent"
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

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Parol
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border rounded-lg outline-none transition focus:ring-2 focus:border-transparent"
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
