import axios from "axios";
import { API_BASE_URL } from "../config.constants";


export async function Register(name: string, email: string, password: string) {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/register`, {
      UserName: name,
      Email: email,
      Password: password,
    });
    return res.data;
  } catch (error: any) {
    // if (error.response) {
    //   const message = error.response.data.message || error.response.data;
    //   throw Error(message);
    // }
    // throw Error("Erro ao ligar ao servidor");
    console.log(error.response);
    throw error;
  }
}
