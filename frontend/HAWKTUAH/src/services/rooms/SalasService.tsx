import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Representa uma sala de aula.
 */
export interface Salas {
  idSala: number;
  descricao: string;
  numMaxAlunos: number;
  idTipoSala: number;
  tipoSala: string;
}

/**
 * Obtém a lista de todas as salas.
 * @returns Lista de salas.
 */
export async function getSalas(): Promise<Salas[]> {
  const res = await axios.get(`${API_BASE_URL}/salas`);

  return res.data;
}

/**
 * Obtém os detalhes de uma sala específica.
 * @param idSala - ID da sala.
 * @returns Detalhes da sala.
 */
export async function getSala(idSala: string) {
  const res = await axios.get(`${API_BASE_URL}/salas/${idSala}`);

  return res.data;
}

/**
 * Representa um tipo de sala (ex: Laboratório, Teórica).
 */
export interface TipoSala {
  idTipoSala: number;
  nome: string;
}

/**
 * Obtém os tipos de sala disponíveis.
 * @returns Lista de tipos de sala.
 */
export async function getTipoSalas(): Promise<TipoSala[]> {
  const res = await axios.get(`${API_BASE_URL}/tiposalas`);
  return res.data;
}

/**
 * Remove uma sala.
 * @param idSala - ID da sala a remover.
 */
export async function deleteSala(idSala: number) {
  return axios.delete(`${API_BASE_URL}/salas/${idSala}`);
}

/**
 * Cria uma nova sala.
 * @param data - Dados da nova sala.
 */
export async function postNewSala(data: any) {
  return axios.post(`${API_BASE_URL}/salas`, data);
}

/**
 * Atualiza uma sala existente.
 * @param idSala - ID da sala.
 * @param data - Novos dados.
 */
export async function updateSala(idSala: string, data: any) {
  const res = await axios.put(`${API_BASE_URL}/salas/${idSala}`, data);
  return res.data;
}

/**
 * DTO para listagem de salas disponíveis.
 */
export interface SalaGetDTO {
  idSala: number;
  nomeSala: string;
  tipo: string;
  capacidade: number;
}

/**
 * Pesquisa salas disponíveis para um determinado período.
 * @param data - Data pretendida.
 * @param inicio - Hora de início.
 * @param fim - Hora de fim.
 * @param idCursoModulo - (Opcional) ID do módulo para verificar compatibilidade.
 * @returns Lista de salas disponíveis.
 */
export async function getSalasDisponiveis(
  data: string,
  inicio: string,
  fim: string,
  idCursoModulo?: string,
) {
  const res = await axios.get<SalaGetDTO[]>(
    `${API_BASE_URL}/salas/disponiveis`,
    {
      params: {
        data: data,
        inicio: inicio,
        fim: fim,
        idCursoModulo: idCursoModulo,
      },
    },
  );

  return res.data;
}
