import type { UserRole } from "./MapUserRole";

export type NavKey =
  | "dashboard"
  | "perfil"
  | "cursos"
  | "formandos"
  | "formadores"
  | "horarios"
  | "assistente";

export const NAV_PERMISSIONS: Record<UserRole, NavKey[]> = {
  ADMIN: [
    "dashboard",
    "perfil",
    "cursos",
    "formandos",
    "formadores",
    "horarios",
    "assistente",
  ],

  FORMADOR: [
    "dashboard",
    "perfil",
    "cursos",
    "formandos",
    "horarios",
    "assistente"
  ],

  FORMANDO: [
    "dashboard",
    "perfil",
    "cursos",
    "horarios",
    "assistente"
  ],

  GERAL: [
    "dashboard",
    "perfil",
    "cursos",
    "assistente"
  ],
};
