import { API_BASE_URL } from "../../config.constants";
import axios from "axios";

export interface Horario {
  idHorario: number;
  idTurma?: number;
  nomeTurma?: string;
  idCursoModulo?: number;
  nomeCurso?: string;
  nomeModulo?: string;
  idFormador?: number;
  nomeFormador?: string;
  idSala?: number;
  nomeSala?: string;
  data: string;
  horaInicio: string;
  horaFim: string;
}

export async function getHorarios() {
  const res = await axios.get(`${API_BASE_URL}/horarios`);

  return res.data;
}

export async function getHorariosTotal() {
  const res = await axios.get(`${API_BASE_URL}/horarios/horario-get`);

  return res.data;
}
