import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authService } from "../auth/AuthService";

export default function PrivateRoute() {
  const location = useLocation();
  const user = authService.decodeToken();

  if (!user) {
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
