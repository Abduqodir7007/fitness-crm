import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const userRole = localStorage.getItem("user_role");
    console.log("[PROTECTED] Checking access:", { userRole, allowedRoles });
    console.log("[PROTECTED] All localStorage:", {
        access_token: localStorage.getItem("access_token")
            ? "exists"
            : "missing",
        user_role: localStorage.getItem("user_role"),
        is_superuser: localStorage.getItem("is_superuser"),
    });

    if (!userRole) {
        console.log("[PROTECTED] No user_role, redirecting to /login");
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        console.log(
            "[PROTECTED] Role not allowed:",
            userRole,
            "not in",
            allowedRoles
        );
        // Redirect to appropriate page based on role
        if (userRole === "admin") {
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
