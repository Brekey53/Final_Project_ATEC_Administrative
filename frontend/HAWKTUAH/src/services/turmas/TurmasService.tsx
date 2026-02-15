import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface Turma {
  idTurma: number;
  idCurso: number;
  nomeTurma: string;
  dataInicio: string;
  dataFim: string;
  nomeCurso: string;
  estado: "Para começar" | "A decorrer" | "Terminada";
  idMetodologia: number;
}

export async function getTurmas() {
  const res = await axios.get(`${API_BASE_URL}/turmas`);

  return res.data;
}

export async function getTurmasGeralDashboard() {
  const res = await axios.get(`${API_BASE_URL}/turmas/proximasturmas`);

  return res.data;
}

export async function getTurma(idTurma: string) {
  const res = await axios.get(`${API_BASE_URL}/turmas/${idTurma}`);

  return res.data;
}

export async function deleteTurma(idTurma: number) {
  return axios.delete(`${API_BASE_URL}/turmas/${idTurma}`);
}

export async function postNewTurma(data: CreateTurmaDTO) {
  return axios.post(`${API_BASE_URL}/turmas`, data);
}

export async function updateTurma(idTurma: string, data: UpdateTurmaDTO) {
  const res = await axios.put(`${API_BASE_URL}/turmas/${idTurma}`, data);
  return res.data;
}

export async function getCursos() {
  const res = await axios.get(`${API_BASE_URL}/cursos`);
  return res.data;
}

export async function getMetodologias() {
  const res = await axios.get(`${API_BASE_URL}/turmas/metodologias`);
  return res.data;
}

export interface CreateTurmaDTO {
  nomeTurma: string;
  idCurso: number;
  dataInicio: string;
  dataFim: string;
  nomeCurso: string;
  idMetodologia: number;
}

export interface UpdateTurmaDTO {
  idTurma: number;
  nomeTurma: string;
  dataInicio: string;
  dataFim: string;
  idCurso: number;
  idMetodologia: number;
}

export type TurmaFormadorDTO = {
  idTurma: number;
  idModulo: number;
  nomeTurma: string;
  nomeCurso: string;
  nomeModulo: string;
  horasDadas: number;
  horasTotaisModulo: number;
  estado: "Para começar" | "A decorrer" | "Terminada";
};

export async function getTurmasFormador() {
  const res = await axios.get(`${API_BASE_URL}/TurmaAlocacao/turmas/formador`);
  return res.data;
}

export async function getTurmasFormadorHorario(idFormador: number) {
  const res = await axios.get(
    `${API_BASE_URL}/TurmaAlocacao/turmas/formador/${idFormador}`,
  );
  return res.data;
}

type AvaliacaoAlunoDTO = {
  idInscricao: number;
  idFormando: number;
  nomeFormando: string;
  nota: number | null;
};

export async function getTurmaAvaliacao(
  turmaId: number,
  moduloId: number,
): Promise<AvaliacaoAlunoDTO[]> {
  const res = await axios.get(`${API_BASE_URL}/TurmaAlocacao/avaliacoes`, {
    params: { turmaId, moduloId },
  });
  return res.data;
}

type DarAvaliacaoDTO = {
  idInscricao: number;
  idModulo: number;
  nota: number;
};

export async function postTurmaAvaliacao(avaliacoes: DarAvaliacaoDTO[]) {
  const res = await axios.post(
    `${API_BASE_URL}/TurmaAlocacao/avaliacoes`,
    avaliacoes,
  );
  return res.data;
}

export interface Colega {
  id: number;
  nome: string;
  email: string;
}

export interface Avaliacao {
  nota: number;
  data: string;
}

export interface Modulo {
  idModulo: number;
  nome: string;
  horasTotais: number;
  avaliacoes: Avaliacao[];
  professores: Professor[];
}

export interface Professor {
  nome: string;
  email: string | null;
}

export interface MinhaTurma {
  nomeTurma: string;
  nomeCurso: string;
  dataInicio: string;
  dataFim: string;
  estado: string;
  colegas: Colega[];
  modulos: Modulo[];
  professores: Professor[];
}

export async function getMinhaTurma(): Promise<MinhaTurma> {
  const res = await axios.get(`${API_BASE_URL}/turmas/minha-turma`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.data;
}

export interface Metodologia {
  idMetodologia: number;
  nome: string;
  horarioInicio: string;
  horarioFim: string;
  pausaRefeicaoInicio: string;
  pausaRefeicaoFim: string;
}
