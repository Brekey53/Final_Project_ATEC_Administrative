export type UserRole = "ADMIN" | "FORMADOR" | "FORMANDO" | "GERAL";

export function mapUserRole(tipo: number): UserRole {
  switch (tipo) {
    case 1: // admin
    case 4: // administrativo
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
