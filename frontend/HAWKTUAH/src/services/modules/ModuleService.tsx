import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

export interface Modulos {
  idModulo: number;
  codigoIdentificacao: string;
  nome: string;
  horasTotais: number;
  creditos: number;
}

export interface ModulosEdit {
  idModulo: number;
  codigoIdentificacao: string;
  nome: string;
  horasTotais: number;
  creditos: number;
  idTipoMateria: number;
  nomeTipoMateria: string;
}

export async function getModulos(): Promise<Modulos[]> {
  const res = await axios.get(`${API_BASE_URL}/modulos`);

  return res.data;
}

export async function getModulo(idModulo: string) {
  const res = await axios.get(`${API_BASE_URL}/modulos/${idModulo}`);

  return res.data;
}

export async function deleteModulo(idModulo: string) {
  return axios.delete(`${API_BASE_URL}/modulos/${idModulo}`);
}

export async function postNewModulo(data: any) {
  return axios.post(`${API_BASE_URL}/modulos`, data);
}

export async function updateModulo(idModulo: string, data: any) {
  const res = await axios.put(`${API_BASE_URL}/modulos/${idModulo}`, data);
  return res.data;
}

export async function getTiposMateria() {
  const res = await axios.get(`${API_BASE_URL}/modulos/tiposmateria`);
  return res.data;
}