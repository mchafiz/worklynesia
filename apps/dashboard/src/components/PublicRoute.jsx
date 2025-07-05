import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
