import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface Formador {
  idFormador: string;
  nome: string;
  nif: string;
  phone?: string;
  dataNascimento: string;
  sexo: string;
  morada: string;
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
  const res = await axios.get(
    `${API_BASE_URL}/utilizadores/check-email?email=${email}`,
  );

  return res;
}
