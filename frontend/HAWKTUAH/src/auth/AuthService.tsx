import axios from "axios";
import { API_BASE_URL } from "../config.constants";
import { jwtDecode } from "jwt-decode";

/**
 * Interface representando os dados descodificados do token JWT.
 */
interface JwtToken {
  email: string;
  tipoUtilizador: string;
  exp: number;
}

// Verifica se o token está expirado (exp em segundos; margem de 60s)
/**
 * Verifica se um token está expirado.
 * @param token - O token JWT.
 * @returns true se expirado, false caso contrário.
 */
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
  /**
   * Realiza o login do utilizador.
   * @param email - Email do utilizador.
   * @param password - Palavra-passe.
   * @returns Dados da resposta (token ou necessidade de 2FA).
   */
  async login(email: string, password: string) {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return res.data;
  },

  // Função para verificar se necessita de verificação 2FA
  /**
   * Verifica o código de 2FA.
   * @param email - Email do utilizador.
   * @param code - Código 2FA.
   * @returns Dados da resposta (inclui token se sucesso).
   */
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
  /**
   * Realiza o logout, removendo token e redirecionando.
   */
  logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("dashboardIntroShown");
    window.location.href = "/login";
  },

  // Função para tratamento de token
  /**
   * Descodifica o token JWT armazenado.
   * @returns Objeto com dados do token ou null se inválido/expirado.
   */
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
  /**
   * Trata a expiração da sessão (remove token e redireciona).
   */
  handleSessionExpired() {
    localStorage.removeItem("token");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  },

  // Verifica se o token está expirado
  /**
   * Verifica se o token armazenado está expirado.
   * @returns true se expirado ou inexistente, false caso contrário.
   */
  isTokenExpired(): boolean {
    const token = localStorage.getItem("token");
    if (!token) return true;
    return checkTokenExpired(token);
  },
};
