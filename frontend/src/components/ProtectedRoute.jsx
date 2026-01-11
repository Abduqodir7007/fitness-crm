import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const userRole = localStorage.getItem("user_role");

    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate page based on role
        if (userRole === "super-admin") {
            return <Navigate to="/dashboard/gyms" replace />;
        } else if (userRole === "admin") {
            return <Navigate to="/dashboard" replace />;
        } else if (userRole === "client") {
            return <Navigate to="/attendance" replace />;
        } else if (userRole === "trainer") {
            return <Navigate to="/trainer-dashboard" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return children;
}
