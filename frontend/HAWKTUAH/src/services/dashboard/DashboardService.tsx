import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface DashboardStats {
  cursosDecorrer: number;
  turmasConcluidas: number;
  formandosAtivos: number;
  formadores: number;
  salas: number;
  modulos: number;
}
export interface CursosADecorrer {
  idTurma: number;
  nomeTurma: string;
  nomeCurso: string;
  dataInicio: string;
  dataFim: string;
}

export interface TurmaAIniciar {
  idTurma: number;
  nomeTurma: string;
  nomeCurso: string;
  dataInicio: string;
  dataFim: string;
}

export interface CursosPorArea {
  idArea: number;
  nomeArea: string;
  totalCursos: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await axios.get(`${API_BASE_URL}/dashboard/stats`);
  return res.data;
}

export async function getCursosADecorrer() {
  const res = await axios.get(`${API_BASE_URL}/dashboard/turmasDecorrer`);
  return res.data;
}

export async function getTurmasAIniciar() {
  const res = await axios.get("/dashboard/turmasAIniciar");
  return res.data as TurmaAIniciar[];
}

export async function getCursosPorArea(): Promise<CursosPorArea[]> {
  const res = await axios.get(`${API_BASE_URL}/dashboard/cursosPorArea`);
  return res.data;
}

/* DASHBOARD SERVICE FOR FORMANDO AVALIAÇÕES */

export interface AvaliacaoFormando {
  idAvaliacao: number;
  nomeModulo: string;
  nota: number | null;
  dataAvaliacao: string | null;
  totalModulosCurso: number;
}

export async function getAvaliacoesFormando(): Promise<AvaliacaoFormando[]> {
  const res = await axios.get(`${API_BASE_URL}/avaliacoes/formando`);
  return res.data;
}
