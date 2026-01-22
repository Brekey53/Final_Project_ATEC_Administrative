import "../css/footer.css";
import { Mail, Phone, Instagram, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer mt-5 py-5 bg-light">
      <div className="container">
        <div className="row align-items-center">

          <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
            <h5 className="fw-bold mb-2">HawkPortal</h5>
            <small>
              Sistema de Gerir Notas
            </small>
          </div>

          {/* Contactos */}
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <p className="mb-1">
              <Mail size={16} className="me-2" />
              hawkportal@gmail.com
            </p>
            <p className="mb-0">
              <Phone size={16} className="me-2" />
              +351 912 345 678
            </p>
          </div>

          <div className="col-md-4 text-center text-md-end">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark me-3"
            >
              <Instagram />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark me-3"
            >
              <Linkedin />
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark"
            >
              <Github />
            </a>
          </div>

        </div>
      </div>
    </footer>

  );
}
