import "../css/navbar.css";
import { Link } from "react-router-dom";
import { authService } from "../auth/AuthService";
import foto from "../img/hawktu.png";
import fotoDefault from "../img/avatarNavbar.png";
import { useEffect, useState } from "react";

import NavbarService from "../services/navbar/NavbarService";
import { mapUserRole } from "../auth/MapUserRole";
import { NAV_PERMISSIONS } from "../auth/NavPermissions";

export default function Navbar() {
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  // Função para fechar o menu ao clicar num link
  const closeMenu = () => setIsNavExpanded(false);

  // Alternar o menu (Abrir/Fechar)
  const toggleMenu = () => setIsNavExpanded(!isNavExpanded);

  const [fotoPerfil, setFotoPerfil] = useState<string>(fotoDefault);

  useEffect(() => {
    async function carregarFoto() {
      const fotoUrl = await NavbarService.getFotoPerfil();
      setFotoPerfil(fotoUrl ?? fotoDefault);
    }

    carregarFoto();
  }, []);

  const user = authService.decodeToken();
  const role = user ? mapUserRole(Number(user.tipoUtilizador)) : "GERAL";

  const allowedLinks = NAV_PERMISSIONS[role];

  const navLinks = [
    { key: "dashboard", label: "Dashboard", to: "/dashboard" },
    { key: "perfil", label: "Perfil", to: "/perfil" },
    { key: "cursos", label: "Cursos", to: "/cursos" },
    { key: "formandos", label: "Formandos", to: "/formandos" },
    { key: "formadores", label: "Formadores", to: "/formadores" },
    { key: "turma", label: "Turma", to: "/turmas" },
    { key: "turmas", label: "Turmas", to: "/turmas" },
    { key: "horarios", label: "Horários", to: "/horarios" },
    { key: "chatbot", label: "Assistente IA", to: "/chatbot" },
  ];

  return (
    <nav className="navbar navbar-expand-lg bg-light px-4">
      <div className="container">
        {/* ESQUERDA — Logo + Hamburger */}
        <div className="d-flex align-items-center gap-3">
          <Link
            to="/dashboard"
            className="d-flex align-items-center gap-2 text-decoration-none text-white"
          >
            <img src={foto} alt="" className="foto" />
            <span className="fw-bold h5 mb-0">Hawk Portal</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMenu}
            aria-expanded={isNavExpanded}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        {/* CENTRO — LINKS */}
        <div
          className={`collapse navbar-collapse justify-content-center ${
            isNavExpanded ? "show" : ""
          }`}
        >
          <ul className="navbar-nav gap-4">
            {navLinks
              .filter((link) => allowedLinks.includes(link.key as any))
              .map((link) => (
                <li key={link.key} className="nav-item">
                  <Link className="nav-link" to={link.to} onClick={closeMenu}>
                    {link.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        {/* DIREITA — PERFIL (sempre visível) */}
        <div className="dropdown ms-auto">
          <button
            className="btn p-0 border-0 bg-transparent dropdown-toggle"
            data-bs-toggle="dropdown"
          >
            <img
              src={fotoPerfil}
              alt="Perfil"
              className="profile-avatar"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fotoDefault;
              }}
            />
          </button>

          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <Link to="/perfil" className="dropdown-item " onClick={closeMenu}>
                Perfil
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button
                className="dropdown-item text-danger"
                onClick={authService.logout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
