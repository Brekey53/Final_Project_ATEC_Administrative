import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface Salas {
  idSala: number;
  descricao: string;
  numMaxAlunos: number;
  idTipoSala: number;
  tipoSala: string;
}

export async function getSalas(): Promise<Salas[]> {
  const res = await axios.get(`${API_BASE_URL}/salas`);

  return res.data;
}

export async function getSala(idSala: string) {
  const res = await axios.get(`${API_BASE_URL}/salas/${idSala}`);

  return res.data;
}

export interface TipoSala {
  idTipoSala: number;
  nome: string;
}

export async function getTipoSalas(): Promise<TipoSala[]> {
  const res = await axios.get(`${API_BASE_URL}/tiposalas`);
  return res.data;
}

export async function deleteSala(idSala: number) {
  return axios.delete(`${API_BASE_URL}/salas/${idSala}`);
}

export async function postNewSala(data: any) {
  return axios.post(`${API_BASE_URL}/salas`, data);
}

export async function updateSala(idSala: string, data: any){
  const res = await axios.put(`${API_BASE_URL}/salas/${idSala}`, data);
  return res.data;
}