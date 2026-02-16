import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Representa um módulo dentro de um curso.
 */
export type Modulo = {
  idModulo: number;
  nome: string;
  horasTotais: number;
  creditos: number;
  prioridade: number;
};

/**
 * Representa um curso com os seus módulos associados.
 */
export type Curso = {
  idCurso: number;
  nome: string;
  idArea: number;
  modulos: Modulo[];
  nomeArea: string;
};

/**
 * Representa uma área de formação.
 */
export type AreaCurso = {
  idArea: number;
  nome: string;
};

/**
 * Obtém a lista de todos os cursos.
 * @returns Lista de cursos.
 */
export async function getCursos(): Promise<Curso[]> {
  const res = await axios.get(`${API_BASE_URL}/cursos`);
  return res.data;
}

/**
 * Obtém a lista de áreas de cursos disponíveis.
 * @returns Lista de áreas.
 */
export async function getAreaCursos(): Promise<AreaCurso[]> {
  const res = await axios.get("/Cursos/areaCursos");
  return res.data;
}

/**
 * Obtém os detalhes de um curso específico.
 * @param idCurso - ID do curso.
 * @returns Detalhes do curso.
 */
export async function getCursoById(idCurso: string): Promise<Curso> {
  const res = await axios.get(`${API_BASE_URL}/cursos/${idCurso}`);
  return res.data;
}

/**
 * Obtém todos os módulos disponíveis no sistema.
 * @returns Lista de módulos.
 */
export async function getAllModulos(): Promise<Modulo[]> {
  const res = await axios.get(`${API_BASE_URL}/modulos`);
  return res.data;
}

/**
 * Obtém os módulos associados a um curso.
 * @param idCurso - ID do curso.
 * @returns Dados do curso com os módulos.
 */
export async function getModulosFromCurso(idCurso: number): Promise<Curso> {
  const res = await axios.get(`${API_BASE_URL}/cursos/${idCurso}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}

/**
 * Atualiza um curso e os seus módulos.
 * @param idCurso - ID do curso.
 * @param data - Novos dados do curso e lista de módulos.
 */
export async function updateCurso(
  idCurso: string,
  data: {
    nome: string;
    idArea: number;
    modulos: {
      idModulo: number;
      prioridade: number;
    }[];
  },
) {
  const res = await axios.put(`${API_BASE_URL}/cursos/${idCurso}`, data);
  return res.data;
}

/**
 * Cria um novo curso.
 * @param data - Dados do novo curso.
 */
export async function postNewCurso(data: {
  nome: string;
  idArea: number;
  descricao: string;
}) {
  const response = await axios.post("/cursos", data);
  return response.data;
}

/**
 * Remove um curso.
 * @param idCurso - ID do curso a remover.
 */
export async function deleteCurso(idCurso: number): Promise<Curso> {
  const res = await axios.delete(`${API_BASE_URL}/cursos/${idCurso}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}
