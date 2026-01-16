import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export async function updateFormando(id: string, data: FormData) {
  // O Axios configura o Content-Type: multipart/form-data automaticamente ao receber FormData
  const res = await axios.put(`${API_BASE_URL}/formandos/${id}`, data);
  return res.data;
}
