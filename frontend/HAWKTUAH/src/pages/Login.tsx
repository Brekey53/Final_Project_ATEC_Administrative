import "../css/login.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Google from "../img/google.png";
import Facebook from "../img/facebook.jpg";
import { Link } from "react-router-dom";
import { authService } from "../auth/AuthService";
import { API_BASE_URL } from "../config.constants";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook para ler a URL

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Estado para mensagem de sucesso
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // useEffect para verificar os parâmetros da URL assim que o componente carrega
  useEffect(() => {
    if (searchParams.get("ativado") === "true") {
      setSuccessMessage("Conta ativada com sucesso! Já pode fazer login.");
    }
    navigate("/login", { replace: true }); // Navega para a página de login
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage(""); // Limpa mensagem de sucesso ao tentar novo login
    setLoading(true);

    try {
      const loginData = await authService.login(email, password);

      if (loginData.requires2FA) {
        setShow2FA(true);
        setEmail(loginData.email);
        setSuccessMessage("Código de verificação enviado para o seu e-mail.");
      }
      //navigate("/dashboard", { replace: true });
    } catch (err: any) {
      // TODO: Quando finalizado apagar o err.message
      setError(err.message || "Email ou password inválidos");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("O código deve ter 6 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.verify2FA(email, code);

      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.tipoUtilizador) {
          localStorage.setItem("tipoUtilizador", data.tipoUtilizador);
        }

        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }
  function LoginGoogle() {
    window.location.href = `${API_BASE_URL}/auth/login-google`; //http://localhost:5056/api/auth/login-google";
  }

  function LoginFacebook() {
    window.location.href = `${API_BASE_URL}/auth/login-facebook`;
  }

  return (
    <>
      <div className="col-12 col-lg-8 credentials-login">
        <div className="modal-login">
          {!show2FA ? (
            <div>
              <h2 className="text-center">Bem-vindo</h2>
              <p className="text-muted text-center">
                Entre na sua conta para continuar
              </p>
              <form
                onSubmit={handleSubmit}
                className="d-flex flex-column justify-content-center"
              >
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="mb-1">
                  <label className="form-label">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
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
                <Link
                  to="/forgot-password"
                  className="text-muted password-reset-text mb-4"
                >
                  Esqueceu a palavra passe?
                </Link>
                {error && <p className="text-danger text-center">{error}</p>}

                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Bem vindo, a entrar..." : "Entrar"}
                </button>
              </form>
              <div className="divisor">
                <p className="text-center">ou</p>
              </div>
              <div className="socials-login d-flex flex-column gap-3">
                <div className="social-btn shadow-sm p-3 rounded d-flex align-items-center gap-3">
                  <img src={Google} alt="Símbolo Google" />
                  <span onClick={LoginGoogle}>Continuar com o Google</span>
                </div>

                <div className="social-btn shadow-sm p-3 rounded d-flex align-items-center gap-3">
                  <img src={Facebook} alt="Símbolo Facebook" />
                  <span onClick={LoginFacebook}>Continuar com o Facebook</span>
                </div>
              </div>
              <div className="social-btn shadow-sm p-3 rounded gap-3 mt-5 text-center">
                <Link to="/create-account" className="criar-conta-link">
                  Não tem uma conta?{" "}
                  <span className="criar-conta-span">Inscreva-se</span>
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleVerify2FA}
              className="d-flex flex-column justify-content-center"
            >
              <div className="mb-4">
                <label className="form-label text-center d-block">
                  Código de Verificação
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="form-control text-center"
                  placeholder="000000"
                  maxLength={6}
                  style={{ fontSize: "1.5rem", letterSpacing: "5px" }}
                  required
                />
              </div>
              <button className="btn btn-success" disabled={loading}>
                {loading ? "A verificar..." : "Confirmar Código"}
              </button>
              <button
                type="button"
                className="btn btn-link mt-2 text-muted"
                onClick={() => setShow2FA(false)}
              >
                Voltar para Login
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
