import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Interface base para o perfil de utilizador.
 */
export interface PerfilBase {
  tipo: number;
  email: string;
  nome?: string;
  nif?: string;
  telefone?: string;
  dataNascimento?: string;
  sexo?: string;
  morada?: string;
  statusAtivacao: number;
}

export interface PerfilFormando {
  idFormando: number;
  escolaridade: string;
}

export interface PerfilFormador {
  idFormador: number;
  iban?: string;
  qualificacoes?: string;
}

export type Perfil = PerfilBase &
  Partial<PerfilFormando> &
  Partial<PerfilFormador>;

/**
 * Obtém o perfil do utilizador autenticado.
 * Combina informações base com dados específicos de Formando/Formador.
 * @returns Dados do perfil combinados.
 */
export async function getMyPerfil(): Promise<Perfil> {
  const res = await axios.get(`${API_BASE_URL}/utilizadores/perfil`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (res.data.baseInfo) {
    return {
      tipo: res.data.baseInfo.idTipoUtilizador,
      ...res.data.baseInfo,
      ...res.data.extra,
    };
  }

  return {
    tipo: res.data.idTipoUtilizador,
    ...res.data,
  };
}

/**
 * Obtém a fotografia de perfil do utilizador autenticado.
 * @returns URL (blob) da imagem ou string vazia se não existir.
 */
export async function getFotoPerfil(): Promise<string> {
  const res = await axios.get(`${API_BASE_URL}/utilizadores/perfil/foto`, {
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.data || res.data.size === 0) {
    return "";
  }

  return URL.createObjectURL(res.data);
}
