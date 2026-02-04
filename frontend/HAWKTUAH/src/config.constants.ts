import axios from "axios";

export const API_BASE_URL = "https://localhost:7022/api";

axios.defaults.baseURL = API_BASE_URL;


// Intercetor de Pedido: Adiciona o Token antes de enviar para o servidor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
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
