import { useState, useEffect } from "react";
import AddUserModal from "./AddUserModal";
import SubscriptionModal from "./SubscriptionModal";
import { dashboardAPI } from "../api/dashboard";
import { authAPI } from "../api/auth";
import { subscriptionAPI } from "../api/subscription";

export default function DashboardContent() {
    const [stats, setStats] = useState([
        {
            label: "Jami Mijozlar",
            value: "0",
            icon: "👥",
            color: "#f0453f",
            key: "total_active_users",
        },
        {
            label: "Trenerlar",
            value: "0",
            icon: "💪",
            color: "#10b981",
            key: "total_trainers",
        },
        {
            label: "Bugun Kiritilgan",
            value: "0",
            icon: "📝",
            color: "#3b82f6",
            key: "today_attendance",
        },
        {
            label: "Faol Obunalar",
            value: "0",
            icon: "✓",
            color: "#f59e0b",
            key: "total_active_subscriptions",
        },
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
        useState(false);
    const [pieChartData, setPieChartData] = useState([]);
    const [hoveredSegment, setHoveredSegment] = useState(null);

    useEffect(() => {
        fetchDashboardData();

        // Refresh when page regains focus (user switches tabs/windows)
        const handleFocus = () => {
            fetchDashboardData();
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [userStatsRes, subStatsRes] = await Promise.all([
                dashboardAPI.getUserStats(),
                dashboardAPI.getSubscriptionStats(),
            ]);

            // Merge the responses
            const userData = userStatsRes[0] || {};
            const subDataArray = subStatsRes || [];

            // Extract pie chart data and total subscriptions
            const pieChartItems = subDataArray.filter((item) => item.type);
            const subscriptionTotal =
                subDataArray.find((item) => item.total_active_subscriptions)
                    ?.total_active_subscriptions || 0;

            const mergedData = {
                total_active_users: userData.total_active_users || 0,
                total_trainers: userData.total_trainers || 0,
                today_attendance: userData.today_attendance || 0,
                total_active_subscriptions: subscriptionTotal,
            };

            // Update stats with fetched data
            setStats((prevStats) =>
                prevStats.map((stat) => ({
                    ...stat,
                    value: String(mergedData[stat.key] || 0),
                }))
            );

            // Set pie chart data
            setPieChartData(pieChartItems);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Dashboard ma'lumotlarini yuklashda xato");
        } finally {
            setLoading(false);
        }
    };

    const recentUsers = [
        {
            id: 1,
            name: "Ali Valiyev",
            phone: "+998901234567",
            status: "Faol",
            joinDate: "2024-11-25",
        },
        {
            id: 2,
            name: "Nodira Qodir",
            phone: "+998901234568",
            status: "Faol",
            joinDate: "2024-11-24",
        },
        {
            id: 3,
            name: "Javohir Xo'jayev",
            phone: "+998901234569",
            status: "Pauzada",
            joinDate: "2024-11-23",
        },
        {
            id: 4,
            name: "Malika Rahimova",
            phone: "+998901234570",
            status: "Faol",
            joinDate: "2024-11-22",
        },
        {
            id: 5,
            name: "Sardor Umarov",
            phone: "+998901234571",
            status: "Tugatilgan",
            joinDate: "2024-11-20",
        },
    ];

    const handleAddUser = async (formData) => {
        try {
            await authAPI.signup(
                formData.first_name,
                formData.last_name,
                formData.phone_number,
                formData.password,
                formData.date_of_birth,
                formData.gender
            );
            setIsModalOpen(false);
            // Refresh stats after adding user
            await fetchDashboardData();
        } catch (err) {
            console.error("Error adding user:", err);
            throw err;
        }
    };

    const handleAddSubscription = async (formData) => {
        try {
            // Call subscription creation API with snake_case field names
            await subscriptionAPI.create(
                formData.userId,
                formData.planId,
                formData.paymentMethod
            );
            setIsSubscriptionModalOpen(false);
            // Refresh stats after adding subscription
            await fetchDashboardData();
        } catch (err) {
            console.error("Error adding subscription:", err);
            throw err;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Title and Buttons */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900">
                        Admin Dashboard
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Assalomu alaykum! Bugungi to'liq ko'rsatmalar
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <span>👥</span> Mijoz qo'shish
                    </button>
                    <button
                        onClick={() => setIsSubscriptionModalOpen(true)}
                        className="px-6 py-2 rounded-lg text-white font-semibold transition"
                        style={{ backgroundColor: "#f0453f" }}
                        onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#d63a34")
                        }
                        onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "#f0453f")
                        }
                    >
                        Abonement sotish
                    </button>
                </div>
            </div>

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddUser}
            />

            {/* Add Subscription Modal */}
            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
                onSubmit={handleAddSubscription}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600">Statistika yuklanmoqda...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        {stat.value}
                                    </p>
                                </div>
                                <div
                                    className="text-3xl"
                                    style={{ color: stat.color }}
                                >
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Oylik daromad
                    </h3>
                    <div className="h-64 flex items-end justify-between px-2">
                        {[
                            { month: "Yan", value: 3200000 },
                            { month: "Fev", value: 3900000 },
                            { month: "Mar", value: 4500000 },
                            { month: "Apr", value: 4100000 },
                            { month: "May", value: 5000000 },
                            { month: "Iyun", value: 4800000 },
                            { month: "Iyul", value: 5200000 },
                            { month: "Avg", value: 5900000 },
                            { month: "Sen", value: 5800000 },
                            { month: "Okt", value: 5700000 },
                        ].map((item) => (
                            <div
                                key={item.month}
                                className="flex flex-col items-center"
                            >
                                <div
                                    className="w-8 bg-gradient-to-t from-red-400 to-red-300 rounded-t opacity-80 hover:opacity-100 transition"
                                    style={{
                                        height: `${
                                            (item.value / 6000000) * 200
                                        }px`,
                                    }}
                                />
                                <span className="text-xs text-gray-600 mt-2">
                                    {item.month}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subscription Distribution Pie Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Abonementlar bo'yicha
                    </h3>
                    <div className="flex flex-col items-center justify-center h-64">
                        {pieChartData.length === 0 ? (
                            <p className="text-gray-600">
                                Ma'lumot mavjud emas
                            </p>
                        ) : (
                            <>
                                <div className="relative">
                                    <svg
                                        width="200"
                                        height="200"
                                        viewBox="0 0 200 200"
                                        className="mb-4"
                                        style={{ overflow: "visible" }}
                                    >
                                        {(() => {
                                            const colors = [
                                                "#3b82f5",
                                                "#ff5724",
                                                "#ef4343",
                                                "#16a34a",
                                            ];
                                            let offset = 0;
                                            return pieChartData.map(
                                                (item, index) => {
                                                    const percentage =
                                                        item.percentage || 0;
                                                    const circumference = 502.4;
                                                    const dasharray =
                                                        (percentage / 100) *
                                                        circumference;
                                                    const color =
                                                        colors[
                                                            index %
                                                                colors.length
                                                        ];
                                                    const dashoffset = -offset;
                                                    offset += dasharray;
                                                    const isHovered =
                                                        hoveredSegment ===
                                                        index;

                                                    return (
                                                        <circle
                                                            key={index}
                                                            cx="100"
                                                            cy="100"
                                                            r="80"
                                                            fill="none"
                                                            stroke={color}
                                                            strokeWidth={
                                                                isHovered
                                                                    ? "45"
                                                                    : "40"
                                                            }
                                                            strokeDasharray={`${dasharray} ${circumference}`}
                                                            strokeDashoffset={
                                                                dashoffset
                                                            }
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            transform="rotate(-90 100 100)"
                                                            style={{
                                                                cursor: "pointer",
                                                                transition:
                                                                    "stroke-width 0.2s",
                                                                opacity:
                                                                    hoveredSegment ===
                                                                        null ||
                                                                    isHovered
                                                                        ? 1
                                                                        : 0.7,
                                                            }}
                                                            onMouseEnter={() =>
                                                                setHoveredSegment(
                                                                    index
                                                                )
                                                            }
                                                            onMouseLeave={() =>
                                                                setHoveredSegment(
                                                                    null
                                                                )
                                                            }
                                                        />
                                                    );
                                                }
                                            );
                                        })()}
                                    </svg>
                                    {hoveredSegment !== null && (
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded text-sm font-semibold whitespace-nowrap">
                                            {pieChartData[hoveredSegment].count}{" "}
                                            obunalar
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    {pieChartData.map((item, index) => {
                                        const colors = [
                                            "#3b82f5",
                                            "#ff5724",
                                            "#ef4343",
                                            "#16a34a",
                                        ];
                                        const color =
                                            colors[index % colors.length];
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 cursor-pointer"
                                                onMouseEnter={() =>
                                                    setHoveredSegment(index)
                                                }
                                                onMouseLeave={() =>
                                                    setHoveredSegment(null)
                                                }
                                            >
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{
                                                        backgroundColor: color,
                                                    }}
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {item.type}{" "}
                                                    {item.percentage}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Yangi Mijozlar
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Ism
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Telefon
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Qo'shilgan Sana
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {user.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                user.status === "Faol"
                                                    ? "bg-green-100 text-green-800"
                                                    : user.status === "Pauzada"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {user.joinDate}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
