import { useState, useEffect, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardContent from "../components/DashboardContent";
import UsersContent from "../components/UsersContent";
import PricingContent from "../components/PricingContent";
import TrainersContent from "../components/TrainersContent";
import PaymentsContent from "../components/PaymentsContent";
import AttendanceContent from "../components/AttendanceContent";

const DashboardPageContent = memo(function DashboardPageContent({
    activeTab,
    handleTabChange,
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <DashboardContent />;
            case "users":
                return <UsersContent />;
            case "pricing":
                return <PricingContent />;
            case "trainers":
                return <TrainersContent />;
            case "reports":
                return <PaymentsContent />;
            case "attendance":
                return <AttendanceContent />;
            default:
                return <DashboardContent />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-30 flex items-center px-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
                <h1 className="ml-4 font-bold text-lg text-gray-900">
                    Fitness CRM
                </h1>
            </div>

            <main className="flex-1 overflow-auto lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
                {renderContent()}
            </main>
        </div>
    );
});

export default function DashboardPage() {
    const { tab } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(tab || "dashboard");

    useEffect(() => {
        if (tab) {
            setActiveTab(tab);
        }
    }, [tab]);

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        navigate(`/dashboard/${newTab}`);
    };

    return (
        <DashboardPageContent
            activeTab={activeTab}
            handleTabChange={handleTabChange}
        />
    );
}
