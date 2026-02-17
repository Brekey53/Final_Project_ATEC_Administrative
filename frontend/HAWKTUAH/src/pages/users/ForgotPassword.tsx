import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config.constants";
import { useState } from "react";
import toast from "react-hot-toast";
import { checkEmail } from "../../services/users/UserService";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {

      const resMail = await checkEmail(email);
      if (!resMail) {
        toast.error("Email não encontrado na nossa base de dados.", { id: "errorEmail"});
        return;
      }

      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email,
      });
      toast.success("Irá receber um email com instruções.", { id: "MailEnviado" });
      return res.data;
    } catch (err: any) {
      toast.error( err.response?.data?.message || "Ocorreu um erro. Tente novamente mais tarde.", { id: "errorNãoEnviado" }
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="credentials-login">
      <div className="modal-login">
        <Link to="/login" className="btn btn-link mb-3">
          <button className="btn text-muted rounded-3">← Voltar</button>
        </Link>

        <h2 className="text-center">Recuperar password</h2>

        <form
          className="d-flex flex-column justify-content-center mt-4"
          onSubmit={handleSubmit}
        >
          <div className="mb-3">
            <label className="form-label">Insira o seu email:</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              required
            />
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "A enviar..." : "Enviar link de recuperação"}
          </button>
        </form>
      </div>
    </div>
  );
}
