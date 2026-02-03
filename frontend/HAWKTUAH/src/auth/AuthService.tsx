import axios from "axios";
import { API_BASE_URL } from "../config.constants";
import { jwtDecode } from "jwt-decode";

interface JwtToken {
  email: string;
  tipoUtilizador: string;
  exp: number;
}

export const authService = {
  async login(email: string, password: string) {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      return res.data;
    } catch (error: any) {
      if (error.response) {
        const message = "Erro ao ligar ao servidor";
        throw new Error(message);
      }
      throw new Error("Erro ao ligar ao servidor");
    }
  },

  async verify2FA(email: string, code: string) {
    const res = await axios.post(`${API_BASE_URL}/auth/verify-2fa`, {
      email,
      code,
    });

    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },

  decodeToken(): JwtToken | null {
    const token = localStorage.getItem("token");
    if (!token) 
      return null;

    try {
      return jwtDecode<JwtToken>(token);
    } catch {
      return null;
    }
  },
};
