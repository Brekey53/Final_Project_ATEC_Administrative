import { API_BASE_URL } from "../../config.constants";
import axios from "axios";

/**
 * Representa um horário de aula.
 */
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

/**
 * Resumo do agendamento de um módulo após geração automática.
 */
export interface ResumoAgendamentoModulo {
  nomeModulo: string;
  nomeFormador: string;
  horasTotais: number;
  horasAgendadas: number;
  concluidoComSucesso: boolean;
  prioridades: number;
  descricaoDetalhada: string;
}

/**
 * Resultado da execução do gerador de horários.
 */
export interface HorarioGeradorResultado {
  mensagem: string;
  totalAulasAgendadas: number;
  dataInicio?: string;
  dataFim?: string;
  resumo: ResumoAgendamentoModulo[];
}

/**
 * Obtém todos os horários registados.
 * @returns Lista de horários.
 */
export async function getHorarios() {
  const res = await axios.get(`${API_BASE_URL}/horarios`);

  return res.data;
}

/**
 * Obtém uma visão total dos horários (formato específico para calendário/timeline).
 * @returns Dados agregados dos horários.
 */
export async function getHorariosTotal() {
  const res = await axios.get(`${API_BASE_URL}/horarios/horario-get`);

  return res.data;
}

/**
 * Obtém um horário específico pelo ID.
 * @param id - ID do horário.
 * @returns Detalhes do horário.
 */
export async function getHorariosById(id: number) {
  const res = await axios.get(`${API_BASE_URL}/horarios/${id}`);

  return res.data;
}

/**
 * Atualiza um horário existente.
 * @param id - ID do horário a atualizar.
 * @param data - Novos dados do horário.
 */
export async function updateHorario(id: string, data: FormData) {
  const res = await axios.put(`${API_BASE_URL}/horarios/${id}`, data);
  return res.data;
}

/**
 * Cria um novo horário.
 * @param data - Dados do novo horário.
 */
export async function postHorario(data: FormData) {
  const res = await axios.post(`${API_BASE_URL}/horarios`, data);
  return res.data;
}

/**
 * Gera automaticamente horários para uma turma.
 * @param idTurma - ID da turma alvo.
 * @returns Resultado da geração (sucesso, conflitos, resumo).
 */
export async function autoGenerateSchedule(idTurma: number) {
  const res = await axios.post(
    `${API_BASE_URL}/horarios/gerar-automatico/${idTurma}`,
  );
  return res.data;
}

/**
 * Remove um horário.
 * @param id - ID do horário a remover.
 */
export async function deleteHorario(id: number) {
  const res = await axios.delete(`${API_BASE_URL}/horarios/${id}`);
  return res.data;
}
