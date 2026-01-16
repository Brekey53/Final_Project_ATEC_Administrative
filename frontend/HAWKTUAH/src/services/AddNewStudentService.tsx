import axios from "axios";
import { API_BASE_URL } from "../config.constants";

/**
 * Envia os dados do novo formando (incluindo ficheiros) para o servidor.
 * @param formData Objeto FormData contendo campos de texto e ficheiros binários.
 */

export async function postNewFormandos(formData: FormData) {
  try {
    const res = await axios.post(`${API_BASE_URL}/formandos/completo`, formData);
    return res.data;
  } catch (error: any) {
    console.log(error.response);
    if (error.response) {
      const message = error.response.data.message || error.response.data;
      throw new Error(message);
    }
    throw new Error("Erro ao ligar ao servidor");
  }
}
