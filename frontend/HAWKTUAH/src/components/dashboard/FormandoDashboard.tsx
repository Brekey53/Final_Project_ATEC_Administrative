import { useEffect, useState } from "react";
import CalendarSchedule from "../../components/CalendarSchedule";
import { authService } from "../../auth/AuthService";
import { getHorariosFormando } from "../../services/calendar/CalendarService";
import {
  type AvaliacaoFormando,
  getAvaliacoesFormando,
} from "../../services/dashboard/DashboardService";
import { checkEmailGetName } from "../../services/users/UserService";
import { Award, BookOpen, Clock } from "lucide-react";

export default function FormandoDashboard() {
  const [events, setEvents] = useState<[]>([]);

  const user = authService.decodeToken();
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoFormando[]>([]);
  const [nameUser, setNameUser] = useState("");

  useEffect(() => {
    async function fetchHorarios() {
      try {
        if (!user) return null;

        const [resData, resNome] = await Promise.all([
          getHorariosFormando(),
          checkEmailGetName(user.email),
        ]);
        setNameUser(resNome.nome);

        const events = resData.map((h: any) => ({
          id: h.idHorario,
          title: `${h.nomeCurso} - ${h.nomeSala}`,
          start: `${h.data}T${h.horaInicio}`,
          end: `${h.data}T${h.horaFim}`,
        }));

        setEvents(events);
      } catch (error) {
        console.error("Erro ao carregar horários", error);
      }
    }

    fetchHorarios();
  }, []);

  

  useEffect(() => {
    getAvaliacoesFormando().then(setAvaliacoes);
  }, []);

  if (!user) return null;

  return (
    <div className="container my-5">
      <div className="row  align-items-center">
        <div className="col-12 col-md-8">
          <h2 className="fw-bold text-dark mb-1">
            Bem vindo(a) {nameUser.split(" ")[0]}
          </h2>
          <p className="text-muted">
            Vê aqui o teu progresso académico e horários.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="row g-4 mb-4">
        {/* Card dos Módulos já avaliados*/}
        <div className="col-12 col-sm-6 col-md-4">
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

        {/* Card da Média*/}
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-danger bg-opacity-10 rounded-3 text-danger">
                <Clock size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0 small fw-semibold">
                  Módulos por Avaliar
                </h6>
                <h4 className="fw-bold mb-0">
                  {avaliacoes && avaliacoes.length > 0 &&
                  avaliacoes[0].totalModulosCurso
                    ? avaliacoes[0].totalModulosCurso - avaliacoes.length
                    : "0"}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* Card da Média*/}
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-success bg-opacity-10 rounded-3 text-success">
                <Award size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0 small fw-semibold">
                  Média Global
                </h6>
                <h4 className="fw-bold mb-0">
                  {avaliacoes.length > 0
                    ? (
                        avaliacoes.reduce(
                          (total, a) => total + (a.nota || 0),
                          0,
                        ) / avaliacoes.length
                      ).toFixed(2)
                    : "-"}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Coluna das Avaliações */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 p-4 pb-0">
              <h5 className="fw-bold mb-0">Últimas Avaliações</h5>
            </div>
            <div className="card-body ">
              {avaliacoes.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted small">
                    Ainda não tens avaliações registadas.
                  </p>
                </div>
              ) : (
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
                      {avaliacoes.map((a) => (
                        <tr key={a.idAvaliacao}>
                          <td className="py-3">
                            <span className="d-block fw-medium">
                              {a.nomeModulo}
                            </span>
                            <span className="text-muted extra-small">
                              {a.dataAvaliacao || "Data pendente"}
                            </span>
                          </td>
                          <td className="text-center">
                            <span
                              className={`badge rounded-pill ${Number(a.nota) >= 10 ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                            >
                              {a.nota}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Horários */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 p-4 pb-0">
              <h5 className="fw-bold mb-0">Agenda Semanal</h5>
            </div>
            <div className="card-body p-4">
              <CalendarSchedule events={events}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
