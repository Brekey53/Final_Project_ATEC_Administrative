import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

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
  fotografia: File | null;
  anexoFicheiro: File | null;
}

export async function getUtilizadores(): Promise<Utilizador[]> {
  const res = await axios.get(`${API_BASE_URL}/utilizadores`);

  return res.data;
}

export async function getUtilizador(idUtilizador: string) {
  const res = await axios.get(`${API_BASE_URL}/utilizadores/${idUtilizador}`);

  return res;
}

export async function deleteUtilizador(idUtilizador: string) {
  return axios.delete(`${API_BASE_URL}/utilizadores/${idUtilizador}`);
}

export async function postNewUtilizador(data: FormData) {
  return axios.post(`${API_BASE_URL}/utilizadores`, data);
}

export async function updateUtilizador(idUtilizador: string, data: FormData) {
  const res = await axios.put(`${API_BASE_URL}/utilizadores/${idUtilizador}`, data);
  return res.data;
}

export async function checkEmail(email: string) {
  const res = await axios.get(
    `${API_BASE_URL}/utilizadores/check-email?email=${email}`,
  );

  return res.data;
}

export async function createUser(data: any) {
  const res = await axios.post(`/utilizadores/new-user`, data);
  return res.data;
}