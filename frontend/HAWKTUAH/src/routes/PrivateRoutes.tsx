import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authService } from "../auth/AuthService";

export default function PrivateRoute() {
  const location = useLocation();
  const token = authService.decodeToken();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
