export default function PricingContent() {
    const pricing = [
        {
            id: 1,
            name: "Standart",
            price: "150,000",
            duration: "1 oy",
            members: 45,
            status: "Faol",
        },
        {
            id: 2,
            name: "Premium",
            price: "300,000",
            duration: "3 oy",
            members: 78,
            status: "Faol",
        },
        {
            id: 3,
            name: "VIP",
            price: "500,000",
            duration: "6 oy",
            members: 32,
            status: "Faol",
        },
        {
            id: 4,
            name: "Oyliq",
            price: "400,000",
            duration: "1 yil",
            members: 25,
            status: "Faol",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Tariflar</h2>
                <p className="text-gray-600">
                    Barcha obunalik tariflarni boshqaring.
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
                    + Yangi Tarif
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pricing.map((plan) => (
                    <div
                        key={plan.id}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-l-4"
                        style={{ borderLeftColor: "#f0453f" }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {plan.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {plan.duration}
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                {plan.status}
                            </span>
                        </div>
                        <div className="space-y-3 mb-4">
                            <div>
                                <p className="text-sm text-gray-600">Narx</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {plan.price} so'm
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Faol Mijozlar
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {plan.members} nafar
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                                Tahrirlash
                            </button>
                            <button className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition">
                                Ko'proq
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
