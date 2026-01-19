import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export interface Salas {
  idSala: number;
  descricao: string;
  numMaxAlunos: number;
}

export async function getSalas(): Promise<Salas[]> {
  const res = await axios.get(`${API_BASE_URL}/salas`);

  return res.data;
}

export async function deleteSala(idSala: number) {
  return axios.delete(`${API_BASE_URL}/salas/${idSala}`);
}

export async function postNewSala(data: any) {
  return axios.post(`${API_BASE_URL}/salas`, data);
}
