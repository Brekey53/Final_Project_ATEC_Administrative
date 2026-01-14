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
        const message = error.response.data.message || error.response.data;
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

  isAdmin(): boolean {
    const decoded = this.decodeToken();
    if (!decoded) 
      return false;

    const tipo = Number(decoded.tipoUtilizador);
    return tipo === 1 || tipo === 4;
  },

  /* TODO: oq eufa */
  isAuthenticated(): boolean {
    const decoded = this.decodeToken();
    if (!decoded) 
      return false;

    return decoded.exp * 1000 > Date.now();
  },
};
