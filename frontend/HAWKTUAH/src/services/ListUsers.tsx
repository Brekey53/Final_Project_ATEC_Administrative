import axios from "axios"
import { API_BASE_URL } from "../config.constants";

export interface Utilizador {
  idUtilizador: number;
  nome: string;
  email: string;
  phone?: string;
  tipoUtilizador: number;
}

const authHeaders = {
  Authorization: `Bearer ${localStorage.getItem("token")}`,
};

export async function getUtilizadores() {
  const res = await axios.get(`${API_BASE_URL}/utilizadores`, {
    headers: authHeaders,
  });

  return res.data;
}
