import { useState, useEffect } from "react";
import { dashboardAPI } from "../api/dashboard";

export default function PaymentsContent() {
    const [payments, setPayments] = useState([]);
    const [dailyProfit, setDailyProfit] = useState(0);
    const [weeklyProfit, setWeeklyProfit] = useState(0);
    const [monthlyProfit, setMonthlyProfit] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentData, profitData] = await Promise.all([
                dashboardAPI.getPaymentHistory(),
                dashboardAPI.getProfit(),
            ]);
            setPayments(paymentData);
            setDailyProfit(profitData.daily_profit || 0);
            setWeeklyProfit(profitData.weekly_profit || 0);
            setMonthlyProfit(profitData.monthly_profit || 0);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Ma'lumotni yuklashda xato");
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

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    To'lovlar
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                    Barcha to'lovlarni va daromadlarni boshqaring.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-gray-600">
                        Bugungi Daromad
                    </p>
                    <p
                        className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2"
                        style={{ color: "#f0453f" }}
                    >
                        {formatCurrency(dailyProfit)} so'm
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-gray-600">
                        Haftalik Daromad
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                        {formatCurrency(weeklyProfit)} so'm
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-gray-600">
                        Oylik Daromad
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                        {formatCurrency(monthlyProfit)} so'm
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
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
