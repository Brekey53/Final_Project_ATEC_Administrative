import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export type Modulo = {
  idModulo: number;
  nome: string;
  horasTotais: number;
  creditos: number;
  prioridade: number;
};

export type Curso = {
  idCurso: number;
  nome: string;
  idArea: number;
  modulos: Modulo[];
};

export async function getCursos(): Promise<Curso[]> {
  const res = await axios.get(`${API_BASE_URL}/cursos`);
  return res.data;
}

export async function getCursoById(idCurso: string): Promise<Curso> {
  const res = await axios.get(`${API_BASE_URL}/cursos/${idCurso}`);
  return res.data;
}

export async function getAllModulos(): Promise<Modulo[]> {
  const res = await axios.get(`${API_BASE_URL}/modulos`);
  return res.data;
}

export async function getModulosFromCurso(idCurso: number): Promise<Curso> {
  const res = await axios.get(`${API_BASE_URL}/cursos/${idCurso}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}

export async function updateCurso(
  idCurso: string,
  data: {
    nome: string;
    idArea: number;
    moduloIds: number[];
  },
) {
  const res = await axios.put(`${API_BASE_URL}/cursos/${idCurso}`, data);
  return res.data;
}

export async function postNewCurso(data: {
  nome: string;
  idArea: number;
  descricao: string;
}) {
  const response = await axios.post("/cursos", data);
  return response.data;
}

export async function deleteCurso(idCurso: number): Promise<Curso> {
  const res = await axios.delete(`${API_BASE_URL}/cursos/${idCurso}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}