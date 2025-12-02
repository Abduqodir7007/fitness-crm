export default function PaymentsContent() {
    const payments = [
        {
            id: 1,
            client: "Ali Valiyev",
            amount: "150,000",
            date: "2024-11-28",
            plan: "Standart",
            status: "Qabul qilindi",
        },
        {
            id: 2,
            client: "Nodira Qodir",
            amount: "300,000",
            date: "2024-11-28",
            plan: "Premium",
            status: "Qabul qilindi",
        },
        {
            id: 3,
            client: "Javohir Xo'jayev",
            amount: "500,000",
            date: "2024-11-27",
            plan: "VIP",
            status: "Kutilmoqda",
        },
        {
            id: 4,
            client: "Malika Rahimova",
            amount: "150,000",
            date: "2024-11-27",
            plan: "Standart",
            status: "Qabul qilindi",
        },
        {
            id: 5,
            client: "Sardor Umarov",
            amount: "400,000",
            date: "2024-11-26",
            plan: "Oyliq",
            status: "Rad etildi",
        },
    ];

    const totalRevenue = "1,850,000 so'm";
    const todayPayments = "450,000 so'm";

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">To'lovlar</h2>
                <p className="text-gray-600">
                    Barcha to'lovlarni va daromadlarni boshqaring.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Jami Daromad</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {totalRevenue}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Bugungi To'lovlar</p>
                    <p
                        className="text-2xl font-bold text-gray-900 mt-2"
                        style={{ color: "#f0453f" }}
                    >
                        {todayPayments}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Kutilgan To'lovlar</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        750,000 so'm
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        To'lovlar Tarixi
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Mijoz
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Summa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Sana
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Plan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {payments.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {payment.client}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        {payment.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {payment.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {payment.plan}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                payment.status ===
                                                "Qabul qilindi"
                                                    ? "bg-green-100 text-green-800"
                                                    : payment.status ===
                                                      "Kutilmoqda"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {payment.status}
                                        </span>
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
