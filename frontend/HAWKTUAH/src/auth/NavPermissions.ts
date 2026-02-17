import type { UserRole } from "./MapUserRole";

/**
 * Chaves de navegação correspondentes às rotas/permissões.
 */
export type NavKey =
  | "dashboard"
  | "perfil"
  | "cursos"
  | "formandos"
  | "formadores"
  | "turmas"
  | "turma";

/**
 * Define as permissões de navegação por tipo de utilizador.
 */
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
