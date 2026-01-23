import "../css/footer.css";

import { Mail, Phone } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faGithub,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className="footer mt-5 py-5 bg-dark text-light">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-around align-items-center text-center gap-4">
          {/* Branding */}
          <div style={{ maxWidth: "260px" }}>
            <h5 className="fw-bold mb-2">HawkPortal</h5>
            <small>
              Gerir cursos, formandos, formadores e horários de forma eficiente
              e intuitiva.
            </small>
          </div>

          {/* Contactos */}
          <div className="d-flex flex-column align-items-center small">
            <p className="mb-1 d-flex align-items-center">
              <Mail size={12} className="me-2" />
              hawkportalmanager@gmail.com
            </p>
            <p className="mb-0 d-flex align-items-center">
              <Phone size={12} className="me-2" />
              +351 912 345 678
            </p>
          </div>

          {/* Redes sociais */}
          <div className="d-flex align-items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faInstagram} size="2x" color="#E4405F" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faLinkedin} size="2x" color="#0A66C2" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faGithub} size="2x" color="#ffffff"/>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
