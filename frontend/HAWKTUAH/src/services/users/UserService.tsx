import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Interface que representa um Utilizador completo no sistema.
 */
export interface Utilizador {
  idUtilizador: string;
  nome: string;
  nif: string;
  dataNascimento: string;
  morada: string;
  telefone?: string;
  sexo: string;
  email: string;
  idTipoUtilizador: number;
  tipoUtilizador: string;
  status: boolean;
  fotografia: File | null;
  anexoFicheiro: File | null;
}

/**
 * Interface simplificada para listagens de Utilizadores.
 */
export interface UtilizadorListItem {
  idUtilizador: string;
  nome: string;
  email: string;
  telefone?: string;
  nif: string;
  tipoUtilizador: string;
  ativo: boolean;
}

/**
 * Interface para os dados de edição de um Utilizador.
 */
export interface EditUtilizador {
  email: string;
  nome: string;
  nif: string;
  telefone: string;
  morada: string;
  sexo: string;
  dataNascimento: string;
  IdTipoUtilizador: number;
  ativo: boolean;
}

/**
 * Obtém a lista de todos os utilizadores.
 * @returns Lista de utilizadores.
 */
export async function getUtilizadores(): Promise<UtilizadorListItem[]> {
  const res = await axios.get(`${API_BASE_URL}/utilizadores`);

  return res.data;
}

/**
 * Obtém os detalhes de um utilizador específico.
 * @param idUtilizador - ID do utilizador a pesquisar.
 * @returns Dados detalhados do utilizador.
 */
export async function getUtilizador(idUtilizador: string) {
  const res = await axios.get(`${API_BASE_URL}/utilizadores/${idUtilizador}`);

  return res.data;
}

/**
 * Remove um utilizador do sistema.
 * @param idUtilizador - ID do utilizador a remover.
 */
export async function deleteUtilizador(idUtilizador: string) {
  const res = await axios.delete(
    `${API_BASE_URL}/utilizadores/${idUtilizador}`,
  );

  return res.data;
}

/**
 * Cria um novo utilizador no sistema.
 * @param data - Dados do utilizador (FormData para suportar upload de ficheiros).
 */
export async function postNewUtilizador(data: FormData) {
  const res = await axios.post(`${API_BASE_URL}/utilizadores`, data);

  return res.data;
}

/**
 * Atualiza os dados de um utilizador existente.
 * @param idUtilizador - ID do utilizador a atualizar.
 * @param data - Novos dados do utilizador.
 */
export async function updateUtilizador(idUtilizador: string, data: FormData) {
  const res = await axios.put(
    `${API_BASE_URL}/utilizadores/${idUtilizador}`,
    data,
  );
  return res.data;
}

/**
 * Verifica se um email já está registado.
 * @param email - Email a verificar.
 */
export async function checkEmail(email: string) {
  const res = await axios.get(
    `${API_BASE_URL}/utilizadores/check-email?email=${email}`,
  );

  return res.data;
}

/**
 * Verifica o email e retorna o nome associado.
 * @param email - Email a pesquisar.
 */
export async function checkEmailGetName(email: string) {
  const res = await axios.get(
    `${API_BASE_URL}/utilizadores/name-by-email?email=${email}`,
  );

  return res.data;
}

/**
 * Cria um novo utilizador (registo simplificado/alternativo).
 * @param data - Dados do utilizador.
 */
export async function createUser(data: any) {
  const res = await axios.post(`/utilizadores/new-user`, data);
  return res.data;
}
