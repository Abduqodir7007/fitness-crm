import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardContent from "../components/DashboardContent";
import UsersContent from "../components/UsersContent";
import PricingContent from "../components/PricingContent";
import TrainersContent from "../components/TrainersContent";
import SchedulesContent from "../components/SchedulesContent";
import PaymentsContent from "../components/PaymentsContent";

export default function DashboardPage() {
    const { tab } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(tab || "dashboard");

    // Sync activeTab with URL
    useEffect(() => {
        if (tab) {
            setActiveTab(tab);
        }
    }, [tab]);

    // Update URL when tab changes
    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        navigate(`/dashboard/${newTab}`);
    };

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
            <div className="flex-1 ml-64 overflow-auto">
                <div className="p-8">{renderContent()}</div>
            </div>
        </div>
    );
}
