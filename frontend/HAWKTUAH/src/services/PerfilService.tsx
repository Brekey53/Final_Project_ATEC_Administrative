import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export interface Perfil {
  tipo: number;
  email: string;
  nome?: string;
  nif?: string;
  telefone?: string;
  dataNascimento?: string;
  sexo?: string;
  morada?: string;
}

export async function getMyPerfil(): Promise<Perfil> {
  const res = await axios.get(`${API_BASE_URL}/utilizadores/perfil`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.data;
}
