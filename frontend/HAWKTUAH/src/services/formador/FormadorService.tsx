import axios from "axios";
import { API_BASE_URL } from "../../config.constants";
import toast from "react-hot-toast";

export interface Formador {
  idFormador: string;
  iban: string;
  qualificacoes: string;
  nome: string;
  nif: string;
  dataNascimento: string;
  morada: string;
  telefone?: string;
  sexo: string;
  email: string;
  fotografia: File | null;
  anexoFicheiro: File | null;
}

export async function getFormadores(): Promise<Formador[]> {
  const res = await axios.get(`${API_BASE_URL}/formadores`);

  return res.data;
}

export async function getFormador(idFormador: string) {
  const res = await axios.get(`${API_BASE_URL}/formadores/${idFormador}`);

  return res;
}

export async function deleteFormador(idFormador: string) {
  return axios.delete(`${API_BASE_URL}/formadores/${idFormador}`);
}

export async function postNewFormador(data: any) {
  return axios.post(`${API_BASE_URL}/formadores`, data);
}

export async function updateFormador(idFormador: string, data: any) {
  const res = await axios.put(`${API_BASE_URL}/formadores/${idFormador}`, data);
  return res.data;
}

export async function checkEmail(email: string) {
  const res = await axios.get(`${API_BASE_URL}/utilizadores/details-by-email?email=${email}`);
  
  return res;
}

export async function downloadFicheiroPDF(
  idFormador: number,
  nomeFormador: string,
) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/formadores/${idFormador}/download-ficha`,
      {
        responseType: "blob", 
      },
    );

    // Criar um link invisível para forçar o download no browser
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Ficha_${nomeFormador}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Limpeza
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao descarregar PDF", error);
    toast.error("Não foi possível gerar o PDF.");
  }
}
