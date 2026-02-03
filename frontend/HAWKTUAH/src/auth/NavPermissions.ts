import type { UserRole } from "./MapUserRole";

export type NavKey =
  | "dashboard"
  | "perfil"
  | "cursos"
  | "formandos"
  | "formadores"
  | "horarios"
  | "chatbot"
  | "turmas"
  | "turma";

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
    "turma"
  ],

  GERAL: [
    "dashboard",
    "perfil",
    "cursos",
    "chatbot",
    "turmas"
  ],
};
