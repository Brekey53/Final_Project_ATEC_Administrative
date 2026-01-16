import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export const updateFormando = async (
  idFormando: string | number,
  data: FormData
) => {
  return axios.put(
    `${API_BASE_URL}/formandos/${idFormando}`,
    data,
    {
      headers: {
            /*TODO: O BEARER TOKEN*/
      },
    }
  );
};
