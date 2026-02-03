import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface FormadorTurma {
  idFormador: number;
  nomeFormador: string;
  modulos: string[];
}

export type ModuloDisponivel = {
  idModulo: number;
  nomeModulo: string;
  idTipoMateria: number;
  tipoMateria: string;
};

export type FormadorDisponivel = {
  idFormador: number;
  nomeFormador: string;
};

export type AlocarFormadorDTO = {
  idTurma: number;
  idModulo: number;
  idFormador: number;
};

export type AlocacaoTurmaModulo = {
  idTurma: number;
  idModulo: number;
  nomeModulo: string;
  idFormador: number;
  nomeFormador: string;
  horasDadas: number;
};
export async function getFormadoresDaTurma(
  idTurma: string | number,
): Promise<AlocacaoTurmaModulo[]> {
    const res = await axios.get(`${API_BASE_URL}/turmaAlocacao/turma/${idTurma}/formadores`);
    return res.data;
}

export async function getModulosDisponiveis(
  idTurma: string | number,
): Promise<ModuloDisponivel[]> {
  const response = await axios.get(
    `${API_BASE_URL}/turmaAlocacao/turma/${idTurma}/modulos-disponiveis`,
  );
  return response.data;
}

export async function getFormadoresPorTipoMateria(
  idTipoMateria: number,
): Promise<FormadorDisponivel[]> {
  const response = await axios.get(
    `${API_BASE_URL}/turmaAlocacao/tipo-materia/${idTipoMateria}`,
  );
  return response.data;
}

export async function alocarFormador(dto: AlocarFormadorDTO) {
  return axios.post(`${API_BASE_URL}/turmaAlocacao`, dto);
}

export async function removerFormador(
  idTurma: number,
  idFormador: number,
  idModulo: number,
) {
  await axios.delete(`${API_BASE_URL}/turmaAlocacao/turma/${idTurma}/formador/${idFormador}/modulo/${idModulo}`);
}


