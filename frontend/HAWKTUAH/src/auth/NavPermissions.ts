import type { UserRole } from "./MapUserRole";

export type NavKey =
  | "dashboard"
  | "perfil"
  | "cursos"
  | "formandos"
  | "formadores"
  | "horarios"
  | "chatbot";

export const NAV_PERMISSIONS: Record<UserRole, NavKey[]> = {
  ADMIN: [
    "dashboard",
    "perfil",
    "cursos",
    "formandos",
    "formadores",
    "horarios",
    "chatbot",
  ],

  FORMADOR: [
    "dashboard",
    "perfil",
    "cursos",
    "formandos",
    "horarios",
    "chatbot"
  ],

  FORMANDO: [
    "dashboard",
    "perfil",
    "cursos",
    "horarios",
    "chatbot"
  ],

  GERAL: [
    "dashboard",
    "perfil",
    "cursos",
    "chatbot"
  ],
};
