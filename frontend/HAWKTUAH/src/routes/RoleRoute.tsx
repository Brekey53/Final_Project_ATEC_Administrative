import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../auth/AuthService";

type Props = {
  permitido: number[];
  path?: string;
};

export default function RoleRoute({
  permitido,
  path = "/dashboard",
}: Props) {
  const user = authService.decodeToken();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const tipo = Number(user.tipoUtilizador);

  if (!permitido.includes(tipo)) {
    return <Navigate to={path} replace />;
  }

  return <Outlet />;
}
