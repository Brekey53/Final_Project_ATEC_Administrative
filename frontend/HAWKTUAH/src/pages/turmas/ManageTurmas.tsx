import React from "react";
import { authService } from "../../auth/AuthService";
import { mapUserRole } from "../../auth/MapUserRole";

import FormadorTurmas from "../../components/turmas/FormadorTurmas"
import GeralTurmas from "../../components/turmas/GeralTurmas"
import AdminTurmas from "../../components/turmas/AdminTurmas"
import FormandoTurmas from "../../components/turmas/FormandoTurmas"

export default function Turmas() {
  const user = authService.decodeToken();
  const role = user ? mapUserRole(Number(user.tipoUtilizador)) : "GERAL";

  if (role === "FORMADOR") {
    return <FormadorTurmas />;
  }

  if (role === "ADMIN") {
    return <AdminTurmas />;
  }

  if (role === "GERAL") {
    return <GeralTurmas />;
  }

  return <FormandoTurmas />;
}
