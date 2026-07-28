import { Navigate } from "react-router-dom";
import { toast } from "sonner";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        toast.error("Please login first to access the dashboard.");
        return <Navigate to="/auth" replace />;
    }

    // Case-insensitive role check for admin access
    const normalizedRole = role ? role.trim().toLowerCase() : "";
    const isAdmin = !role || ["admin", "super_admin", "superadmin", "administrator"].includes(normalizedRole);

    if (!isAdmin) {
        toast.error("You do not have permission to access the dashboard.");
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
