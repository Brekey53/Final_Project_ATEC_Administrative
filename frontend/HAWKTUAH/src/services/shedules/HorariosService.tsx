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

export interface ResumoAgendamentoModulo {
  nomeModulo: string;
  nomeFormador: string;
  horasTotais: number;
  horasAgendadas: number;
  concluidoComSucesso: boolean;
  prioridades: number;
  descricaoDetalhada: string;
}

export interface HorarioGeradorResultado {
  mensagem: string;
  totalAulasAgendadas: number;
  dataInicio?: string;
  dataFim?: string;
  resumo: ResumoAgendamentoModulo[];
}

export async function getHorarios() {
  const res = await axios.get(`${API_BASE_URL}/horarios`);

  return res.data;
}

export async function getHorariosTotal() {
  const res = await axios.get(`${API_BASE_URL}/horarios/horario-get`);

  return res.data;
}

export async function getHorariosById(id: number) {
  const res = await axios.get(`${API_BASE_URL}/horarios/${id}`);

  return res.data;
}

export async function updateHorario(id: string, data: FormData) {
  const res = await axios.put(`${API_BASE_URL}/horarios/${id}`, data);
  return res.data;
}

export async function postHorario(data: FormData) {
  const res = await axios.post(`${API_BASE_URL}/horarios`, data);
  return res.data;
}

export async function autoGenerateSchedule(idTurma: number) {
  const res = await axios.post(
    `${API_BASE_URL}/horarios/gerar-automatico/${idTurma}`,
  );
  return res.data;
}

export async function deleteHorario(id: number) {
  const res = await axios.delete(`${API_BASE_URL}/horarios/${id}`);
  return res.data;
}
