import "../../css/landingPage.css";
import "../../css/dashboardSimple.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CardsDashboard from "../../components/CardsDashboard";
import QuickActionsCards from "../../components/QuickActionsCards";
import {
  getDashboardStats,
  type DashboardStats,
  getCursosADecorrer,
  type CursosADecorrer,
  getTurmasAIniciar,
  getCursosPorArea,
  type CursosPorArea,
  type TurmaAIniciar,
} from "../../services/dashboard/DashboardService";

import {
  GraduationCap,
  BookOpen,
  Users,
  UserRound,
  LayoutGrid,
  Calendar,
} from "lucide-react";

import {
  Layers,
  Building,
  UserCog,
  UsersRound,
  CalendarClock,
} from "lucide-react";


export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    cursosDecorrer: 0,
    totalCursos: 0,
    formandosAtivos: 0,
    formadores: 0,
    salas: 0,
    modulos: 0,
  });

  const [loading, setLoading] = useState(true);
  const [cursosADecorrer, setCursosADecorrer] = useState<CursosADecorrer[]>([]);
  const [turmasAIniciar, setTurmasAIniciar] = useState<TurmaAIniciar[]>([]);
  const [cursosPorArea, setCursosPorArea] = useState<CursosPorArea[]>([]);

  useEffect(() => {
    async function loadAll() {
      try {
        const [statsData, cursosData, turmasData, areasData] =
          await Promise.all([
            getDashboardStats(),
            getCursosADecorrer(),
            getTurmasAIniciar(),
            getCursosPorArea(),
          ]);

        setStats(statsData);
        setCursosADecorrer(cursosData);
        setTurmasAIniciar(turmasData);
        setCursosPorArea(areasData);
      } catch (e) {
        console.error("Erro ao carregar dashboard", e);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  return (
    <>
      <div className="main-layout mt-5">
        <div className="container">
          {/*  Titulo e Açoes rápidas*/}
          <div className="title-dashboard d-flex justify-content-between w-100">
            <div className="title-dashboard-left ">
              <h1>
                Bem vindo
                <br />
              </h1>
              <span className="text-muted">
                Informação Rápida sobre o Sistema
              </span>
            </div>
            <div className="title-dashboard-right d-flex justify-content-end align-items-center gap-2">
              <Link
                to="/chatbot"
                className="btn btn-outline-primary rounded px-4"
              >
                Assistente AI
              </Link>

              <Link
                to="/horarios"
                className="btn btn-outline-secondary rounded px-4"
              >
                Ver Horários
              </Link>
            </div>
          </div>
          <div className="quick-access-menu mt-3 p-3 shadow-sm">
            <h3>Ações Rápidas</h3>
            <div className="row row-cols-2 row-cols-md-4 g-3">
              <Link to="/gerir-modulos" className="text-decoration-none">
                <div className="col">
                  <QuickActionsCards
                    title="Gerir Módulos"
                    icon={<Layers size={20} color="#28a745" />}
                  />
                </div>
              </Link>
              <Link to="/gerir-salas" className="text-decoration-none">
                <div className="col">
                  <QuickActionsCards
                    title="Gerir Salas"
                    icon={<Building size={20} color="#28a745" />}
                  />
                </div>
              </Link>
              <Link to="/gerir-cursos" className="text-decoration-none">
                <div className="col">
                  <QuickActionsCards
                    title="Gerir Cursos"
                    icon={<BookOpen size={20} color="#28a745" />}
                  />
                </div>
              </Link>
              <Link to="/gerir-horarios" className="text-decoration-none">
                <div className="col">
                  <QuickActionsCards
                    title="Gerir Horários "
                    icon={<CalendarClock size={20} color="#28a745" />}
                  />
                </div>
              </Link>
              <Link to="/gerir-formandos" className="text-decoration-none">
                <div className="col">
                  <QuickActionsCards
                    title="Gerir Formandos"
                    icon={<Users size={20} color="#28a745" />}
                  />
                </div>
              </Link>
              <Link to="/gerir-formadores" className="text-decoration-none">
                <div className="col">
                  <QuickActionsCards
                    title="Gerir Formadores"
                    icon={<UserCog size={20} color="#28a745" />}
                  />
                </div>
              </Link>
              <Link to="/gerir-utilizadores" className="text-decoration-none">
                <div className="col">
                  <QuickActionsCards
                    title="Gerir Utilizadores"
                    icon={<UsersRound size={20} color="#28a745" />}
                  />
                </div>
              </Link>
              <Link to="/gerir-turmas" className="text-decoration-none">
                <div className="col">
                  <QuickActionsCards
                    title="Gerir Turmas"
                    icon={<CalendarClock size={20} color="#28a745" />}
                  />
                </div>
              </Link>
            </div>
          </div>

          {/* CardBoards info geral */}
          <div className="row row-cols-1 row-cols-md-3 g-3 mt-3">
            <div className="col">
              <CardsDashboard
                title="Cursos a Decorrer"
                value={loading ? "..." : stats.cursosDecorrer}
                icon={<GraduationCap size={20} color="#28a745" />}
                iconBgColor="#e8f5e9"
                detailsLink="/turmas"
              />
            </div>
            <div className="col">
              <CardsDashboard
                title="Total de Cursos"
                value={loading ? "..." : stats.totalCursos}
                icon={<BookOpen size={20} color="#007bff" />}
                iconBgColor="#e3f2fd"
                detailsLink="/cursos"
              />
            </div>
            <div className="col">
              <CardsDashboard
                title="Formandos Ativos"
                value={loading ? "..." : stats.formandosAtivos}
                icon={<Users size={20} color="#6f42c1" />}
                iconBgColor="#f3e5f5"
                detailsLink="/formandos"
              />
            </div>
            <div className="col">
              <CardsDashboard
                title="Formadores"
                value={loading ? "..." : stats.formandosAtivos}
                icon={<UserRound size={20} color="#fd7e14" />}
                iconBgColor="#fff3e0"
                detailsLink="/formadores"
              />
            </div>
            <div className="col">
              <CardsDashboard
                title="Salas"
                value={loading ? "..." : stats.salas}
                icon={<LayoutGrid size={20} color="#20c997" />}
                iconBgColor="#e0f2f1"
                detailsLink="/salas"
              />
            </div>
            <div className="col">
              <CardsDashboard
                title="Módulos"
                value={loading ? "..." : stats.modulos}
                icon={<Calendar size={20} color="#e83e8c" />}
                iconBgColor="#fce4ec"
                detailsLink="/modulos"
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
                      Turmas/Cursos a decorrer
                    </div>
                    <a
                      href="#"
                      className="text-muted small text-decoration-none"
                    >
                      Ver todos
                    </a>
                  </div>
                  {cursosADecorrer.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center my-auto py-5">
                      <p className="text-muted small">
                        Nenhuma turma a decorrer
                      </p>
                    </div>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {cursosADecorrer.map((t) => (
                        <li
                          key={t.idTurma}
                          className="list-group-item d-flex justify-content-between align-items-center px-0"
                        >
                          <div>
                            <strong>{t.nomeCurso}</strong>
                            <div className="text-muted small">
                              {t.nomeTurma}
                            </div>
                          </div>

                          <span className="badge bg-success-subtle text-success">
                            A decorrer
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-2 fw-semibold">
                      <span className="text-primary">🕒</span>
                      Próximos 60 Dias
                    </div>
                    <a
                      href="#"
                      className="text-muted small text-decoration-none"
                    >
                      Ver todos
                    </a>
                  </div>
                  {turmasAIniciar.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted small">
                        Nenhuma turma a iniciar nos próximos 60 dias
                      </p>
                    </div>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {turmasAIniciar.map((t) => (
                        <li
                          key={t.idTurma}
                          className="list-group-item px-0 py-3 border-0"
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            {/* INFO */}
                            <div>
                              <div className="fw-semibold">{t.nomeCurso}</div>
                              <div className="text-muted small">
                                {t.nomeTurma} · Início{" "}
                                {new Date(t.dataInicio).toLocaleDateString(
                                  "pt-PT",
                                )}
                              </div>
                            </div>

                            {/* STATUS */}
                            <span className="badge bg-primary-subtle text-primary rounded-pill px-3">
                              Em breve
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="row g-4">
              <div className="col">
                <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-2 fw-semibold">
                      Cursos por Área
                    </div>
                    <a
                      href="#"
                      className="text-muted small text-decoration-none justify-content-right"
                    >
                      Ver todos
                    </a>
                  </div>
                  {cursosPorArea.length === 0 ? (
                    <p className="text-muted small">Sem dados disponíveis</p>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {cursosPorArea.map((area) => (
                        <li
                          key={area.idArea}
                          className="list-group-item d-flex justify-content-between align-items-center px-0"
                        >
                          <span>{area.nomeArea}</span>
                          <span className="badge bg-primary rounded-pill">
                            {area.totalCursos}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
