import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Representa a associação entre formador e turmas (com módulos).
 */
export interface FormadorTurma {
  idFormador: number;
  nomeFormador: string;
  modulos: string[];
}

/**
 * Representa um módulo disponível para alocação.
 */
export type ModuloDisponivel = {
  idModulo: number;
  nomeModulo: string;
  idTipoMateria: number;
  tipoMateria: string;
};

/**
 * Representa um formador disponível para um tipo de matéria.
 */
export type FormadorDisponivel = {
  idFormador: number;
  nomeFormador: string;
};

/**
 * DTO para alocar um formador a um módulo de uma turma.
 */
export type AlocarFormadorDTO = {
  idTurma: number;
  idModulo: number;
  idFormador: number;
};

/**
 * Detalhes da alocação de um módulo numa turma.
 */
export type AlocacaoTurmaModulo = {
  idTurma: number;
  idModulo: number;
  nomeModulo: string;
  idFormador: number;
  nomeFormador: string;
  horasDadas: number;
};
/**
 * Obtém os formadores alocados a uma turma.
 * @param idTurma - ID da turma.
 * @returns Lista de alocações.
 */
export async function getFormadoresDaTurma(
  idTurma: string | number,
): Promise<AlocacaoTurmaModulo[]> {
  const res = await axios.get(
    `${API_BASE_URL}/turmaAlocacao/turma/${idTurma}/formadores`,
  );
  return res.data;
}

/**
 * Obtém os módulos disponíveis para alocação numa turma.
 * @param idTurma - ID da turma.
 * @returns Lista de módulos disponíveis.
 */
export async function getModulosDisponiveis(
  idTurma: string | number,
): Promise<ModuloDisponivel[]> {
  const response = await axios.get(
    `${API_BASE_URL}/turmaAlocacao/turma/${idTurma}/modulos-disponiveis`,
  );
  return response.data;
}

/**
 * Obtém formadores qualificados para um tipo de matéria.
 * @param idTipoMateria - ID do tipo de matéria.
 * @returns Lista de formadores disponíveis.
 */
export async function getFormadoresPorTipoMateria(
  idTipoMateria: number,
): Promise<FormadorDisponivel[]> {
  const response = await axios.get(
    `${API_BASE_URL}/turmaAlocacao/tipo-materia/${idTipoMateria}`,
  );
  return response.data;
}

/**
 * Aloca um formador a um módulo de uma turma.
 * @param dto - Dados da alocação.
 */
export async function alocarFormador(dto: AlocarFormadorDTO) {
  return axios.post(`${API_BASE_URL}/turmaAlocacao`, dto);
}

/**
 * Remove a alocação de um formador de um módulo numa turma.
 * @param idTurma - ID da turma.
 * @param idFormador - ID do formador.
 * @param idModulo - ID do módulo.
 */
export async function removerFormador(
  idTurma: number,
  idFormador: number,
  idModulo: number,
) {
  await axios.delete(
    `${API_BASE_URL}/turmaAlocacao/turma/${idTurma}/formador/${idFormador}/modulo/${idModulo}`,
  );
}
