import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

// Interface atualizada para refletir os novos dados do Backend
export interface Formando {
  idFormando: number;
  nome: string;
  email: string;
  nif: string;
  turma: string;
  status?: boolean;
  phone?: string;
}

// Obter todos os formandos (Listagem com Turma)
export async function getFormandos(): Promise<Formando[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/formandos`);
    return res.data;
  } catch (error) {
    console.error("Erro ao obter formandos:", error);
    throw error;
  }
}

// Obter detalhes de um formando por ID
export async function getFormandoById(
  idFormando: number | string,
): Promise<any> {
  try {
    const res = await axios.get(`${API_BASE_URL}/formandos/${idFormando}`);
    return res.data;
  } catch (error) {
    console.error(`Erro ao obter formando ${idFormando}:`, error);
    throw error;
  }
}
