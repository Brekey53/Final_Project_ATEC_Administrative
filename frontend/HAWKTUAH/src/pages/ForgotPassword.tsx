import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config.constants";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email,
      });
      setMessage("Se o email existir, irá receber um email com instruções.");
      return res.data;
    } catch (err: any) {
      setMessage(
        err.mensagem || "Ocorreu um erro. Tente novamente mais tarde."
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

        {message && (
          <p className="alert alert-info text-center mt-3">{message}</p>
        )}

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
