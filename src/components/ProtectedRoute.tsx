
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    const user = localStorage.getItem("user");
    if (!user) return false;
    
    try {
      const userData = JSON.parse(user);
      return userData.isLoggedIn === true;
    } catch (error) {
      return false;
    }
  };
  
  if (!isAuthenticated()) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
