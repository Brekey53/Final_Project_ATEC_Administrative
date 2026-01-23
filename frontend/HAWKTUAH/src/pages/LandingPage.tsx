import { useState } from "react";
import DashboardIntro from "../components/DashboardIntro";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import FormadorDashboard from "../components/dashboard/FormadorDashboard";
import FormandoDashboard from "../components/dashboard/FormandoDashboard";
import GeralDashboard from "../components/dashboard/GeralDashboard";
import { authService } from "../auth/AuthService";
import { mapUserRole } from "../auth/MapUserRole";

export default function Dashboard() {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem("dashboardIntroShown");
  });

  const user = authService.decodeToken();
  if (!user) 
    return null;

  const role = mapUserRole(Number(user.tipoUtilizador));

  if (showIntro) {
    return (
      <DashboardIntro
        onFinish={() => {
          sessionStorage.setItem("dashboardIntroShown", "true");
          setShowIntro(false);
        }}
      />
    );
  }

  switch (role) {
    case "ADMIN":
      return <AdminDashboard />;

    case "FORMADOR":
      return <FormadorDashboard />;

    case "FORMANDO":
      return <FormandoDashboard />;

    case "GERAL":
    default:
      return <GeralDashboard />;
  }
}
