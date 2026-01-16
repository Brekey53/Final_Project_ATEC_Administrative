import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export interface Formando {
  id: number;
  nome: string;
  email: string;
  phone: string;
}

export async function getFormandos() {
  const res = await axios.get(`${API_BASE_URL}/formandos`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.data as Formando[];
}
