import { memo } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = memo(function Sidebar({
    activeTab,
    setActiveTab,
    isOpen,
    onClose,
}) {
    const navigate = useNavigate();

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: "🏠" },
        { id: "users", label: "Mijozlar", icon: "👥" },
        { id: "attendance", label: "Davomat", icon: "📝" },
        { id: "pricing", label: "Tariflar", icon: "📋" },
        { id: "trainers", label: "Trenerlar", icon: "💪" },
        { id: "reports", label: "To'lovlar", icon: "📊" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    const handleMenuClick = (id) => {
        setActiveTab(id);
        if (onClose) onClose();
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`h-screen text-white w-64 flex flex-col fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                style={{ backgroundColor: "#0f1729" }}
            >
                {/* Logo Section */}
                <div
                    className="p-6 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}
                >
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
                            <h1 className="font-bold text-lg text-white">
                                Fitness CRM
                            </h1>
                            <p className="text-xs text-gray-400">Pro Version</p>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left font-medium text-white ${
                                activeTab === item.id
                                    ? "border-l-4"
                                    : "hover:opacity-80"
                            }`}
                            style={{
                                backgroundColor:
                                    activeTab === item.id
                                        ? "rgba(240, 69, 63, 0.1)"
                                        : "transparent",
                                borderLeftColor:
                                    activeTab === item.id
                                        ? "#f0453f"
                                        : "transparent",
                            }}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Logout Button */}
                <div
                    className="p-6 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}
                >
                    <button
                        onClick={handleLogout}
                        className="w-full text-white font-medium py-2 px-4 rounded-lg transition hover:opacity-80"
                        style={{ backgroundColor: "rgba(240, 69, 63, 0.8)" }}
                    >
                        Chiqish
                    </button>
                </div>
            </div>
        </>
    );
});

export default Sidebar;
