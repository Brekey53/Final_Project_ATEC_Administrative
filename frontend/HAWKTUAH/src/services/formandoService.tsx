import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export interface Formando {
  idFormando: number;
  nome: string;
  email: string;
  phone?: string;
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
  idFormando: number | string
): Promise<Formando> {
  const res = await axios.get(`${API_BASE_URL}/formandos/${idFormando}`, {
    headers: authHeaders,
  });

  return res.data;
}
