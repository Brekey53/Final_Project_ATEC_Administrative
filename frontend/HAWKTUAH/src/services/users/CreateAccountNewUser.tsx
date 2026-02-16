import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Dados necessários para o registo de um novo utilizador.
 */
export interface RegisterData {
  Email: string;
  Password: string;
  Nome: string;
  Nif: string;
  DataNascimento: string; // Formato YYYY-MM-DD
}

/**
 * Função de Registo de Utilizadores.
 * Envia os dados para a tabela centralizada de Utilizadores.
 *
 * @param userData - Dados do utilizador a registar.
 * @returns Resposta da API.
 */
export async function CreateAccountNewUser(userData: RegisterData) {
  const res = await axios.post(`${API_BASE_URL}/auth/register`, userData);

  return res.data;
}
