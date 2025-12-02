export default function UsersContent() {
    const users = [
        {
            id: 1,
            name: "Ali Valiyev",
            phone: "+998901234567",
            email: "ali@example.com",
            status: "Faol",
            membership: "Premium",
        },
        {
            id: 2,
            name: "Nodira Qodir",
            phone: "+998901234568",
            email: "nodira@example.com",
            status: "Faol",
            membership: "Standard",
        },
        {
            id: 3,
            name: "Javohir Xo'jayev",
            phone: "+998901234569",
            email: "javohir@example.com",
            status: "Pauzada",
            membership: "Premium",
        },
        {
            id: 4,
            name: "Malika Rahimova",
            phone: "+998901234570",
            email: "malika@example.com",
            status: "Faol",
            membership: "Standard",
        },
        {
            id: 5,
            name: "Sardor Umarov",
            phone: "+998901234571",
            email: "sardor@example.com",
            status: "Tugatilgan",
            membership: "Premium",
        },
        {
            id: 6,
            name: "Gulnora Mirzaeva",
            phone: "+998901234572",
            email: "gulnora@example.com",
            status: "Faol",
            membership: "Standard",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Mijozlar</h2>
                <p className="text-gray-600">
                    Barcha registratsiya qilingan mijozlarni ko'ring va
                    boshqaring.
                </p>
            </div>

            <div className="flex justify-end">
                <button
                    className="px-6 py-2 rounded-lg text-white font-semibold transition"
                    style={{ backgroundColor: "#f0453f" }}
                    onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#d63a34")
                    }
                    onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#f0453f")
                    }
                >
                    + Yangi Mijoz
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Obunalar
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Amallar
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {user.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {user.email}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {user.membership}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <button className="text-blue-600 hover:text-blue-900 font-medium">
                                            Tahrirlash
                                        </button>
                                        <button className="text-red-600 hover:text-red-900 font-medium">
                                            O'chirish
                                        </button>
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
