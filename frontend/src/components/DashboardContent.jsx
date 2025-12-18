import { useState, useEffect, useCallback, memo } from "react";
import AddUserModal from "./AddUserModal";
import SubscriptionModal from "./SubscriptionModal";
import DailySubscriptionModal from "./DailySubscriptionModal";
import { dashboardAPI } from "../api/dashboard";
import { authAPI } from "../api/auth";
import { subscriptionAPI } from "../api/subscription";

const DashboardContent = memo(function DashboardContent() {
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
        {
            label: "Kunlik Paketlar",
            value: "0",
            icon: "📦",
            color: "#8b5cf6",
            key: "daily_plans_sold",
        },
        {
            label: "Bugun Foyda",
            value: "0",
            icon: "💰",
            color: "#06b6d4",
            key: "daily_profit",
            isProfit: true,
        },
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
        useState(false);
    const [isDailySubscriptionModalOpen, setIsDailySubscriptionModalOpen] =
        useState(false);
    const [pieChartData, setPieChartData] = useState([]);
    const [hoveredSegment, setHoveredSegment] = useState(null);
    const [hoveredLinePoint, setHoveredLinePoint] = useState(null);
    const [hoveredBar, setHoveredBar] = useState(null);
    const [dailyClientsData, setDailyClientsData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [userStatsRes, subStatsRes, dailyStatsRes, monthlyStatsRes] =
                await Promise.all([
                    dashboardAPI.getUserStats(),
                    dashboardAPI.getSubscriptionStats(),
                    dashboardAPI.getDailyStats(),
                    dashboardAPI.getMonthlyPayment(),
                ]);

            // Merge the responses
            const userData = userStatsRes[0] || {};
            const subDataArray = subStatsRes || [];
            const dailyData = dailyStatsRes || {};

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
                daily_plans_sold: dailyData.daily_clients || 0,
                daily_profit: dailyData.daily_profit || 0,
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

            // Update line graph data with weekly clients
            let weeklyClients = dailyData.weekly_clients;

            if (
                weeklyClients &&
                Array.isArray(weeklyClients) &&
                weeklyClients.length > 0
            ) {
                // Convert English day names to Uzbek
                const dayMap = {
                    Monday: "Dushanba",
                    Tuesday: "Seshanba",
                    Wednesday: "Chorshanba",
                    Thursday: "Payshanba",
                    Friday: "Juma",
                    Saturday: "Shanba",
                    Sunday: "Yakshanba",
                };
                const convertedData = weeklyClients.map((item) => {
                    const mappedDay = dayMap[item.day] || item.day;
                    return {
                        day: mappedDay,
                        count: item.count || 0,
                    };
                });
                setDailyClientsData(convertedData);
            }

            // Process monthly data
            if (
                monthlyStatsRes &&
                Array.isArray(monthlyStatsRes) &&
                monthlyStatsRes.length > 0
            ) {
                const monthNameMap = {
                    January: "Yan",
                    February: "Fev",
                    March: "Mar",
                    April: "Apr",
                    May: "May",
                    June: "Iyun",
                    July: "Iyul",
                    August: "Avg",
                    September: "Sen",
                    October: "Okt",
                    November: "Noy",
                    December: "Dek",
                };

                const processedMonthly = monthlyStatsRes.map((item) => ({
                    month: monthNameMap[item.month] || item.month,
                    profit: item.profit || 0,
                }));
                setMonthlyData(processedMonthly);
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Dashboard ma'lumotlarini yuklashda xato");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();

        // Refresh when page regains focus (user switches tabs/windows)
        const handleFocus = () => {
            fetchDashboardData();
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [fetchDashboardData]);

    // Auto-dismiss error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

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
                formData.paymentMethod,
                formData.trainerId
            );
            setIsSubscriptionModalOpen(false);
            // Refresh stats after adding subscription
            await fetchDashboardData();
        } catch (err) {
            console.error("Error adding subscription:", err);
            // Display backend error message or generic error
            const errorMessage =
                err.response?.data?.detail || "Obuna yaratishda xato";
            setError(errorMessage);
            throw err;
        }
    };

    const handleAddDailySubscription = async (formData) => {
        try {
            // Call daily subscription creation API
            await subscriptionAPI.createDaily(
                formData.userId,
                formData.amount,
                formData.paymentMethod
            );
            setIsDailySubscriptionModalOpen(false);
            // Refresh stats after adding subscription
            await fetchDashboardData();
        } catch (err) {
            console.error("Error adding daily subscription:", err);
            const errorMessage =
                err.response?.data?.detail || "Kunlik obuna yaratishda xato";
            setError(errorMessage);
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
                    <button
                        onClick={() => setIsDailySubscriptionModalOpen(true)}
                        className="px-6 py-2 rounded-lg text-white font-semibold transition"
                        style={{ backgroundColor: "#10b981" }}
                        onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#059669")
                        }
                        onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "#10b981")
                        }
                    >
                        Kunlik abonement sotish
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

            {/* Add Daily Subscription Modal */}
            <DailySubscriptionModal
                isOpen={isDailySubscriptionModalOpen}
                onClose={() => setIsDailySubscriptionModalOpen(false)}
                onSubmit={handleAddDailySubscription}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-700 hover:text-red-900 font-bold text-xl ml-4"
                    >
                        ×
                    </button>
                </div>
            )}

            {loading ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600">Statistika yuklanmoqda...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                                        {stat.isProfit
                                            ? stat.value.toLocaleString("uz-UZ")
                                            : stat.value}
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
            <div className="space-y-6">
                {/* First Row: Line Graph and Pie Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Clients Line Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            So'nggi 7 kunlik mijozlar
                        </h3>
                        <div className="h-64">
                            <svg
                                width="100%"
                                height="100%"
                                viewBox="0 0 600 250"
                                className="w-full"
                            >
                                {/* Gradient definition */}
                                <defs>
                                    <linearGradient
                                        id="areaGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="0%"
                                        y2="100%"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#ffd0c2"
                                            stopOpacity="0.8"
                                        />
                                        <stop
                                            offset="50%"
                                            stopColor="#ffe3db"
                                            stopOpacity="0.5"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#ffefea"
                                            stopOpacity="0.2"
                                        />
                                    </linearGradient>
                                </defs>
                                {/* Grid lines */}
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <line
                                        key={`grid-${i}`}
                                        x1="60"
                                        y1={50 + i * 40}
                                        x2="580"
                                        y2={50 + i * 40}
                                        stroke="#e5e7eb"
                                        strokeWidth="1"
                                    />
                                ))}

                                {/* Y-axis labels */}
                                {[0, 2, 4, 6, 8, 10].map((value, i) => (
                                    <text
                                        key={`y-label-${i}`}
                                        x="50"
                                        y={210 - i * 40}
                                        fontSize="12"
                                        fill="#6b7280"
                                        textAnchor="end"
                                    >
                                        {value}
                                    </text>
                                ))}

                                {/* X-axis */}
                                <line
                                    x1="60"
                                    y1="210"
                                    x2="580"
                                    y2="210"
                                    stroke="#d1d5db"
                                    strokeWidth="2"
                                />

                                {/* Y-axis */}
                                <line
                                    x1="60"
                                    y1="30"
                                    x2="60"
                                    y2="210"
                                    stroke="#d1d5db"
                                    strokeWidth="2"
                                />

                                {/* Line path with fill area */}
                                {(() => {
                                    const maxValue = 10;
                                    const points = dailyClientsData.map(
                                        (item, index) => {
                                            const x = 100 + index * 70;
                                            const y =
                                                210 -
                                                (item.count / maxValue) * 170;
                                            return `${x},${y}`;
                                        }
                                    );
                                    // Create a closed polygon for the fill area
                                    const fillPoints =
                                        points + ` 520,210 60,210`; // Close the path at the bottom
                                    return (
                                        <>
                                            <polygon
                                                points={fillPoints}
                                                fill="url(#areaGradient)"
                                            />
                                            <polyline
                                                points={points.join(" ")}
                                                fill="none"
                                                stroke="#ff5724"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </>
                                    );
                                })()}

                                {/* Data points (circles) */}
                                {dailyClientsData.map((item, index) => {
                                    const maxValue = 10;
                                    const x = 100 + index * 70;
                                    const y =
                                        210 - (item.count / maxValue) * 170;
                                    return (
                                        <g
                                            key={`point-${index}`}
                                            onMouseEnter={() =>
                                                setHoveredLinePoint(index)
                                            }
                                            onMouseLeave={() =>
                                                setHoveredLinePoint(null)
                                            }
                                            style={{ cursor: "pointer" }}
                                        >
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r={
                                                    hoveredLinePoint === index
                                                        ? "7"
                                                        : "5"
                                                }
                                                fill="#ff5724"
                                                style={{ transition: "r 0.2s" }}
                                            />
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r="3"
                                                fill="white"
                                            />
                                        </g>
                                    );
                                })}

                                {/* Tooltip for hovered point */}
                                {hoveredLinePoint !== null &&
                                    (() => {
                                        const item =
                                            dailyClientsData[hoveredLinePoint];
                                        const maxValue = 10;
                                        const x = 100 + hoveredLinePoint * 70;
                                        const y =
                                            210 - (item.count / maxValue) * 170;
                                        return (
                                            <g key="tooltip">
                                                <rect
                                                    x={x - 40}
                                                    y={y - 50}
                                                    width="80"
                                                    height="35"
                                                    fill="#1f2937"
                                                    rx="4"
                                                />
                                                <text
                                                    x={x}
                                                    y={y - 30}
                                                    fontSize="12"
                                                    fill="white"
                                                    textAnchor="middle"
                                                    fontWeight="bold"
                                                >
                                                    {item.day}
                                                </text>
                                                <text
                                                    x={x}
                                                    y={y - 15}
                                                    fontSize="14"
                                                    fill="#ff5724"
                                                    textAnchor="middle"
                                                    fontWeight="bold"
                                                >
                                                    {item.count} nafar
                                                </text>
                                            </g>
                                        );
                                    })()}

                                {/* X-axis labels */}
                                {dailyClientsData.map((item, index) => {
                                    const x = 100 + index * 70;
                                    return (
                                        <text
                                            key={`x-label-${index}`}
                                            x={x}
                                            y="235"
                                            fontSize="12"
                                            fill="#6b7280"
                                            textAnchor="middle"
                                        >
                                            {item.day.substring(0, 3)}
                                        </text>
                                    );
                                })}
                            </svg>
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
                                                            item.percentage ||
                                                            0;
                                                        const circumference = 502.4;
                                                        const dasharray =
                                                            (percentage / 100) *
                                                            circumference;
                                                        const color =
                                                            colors[
                                                                index %
                                                                    colors.length
                                                            ];
                                                        const dashoffset =
                                                            -offset;
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
                                                {
                                                    pieChartData[hoveredSegment]
                                                        .count
                                                }{" "}
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
                                                            backgroundColor:
                                                                color,
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

                {/* Revenue Chart - Full Width Below */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Oylik daromad
                    </h3>
                    <div className="h-64 flex items-end justify-between px-2 relative">
                        {monthlyData.map((item, index) => {
                            const maxProfit = Math.max(
                                ...monthlyData.map((d) => d.profit)
                            );
                            const isHovered = hoveredBar === index;
                            return (
                                <div
                                    key={item.month}
                                    className="flex flex-col items-center relative group"
                                    onMouseEnter={() => setHoveredBar(index)}
                                    onMouseLeave={() => setHoveredBar(null)}
                                >
                                    <div
                                        className={`w-8 bg-gradient-to-t from-red-400 to-red-300 rounded-t transition ${
                                            isHovered
                                                ? "opacity-100 shadow-lg"
                                                : "opacity-80 hover:opacity-100"
                                        }`}
                                        style={{
                                            height: `${
                                                maxProfit > 0
                                                    ? (item.profit /
                                                          maxProfit) *
                                                      200
                                                    : 0
                                            }px`,
                                        }}
                                    />
                                    {isHovered && (
                                        <div className="absolute bottom-full mb-2 bg-gray-900 text-white px-3 py-2 rounded text-sm font-semibold whitespace-nowrap">
                                            {item.profit.toLocaleString(
                                                "uz-UZ"
                                            )}
                                        </div>
                                    )}
                                    <span className="text-xs text-gray-600 mt-2">
                                        {item.month}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
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
});

export default DashboardContent;
