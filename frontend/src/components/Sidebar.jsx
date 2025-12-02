import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ activeTab, setActiveTab }) {
    const navigate = useNavigate();

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: "🏠" },
        { id: "users", label: "Mijozlar", icon: "👥" },
        { id: "pricing", label: "Tariflar", icon: "📋" },
        { id: "trainers", label: "Trenerlar", icon: "💪" },
        { id: "schedules", label: "Jadval", icon: "📅" },
        { id: "reports", label: "To'lovlar", icon: "📊" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    return (
        <div className="h-screen bg-slate-900 text-white w-64 flex flex-col fixed left-0 top-0">
            {/* Logo Section */}
            <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#f0453f" }}
                    >
                        <svg
                            className="w-6 h-6 text-white"
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
                    <div>
                        <h1 className="font-bold text-lg">Fitness CRM</h1>
                        <p className="text-xs text-slate-400">Pro Version</p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-3 py-6 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                            activeTab === item.id
                                ? "bg-slate-700 border-l-4"
                                : "text-slate-300 hover:bg-slate-800"
                        }`}
                        style={
                            activeTab === item.id
                                ? { borderLeftColor: "#f0453f" }
                                : {}
                        }
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="p-6 border-t border-slate-700">
                <button
                    onClick={handleLogout}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                    Chiqish
                </button>
            </div>
        </div>
    );
}
