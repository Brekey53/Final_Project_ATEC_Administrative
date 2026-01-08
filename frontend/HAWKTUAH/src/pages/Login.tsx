import "../css/login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faCalendar,
  faRobot,
  faSchool,
} from "@fortawesome/free-solid-svg-icons";

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
      navigate("/Dashboard", { replace: true });
    } catch (err) {
      setError("Email ou password inválidos");
    } finally {
      setLoading(false);
    }
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
            <p className="description-login">
              Gerir cursos, formandos, formadores e horários
              <br />
              de forma eficiente e intuitiva
            </p>
            <div className="cards-login">
              <div className="row">
                <div className="col-6">
                  <div className="card-login card-1">
                    <i className="fa-solid fa-graduation-cap"></i>
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
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                  />
                </div>
                {error && <p className="text-danger text-center">{error}</p>}

                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Bem vindo, a entrar..." : "Entrar"}
                </button>
              </form>
              <hr></hr>
              <p className="text-center">Ou</p>
              <div className="socials-login">
                <div className="email-login">Entrar com o Google</div>
                <div className="facebok-login">Entrar com Facebook</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
