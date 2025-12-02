export default function SchedulesContent() {
    const schedules = [
        {
            id: 1,
            trainer: "Rustam Abdullayev",
            class: "Fitness Boshlang'ich",
            time: "09:00 - 10:00",
            day: "Dushanba",
            capacity: "15/20",
            status: "Faol",
        },
        {
            id: 2,
            trainer: "Zulxumor Raximova",
            class: "Yoga Oʻrta",
            time: "10:30 - 11:30",
            day: "Seshanba",
            capacity: "12/15",
            status: "Faol",
        },
        {
            id: 3,
            trainer: "Firdavs Qosimov",
            class: "Boxing Boshlang'ich",
            time: "18:00 - 19:30",
            day: "Chorshanba",
            capacity: "8/10",
            status: "Faol",
        },
        {
            id: 4,
            trainer: "Sevara Abdullayeva",
            class: "Pilates",
            time: "16:00 - 17:00",
            day: "Payshanba",
            capacity: "10/12",
            status: "Faol",
        },
        {
            id: 5,
            trainer: "Rustam Abdullayev",
            class: "Fitness Advanced",
            time: "19:00 - 20:30",
            day: "Juma",
            capacity: "18/20",
            status: "Faol",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Jadval</h2>
                <p className="text-gray-600">
                    Barcha darslar va jadvalni boshqaring.
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
                    + Yangi Dars
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Trener
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Dars Nomi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Vaqti
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Kun
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Sig\'im
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {schedules.map((schedule) => (
                                <tr
                                    key={schedule.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {schedule.trainer}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {schedule.class}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {schedule.time}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {schedule.day}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center">
                                            <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${
                                                            (parseInt(
                                                                schedule.capacity
                                                            ) /
                                                                parseInt(
                                                                    schedule.capacity.split(
                                                                        "/"
                                                                    )[1]
                                                                )) *
                                                            100
                                                        }%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {schedule.capacity}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                            {schedule.status}
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
