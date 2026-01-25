import { useEffect, useState } from "react";
import Cursos from "../../pages/course/Cursos";
import Horarios from "../../pages/schedule/Schedules";
import { authService } from "../../auth/AuthService";
import { getHorariosFormando } from "../../services/calendar/CalendarService";
import {type AvaliacaoFormando, getAvaliacoesFormando} from "../../services/dashboard/DashboardService"

export default function FormandoDashboard() {
  const [events, setEvents] = useState<[]>([]);

  const user = authService.decodeToken();
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoFormando[]>([]);

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

  useEffect(() => {
  getAvaliacoesFormando().then(setAvaliacoes);
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

      {/* Avaliações */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">Avaliações</h4>

          {avaliacoes.length === 0 ? (
            <p className="text-muted">Ainda não existem avaliações</p>
          ) : (
            <ul className="list-group">
              {avaliacoes.map((a) => (
                <li key={a.idAvaliacao} className="list-group-item">
                  <strong>{a.nomeModulo}</strong>
                  <div className="small text-muted">
                    {a.dataAvaliacao ?? "-"} · Nota: {a.nota ?? "-"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Horários */}
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <div className="d-flex justify-content-center gap-4 mb-4">
            <Horarios />
          </div>
        </div>
      </div>
    </div>
  );
}
