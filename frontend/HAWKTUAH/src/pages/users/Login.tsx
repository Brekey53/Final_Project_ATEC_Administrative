import "../../css/login.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Facebook from "../../img/facebook.jpg";
import { Link } from "react-router-dom";
import { authService } from "../../auth/AuthService";
import { API_BASE_URL } from "../../config.constants";
import toast from "react-hot-toast";

import { GoogleLogin } from "@react-oauth/google";
import FacebookButton from "../../components/FacebookButton";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook para ler a URL

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // useEffect para verificar os parâmetros da URL assim que o componente carrega
  useEffect(() => {
    const ativado = searchParams.get("ativado");
    const socialSuccessG = searchParams.get("socialLoginG");
    const socialSuccessF = searchParams.get("socialLoginF");
    const token = searchParams.get("token");

    if (!ativado && !socialSuccessG && !socialSuccessF) return;

    if (ativado === "true") {
      toast.success("Conta ativada com sucesso! Já pode fazer login." , { id: "ativado-toast"} );
      navigate("/login", { replace: true });
      return;
    }

    if (token) {
      localStorage.setItem("token", token);

      if (socialSuccessF === "success") {
        toast.success("Facebook login efetuado com sucesso!", {
          id: "social-toast",
        });
      } else if (socialSuccessG === "success") {
        toast.success("Google login efetuado com sucesso!", {
          id: "social-toast",
        });
      }

      const currentPath = window.location.pathname;
      window.history.replaceState({}, "", currentPath);

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    }
  }, [searchParams, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData = await authService.login(email, password);

      if (loginData.requires2FA) {
        setShow2FA(true);
        setEmail(loginData.email);
        toast.success("Código de verificação enviado para o seu e-mail.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Email ou password inválidos");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (code.length !== 6) {
        toast.error("O código deve ter 6 dígitos.");
        return;
      }

      const data = await authService.verify2FA(email, code);

      if (data.token) {
        localStorage.setItem("token", data.token);
        toast.success("Bem-vindo de volta!");
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      toast.error("Código inválido ou expirado.", {
        id: "2fa-error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse: any) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        idToken: credentialResponse.credential,
      });

      localStorage.setItem("token", response.data.token);
      toast.success("Google login efetuado com sucesso!", { id: "google-success" });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error("Erro no login com Google", { id: "google-error" });
    }
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
              <div className="">
                <GoogleLogin
                  size="large"
                  theme="outline"
                  shape="rectangular"
                  width="100%"
                  text="continue_with"
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Falha no login Google")}
                />
              </div>

              <div className="create-account-btn mt-5">
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
