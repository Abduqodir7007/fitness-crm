import { useState, useEffect } from "react";
import { dashboardAPI } from "../api/dashboard";

export default function PaymentsContent() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        setLoading(true);
        try {
            const data = await dashboardAPI.getPaymentHistory();
            setPayments(data);
        } catch (err) {
            console.error("Error fetching payment history:", err);
            setError("To'lovlar tarixini yuklashda xato");
        } finally {
            setLoading(false);
        }
    };

    // Format date to Uzbek locale
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("uz-UZ").format(amount);
    };

    const totalRevenue =
        payments.length > 0
            ? formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0)) +
              " so'm"
            : "0 so'm";
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
                    {loading ? (
                        <div className="p-8 text-center text-gray-600">
                            To'lovlar yuklanmoqda...
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-600">
                            {error}
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="p-8 text-center text-gray-600">
                            To'lov topilmadi
                        </div>
                    ) : (
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.map((payment, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {payment.user.first_name}{" "}
                                            {payment.user.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {formatCurrency(payment.amount)}{" "}
                                            so'm
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(payment.payment_date)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
