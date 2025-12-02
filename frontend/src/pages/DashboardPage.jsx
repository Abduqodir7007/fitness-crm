import { useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardContent from "../components/DashboardContent";
import UsersContent from "../components/UsersContent";
import PricingContent from "../components/PricingContent";
import TrainersContent from "../components/TrainersContent";
import SchedulesContent from "../components/SchedulesContent";
import PaymentsContent from "../components/PaymentsContent";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("dashboard");

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
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 ml-64 overflow-auto">
                <div className="p-8">{renderContent()}</div>
            </div>
        </div>
    );
}
