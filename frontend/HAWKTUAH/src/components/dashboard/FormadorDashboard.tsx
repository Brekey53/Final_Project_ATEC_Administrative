import { authService } from "../../auth/AuthService";
import { useEffect, useState } from "react";
import {
  getHorariosFormador,
  getHorasFormadorMesAtual,
  getHorasFormadorMesAnterior,
  getNumeroTurmasFormador,
} from "../../services/calendar/CalendarService";
import { checkEmailGetName } from "../../services/users/UserService";
import CalendarSchedule from "../CalendarSchedule";
import { Link } from "react-router";
import { Calendar, Clock, Users } from "lucide-react";
import { getHojeISO } from "../../utils/dataUtils";
import { exportHorarioFormador } from "../../services/calendar/CalendarService";
import toast from "react-hot-toast";

export default function FormadorDashboard() {
  const [events, setEvents] = useState<[]>([]);
  const [horasMesAtual, setHorasMesAtual] = useState();
  const [horasMesAnterior, setHorasMesAnterior] = useState<[]>([]);
  const [turmasAtuais, setTurmasAtuais] = useState(0);
  const [nameUser, setNameUser] = useState("");

  const user = authService.decodeToken();

  useEffect(() => {
    async function fetchHorarios() {
      try {
        if (!user) return null;

        const [resData, resNome] = await Promise.all([
          getHorariosFormador(),
          checkEmailGetName(user.email),
        ]);
        setNameUser(resNome.nome);

        const events = resData.map((h: any) => ({
          id: h.idHorario,
          title: `${h.nomeTurma}\n${h.nomeModulo}\n${h.nomeSala}`,
          start: `${h.data}T${h.horaInicio}`,
          end: `${h.data}T${h.horaFim}`,
        }));

        setEvents(events);
      } catch (error) {
        toast.error("Erro ao carregar horários");
      }
    }

    fetchHorarios();
  }, []);

  const handleExportClick = async () => {
    if (!user) return null;

    try {
      const res = await exportHorarioFormador();

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
      toast.error("Erro ao exportar horario formador");
    }
  };

  useEffect(() => {
    async function fetchEstatisticasFormador() {
      try {
        const dataAtual = await getHorasFormadorMesAtual();
        const dataAnterior = await getHorasFormadorMesAnterior();
        const numeroTurmas = await getNumeroTurmasFormador();

        setHorasMesAtual(dataAtual);
        setHorasMesAnterior(dataAnterior);
        setTurmasAtuais(numeroTurmas);
      } catch (error) {
        toast.error("Erro ao carregar horas");
      }
    }

    fetchEstatisticasFormador();
  }, []);

  if (!user) return null;

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h3 className="mb-1">
            Bem-vindo(a), <strong>{nameUser}</strong>
          </h3>
          <small className="text-muted">
            Aqui está o resumo da tua atividade
          </small>
        </div>
        <Link to="/adicionar-disponibilidade" className="btn btn-success">
          + Adicionar Disponibilidade
        </Link>
      </div>

      {/* Estatísticas */}
      {/* Horas do Mês Atual */}
      <div className="row g-3 mb-5">
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary">
                  <Clock size={20} />
                </div>
                <div>
                  <h6 className="text-muted mb-0 small fw-semibold">
                    Horas este mês
                  </h6>
                  <h4 className="fw-bold mb-0">{horasMesAtual}h</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horas do Mês Anterior */}
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-secondary bg-opacity-10 rounded-3 text-secondary">
                  <Calendar size={20} />
                </div>
                <div>
                  <h6 className="text-muted mb-0 small fw-semibold">
                    Mês Anterior
                  </h6>
                  <h4 className="fw-bold mb-0">{horasMesAnterior}h</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Turmas que o formador leciona agora */}
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-success bg-opacity-10 rounded-3 text-success">
                  <Users size={20} />
                </div>
                <div>
                  <h6 className="text-muted mb-0 small fw-semibold">
                    Nº Turmas Atuais
                  </h6>
                  <h4 className="fw-bold mb-0">{turmasAtuais}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horário semanal */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-0 p-4 pb-0">
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bold mb-0">Horário</h3>
          </div>
        </div>
        <div className="card-body p-4">
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
  );
}
