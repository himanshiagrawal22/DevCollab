import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(
          "http://localhost:5000/api/auth/me",
          {
            withCredentials: true,
          }
        );

        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Authentication check hone tak
  if (isAuthenticated === null) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading DevCollab...</p>
      </div>
    );
  }

  // Login nahi hai
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Login hai
  return children;
}

export default ProtectedRoute;