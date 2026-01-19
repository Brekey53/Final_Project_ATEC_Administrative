import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config.constants";

type Props = {
  onSuccess: (jwt: string) => void;
};

export default function FacebookButton({ onSuccess }: Props) {
  const handleLogin = () => {
    if (!window.FB) {
      toast.error("Facebook SDK não carregado");
      return;
    }

    window.FB.login(
      (response: any) => {
        if (!response.authResponse) {
          toast.error("Login Facebook cancelado");
          return;
        }

        (async () => {
          try {
            const accessToken = response.authResponse.accessToken;

            const apiResponse = await axios.post(
              `${API_BASE_URL}/auth/facebook`,
              { accessToken },
            );

            onSuccess(apiResponse.data.token);
          } catch {
            toast.error("Erro no login Facebook");
          }
        })();
      },
      { scope: "email,public_profile" },
    );
  };

  return (
    <span onClick={handleLogin} style={{ cursor: "pointer" }}>
      Continuar com o Facebook
    </span>
  );
}
