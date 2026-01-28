import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface Turma {
  idTurma: number;
  idCurso: number;
  nomeTurma: string;
  dataInicio: string;
  dataFim: string;
  nomeCurso: string;
}

export async function getTurmas() {
  const res = await axios.get(`${API_BASE_URL}/turmas`);

  return res.data;
}

export async function getTurma(idSala: string) {
  const res = await axios.get(`${API_BASE_URL}/turmas/${idSala}`);

  return res.data;
}

export async function deleteTurma(idSala: number) {
  return axios.delete(`${API_BASE_URL}/turmas/${idSala}`);
}

export async function postNewTurma(data: any) {
  return axios.post(`${API_BASE_URL}/turmas`, data);
}

export async function updateTurma(idSala: string, data: any) {
  const res = await axios.put(`${API_BASE_URL}/turmas/${idSala}`, data);
  return res.data;
}

export async function getCursos() {
  const res = await axios.get(`${API_BASE_URL}/cursos`);
  return res.data;
}

export interface TurmaFormadorDTO {
  idTurma: number;
  idModulo: number;
  nomeTurma: string;
  nomeModulo: string;
  dataInicio: string;
  dataFim: string;
  idCurso: number;
}

export async function getTurmasFormador() {
  const res = await axios.get(`${API_BASE_URL}/TurmaAlocacao/turmas/formador`);
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
