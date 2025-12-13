import { useState, useEffect, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardContent from "../components/DashboardContent";
import UsersContent from "../components/UsersContent";
import PricingContent from "../components/PricingContent";
import TrainersContent from "../components/TrainersContent";
import SchedulesContent from "../components/SchedulesContent";
import PaymentsContent from "../components/PaymentsContent";

const DashboardPageContent = memo(function DashboardPageContent({
    activeTab,
    handleTabChange,
}) {
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
            case "schedules":
                return <SchedulesContent />;
            case "reports":
                return <PaymentsContent />;
            default:
                return <DashboardContent />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
            <main className="flex-1 overflow-auto ml-64 p-8">
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
