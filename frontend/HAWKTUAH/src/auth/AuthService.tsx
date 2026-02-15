import axios from "axios";
import { API_BASE_URL } from "../config.constants";
import { jwtDecode } from "jwt-decode";

interface JwtToken {
  email: string;
  tipoUtilizador: string;
  exp: number;
}

// Verifica se o token está expirado (exp em segundos; margem de 60s)
function checkTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtToken>(token);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const marginSeconds = 60;
    return decoded.exp <= nowSeconds + marginSeconds;
  } catch {
    return true;
  }
}

export const authService = {
  async login(email: string, password: string) {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return res.data;
  },

  // Função para verificar se necessita de verificação 2FA
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

  // Remove o token e envia para a pagina login
  logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("dashboardIntroShown");
    window.location.href = "/login";
  },

  // Função para tratamento de token
  decodeToken(): JwtToken | null {
    const token = localStorage.getItem("token");
    if (!token || checkTokenExpired(token)) return null;

    try {
      return jwtDecode<JwtToken>(token);
    } catch {
      return null;
    }
  },

  // Remove o token e envia para a pagina login
  handleSessionExpired() {
    localStorage.removeItem("token");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  },

  // Verifica se o token está expirado
  isTokenExpired(): boolean {
    const token = localStorage.getItem("token");
    if (!token) return true;
    return checkTokenExpired(token);
  },
};
