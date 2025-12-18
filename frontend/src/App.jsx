import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ViewUserPage from "./pages/ViewUserPage";
import ClientAttendancePage from "./pages/ClientAttendancePage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/:tab"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user/:userId"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <ViewUserPage />
                    </ProtectedRoute>
                }
            />

            {/* Client Routes */}
            <Route
                path="/attendance"
                element={
                    <ProtectedRoute allowedRoles={["client"]}>
                        <ClientAttendancePage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;
