import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const dashboardPaths = {
  customer: "/CustomerHome",
  provider: "/ProviderHome",
  admin: "/AdminDashboard",
};

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) {
    return <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={dashboardPaths[user.role] || "/login"} replace />;
  }

  return children;
}
