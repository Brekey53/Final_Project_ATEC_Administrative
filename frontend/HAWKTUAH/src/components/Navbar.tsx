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
      try {
        const fotoUrl = await NavbarService.getFotoPerfil();
        if (fotoUrl) setFotoPerfil(fotoUrl);
      } catch {
        setFotoPerfil(fotoDefault);
      }
    }

    carregarFoto();
  }, []);
  const user = authService.decodeToken();
  const role = user
  ? mapUserRole(Number(user.tipoUtilizador))
  : "GERAL";


  const allowedLinks = NAV_PERMISSIONS[role];

  const navLinks = [
    { key: "dashboard", label: "Dashboard", to: "/dashboard" },
    { key: "perfil", label: "Perfil", to: "/perfil" },
    { key: "cursos", label: "Cursos", to: "/cursos" },
    { key: "formandos", label: "Formandos", to: "/formandos" },
    { key: "formadores", label: "Formadores", to: "/formadores" },
    { key: "horarios", label: "Horários", to: "/horarios" },
    { key: "chatbot", label: "Assistente IA", to: "/chatbot" },
  ];

  return (
    <>
      <nav className="navbar navbar-light bg-light">
        <div className="container">
          <div className="d-flex align-items-center gap-3">
            <span className="text-white h4 fw-bold">Hawk Portal</span>
            <Link to="/dashboard">
              <img src={foto} alt="" className="foto" />
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNavbar"
              onClick={toggleMenu}
              aria-expanded={isNavExpanded}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
          \
          <div className="d-flex align-items-center gap-4">
            <ul>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={fotoPerfil}
                    alt="Foto de perfil"
                    className="profile-avatar"
                  />
                </a>
                <div
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="navbarDropdown"
                >
                  <Link
                    to="/perfil"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    Perfil
                  </Link>
                  <hr className="dropdown-divider" />
                  <a
                    className="dropdown-item text-danger"
                    href="#"
                    onClick={() => {
                      authService.logout();
                      closeMenu();
                    }}
                  >
                    Logout
                  </a>
                </div>
              </li>
            </ul>
          </div>
          <div
            className={`collapse navbar-collapse ${isNavExpanded ? "show" : ""}`}
            id="mainNavbar"
          >
            <div className="d-flex justify-content-around">
              <div className="d-flex flex-row justify-content-between align-items-center gap-4">
                <div className="nav-links d-flex flex-row gap-4 mt-3">
                  {navLinks
                    .filter((link) => allowedLinks.includes(link.key as any))
                    .map((link) => (
                      <Link key={link.key} to={link.to} onClick={closeMenu}>
                        <p className="mb-0">{link.label}</p>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
