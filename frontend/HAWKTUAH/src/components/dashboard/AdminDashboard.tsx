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
  getTopFormadores,
  type TopFormadorHoras,
} from "../../services/dashboard/DashboardService";
import { authService } from "../../auth/AuthService";
import { checkEmailGetName } from "../../services/users/UserService";

import {
  GraduationCap,
  BookOpen,
  Users,
  UserRound,
  LayoutGrid,
  Calendar,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import {
  Layers,
  Building,
  UserCog,
  UsersRound,
  CalendarClock,
} from "lucide-react";

import toast from "react-hot-toast";

import HorizontalBarChart from "../../components/HorizontalBarChart";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    cursosDecorrer: 0,
    turmasConcluidas: 0,
    formandosAtivos: 0,
    formadores: 0,
    salas: 0,
    modulos: 0,
  });

  const isMobile = window.innerWidth < 768;
  const iconSize = isMobile ? 16 : 25;

  const valueFormatter = (value: number | null) => (value ? `${value} h` : "");

  const user = authService.decodeToken();

  const [loading, setLoading] = useState(true);
  const [cursosADecorrer, setCursosADecorrer] = useState<CursosADecorrer[]>([]);
  const [turmasAIniciar, setTurmasAIniciar] = useState<TurmaAIniciar[]>([]);
  const [cursosPorArea, setCursosPorArea] = useState<CursosPorArea[]>([]);
  const [topFormadores, setTopFormadores] = useState<TopFormadorHoras[]>([]);
  const [nameUser, setNameUser] = useState("");
  const [currentPageCursos, setCurrentPageCursos] = useState(1);
  const [currentPageComecar, setCurrentPageComecar] = useState(1);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    async function loadAll() {
      try {
        if (!user) return null;

        const [
          statsData,
          cursosData,
          turmasData,
          areasData,
          resNome,
          topFormadoresData,
        ] = await Promise.all([
          getDashboardStats(),
          getCursosADecorrer(),
          getTurmasAIniciar(),
          getCursosPorArea(),
          checkEmailGetName(user.email),
          getTopFormadores(),
        ]);

        setNameUser(resNome.nome);
        setStats(statsData);
        setCursosADecorrer(cursosData);
        setTurmasAIniciar(turmasData);
        setCursosPorArea(areasData);
        setTopFormadores(topFormadoresData);
      } catch (err: any) {
        toast.error("Erro ao carregar dashboard", { id: "erroDashboard" });
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  const dataset = topFormadores.map((f) => ({
    formador: f.nome,
    horas: f.horas,
  }));

  const totalPagesCursosADecorrer = Math.ceil(
    cursosADecorrer.length / ITEMS_PER_PAGE,
  );

  const startIndex = (currentPageCursos - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const cursosADecorrerPaginados = cursosADecorrer.slice(startIndex, endIndex);


  const totalPagesTurmaPorComecar = Math.ceil(
    turmasAIniciar.length / ITEMS_PER_PAGE,
  );

  const inicio = (currentPageComecar - 1) * ITEMS_PER_PAGE;
  const fim = inicio + ITEMS_PER_PAGE;

  const turmasAComecarPaginadas = turmasAIniciar.slice(inicio, fim);

  return (
    <>
      <div className="main-layout mt-2 mt-md-3">
        <div className="container">
          {/*  Titulo e Açoes rápidas*/}
          <div className="mb-5 mt-4">
            <h2 className="fw-bold">
              Bem-vindo(a), <span className="text-primary">{nameUser}</span>
            </h2>
            <p className="text-muted mb-0">Informação Rápida sobre o Sistema</p>
          </div>
          <div className="quick-access-menu mt-3 p-3 p-md-4 shadow-sm">
            <h3>Ações Rápidas</h3>
            <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 my-2 g-2 g-md-3">
              <div className="col">
                <Link to="/gerir-modulos" className="text-decoration-none">
                  <QuickActionsCards
                    title="Gerir Módulos"
                    icon={<Layers size={iconSize} color="#28a745" />}
                  />
                </Link>
              </div>
              <div className="col">
                <Link to="/gerir-salas" className="text-decoration-none">
                  <QuickActionsCards
                    title="Gerir Salas"
                    icon={<Building size={iconSize} color="#28a745" />}
                  />
                </Link>
              </div>
              <div className="col">
                <Link to="/gerir-cursos" className="text-decoration-none">
                  <QuickActionsCards
                    title="Gerir Cursos"
                    icon={<BookOpen size={iconSize} color="#28a745" />}
                  />
                </Link>
              </div>
              <div className="col">
                <Link to="/gerir-horarios" className="text-decoration-none">
                  <QuickActionsCards
                    title="Gerir Horários"
                    icon={<CalendarClock size={iconSize} color="#28a745" />}
                  />
                </Link>
              </div>
              <div className="col">
                <Link to="/gerir-formandos" className="text-decoration-none">
                  <QuickActionsCards
                    title="Gerir Formandos"
                    icon={<Users size={iconSize} color="#28a745" />}
                  />
                </Link>
              </div>
              <div className="col">
                <Link to="/gerir-formadores" className="text-decoration-none">
                  <QuickActionsCards
                    title="Gerir Formadores"
                    icon={<UserCog size={iconSize} color="#28a745" />}
                  />
                </Link>
              </div>
              <div className="col">
                <Link to="/gerir-utilizadores" className="text-decoration-none">
                  <QuickActionsCards
                    title="Gerir Utilizadores"
                    icon={<UsersRound size={iconSize} color="#28a745" />}
                  />
                </Link>
              </div>
              <div className="col">
                <Link to="/turmas" className="text-decoration-none">
                  <QuickActionsCards
                    title="Gerir Turmas"
                    icon={<CalendarClock size={iconSize} color="#28a745" />}
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* CardBoards info geral */}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 mt-4">
            <div className="col">
              <CardsDashboard
                title="Turmas a Decorrer"
                value={loading ? "..." : stats.cursosDecorrer}
                icon={<GraduationCap size={20} color="#28a745" />}
                iconBgColor="#e8f5e9"
                detailsLink="/turmas"
              />
            </div>
            <div className="col">
              <CardsDashboard
                title="Turmas Concluídas"
                value={loading ? "..." : stats.turmasConcluidas}
                icon={<BookOpen size={20} color="#007bff" />}
                iconBgColor="#e3f2fd"
                detailsLink="/turmas"
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
                value={loading ? "..." : stats.formadores}
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
                detailsLink="/gerir-salas"
              />
            </div>
            <div className="col">
              <CardsDashboard
                title="Módulos"
                value={loading ? "..." : stats.modulos}
                icon={<Calendar size={20} color="#e83e8c" />}
                iconBgColor="#fce4ec"
                detailsLink="/gerir-modulos"
              />
            </div>
          </div>

          <div className="mt-5">
            <div className="row g-4">
              {/* Turmas a decorrer Card */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm p-3 p-md-4 h-100 rounded-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-2 fw-semibold">
                      <span className="green-circle-active-courses"></span>
                      Turmas/Cursos a decorrer
                    </div>
                    <Link
                      to="/turmas"
                      className="text-muted small text-decoration-none"
                    >
                      Ver todos
                    </Link>
                  </div>
                  {cursosADecorrerPaginados.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center my-auto py-5">
                      <p className="text-muted small">
                        Nenhuma turma a decorrer
                      </p>
                    </div>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {cursosADecorrerPaginados.map((t) => (
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
                      {totalPagesCursosADecorrer > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2 pt-4">
                          <button
                            className="btn btn-outline-secondary"
                            disabled={currentPageCursos === 1}
                            onClick={() => setCurrentPageCursos((p) => p - 1)}
                          >
                            <ChevronLeft />
                          </button>

                          <span className="text-muted">
                            Página {currentPageCursos} de{" "}
                            {totalPagesCursosADecorrer}
                          </span>

                          <button
                            className="btn btn-outline-secondary"
                            disabled={
                              currentPageCursos === totalPagesCursosADecorrer
                            }
                            onClick={() => setCurrentPageCursos((p) => p + 1)}
                          >
                            <ChevronRight />
                          </button>
                        </div>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {/* Próximos 60 dias Card */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-2 fw-semibold">
                      <span className="text-primary">🕒</span>
                      Próximos 60 Dias
                    </div>
                    <Link
                      to="/turmas"
                      className="text-muted small text-decoration-none"
                    >
                      Ver todos
                    </Link>
                  </div>
                  {turmasAComecarPaginadas.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted small">
                        Nenhuma turma a iniciar nos próximos 60 dias
                      </p>
                    </div>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {turmasAComecarPaginadas.map((t) => (
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
                  {totalPagesTurmaPorComecar > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-2 pt-4">
                      <button
                        className="btn btn-outline-secondary"
                        disabled={currentPageComecar === 1}
                        onClick={() => setCurrentPageComecar((p) => p - 1)}
                      >
                        <ChevronLeft />
                      </button>

                      <span className="text-muted">
                        Página {currentPageComecar} de{" "}
                        {totalPagesTurmaPorComecar}
                      </span>

                      <button
                        className="btn btn-outline-secondary"
                        disabled={
                          currentPageComecar === totalPagesTurmaPorComecar
                        }
                        onClick={() => setCurrentPageComecar((p) => p + 1)}
                      >
                        <ChevronRight />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cursos Por área Card */}
              <div className="col-12 col-md-4">
                <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                    <div className="d-flex align-items-center gap-2 fw-semibold">
                      Cursos por Área
                    </div>
                    <Link
                      to="/cursos"
                      className="text-muted small text-decoration-none"
                    >
                      Ver todos
                    </Link>
                  </div>
                  {cursosPorArea.length === 0 ? (
                    <p className="text-muted small">Sem dados disponíveis</p>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {cursosPorArea.map((area) => (
                        <li
                          key={area.idArea}
                          className="list-group-item d-flex justify-content-between align-items-start align-items-md-center px-0 gap-2"
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

          <div className="mt-5">
            <div className="row g-4">
              {/* Top 10 Formador com mais horas */}
              <div className="col-12 mb-4">
                <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4">
                  {loading ? (
                    <p className="text-muted">A carregar gráfico...</p>
                  ) : (
                    <HorizontalBarChart
                      title="Top 10 Formadores com mais horas"
                      dataset={dataset}
                      categoryKey="formador"
                      valueKey="horas"
                      label="Horas"
                      valueFormatter={valueFormatter}
                    />
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
