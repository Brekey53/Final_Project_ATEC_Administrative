import type { UserRole } from "./MapUserRole";

export type NavKey =
  | "dashboard"
  | "perfil"
  | "cursos"
  | "formandos"
  | "formadores"
  | "horarios"
  | "chatbot"
  | "turmas";

export const NAV_PERMISSIONS: Record<UserRole, NavKey[]> = {
  ADMIN: [
    "dashboard",
    "perfil",
    "cursos",
    "formandos",
    "formadores",
    "horarios",
    "chatbot",
    "turmas"
  ],

  FORMADOR: [
    "dashboard",
    "perfil",
    "cursos",
    "formandos",
    "horarios",
    "chatbot",
    "turmas"
  ],

  FORMANDO: [
    "dashboard",
    "perfil",
    "cursos",
    "horarios",
    "chatbot",
    "turmas"
  ],

  GERAL: [
    "dashboard",
    "perfil",
    "cursos",
    "chatbot",
    "turmas"
  ],
};
