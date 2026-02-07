import axios from "axios";
import { API_BASE_URL } from "../../config.constants";
import { toast } from "react-hot-toast";

export interface Formando {
  idFormando: number;
  nome: string;
  nif: string;
  dataNascimento: string;
  morada: string;
  telefone?: string;
  sexo: string;
  email: string;
  turma: string;
  idEscolaridade: string;
  estado: string;
  fotografia: File | null;
  anexoFicheiro: File | null;
}


// Obter todos os formandos
export async function getFormandos(): Promise<Formando[]> {
  const res = await axios.get(`${API_BASE_URL}/formandos`);
  return res.data;
}

// Obter detalhes de um formando por ID
export async function getFormandoById(
  idFormando: number | string,
): Promise<any> {
  const res = await axios.get(`${API_BASE_URL}/formandos/${idFormando}`);
  return res.data;
}

export async function postNewFormandos(formData: FormData) {
  const res = await axios.post(`${API_BASE_URL}/formandos/completo`, formData);
  return res.data;
}

export async function updateFormando(id: string, data: FormData) {
  // O Axios configura o Content-Type: multipart/form-data automaticamente ao receber FormData

  const res = await axios.put(`${API_BASE_URL}/formandos/${id}`, data);
  return res.data;
}

export async function deleteFormando(idFormando: number) {
  return axios.delete(`${API_BASE_URL}/Formandos/${idFormando}`);
}

export async function getTurmas() {
  const res = await axios.get(`${API_BASE_URL}/turmas`);

  return res.data;
}

export async function getEscolaridades() {
  const res = await axios.get(`${API_BASE_URL}/escolaridades`);

  return res.data;
}

export async function checkEmail(email: string) {
  const res = await axios.get(
    `${API_BASE_URL}/utilizadores/details-by-email?email=${email}`,
  );

  return res.data;
}

export async function downloadFicheiroPDF(
  idFormando: number,
  nomeFormando: string,
) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/formandos/${idFormando}/download-ficha`,
      {
        responseType: "blob",
      },
    );

    // Criar um link invisível para forçar o download no browser
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Ficha_${nomeFormando}.pdf`);
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
