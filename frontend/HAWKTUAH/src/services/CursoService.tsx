import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export interface Curso {
  idCurso: number,
  idArea: number,
  nome: string
}

export async function getMyPerfil(): Promise<Curso> {
  const res = await axios.get(`${API_BASE_URL}/utilizadores/perfil`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.data;
}

export async function getFotoPerfil(): Promise<string> {
  const res = await axios.get(
    `${API_BASE_URL}/utilizadores/perfil/foto`,
    {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return URL.createObjectURL(res.data);
}

