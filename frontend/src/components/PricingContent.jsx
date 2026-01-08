import { useState, useEffect } from "react";
import AddPricingModal from "./AddPricingModal";
import EditPricingModal from "./EditPricingModal";
import { pricingAPI } from "../api/pricing";

export default function PricingContent() {
    const [plans, setPlans] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch pricing plans on component mount
    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const data = await pricingAPI.getAll();
            setPlans(data);
        } catch (err) {
            console.error("Error fetching plans:", err);
            setError("Tariflarni yuklashda xato");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPlan = async (formData) => {
        try {
            await pricingAPI.create(
                formData.name,
                formData.price,
                formData.duration_days
            );
            // Refresh plans list
            await fetchPlans();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error adding plan:", err);
            throw err;
        }
    };

    const handleEditPlan = (plan) => {
        setSelectedPlan(plan);
        setIsEditModalOpen(true);
    };

    const handleUpdatePlan = async (planId, formData) => {
        try {
            await pricingAPI.update(
                planId,
                formData.name,
                formData.price,
                formData.duration_days
            );
            // Refresh plans list
            await fetchPlans();
            setIsEditModalOpen(false);
            setSelectedPlan(null);
        } catch (err) {
            console.error("Error updating plan:", err);
            setError("Tarifni yangilashda xato");
            throw err;
        }
    };

    const handleDeletePlan = async (planId) => {
        if (window.confirm("Haqiqatan ham bu tarifni o'chirmoqchisiz?")) {
            try {
                await pricingAPI.delete(planId);
                // Refresh plans list
                await fetchPlans();
            } catch (err) {
                setError("Tarifni o'chirishda xato");
                console.error("Error deleting plan:", err);
            }
        }
    };

    const formatPrice = (price) => {
        return price?.toLocaleString("uz-UZ") || "0";
    };

    const formatDuration = (days) => {
        if (days === 30) return "1 oy";
        if (days === 90) return "3 oy";
        if (days === 180) return "6 oy";
        if (days === 365) return "1 yil";
        return `${days} kun`;
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Tariflar
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                    Barcha obunalik tariflarni boshqaring.
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
                    + Yangi Tarif
                </button>
            </div>

            {/* Add Pricing Modal */}
            <AddPricingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddPlan}
            />

            {/* Edit Pricing Modal */}
            <EditPricingModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedPlan(null);
                }}
                onSubmit={handleUpdatePlan}
                plan={selectedPlan}
            />

            {/* Error State */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-12">
                    <p className="text-gray-600">Tariflar yuklanmoqda...</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && plans.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                    <p className="text-gray-600 text-lg">
                        Hozircha tarif yo'q. Yangi tarif qo'shishni boshlang.
                    </p>
                </div>
            )}

            {/* Plans Grid */}
            {!isLoading && plans.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition border-l-4"
                            style={{ borderLeftColor: "#f0453f" }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                        {plan.type}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        {formatDuration(plan.duration_days)}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                    {plan.is_active ? "Faol" : "Nofaol"}
                                </span>
                            </div>
                            <div className="space-y-3 mb-4">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Narx
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatPrice(plan.price)} so'm
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEditPlan(plan)}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm"
                                >
                                    ✏️ Tahrirlash
                                </button>
                                <button
                                    onClick={() => handleDeletePlan(plan.id)}
                                    className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition text-sm"
                                >
                                    🗑️ O'chirish
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
