import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Define a disponibilidade de um formador.
 */
export type Disponibilidade = {
  data: string;
  horaInicio: string;
  horaFim: string;
};

/**
 * Representa um horário já marcado para um formador.
 */
export type HorarioMarcado = {
  data: string;
  horaInicio: string;
  horaFim: string;
  nomeSala: string;
  nomeCurso: string;
};

/**
 * Obtém a disponibilidade de um formador.
 * @param idFormador - ID do formador.
 * @returns Lista de períodos de disponibilidade.
 */
export async function getDisponibilidadeFormador(
  idFormador: number,
): Promise<Disponibilidade[]> {
  const res = await axios.get<Disponibilidade[]>(
    `${API_BASE_URL}/horarios/${idFormador}/disponibilidade`,
  );
  return res.data;
}

/**
 * Obtém os horários marcados de um formador.
 * @param idFormador - ID do formador.
 * @returns Lista de horários marcados.
 */
export async function getHorariosFormador(
  idFormador: number,
): Promise<HorarioMarcado[]> {
  const res = await axios.get<HorarioMarcado[]>(
    `${API_BASE_URL}/horarios/${idFormador}/marcados`,
  );
  return res.data;
}
