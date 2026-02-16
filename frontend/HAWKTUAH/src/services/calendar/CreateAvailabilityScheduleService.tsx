import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Representa um evento de disponibilidade.
 */
export interface AvailabilityEvent {
  id?: number;
  idFormador: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  estaMarcado: boolean;
}

/**
 * Representa um evento de horário (simplificado).
 */
export interface ScheduleEvent {
  data: string;
  horaInicio: string;
  horaFim: string;
}

/**
 * Representa um input de intervalo de disponibilidade.
 */
export interface ScheduleInputEvent {
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
}

/**
 * Obtém os eventos de disponibilidade do formador.
 * @returns Lista de eventos.
 */
export async function getEventosCalendario() {
  const response = await axios.get(API_BASE_URL + "/disponibilidadeformador");
  return response.data;
}

/**
 * Cria um novo evento de disponibilidade.
 * @param eventData - Dados do evento.
 */
export async function postEventosCalendario(eventData: ScheduleEvent) {
  const response = await axios.post(API_BASE_URL + "/disponibilidadeformador", {
    ...eventData,
  });
  return response.data;
}

/**
 * Remove um evento de disponibilidade.
 * @param id - ID do evento a remover.
 */
export async function deleteEventosCalendario(id: number) {
  const response = await axios.delete(
    API_BASE_URL + `/disponibilidadeformador/${id}`,
  );
  return response.data;
}

/**
 * Define disponibilidade num intervalo de datas.
 * @param eventData - Dados do intervalo.
 */
export async function postDisponibilidadeInput(eventData: ScheduleInputEvent) {
  const response = await axios.post(
    API_BASE_URL + "/disponibilidadeformador/inputs",
    {
      ...eventData,
    },
  );
  return response.data;
}
