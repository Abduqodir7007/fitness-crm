import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import { capitalize } from "../utils/capitalize";
import { authAPI } from "../api/auth";
import { usersAPI } from "../api/users";
import { notificationsAPI } from "../api/notifications";

export default function UsersContent() {
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const websocketRef = useRef(null);
    const navigate = useNavigate();

    const getGymId = () => localStorage.getItem("gym_id");

    // Fetch users from database on component mount and setup WebSocket
    useEffect(() => {
        fetchUsers();
        fetchNotifications();
        setupWebSocket();

        // Cleanup WebSocket on component unmount
        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
            }
        };
    }, []);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const data = await usersAPI.getAll();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Foydalanuvchilarni yuklashda xato");
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const fetchNotifications = async () => {
        setIsLoadingNotifications(true);
        try {
            const data = await notificationsAPI.getNotifications();
            setNotifications(data || []);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            // Don't show error for notifications, it's optional
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    const setupWebSocket = () => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const backendHost =
            import.meta.env.VITE_API_URL?.replace("http://", "")
                .replace("https://", "")
                .replace("/api", "") || "localhost:8000";
        const wsUrl = `${protocol}//${backendHost}/api/users/ws/`;

        try {
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                // Request initial users list
                ws.send(JSON.stringify({ type: "users", gym_id: getGymId() }));
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === "users" && message.data) {
                        setUsers(message.data);
                    }
                } catch (err) {
                    // Silent error handling
                }
            };

            ws.onerror = () => {
                // Silent error handling
            };

            ws.onclose = () => {
                // Try to reconnect after 5 seconds
                setTimeout(() => {
                    setupWebSocket();
                }, 5000);
            };

            websocketRef.current = ws;
        } catch (err) {
            // Silent error handling
        }
    };

    const handleAddUser = async (formData) => {
        setIsLoading(true);
        setError(null);
        try {
            // Call backend signup endpoint with English field names
            await authAPI.signup(
                formData.first_name,
                formData.last_name,
                formData.phone_number,
                formData.password,
                formData.date_of_birth,
                formData.gender
            );

            // Send message through WebSocket to notify all clients of new user
            if (
                websocketRef.current &&
                websocketRef.current.readyState === WebSocket.OPEN
            ) {
                websocketRef.current.send(JSON.stringify({ type: "users", gym_id: getGymId() }));
            } else {
                // Fallback: fetch directly if WebSocket not ready
                await fetchUsers();
            }
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message || "Foydalanuvchini qo'shishda xato");
            console.error("Error adding user:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (
            !window.confirm(
                "Haqiqatan ham bu foydalanuvchini o'chirishni xohlaysizmi?"
            )
        ) {
            return;
        }

        try {
            await usersAPI.delete(userId);
            // Send message through WebSocket to notify other clients
            if (
                websocketRef.current &&
                websocketRef.current.readyState === WebSocket.OPEN
            ) {
                websocketRef.current.send(JSON.stringify({ type: "users" }));
            }
        } catch (err) {
            // Display backend error message or generic error
            const errorMessage =
                err.response?.data?.detail ||
                "Foydalanuvchini o'chirishda xato";
            setError(errorMessage);
            console.error("Error deleting user:", err);
        }
    };

    const handleViewUser = (user) => {
        navigate(`/user/${user.id}`);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        // Refresh users list after successful edit
        if (
            websocketRef.current &&
            websocketRef.current.readyState === WebSocket.OPEN
        ) {
            websocketRef.current.send(JSON.stringify({ type: "users" }));
        } else {
            fetchUsers();
        }
    };

    // Filter users based on search query
    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
            user.first_name?.toLowerCase().includes(query) ||
            user.last_name?.toLowerCase().includes(query) ||
            user.phone_number?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Mijozlar
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                    Barcha registratsiya qilingan mijozlarni ko'ring va
                    boshqaring.
                </p>
            </div>

            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
                <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Qidirish
                    </label>
                    <input
                        type="text"
                        placeholder="Ism, Familiya yoki Telefon..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 sm:px-6 py-2 rounded-lg text-white font-semibold transition whitespace-nowrap"
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

            {/* Customers List Section */}
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    🔔 Bildirishnomalar
                </h3>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    {isLoadingNotifications ? (
                        <p className="text-gray-600 text-center py-8">
                            Bildirishnomalar yuklanmoqda...
                        </p>
                    ) : notifications.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">
                            Bildirishnoma yo'q
                        </p>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {notifications.slice(0, 3).map((notification) => {
                                const daysLeft = notification.days_left;
                                const statusDisplay = `Abonement ${daysLeft} kunda tugaydi`;

                                return (
                                    <div
                                        key={notification.user_id}
                                        className="flex flex-col sm:flex-row sm:items-start justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition gap-3"
                                    >
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                                {capitalize(
                                                    notification.first_name
                                                )}{" "}
                                                {capitalize(
                                                    notification.last_name
                                                )}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                {notification.phone_number}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                                                {statusDisplay && (
                                                    <p className="text-xs text-gray-600">
                                                        {statusDisplay}
                                                    </p>
                                                )}
                                                {notification.status ===
                                                    "Yakunlanmoqda" &&
                                                    daysLeft > 0 && (
                                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                                                            {daysLeft} kun qoldi
                                                        </span>
                                                    )}
                                                {notification.status ===
                                                    "Tugagan" && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                                                            Tugagan
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                        <button
                                            className="px-4 py-2 rounded font-semibold transition text-sm"
                                            style={{
                                                backgroundColor: "#f6f7f9",
                                                color: "#333",
                                            }}
                                            onMouseEnter={(e) =>
                                            (e.target.style.backgroundColor =
                                                "#e8eaed")
                                            }
                                            onMouseLeave={(e) =>
                                            (e.target.style.backgroundColor =
                                                "#f6f7f9")
                                            }
                                        >
                                            💬 SMS
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddUser}
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                }}
                onSuccess={handleEditSuccess}
                user={selectedUser}
            />

            {isLoadingUsers ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600">
                        Foydalanuvchilar yuklanmoqda...
                    </p>
                </div>
            ) : users.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600">
                        Hali foydalanuvchi qo'shilmagan
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Ism
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Familiya
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Telefon
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                                        Tug'ilgan sana
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Amallar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-3 sm:px-6 py-4 text-center text-gray-600"
                                        >
                                            {searchQuery
                                                ? "Qidiruvni mos keladigan foydalanuvchi topilmadi"
                                                : "Foydalanuvchi yo'q"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {capitalize(user.first_name)}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600">
                                                {capitalize(user.last_name)}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600">
                                                {user.phone_number}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                                                {user.date_of_birth}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                                                <span
                                                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${user.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {user.is_active
                                                        ? "Faol"
                                                        : "Nofa'ol"}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm space-x-2 sm:space-x-3">
                                                <button
                                                    onClick={() =>
                                                        handleViewUser(user)
                                                    }
                                                    className="text-black hover:text-blue-600 transition"
                                                    title="Ko'rish"
                                                >
                                                    <svg
                                                        className="w-4 h-4 sm:w-5 sm:h-5 inline"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                            clipRule="evenodd"
                                                        ></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEditUser(user)
                                                    }
                                                    className="text-black hover:text-blue-600 transition"
                                                    title="Tahrirlash"
                                                >
                                                    <svg
                                                        className="w-4 h-4 sm:w-5 sm:h-5 inline"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                                            clipRule="evenodd"
                                                        ></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user.id
                                                        )
                                                    }
                                                    className="text-black hover:text-red-600 transition"
                                                    title="O'chirish"
                                                >
                                                    <svg
                                                        className="w-4 h-4 sm:w-5 sm:h-5 inline"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                        ></path>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
