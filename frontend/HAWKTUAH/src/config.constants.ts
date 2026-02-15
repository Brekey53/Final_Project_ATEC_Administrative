import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const API_BASE_URL = "https://localhost:7022/api";

axios.defaults.baseURL = API_BASE_URL;


// Verifica se o token JWT está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const nowSeconds = Math.floor(Date.now() / 1000);
    return decoded.exp <= nowSeconds + 60;
  } catch {
    return true;
  }
};

// Intercetor de Pedido: Adiciona o Token e verifica expiração antes de enviar
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem("token");
        if(window.location.pathname !== "/login"){
          window.location.href = "/login";
        }
        return Promise.reject(new Error("Sessão expirada"));
      }
      // Anexa o cabeçalho Authorization a todos os pedidos automaticamente
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Intercetor de Resposta: Lida com erros globais (como o 401 ou 403)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sessão expirada. A redirecionar...");
      localStorage.removeItem("token");

      if(window.location.pathname !== "/login"){
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axios;
