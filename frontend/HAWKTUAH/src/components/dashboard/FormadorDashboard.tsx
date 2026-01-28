import { authService } from "../../auth/AuthService";
import { useEffect, useState } from "react";
import {
  getHorariosFormador,
  getHorasFormadorMesAtual,
  getHorasFormadorMesAnterior,
} from "../../services/calendar/CalendarService";
import { checkEmailGetName } from "../../services/users/UserService";
import CalendarSchedule from "../CalendarSchedule";

export default function FormadorDashboard() {
  const [events, setEvents] = useState<[]>([]);
  const [horasMesAtual, setHorasMesAtual] = useState();
  const [horasMesAnterior, setHorasMesAnterior] = useState<[]>([]);
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
    async function fetchHorasDesteMes() {
      try {
        const dataAtual = await getHorasFormadorMesAtual();
        const dataAnterior = await getHorasFormadorMesAnterior();

        setHorasMesAtual(dataAtual);
        setHorasMesAnterior(dataAnterior);
      } catch (error) {
        console.error("Erro ao carregar horas", error);
      }
    }

    fetchHorasDesteMes();
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

        <button className="btn btn-success">+ Adicionar disponibilidade</button>
      </div>

      {/* Estatísticas */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Horas dadas este mês</h6>
              <h3>{horasMesAtual}h</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Horas dadas mês passado</h6>
              {/*TODO: IMPLEMENTAR BACKEND AQUI */}
              <h3>{horasMesAnterior}h</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Horário semanal */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Horário desta semana</h5>

          <div className="text-muted">
            <CalendarSchedule events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
