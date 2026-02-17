import { useEffect, useState } from "react";
import CalendarSchedule from "../../components/CalendarSchedule";
import { authService } from "../../auth/AuthService";
import {
  getHorariosFormando,
  exportHorarioFormando,
} from "../../services/calendar/CalendarService";
import {
  type AvaliacaoFormando,
  getAvaliacoesFormando,
} from "../../services/dashboard/DashboardService";
import { checkEmailGetName } from "../../services/users/UserService";
import axios from "axios";
import {
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { getHojeISO } from "../../utils/dataUtils";
import toast from "react-hot-toast";

export default function FormandoDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoFormando[]>([]);
  const [nameUser, setNameUser] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;
  const user = authService.decodeToken();

  useEffect(() => {
    async function fetchHorarios() {
      try {
        if (!user) return;

        const [resData, resNome] = await Promise.all([
          getHorariosFormando(),
          checkEmailGetName(user.email),
        ]);

        setNameUser(resNome.nome);

        const formattedEvents = resData.map((h: any) => ({
          id: h.idHorario,
          title: `${h.nomeModulo}\n${h.nomeSala}`,
          start: `${h.data}T${h.horaInicio}`,
          end: `${h.data}T${h.horaFim}`,
        }));

        setEvents(formattedEvents);
      } catch (error) {
        toast.error("Erro ao carregar horários");
      }
    }

    fetchHorarios();
  }, []);

  useEffect(() => {
    getAvaliacoesFormando().then(setAvaliacoes);
  }, []);

  const handleExportClick = async () => {
    if (!user) return null;

    try {
      const res = await exportHorarioFormando();

      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `horario_${nameUser.split(" ")[0]}_${getHojeISO()}.ics`,
      );
      document.body.appendChild(link);
      link.click();

      // Limpeza
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Erro ao exportar o calendário.", {
        id: "erro-exportar-calendario",
      });
    }
  };

  if (!user) return null;

  const totalPages = Math.ceil(avaliacoes.length / ITEMS_PER_PAGE);
  const inicio = (currentPage - 1) * ITEMS_PER_PAGE;
  const fim = inicio + ITEMS_PER_PAGE;
  const avaliacoesPaginadas = avaliacoes.slice(inicio, fim);

  const mediaGlobal =
    avaliacoes.length > 0
      ? (
          avaliacoes.reduce((total, a) => total + (a.nota || 0), 0) /
          avaliacoes.length
        ).toFixed(2)
      : "-";

  const modulosPorAvaliar =
    avaliacoes.length > 0 && avaliacoes[0].totalModulosCurso
      ? avaliacoes[0].totalModulosCurso - avaliacoes.length
      : 0;

  return (
    <div className="container my-4 my-md-5 px-3 px-md-4">
      {/* Header */}
      <div className="row align-items-center gy-3 mb-4">
        <div className="col-12">
          <h2 className="fw-bold">
          Bem-vindo(a), <span className="text-primary">{nameUser}</span>
        </h2>
          <p className="text-muted mb-0">
            Vê aqui o teu progresso académico e horários.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="row g-4 mb-4">
        {/* Módulos Avaliados */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-primary bg-opacity-10 rounded-3 text-primary">
                <BookOpen size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0 small fw-semibold">
                  Módulos Avaliados
                </h6>
                <h4 className="fw-bold mb-0">{avaliacoes.length}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Módulos por Avaliar */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-danger bg-opacity-10 rounded-3 text-danger">
                <Clock size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0 small fw-semibold">
                  Módulos por Avaliar
                </h6>
                <h4 className="fw-bold mb-0">{modulosPorAvaliar}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Média Global */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-success bg-opacity-10 rounded-3 text-success">
                <Award size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0 small fw-semibold">
                  Média Global
                </h6>
                <h4 className="fw-bold mb-0">{mediaGlobal}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="row g-4">
        {/* Avaliações */}
        <div className="col-12 col-lg-5 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 p-4 pb-0">
              <h5 className="fw-bold mb-0">Últimas Avaliações</h5>
            </div>
            <div className="card-body">
              {avaliacoes.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted small mb-0">
                    Ainda não tens avaliações registadas.
                  </p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0 small text-muted text-uppercase">
                            Módulo
                          </th>
                          <th className="border-0 small text-muted text-uppercase text-center">
                            Nota
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {avaliacoesPaginadas.map((a) => (
                          <tr key={a.idAvaliacao}>
                            <td className="py-3">
                              <span className="d-block fw-medium">
                                {a.nomeModulo}
                              </span>
                              <span className="text-muted small">
                                {a.dataAvaliacao || "Data pendente"}
                              </span>
                            </td>
                            <td className="text-center">
                              <span
                                className={`badge rounded-pill ${
                                  Number(a.nota) >= 10
                                    ? "bg-success-subtle text-success"
                                    : "bg-danger-subtle text-danger"
                                }`}
                              >
                                {a.nota}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-3 pt-3">
                      <button
                        className="btn btn-outline-secondary"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <span className="text-muted small">
                        Página {currentPage} de {totalPages}
                      </span>

                      <button
                        className="btn btn-outline-secondary"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Agenda */}
        <div className="col-12 col-lg-7 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 p-4 pb-0">
              <h5 className="fw-bold mb-0">Agenda Semanal</h5>
            </div>
            <div className="card-body p-3 p-md-4 overflow-auto">
              <CalendarSchedule events={events} />
              <div>
                <br />
                <button
                  className="btn btn-outline-primary"
                  onClick={handleExportClick}
                >
                  📅 Exportar Calendário
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
