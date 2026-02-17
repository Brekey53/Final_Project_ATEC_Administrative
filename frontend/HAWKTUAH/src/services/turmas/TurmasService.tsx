import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Representa uma turma.
 */
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

/**
 * Obtém a lista de todas as turmas.
 * @returns Lista de turmas.
 */
export async function getTurmas() {
  const res = await axios.get(`${API_BASE_URL}/turmas`);

  return res.data;
}

/**
 * Obtém as próximas turmas para o dashboard geral.
 * @returns Lista de turmas futuras.
 */
export async function getTurmasGeralDashboard() {
  const res = await axios.get(`${API_BASE_URL}/turmas/proximasturmas`);

  return res.data;
}

/**
 * Obtém os detalhes de uma turma específica.
 * @param idTurma - ID da turma.
 * @returns Detalhes da turma.
 */
export async function getTurma(idTurma: string) {
  const res = await axios.get(`${API_BASE_URL}/turmas/${idTurma}`);

  return res.data;
}

/**
 * Remove uma turma.
 * @param idTurma - ID da turma a remover.
 */
export async function deleteTurma(idTurma: number) {
  return axios.delete(`${API_BASE_URL}/turmas/${idTurma}`);
}

/**
 * Cria uma nova turma.
 * @param data - Dados da nova turma.
 */
export async function postNewTurma(data: CreateTurmaDTO) {
  return axios.post(`${API_BASE_URL}/turmas`, data);
}

/**
 * Atualiza uma turma existente.
 * @param idTurma - ID da turma.
 * @param data - Novos dados da turma.
 */
export async function updateTurma(idTurma: string, data: UpdateTurmaDTO) {
  const res = await axios.put(`${API_BASE_URL}/turmas/${idTurma}`, data);
  return res.data;
}

/**
 * Obtém a lista de cursos (auxiliar para formulários de turmas).
 * @returns Lista de cursos.
 */
export async function getCursos() {
  const res = await axios.get(`${API_BASE_URL}/cursos`);
  return res.data;
}

/**
 * Obtém as metodologias disponíveis.
 * @returns Lista de metodologias.
 */
export async function getMetodologias() {
  const res = await axios.get(`${API_BASE_URL}/turmas/metodologias`);
  return res.data;
}

/**
 * DTO para criação de turma.
 */
export interface CreateTurmaDTO {
  nomeTurma: string;
  idCurso: number;
  dataInicio: string;
  dataFim: string;
  nomeCurso: string;
  idMetodologia: number;
}

/**
 * DTO para atualização de turma.
 */
export interface UpdateTurmaDTO {
  idTurma: number;
  nomeTurma: string;
  dataInicio: string;
  dataFim: string;
  idCurso: number;
  idMetodologia: number;
}

/**
 * DTO com informações de uma turma associada a um formador.
 */
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

/**
 * Obtém as turmas associadas ao formador autenticado.
 * @returns Lista de turmas do formador.
 */
export async function getTurmasFormador() {
  const res = await axios.get(`${API_BASE_URL}/TurmaAlocacao/turmas/formador`);
  return res.data;
}

/**
 * Obtém as turmas associadas a um formador específico (para visualização de horário).
 * @param idFormador - ID do formador.
 * @returns Lista de turmas.
 */
export async function getTurmasFormadorHorario(idFormador: number) {
  const res = await axios.get(
    `${API_BASE_URL}/TurmaAlocacao/turmas/formador/${idFormador}`,
  );
  return res.data;
}

export type AvaliacaoAlunoDTO = {
  idInscricao: number;
  idFormando: number;
  nomeFormando: string;
  email: string;
  nota: number | null;
};

/**
 * Obtém as avaliações de uma turma para um módulo específico.
 * @param turmaId - ID da turma.
 * @param moduloId - ID do módulo.
 * @returns Lista de avaliações dos alunos.
 */
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

/**
 * Submete as avaliações dos alunos para um módulo.
 * @param avaliacoes - Lista de avaliações a guardar.
 */
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

/**
 * Interface que representa os detalhes da turma do utilizador (aluno).
 */
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

/**
 * Obtém os detalhes da turma do utilizador autenticado (aluno).
 * @returns Detalhes da "Minha Turma".
 */
export async function getMinhaTurma(): Promise<MinhaTurma> {
  const res = await axios.get(`${API_BASE_URL}/turmas/minha-turma`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.data;
}

/**
 * Representa uma metodologia de ensino.
 */
export interface Metodologia {
  idMetodologia: number;
  nome: string;
  horarioInicio: string;
  horarioFim: string;
  pausaRefeicaoInicio: string;
  pausaRefeicaoFim: string;
}

export interface TurmaRaw {
  idTurma: number;
  nomeTurma: string;
  idModulo: number;
  idCursoModulo: number;
}

/**
 * Representa um aluno inscrito numa turma.
 */
export interface AlunoTurma {
  idInscricao: number;
  idFormando: number;
  idUtilizador: number;
  nome: string;
  email: string;
  foto?: string;
}

/**
 * Representa um candidato (Formando ou Geral) que ainda não tem turma atribuída.
 */
export interface CandidatoSemTurma {
  idUtilizador: number;
  nome: string;
  email: string;
  tipo: "Formando" | "Geral";
}

/**
 * Obtém os alunos inscritos numa turma.
 * @param idTurma - ID da turma.
 * @returns Lista de alunos.
 */
export async function getAlunosTurma(idTurma: string | number) {
  const res = await axios.get(`${API_BASE_URL}/turmas/${idTurma}/alunos`);
  return res.data;
}

/**
 * Obtém a lista de candidatos sem turma.
 * @returns Lista de candidatos.
 */
export async function getCandidatosSemTurma() {
  const res = await axios.get(`${API_BASE_URL}/turmas/candidatos-sem-turma`);
  return res.data;
}

/**
 * Adiciona um aluno a uma turma.
 * @param idTurma - ID da turma.
 * @param idUtilizador - ID do utilizador (aluno) a adicionar.
 */
export async function adicionarAlunoTurma(
  idTurma: string | number,
  idUtilizador: number,
) {
  const res = await axios.post(
    `${API_BASE_URL}/turmas/${idTurma}/alunos`,
    idUtilizador,
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  return res.data;
}

/**
 * Remove um aluno de uma turma.
 * @param idTurma - ID da turma.
 * @param idUtilizador - ID do utilizador (aluno) a remover.
 */
export async function removerAlunoTurma(
  idTurma: string | number,
  idUtilizador: number,
) {
  const res = await axios.delete(
    `${API_BASE_URL}/turmas/${idTurma}/alunos/${idUtilizador}`,
  );
  return res.data;
}
