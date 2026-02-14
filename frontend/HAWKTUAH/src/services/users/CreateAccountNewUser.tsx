import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface RegisterData {
  Email: string;
  Password: string;
  Nome: string;
  Nif: string;
  DataNascimento: string; // Formato YYYY-MM-DD
}

/**
 * Função de Registo de Utilizadores
 * Envia os dados para a tabela centralizada de Utilizadores
 */
export async function CreateAccountNewUser(userData: RegisterData) {
  const res = await axios.post(`${API_BASE_URL}/auth/register`, userData);

  return res.data;
}
