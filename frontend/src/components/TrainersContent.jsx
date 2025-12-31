import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { capitalize } from "../utils/capitalize";
import AddTrainerModal from "./AddTrainerModal";
import EditUserModal from "./EditUserModal";
import { authAPI } from "../api/auth";

export default function TrainersContent() {
    const navigate = useNavigate();
    const [trainers, setTrainers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const websocketRef = useRef(null);

    // Fetch trainers from HTTP endpoint first
    const fetchTrainers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/users`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "access_token"
                        )}`,
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                // Filter trainers only
                const trainersOnly = data.filter(
                    (user) => user.role === "trainer"
                );
                setTrainers(trainersOnly);
            }
        } catch (err) {
            console.error("Error fetching trainers:", err);
            setError("Trenerlarni yuklashda xato");
        } finally {
            setIsLoading(false);
        }
    };

    // Connect to WebSocket for real-time updates
    const setupWebSocket = () => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const backendHost =
            import.meta.env.VITE_API_URL?.replace("http://", "")
                .replace("https://", "")
                .replace("/api", "") || "localhost:8000";
        const wsUrl = `${protocol}//${backendHost}/api/users/ws/trainers`;

        try {
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("Trainers WebSocket connected");
                ws.send(JSON.stringify({ type: "trainers" }));
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === "trainers" && message.data) {
                        setTrainers(message.data);
                    }
                } catch (err) {
                    console.error("WebSocket message error:", err);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            ws.onclose = () => {
                console.log("Trainers WebSocket disconnected");
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

    // Setup on component mount
    useEffect(() => {
        const initialize = async () => {
            // First, fetch trainers from HTTP endpoint
            await fetchTrainers();
            // Then setup websocket for real-time updates
            setupWebSocket();
        };

        initialize();

        // Cleanup WebSocket on unmount
        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
            }
        };
    }, []);

    // Handle add trainer
    const handleAddTrainer = async (formData) => {
        try {
            await authAPI.signup(
                formData.first_name,
                formData.last_name,
                formData.phone_number,
                formData.password,
                formData.date_of_birth,
                formData.gender,
                "trainer" // Pass role as trainer
            );

            // Send message through WebSocket to notify all clients of new trainer
            if (
                websocketRef.current &&
                websocketRef.current.readyState === WebSocket.OPEN
            ) {
                websocketRef.current.send(JSON.stringify({ type: "trainers" }));
            } else {
                // Fallback: fetch directly if WebSocket not ready
                await fetchTrainers();
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error adding trainer:", error);
            throw error;
        }
    };

    // Handle delete trainer
    const handleDeleteTrainer = async (trainerId) => {
        if (window.confirm("Haqiqatan ham bu trenerni o'chirmoqchisiz?")) {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/users/delete/${trainerId}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "access_token"
                            )}`,
                        },
                    }
                );
                if (response.ok) {
                    // WebSocket will broadcast the update
                    if (websocketRef.current?.readyState === WebSocket.OPEN) {
                        websocketRef.current.send(
                            JSON.stringify({ type: "trainers" })
                        );
                    }
                } else {
                    setError("Trenerni o'chirishda xato");
                }
            } catch (err) {
                console.error("Error deleting trainer:", err);
                setError("Trenerni o'chirishda xato");
            }
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Trenerlar
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                    Barcha trenerlarni ko'ring va boshqaring.
                </p>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 sm:px-6 py-2 rounded-lg text-white font-semibold transition text-sm sm:text-base"
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

            {/* Add Trainer Modal */}
            <AddTrainerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddTrainer}
            />

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-12">
                    <p className="text-gray-600">Trenerlar yuklanmoqda...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Trainers Grid */}
            {!isLoading && trainers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                    <p className="text-gray-600 text-lg">
                        Hozircha trener yo'q. Yangi trener qo'shishni boshlang.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trainers.map((trainer) => (
                        <div
                            key={trainer.id}
                            onClick={() => navigate(`/trainer/${trainer.id}`)}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {trainer.first_name?.charAt(0) || "T"}
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        trainer.is_active
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                    }`}
                                >
                                    {trainer.is_active ? "Faol" : "Pauzada"}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {capitalize(trainer.first_name)}{" "}
                                {capitalize(trainer.last_name)}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {trainer.phone_number}
                            </p>
                            <div className="space-y-2 mb-4 border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        Roli:
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        {trainer.role || "trainer"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        Tug'ilgan sana:
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        {trainer.date_of_birth || "—"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTrainer(trainer);
                                        setIsEditModalOpen(true);
                                    }}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm"
                                >
                                    ✏️ Tahrirlash
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTrainer(trainer.id);
                                    }}
                                    className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition text-sm"
                                >
                                    🗑️ O'chirish
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Edit Trainer Modal */}
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedTrainer(null);
                }}
                user={selectedTrainer}
                onSuccess={() => {
                    // Refresh trainers list after update
                    fetchTrainers();
                    // Also trigger WebSocket update if available
                    if (websocketRef.current?.readyState === WebSocket.OPEN) {
                        websocketRef.current.send(
                            JSON.stringify({ type: "trainers" })
                        );
                    }
                }}
            />
        </div>
    );
}
