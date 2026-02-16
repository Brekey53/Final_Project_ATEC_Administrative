import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Interface simplificada para listagem de utilizadores (versão alternativa).
 */
export interface Utilizador {
  idUtilizador: number;
  nome: string;
  email: string;
  telefone: string;
  tipoUtilizador: string;
}

/**
 * Obtém a lista de utilizadores.
 * Nota: Esta função pode ser redundante em relação ao UserService.
 * @returns Lista de utilizadores.
 */
export async function getUtilizadores(): Promise<Utilizador[]> {
  const res = await axios.get(`${API_BASE_URL}/utilizadores`);

  return res.data;
}
