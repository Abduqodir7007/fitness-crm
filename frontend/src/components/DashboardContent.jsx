export default function DashboardContent() {
    const stats = [
        {
            label: "Jami Mijozlar",
            value: "1,234",
            icon: "👥",
            color: "#f0453f",
        },
        { label: "Faol Obunalar", value: "856", icon: "✓", color: "#10b981" },
        {
            label: "Bugun Kiritilgan",
            value: "12",
            icon: "📝",
            color: "#3b82f6",
        },
        {
            label: "Bugun To'lovlar",
            value: "$4,230",
            icon: "💰",
            color: "#f59e0b",
        },
    ];

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

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-600">
                    Salom, Admin! Bugungi statistikani ko'ring.
                </p>
            </div>

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
