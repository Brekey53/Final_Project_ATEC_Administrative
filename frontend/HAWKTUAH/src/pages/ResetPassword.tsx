import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config.constants";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // Captura o JWT da URL

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("As passwords não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        Token: token,
        NewPassword: newPassword,
      });
      alert("Password alterada com sucesso!");
      navigate("/login");
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "O link expirou ou é inválido."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token)
    return (
      <div className="text-center mt-5">Token de recuperação em falta.</div>
    );

  return (
    <div className="credentials-login">
      <div className="modal-login">
        <h2 className="text-center">Nova Password</h2>
        <p className="text-muted text-center">
          Defina a sua nova palavra-passe abaixo.
        </p>

        {message && <p className="alert alert-danger text-center">{message}</p>}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 mt-4">
          <div className="form-group">
            <label className="form-label">Nova Password:</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Password:</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "A processar..." : "Redefinir Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
