import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface Turma {
  idTurma: number;
  idCurso: number;
  nomeTurma: string;
  dataInicio: string;
  dataFim: string;
}

export async function getTurmas() {
  const res = await axios.get(`${API_BASE_URL}/turmas/proximasturmas`);

  return res.data;
}
