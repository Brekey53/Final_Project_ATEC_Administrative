import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export async function getHorariosFormador() {
  const res = await axios.get(`${API_BASE_URL}/horarios/formador`);
  return res.data;
}

export async function getHorasFormadorMesAtual() {
  const res = await axios.get(`${API_BASE_URL}/formadores/mesatual`);
  return res.data.totalHoras;
}

export async function getHorasFormadorMesAnterior() {
  const res = await axios.get(`${API_BASE_URL}/formadores/mesanterior`);
  return res.data.totalHoras;
}

export async function getNumeroTurmasFormador() {
  const res = await axios.get(`${API_BASE_URL}/formadores/numTurmas`);
  return res.data;
}

export async function getHorariosFormando() {
  const res = await axios.get(`${API_BASE_URL}/horarios/formando`);
  return res.data;
}

export async function exportHorarioFormando() {
  const res = await axios.get(
    `${API_BASE_URL}/Horarios/exportar/formandoCalendar`,
    {
      responseType: "blob",
    },
  );
  return res.data;
}
