import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Estatísticas gerais para o dashboard.
 */
export interface DashboardStats {
  cursosDecorrer: number;
  turmasConcluidas: number;
  formandosAtivos: number;
  formadores: number;
  salas: number;
  modulos: number;
}
/**
 * Representa um curso em andamento.
 */
export interface CursosADecorrer {
  idTurma: number;
  nomeTurma: string;
  nomeCurso: string;
  dataInicio: string;
  dataFim: string;
}

/**
 * Representa uma turma prestes a iniciar.
 */
export interface TurmaAIniciar {
  idTurma: number;
  nomeTurma: string;
  nomeCurso: string;
  dataInicio: string;
  dataFim: string;
}

/**
 * Estatísticas de cursos agrupados por área.
 */
export interface CursosPorArea {
  idArea: number;
  nomeArea: string;
  totalCursos: number;
}

/**
 * Obtém as estatísticas gerais do dashboard.
 * @returns Dados estatísticos.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await axios.get(`${API_BASE_URL}/dashboard/stats`);
  return res.data;
}

/**
 * Obtém a lista de cursos a decorrer.
 * @returns Lista de cursos/turmas.
 */
export async function getCursosADecorrer() {
  const res = await axios.get(`${API_BASE_URL}/dashboard/turmasDecorrer`);
  return res.data;
}

/**
 * Obtém a lista de turmas a iniciar brevemente.
 * @returns Lista de turmas.
 */
export async function getTurmasAIniciar() {
  const res = await axios.get("/dashboard/turmasAIniciar");
  return res.data as TurmaAIniciar[];
}

/**
 * Obtém a distribuição de cursos por área.
 * @returns Lista de áreas e totais.
 */
export async function getCursosPorArea(): Promise<CursosPorArea[]> {
  const res = await axios.get(`${API_BASE_URL}/dashboard/cursosPorArea`);
  return res.data;
}

/* DASHBOARD SERVICE FOR FORMANDO AVALIAÇÕES */

/**
 * Representa a avaliação de um formando num módulo.
 */
export interface AvaliacaoFormando {
  idAvaliacao: number;
  nomeModulo: string;
  nota: number | null;
  dataAvaliacao: string | null;
  totalModulosCurso: number;
}

/**
 * Obtém as avaliações do formando autenticado.
 * @returns Lista de avaliações.
 */
export async function getAvaliacoesFormando(): Promise<AvaliacaoFormando[]> {
  const res = await axios.get(`${API_BASE_URL}/avaliacoes/formando`);
  return res.data;
}

/**
 * Dados de produtividade de formadores (Top Horas).
 */
export type TopFormadorHoras = {
  nome: string;
  horas: number;
};

/**
 * Obtém os formadores com mais horas dadas.
 * @returns Lista de formadores e horas.
 */
export async function getTopFormadores(): Promise<TopFormadorHoras[]> {
  const res = await axios.get(`${API_BASE_URL}/dashboard/topformadores`);
  return res.data;
}
