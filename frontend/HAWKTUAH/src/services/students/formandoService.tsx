import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

// Interface atualizada para refletir os novos dados do Backend
export interface Formando {
  idFormando: number;
  nome: string;
  nif: string;
  dataNascimento: string;
  morada: string;
  telefone?: string;
  sexo: string;
  email: string;
  turma: string;
  idEscolaridade: string;
  fotografia: File | null;
  anexoFicheiro: File | null;
}

// Obter todos os formandos (Listagem com Turma)
export async function getFormandos(): Promise<Formando[]> {
  const res = await axios.get(`${API_BASE_URL}/formandos`);
  return res.data;
}

// Obter detalhes de um formando por ID
export async function getFormandoById(
  idFormando: number | string,
): Promise<any> {
  const res = await axios.get(`${API_BASE_URL}/formandos/${idFormando}`);
  return res.data;
}

export async function postNewFormandos(formData: FormData) {
  const res = await axios.post(`${API_BASE_URL}/formandos/completo`, formData);
  return res.data;
}

export async function updateFormando(id: string, data: FormData) {
  // O Axios configura o Content-Type: multipart/form-data automaticamente ao receber FormData

  const res = await axios.put(`${API_BASE_URL}/formandos/${id}`, data);
  return res.data;
}

export async function deleteFormando(idFormando: number) {
  return axios.delete(`${API_BASE_URL}/Formandos/${idFormando}`);
}

export async function getTurmas() {
  const res = await axios.get(`${API_BASE_URL}/turmas`);

  return res.data;
}

export async function getEscolaridades() {
  const res = await axios.get(`${API_BASE_URL}/escolaridades`);

  return res.data;
}

export async function checkEmail(email: string) {
  const res = await axios.get(
    `${API_BASE_URL}/utilizadores/details-by-email?email=${email}`,
  );

  return res.data;
}
