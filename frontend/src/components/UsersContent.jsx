import { useState, useEffect, useRef } from "react";
import AddUserModal from "./AddUserModal";
import { authAPI } from "../api/auth";
import { usersAPI } from "../api/users";

export default function UsersContent() {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const websocketRef = useRef(null);

    // Fetch users from database on component mount and setup WebSocket
    useEffect(() => {
        fetchUsers();
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
                console.log("WebSocket connected");
                // Request initial users list
                ws.send(JSON.stringify({ type: "users" }));
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === "users" && message.data) {
                        setUsers(message.data);
                    }
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            ws.onclose = () => {
                console.log("WebSocket disconnected");
                // Try to reconnect after 5 seconds
                setTimeout(() => {
                    setupWebSocket();
                }, 5000);
            };

            websocketRef.current = ws;
        } catch (err) {
            console.error("Error setting up WebSocket:", err);
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
                websocketRef.current.send(JSON.stringify({ type: "users" }));
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
            setError("Foydalanuvchini o'chirishda xato");
            console.error("Error deleting user:", err);
        }
    };

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
                    onClick={() => setIsModalOpen(true)}
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

            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddUser}
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
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Ism
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Familiya
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Telefon
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Tug'ilgan sana
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Amallar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {user.first_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {user.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {user.phone_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {user.date_of_birth}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    user.is_active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {user.is_active
                                                    ? "Faol"
                                                    : "Nofa'ol"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                                            <button
                                                className="text-black hover:text-blue-600 transition"
                                                title="Tahrirlash"
                                            >
                                                <svg
                                                    className="w-5 h-5 inline"
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
                                                    handleDeleteUser(user.id)
                                                }
                                                className="text-black hover:text-red-600 transition"
                                                title="O'chirish"
                                            >
                                                <svg
                                                    className="w-5 h-5 inline"
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
