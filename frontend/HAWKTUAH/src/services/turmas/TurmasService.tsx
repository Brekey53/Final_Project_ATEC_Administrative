import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface Turma {
  idTurma: number;
  idCurso: number;
  nomeTurma: string;
  dataInicio: string;
  dataFim: string;
  nomeCurso: string;
}

export async function getTurmas() {
  const res = await axios.get(`${API_BASE_URL}/turmas`);

  return res.data;
}

export async function getTurma(idSala: string) {
  const res = await axios.get(`${API_BASE_URL}/turmas/${idSala}`);

  return res.data;
}

export async function deleteTurma(idSala: number) {
  return axios.delete(`${API_BASE_URL}/turmas/${idSala}`);
}

export async function postNewTurma(data: any) {
  return axios.post(`${API_BASE_URL}/turmas`, data);
}

export async function updateTurma(idSala: string, data: any){
  const res = await axios.put(`${API_BASE_URL}/turmas/${idSala}`, data);
  return res.data;
}

export async function getCursos(){
  const res = await axios.get(`${API_BASE_URL}/cursos`);
  return res.data;
}


