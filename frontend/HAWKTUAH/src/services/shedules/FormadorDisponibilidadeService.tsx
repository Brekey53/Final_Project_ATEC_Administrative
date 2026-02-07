import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export type Disponibilidade = {
  data: string;
  horaInicio: string;
  horaFim: string;
};

export type HorarioMarcado = {
  data: string;
  horaInicio: string;
  horaFim: string;
  nomeSala: string;
  nomeCurso: string;
};


export async function getDisponibilidadeFormador(
  idFormador: number,
): Promise<Disponibilidade[]> {
  const res = await axios.get<Disponibilidade[]>(
    `${API_BASE_URL}/horarios/${idFormador}/disponibilidade`,
  );
  return res.data;
}

export async function getHorariosFormador(
  idFormador: number,
): Promise<HorarioMarcado[]> {
  const res = await axios.get<HorarioMarcado[]>(
    `${API_BASE_URL}/horarios/${idFormador}/marcados`,
  );
  return res.data;
}
