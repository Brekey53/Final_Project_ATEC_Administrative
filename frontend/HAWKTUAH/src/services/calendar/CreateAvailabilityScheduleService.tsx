import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface AvailabilityEvent {
  id?: number;
  idFormador: number;
  data: string;
  horaInicio: string;
  horaFim: string;
}

export interface ScheduleEvent {
  data: string;
  horaInicio: string;
  horaFim: string;
}

export interface ScheduleInputEvent {
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
}

export async function getEventosCalendario() {
  const response = await axios.get(API_BASE_URL + "/disponibilidadeformador");
  return response.data;
}

export async function postEventosCalendario(eventData: ScheduleEvent) {
  const response = await axios.post(API_BASE_URL + "/disponibilidadeformador", {
    ...eventData,
  });
  return response.data;
}

export async function deleteEventosCalendario(id: number) {
  const response = await axios.delete(
    API_BASE_URL + `/disponibilidadeformador/${id}`,
  );
  return response.data;
}


export async function postDisponibilidadeInput(eventData: ScheduleInputEvent) {
  const response = await axios.post(API_BASE_URL + "/disponibilidadeformador/inputs", {
    ...eventData,
  });
  return response.data;
}
