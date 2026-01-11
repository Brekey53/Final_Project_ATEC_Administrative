import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export async function login(email: string, password: string) {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return res.data;
    // console.log("Status:", res.status);
    // console.log("Response data:", res.data);
  } catch (error: any) {
    if (error.response) {
      const message = error.response.data.message || error.response.data;
      throw new Error(message);
    }
    throw new Error("Erro ao ligar ao servidor");
  }
}
