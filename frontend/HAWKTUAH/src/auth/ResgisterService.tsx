import axios from "axios";
import { API_BASE_URL } from "../config.constants";

// TODO: RETIRAR O NOME?????????? Retirei! xD
export async function Register( email: string, password: string) {
  try {
    const res = await axios.post(`${API_BASE_URL}/utilizadores`, {
      email,
      password,
    });
    console.log("Status:", res.status);
    console.log("Response data:", res.data);
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Credenciais inválidas");
    }
    throw new Error("Erro ao ligar ao servidor");
  }

}
