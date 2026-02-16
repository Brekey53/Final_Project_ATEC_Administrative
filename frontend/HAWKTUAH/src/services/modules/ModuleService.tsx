import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Interface base para módulos.
 */
export interface Modulos {
  idModulo: number;
  codigoIdentificacao: string;
  nome: string;
  horasTotais: number;
  creditos: number;
}

/**
 * Interface estendida para edição de módulos (inclui tipo de matéria).
 */
export interface ModulosEdit {
  idModulo: number;
  codigoIdentificacao: string;
  nome: string;
  horasTotais: number;
  creditos: number;
  idTipoMateria: number;
  nomeTipoMateria: string;
}

/**
 * Obtém a lista de todos os módulos.
 * @returns Lista de módulos.
 */
export async function getModulos(): Promise<Modulos[]> {
  const res = await axios.get(`${API_BASE_URL}/modulos`);

  return res.data;
}

/**
 * Obtém os detalhes de um módulo específico.
 * @param idModulo - ID do módulo.
 * @returns Detalhes do módulo.
 */
export async function getModulo(idModulo: string) {
  const res = await axios.get(`${API_BASE_URL}/modulos/${idModulo}`);

  return res.data;
}

/**
 * Remove um módulo.
 * @param idModulo - ID do módulo a remover.
 */
export async function deleteModulo(idModulo: string) {
  return axios.delete(`${API_BASE_URL}/modulos/${idModulo}`);
}

/**
 * Cria um novo módulo.
 * @param data - Dados do módulo.
 */
export async function postNewModulo(data: any) {
  return axios.post(`${API_BASE_URL}/modulos`, data);
}

/**
 * Atualiza um módulo existente.
 * @param idModulo - ID do módulo.
 * @param data - Novos dados.
 */
export async function updateModulo(idModulo: string, data: any) {
  const res = await axios.put(`${API_BASE_URL}/modulos/${idModulo}`, data);
  return res.data;
}

/**
 * Obtém os tipos de matéria disponíveis.
 * @returns Lista de tipos de matéria.
 */
export async function getTiposMateria() {
  const res = await axios.get(`${API_BASE_URL}/modulos/tiposmateria`);
  return res.data;
}
