import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Wraps a page that should only be visible to logged-in users.
// If not authenticated, we redirect to /login INSTEAD of rendering
// children at all — the protected page's code never even runs.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}