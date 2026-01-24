import { useEffect, useState } from "react";
import Cursos from "../../pages/course/Cursos";
import Horarios from "../../pages/schedule/Schedules";
import { authService } from "../../auth/AuthService";
import { getHorariosFormando } from "../../services/calendar/CalendarService"

type Tab = "cursos" | "horarios";

export default function FormandoDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("cursos");
  const [events, setEvents] = useState<[]>([]);

  const user = authService.decodeToken();

useEffect(() => {
    async function fetchHorarios() {
      try {
        const data = await getHorariosFormando();

        const events = data.map((h: any) => ({
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


  if (!user) return null;

  return (
    <div className="container my-5">
      <div className="mb-4">
        <h3 className="mb-1">
          Bem-vindo, <strong>{user.email}</strong>
        </h3>
        <small className="text-muted">
          Acompanha aqui o teu progresso e horários
        </small>
      </div>

      {/* Tabs */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-center gap-4 mb-4">
            <button
              className={`btn ${
                activeTab === "cursos" ? "btn-success" : "btn-outline-primary"
              }`}
              onClick={() => setActiveTab("cursos")}
            >
              Cursos
            </button>

            <button
              className={`btn ${
                activeTab === "horarios" ? "btn-success" : "btn-outline-primary"
              }`}
              onClick={() => setActiveTab("horarios")}
            >
              Horário Semanal
            </button>
          </div>

          {activeTab === "cursos" && <Cursos />}
          {activeTab === "horarios" && <Horarios />}
        </div>
      </div>

      {/* Avaliações */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Avaliações</h5>

          <ul className="list-group">
            <li className="list-group-item d-flex justify-content-between">
              <span>Módulo React</span>
              <strong>16</strong>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}
