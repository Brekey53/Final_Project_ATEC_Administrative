export type UserRole = "ADMIN" | "FORMADOR" | "FORMANDO" | "GERAL";

/** Mapeia o tipo numérico do backend (TipoUtilizador) para o role usado no frontend */
export function mapUserRole(tipo: number): UserRole {
  switch (tipo) {
    case 1: // admin
    case 4: // administrativo
    case 6: // superadmin 
      return "ADMIN";

    case 2:
      return "FORMADOR";

    case 3:
      return "FORMANDO";

    case 5:
    default:
      return "GERAL";
  }
}
