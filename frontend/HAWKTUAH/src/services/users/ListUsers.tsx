import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface Utilizador {
  idUtilizador: number;
  nome: string;
  email: string;
  telefone: string;
  tipoUtilizador: string;
}

export async function getUtilizadores(): Promise<Utilizador[]> {
  const res = await axios.get(`${API_BASE_URL}/utilizadores`);

  return res.data;
}
