import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

/**
 * Serviço responsável por operações relacionadas com a Navbar (ex: foto de perfil).
 */
class NavbarService {
  /**
   * Obtém a foto de perfil do utilizador para exibir na Navbar.
   * @returns URL (blob) da imagem ou null se não existir/erro.
   */
  async getFotoPerfil(): Promise<string | null> {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${API_BASE_URL}/utilizadores/perfil/foto`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
        validateStatus: (status) => status === 200 || status === 204,
      },
    );

    const blob = response.data;
    if (!blob || blob.size === 0) {
      return null;
    }
    return URL.createObjectURL(blob);
  }
}

export default new NavbarService();
