import { Navigate } from "react-router-dom";
import { toast } from "sonner";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        toast.error("Please login first to access the dashboard.");
        return <Navigate to="/auth" replace />;
    }

    // Assuming dashboard is only for admins
    if (role !== "Admin") {
        toast.error("You do not have permission to access the dashboard.");
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
