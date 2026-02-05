import type { UserRole } from "./MapUserRole";

export type NavKey =
  | "dashboard"
  | "perfil"
  | "cursos"
  | "formandos"
  | "formadores"
  | "turmas"
  | "turma";

export const NAV_PERMISSIONS: Record<UserRole, NavKey[]> = {
  ADMIN: [
    "dashboard",
    "perfil",
    "cursos",
    "formandos",
    "formadores",
    "turmas"
  ],

  FORMADOR: [
    "dashboard",
    "perfil",
    "cursos",
    "formandos",
    "turmas"
  ],

  FORMANDO: [
    "dashboard",
    "perfil",
    "cursos",
    "turma"
  ],

  GERAL: [
    "dashboard",
    "perfil",
    "cursos",
    "turmas"
  ],
};
