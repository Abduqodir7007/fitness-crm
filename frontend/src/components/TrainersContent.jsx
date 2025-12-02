export default function TrainersContent() {
    const trainers = [
        {
            id: 1,
            name: "Rustam Abdullayev",
            specialty: "Fitness",
            clients: 24,
            rating: 4.8,
            status: "Faol",
        },
        {
            id: 2,
            name: "Zulxumor Raximova",
            specialty: "Yoga",
            clients: 18,
            rating: 4.9,
            status: "Faol",
        },
        {
            id: 3,
            name: "Firdavs Qosimov",
            specialty: "Boxing",
            clients: 32,
            rating: 4.7,
            status: "Faol",
        },
        {
            id: 4,
            name: "Sevara Abdullayeva",
            specialty: "Pilates",
            clients: 15,
            rating: 4.6,
            status: "Pauzada",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Trenerlar</h2>
                <p className="text-gray-600">
                    Barcha trenerlarni ko'ring va boshqaring.
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
                    + Yangi Trener
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainers.map((trainer) => (
                    <div
                        key={trainer.id}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                                {trainer.name.charAt(0)}
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    trainer.status === "Faol"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                                {trainer.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {trainer.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {trainer.specialty}
                        </p>
                        <div className="space-y-2 mb-4 border-t pt-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                    Mijozlar:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {trainer.clients}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                    Reyting:
                                </span>
                                <span className="font-semibold text-yellow-500">
                                    ⭐ {trainer.rating}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm">
                                Tahrirlash
                            </button>
                            <button className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition text-sm">
                                O'chirish
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
