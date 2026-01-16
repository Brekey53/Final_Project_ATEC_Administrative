import axios from "axios";
import { API_BASE_URL } from "../config.constants";

const authHeaders = {
  Authorization: `Bearer ${localStorage.getItem("token")}`,
};

export const updateFormando = async (
  idFormando: string | number,
  data: FormData
) => {
  return axios.put(
    `${API_BASE_URL}/formandos/${idFormando}`,
    data,
    {
      headers: authHeaders,
    }
  );
};
