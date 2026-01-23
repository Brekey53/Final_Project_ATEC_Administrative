import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export async function deleteFormando(idFormando: number) {
  return axios.delete(`${API_BASE_URL}/Formandos/${idFormando}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
}
