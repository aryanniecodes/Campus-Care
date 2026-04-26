import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // If no token exists, redirect to the login page
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the child components
  return children;
};

export default ProtectedRoute;
