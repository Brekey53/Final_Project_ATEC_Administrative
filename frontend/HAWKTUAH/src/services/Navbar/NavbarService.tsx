import axios from "axios";
import { API_BASE_URL } from "../../config.constants";

class NavbarService {
  async getFotoPerfil(): Promise<string | null> {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${API_BASE_URL}/utilizadores/perfil/foto`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }
    );

    const blob = response.data;
    return URL.createObjectURL(blob);
  }
}

export default new NavbarService();
