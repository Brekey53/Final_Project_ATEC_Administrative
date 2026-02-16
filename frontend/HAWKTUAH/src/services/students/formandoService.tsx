import axios from "axios";
import { API_BASE_URL } from "../../config.constants";
import { toast } from "react-hot-toast";

/**
 * Representa um formando (aluno).
 */
export interface Formando {
  idFormando: number;
  nome: string;
  nif: string;
  dataNascimento: string;
  morada: string;
  telefone?: string;
  sexo: string;
  email: string;
  nomeTurma: string;
  idEscolaridade: string;
  estado: string;
  fotografia: File | null;
  anexoFicheiro: File | null;
  dataFim?: string;
}

// Obter todos os formandos
/**
 * Obtém a lista de todos os formandos.
 * @returns Lista de formandos.
 */
export async function getFormandos() {
  const res = await axios.get(`${API_BASE_URL}/formandos`);
  return res.data;
}

/**
 * Obtém os detalhes de um formando pelo ID.
 * @param idFormando - ID do formando.
 * @returns Detalhes do formando.
 */
export async function getFormandoById(
  idFormando: number | string,
): Promise<any> {
  const res = await axios.get(`${API_BASE_URL}/formandos/${idFormando}`);
  return res.data;
}

/**
 * Cria um novo formando.
 * @param formData - Dados do novo formando.
 */
export async function postNewFormandos(formData: FormData) {
  const res = await axios.post(`${API_BASE_URL}/formandos/completo`, formData);
  return res.data;
}

/**
 * Atualiza os dados de um formando.
 * @param id - ID do formando.
 * @param data - Novos dados do formando.
 */
export async function updateFormando(id: string, data: FormData) {
  // O Axios configura o Content-Type: multipart/form-data automaticamente ao receber FormData

  const res = await axios.put(`${API_BASE_URL}/formandos/${id}`, data);
  return res.data;
}

/**
 * Remove um formando.
 * @param idFormando - ID do formando a remover.
 */
export async function deleteFormando(idFormando: number) {
  return axios.delete(`${API_BASE_URL}/Formandos/${idFormando}`);
}

/**
 * Obtém todas as turmas (auxiliar).
 * @returns Lista de turmas.
 */
export async function getTurmas() {
  const res = await axios.get(`${API_BASE_URL}/turmas`);

  return res.data;
}

/**
 * Obtém a lista de escolaridades disponíveis.
 * @returns Lista de escolaridades.
 */
export async function getEscolaridades() {
  const res = await axios.get(`${API_BASE_URL}/escolaridades`);

  return res.data;
}

/**
 * Verifica dados (detalhes) associados a um email.
 * @param email - Email a verificar.
 */
export async function checkEmail(email: string) {
  const res = await axios.get(
    `${API_BASE_URL}/utilizadores/details-by-email?email=${email}`,
  );

  return res.data;
}

/**
 * Descarrega a ficha do formando em formato PDF.
 * @param idFormando - ID do formando.
 * @param nomeFormando - Nome do formando (para o nome do ficheiro).
 */
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
    toast.error("Não foi possível gerar o PDF.", { id: "errorPDF" });
  }
}
