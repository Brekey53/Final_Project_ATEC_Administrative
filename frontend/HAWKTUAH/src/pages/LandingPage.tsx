import "../css/landingPage.css";
import { Link } from "react-router-dom";
import CardsDashboard from "../components/CardsDashboard";
import {
  GraduationCap,
  BookOpen,
  Users,
  UserRound,
  LayoutGrid,
  Calendar,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      <div className="container">
        <div className="title-dashboard d-flex justify-content-between w-100">
          <div className="title-dashboard-left ">
            <h2>
              Dasboard
              <br />
            </h2>
            <span className="text-muted">
              Informação Rápida sobre o Sistema
            </span>
          </div>
          <div className="title-dashboard-right justify-content-end">
            <Link to="/assistenteAI" className="btn rounded">
              Assistente AI
            </Link>
            <Link to="/horarios" className="btn rounded">
              Ver Horários
            </Link>
          </div>
        </div>
        <div className="row row-cols-1 row-cols-md-3 g-3">
          <div className="col">
            <CardsDashboard
              title="Cursos a Decorrer"
              value={0}
              icon={<GraduationCap size={20} color="#28a745" />}
              iconBgColor="#e8f5e9"
            />
          </div>
          <div className="col">
            <CardsDashboard
              title="Total de Cursos"
              value={1}
              icon={<BookOpen size={20} color="#007bff" />}
              iconBgColor="#e3f2fd"
            />
          </div>
          <div className="col">
            <CardsDashboard
              title="Formandos Ativos"
              value={0}
              icon={<Users size={20} color="#6f42c1" />}
              iconBgColor="#f3e5f5"
            />
          </div>
          <div className="col">
            <CardsDashboard
              title="Formadores"
              value={0}
              icon={<UserRound size={20} color="#fd7e14" />}
              iconBgColor="#fff3e0"
            />
          </div>
          <div className="col">
            <CardsDashboard
              title="Salas"
              value={0}
              icon={<LayoutGrid size={20} color="#20c997" />}
              iconBgColor="#e0f2f1"
            />
          </div>
          <div className="col">
            <CardsDashboard
              title="Módulos"
              value={0}
              icon={<Calendar size={20} color="#e83e8c" />}
              iconBgColor="#fce4ec"
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center gap-2 fw-semibold">
                    <span className="green-circle-active-courses"></span>
                    Cursos a decorrer
                  </div>
                  <a href="#" className="text-muted small text-decoration-none">
                    Ver todos
                  </a>
                </div>
                <div className="d-flex flex-column align-items-center justify-content-center my-auto py-5">
                  <p className="text-muted small">Nenhum curso a decorrer</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center gap-2 fw-semibold">
                    <span className="text-primary">🕒</span>
                    Próximos 60 Dias
                  </div>
                  <a href="#" className="text-muted small text-decoration-none">
                    Ver todos
                  </a>
                </div>
                <div className="p-3 rounded-3 d-flex justify-content-between align-items-center">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">Cursos por área</div>
      </div>
    </>
  );
}
