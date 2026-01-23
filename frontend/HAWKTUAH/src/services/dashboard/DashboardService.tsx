import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export interface DashboardStats {
  cursosDecorrer: number;
  totalCursos: number;
  formandosAtivos: number;
  formadores: number;
  salas: number;
  modulos: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await axios.get(`${API_BASE_URL}/dashboard/stats`);
  return res.data;
}
