import "../css/navbar.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      <nav className="navbar navbar-light bg-light">
        <div className="container">
          <div className="d-flex align-items-center gap-3">
            <Link to="/">
              <p className="mb-0">Imagem</p>
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNavbar"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
          <div className="d-flex align-items-center gap-4">
            <p>notificações</p>
            <p>imagem</p>
          </div>
          <div className="collapse navbar-collapse" id="mainNavbar">
            <div className="d-flex justify-content-around">
              <div className="d-flex flex-row justify-content-between align-items-center gap-4">
                <div className="nav-links d-flex flex-row gap-4 mt-3">
                  <p className="mb-0">Dashboard</p>
                  <Link to="Perfil"><p className="mb-0">Perfil</p> </Link>
                  <p className="mb-0">Cursos</p>
                  <p className="mb-0">Formandos</p>
                  <p className="mb-0">Formadores</p>
                  <p className="mb-0">Horários</p>
                  <p className="mb-0">Assistente IA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
