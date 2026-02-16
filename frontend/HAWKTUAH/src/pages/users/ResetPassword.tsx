import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config.constants";
import { toast } from "react-hot-toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // Captura o JWT da URL

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setShowPassword(false);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("As passwords não coincidem.");
      return;
    }

    if (newPassword.length < 6 || confirmPassword.length < 6) {
      toast.error("Tem de ter pelo menos 6 caracteres");
    }

    const isPasswordStrong = (pass: string) => {
      const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!.%*?&]{6,}$/;
      return regex.test(pass);
    };

    if (!isPasswordStrong(newPassword)) {
      toast.error(
        "A password deve ter pelo menos 6 caracteres, incluindo uma letra e um número.",
        { id: "erro-password-inválida" },
      );
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        Token: token,
        NewPassword: newPassword,
      });
      toast.success("Password alterada com sucesso!", {
        id: "successChangePass",
      });
      navigate("/login");
    } catch (err: any) {
      toast.error("Erro ao alterar a password, tente novamente.", {
        id: "errorChangePass",
      });
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
            <br />
            <small className="text-muted">
              Tem de ter pelo menos 6 caracteres.
            </small>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Password:</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="showPass"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label
              className="form-check-label text-muted"
              htmlFor="showPass"
              style={{ fontSize: "0.9rem" }}
            >
              Mostrar palavra-passe
            </label>
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "A processar..." : "Redefinir Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
