import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Obtém os horários do formador autenticado.
 * @returns Lista de horários.
 */
export async function getHorariosFormador() {
  const res = await axios.get(`${API_BASE_URL}/horarios/formador`);
  return res.data;
}

/**
 * Obtém o total de horas dadas pelo formador no mês atual.
 * @returns Total de horas.
 */
export async function getHorasFormadorMesAtual() {
  const res = await axios.get(`${API_BASE_URL}/formadores/mesatual`);
  return res.data.totalHoras;
}

/**
 * Obtém o total de horas dadas pelo formador no mês anterior.
 * @returns Total de horas.
 */
export async function getHorasFormadorMesAnterior() {
  const res = await axios.get(`${API_BASE_URL}/formadores/mesanterior`);
  return res.data.totalHoras;
}

/**
 * Obtém o número de turmas associadas ao formador.
 * @returns Número de turmas.
 */
export async function getNumeroTurmasFormador() {
  const res = await axios.get(`${API_BASE_URL}/formadores/numTurmas`);
  return res.data;
}

/**
 * Obtém os horários do formando autenticado.
 * @returns Lista de horários.
 */
export async function getHorariosFormando() {
  const res = await axios.get(`${API_BASE_URL}/horarios/formando`);
  return res.data;
}

/**
 * Exporta o horário do formando para formato de calendário (ICS/PDF).
 * @returns Ficheiro binário (blob).
 */
export async function exportHorarioFormando() {
  const res = await axios.get(
    `${API_BASE_URL}/Horarios/exportar/formandoCalendar`,
    {
      responseType: "blob",
    },
  );
  return res.data;
}

/**
 * Exporta o horário do formador para formato de calendário (ICS/PDF).
 * @returns Ficheiro binário (blob).
 */
export async function exportHorarioFormador() {
  const res = await axios.get(
    `${API_BASE_URL}/Horarios/exportar/formadorCalendar`,
    {
      responseType: "blob",
    },
  );
  return res.data;
}
