import "../css/login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Google from "../img/google.png";
import Facebook from "../img/facebook.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faCalendar,
  faRobot,
  faSchool,
} from "@fortawesome/free-solid-svg-icons";

import { Link } from "react-router-dom";
import { login } from "../auth/AuthService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Email ou password inválidos");
    } finally {
      setLoading(false);
    }
  }

  function loginGoogle() {
    window.location.href = "http://localhost:5056/api/auth/login-google";
  }

  return (
    <div className="container-login">
      <div className="row h-100 g-0">
        <div className="col-12 col-lg-4 banner-login">
          <div className="ball ball-1"></div>
          <div>
            <p className="eyebrow-login">Manager HAWKTUAH</p>
            <h1 className="title-login">
              Sistema de <br />
              Gestão de Notas
            </h1>
            <p className="description-login mb-5 mt-3">
              Gerir cursos, formandos, formadores e horários
              <br />
              de forma eficiente e intuitiva.
            </p>
            <div className="cards-login ">
              <div className="row">
                <div className="col-6">
                  <div className="card-login card-1">
                    <FontAwesomeIcon icon={faGraduationCap} className="icon" />
                    <p>Gestão de Formandos</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card-login card-2">
                    <FontAwesomeIcon icon={faCalendar} className="icon" />
                    <p>Horários</p>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-6">
                  <div className="card-login card-3">
                    <FontAwesomeIcon icon={faSchool} className="icon" />
                    <p>Cursos e Módulos</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card-login card-4">
                    <FontAwesomeIcon icon={faRobot} className="icon" />
                    <p>Chatbot</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="ball ball-2"></div>
        </div>
        <div className="col-12 col-lg-8 credentials-login">
          <div className="container d-flex justify-content-center">
            <div className="modal-login">
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                  />
                </div>
                <Link
                  to="/login/forgot-password"
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
                  <span onClick={loginGoogle}>Continuar com o Google</span>
                </div>

                <div className="social-btn shadow-sm p-3 rounded d-flex align-items-center gap-3">
                  <img src={Facebook} alt="Símbolo Facebook" />
                  <span>Continuar com o Facebook</span>
                </div>
              </div>
              <div className="social-btn shadow-sm p-3 rounded gap-3 mt-5 text-center">
                <Link to="/create-account" className="criar-conta-link">
                  Não tem uma conta? <span className="criar-conta-span">Inscreva-se</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
