import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface Formador {
  idFormador: string;
  iban: string;
  qualificacoes: string;
  nome: string;
  nif: string;
  dataNascimento: string;
  morada: string;
  telefone?: string;
  sexo: string;
  email: string;
  fotografia: File | null;
  anexoFicheiro: File | null;
}

export async function getFormadores(): Promise<Formador[]> {
  const res = await axios.get(`${API_BASE_URL}/formadores`);

  return res.data;
}

export async function getFormador(idFormador: string) {
  const res = await axios.get(`${API_BASE_URL}/formadores/${idFormador}`);

  return res;
}

export async function deleteFormador(idFormador: string) {
  return axios.delete(`${API_BASE_URL}/formadores/${idFormador}`);
}

export async function postNewFormador(data: any) {
  return axios.post(`${API_BASE_URL}/formadores`, data);
}

export async function updateFormador(idFormador: string, data: any) {
  const res = await axios.put(`${API_BASE_URL}/formadores/${idFormador}`, data);
  return res.data;
}

export async function checkEmail(email: string) {
  const res = await axios.get(`${API_BASE_URL}/utilizadores/details-by-email?email=${email}`);
  
  return res;
}
