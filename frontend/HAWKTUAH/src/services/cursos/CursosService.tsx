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
  idArea: number;
  nome: string;
  modulos: Modulo[];
};


export async function getCursos(): Promise<Curso> {
    const res = await axios.get(`${API_BASE_URL}/cursos`, {
        headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    });
    return res.data;
}

export async function getModulosFromCurso(idCurso: number): Promise<Curso>{
  const res = await axios.get(`${API_BASE_URL}/cursos/${idCurso}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}