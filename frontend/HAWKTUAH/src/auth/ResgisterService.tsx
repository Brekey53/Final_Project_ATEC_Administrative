import axios from "axios";
import { API_BASE_URL } from "../config.constants";

// TODO: RETIRAR O NOME?????????? Retirei! xD
export async function Register(email: string, password: string) {
  try {
    const res = await axios.post(`${API_BASE_URL}/utilizadores`, {
      email,
      password,
    });
    return res.data;
  } catch (error: any) {
    if (error.response) {
      const message = error.response.data.message || error.response.data;
      throw new Error(message);
    }
    throw new Error("Erro ao ligar ao servidor");
  }
}
