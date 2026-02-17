import axios from "axios";
import { API_BASE_URL } from "../../config.constants";
import toast from "react-hot-toast";

/**
 * Representa um formador.
 */
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

/**
 * Obtém a lista de todos os formadores.
 * @returns Lista de formadores.
 */
export async function getFormadores(): Promise<Formador[]> {
  const res = await axios.get(`${API_BASE_URL}/formadores`);

  return res.data;
}

/**
 * Obtém os detalhes de um formador específico.
 * @param idFormador - ID do formador.
 * @returns Detalhes do formador.
 */
export async function getFormador(idFormador: string) {
  const res = await axios.get(`${API_BASE_URL}/formadores/${idFormador}`);

  return res;
}

/**
 * Remove um formador.
 * @param idFormador - ID do formador a remover.
 */
export async function deleteFormador(idFormador: string) {
  return axios.delete(`${API_BASE_URL}/formadores/${idFormador}`);
}

/**
 * Cria um novo formador.
 * @param data - Dados do novo formador.
 */
export async function postNewFormador(data: any) {
  return axios.post(`${API_BASE_URL}/formadores`, data);
}

/**
 * Atualiza um formador existente.
 * @param idFormador - ID do formador.
 * @param data - Novos dados do formador.
 */
export async function updateFormador(idFormador: string, data: any) {
  const res = await axios.put(`${API_BASE_URL}/formadores/${idFormador}`, data);
  return res.data;
}

/**
 * Obtém os tipos de matéria associados a formadores (para select).
 * @returns Lista de tipos de matéria.
 */
export async function getTiposMateria() {
  const res = await axios.get(`${API_BASE_URL}/formadores/tiposmateria`);

  return res.data;
}

/**
 * Verifica detalhes de um utilizador por email (para verificar existência).
 * @param email - Email a verificar.
 */
export async function checkEmail(email: string) {
  const res = await axios.get(
    `${API_BASE_URL}/utilizadores/details-by-email?email=${email}`,
  );

  return res;
}

/**
 * Descarrega a ficha do formador em PDF.
 * @param idFormador - ID do formador.
 * @param nomeFormador - Nome do formador (para o ficheiro).
 */
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
    toast.error("Não foi possível gerar o PDF.", { id: "errorPdF" });
  }
}
