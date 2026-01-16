import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export interface Formando {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
}

const authHeaders = {
  Authorization: `Bearer ${localStorage.getItem("token")}`,
};

export async function getFormandos(): Promise<Formando[]> {
  const res = await axios.get(`${API_BASE_URL}/formandos`, {
    headers: authHeaders,
  });

  return res.data;
}

export async function getFormandoById(
  id: number | string
): Promise<Formando> {
  const res = await axios.get(`${API_BASE_URL}/formandos/${id}`, {
    headers: authHeaders,
  });

  return res.data;
}
