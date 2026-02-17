import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt";
import type {
  AvailabilityEvent,
  ScheduleEvent,
} from "../services/calendar/CreateAvailabilityScheduleService";
import { useRef, useState } from "react";

/**
 * Propriedades para o componente de definição de disponibilidade.
 */
interface CreateAvailabilityScheduleProps {
  events: AvailabilityEvent[];
  onSelect: (event: ScheduleEvent) => void;
  onDelete: (id: number) => void;
}
/**
 * Componente interativo (Calendário) para o formador definir a sua disponibilidade.
 * Permite selecionar intervalos de tempo e visualizar/remover disponibilidades já marcadas.
 */
export default function CreateAvailabilitySchedule({
  events,
  onSelect,
  onDelete,
}: CreateAvailabilityScheduleProps) {
  const calendarRef = useRef<any>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const formattedEvents = events.map((ev) => {
    const startISO = `${ev.data}T${ev.horaInicio}`;
    const endISO = `${ev.data}T${ev.horaFim}`;
    const dataEvento = new Date(startISO);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const eventoPassado = dataEvento < hoje;

    let title = "";
    let color = "";

    if (eventoPassado) {
      title = "Realizado";
      color = "#dd4c4c";
    } else if (ev.tipo === "Ocupado") {
      title = "Ocupado";
      color = "#dd4c4c";
    } else {
      title = "Disponível";
      color = "#4caf50";
    }

    return {
      id: String(ev.id),
      start: startISO,
      end: endISO,
      title,
      backgroundColor: color,
      borderColor: color,
      display: "block",
    };
  });

  const almocoBackground = {
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: "12:00",
    endTime: "13:00",
    display: "background",
    backgroundColor: "#aaa1a1",
  };
  const jantarBackground = {
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: "19:00",
    endTime: "20:00",
    display: "background",
    backgroundColor: "#aaa1a1",
  };

  const handleConfirmDelete = () => {
    if (selectedId !== null) {
      onDelete(selectedId);
      setShowRemoveModal(false);
      setSelectedId(null);
    }
  };
  const hoje = new Date();
  const dataMarcacaoMinima = new Date();
  dataMarcacaoMinima.setMonth(hoje.getMonth() + 1);

  // Período desativado: da origem até daqui a 1 mês (não permitido marcar)
  const diasPassados = {
    start: "2000-01-01",
    end: dataMarcacaoMinima.toISOString().split("T")[0],
    display: "background",
    backgroundColor: "#aaa1a1",
    allDay: true,
  };
  return (
    <>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        customButtons={{
          irParaDisponivel: {
            text: "Mês Disponível para Marcar",
            click: () => {
              const calendarApi = calendarRef.current.getApi();
              calendarApi.gotoDate(dataMarcacaoMinima);
            },
          },
        }}
        headerToolbar={{
          left: "prev,next irParaDisponivel",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        initialView="timeGridWeek"
        locale={ptLocale}
        selectable={true}
        selectMirror={true}
        weekends={false}
        initialDate={dataMarcacaoMinima}
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="23:00:00"
        height="auto"
        snapDuration="01:00:00"
        selectMinDistance={20}
        events={[
          almocoBackground,
          jantarBackground,
          ...formattedEvents,
          diasPassados,
        ]}
        eventOverlap={false}
        eventClick={(info) => {
          const eventId = info.event.id;
          if (!eventId || eventId === "undefined") return;
          setSelectedId(Number(eventId));
          setShowRemoveModal(true);
        }}
        selectAllow={(info) => {
          const { start, end } = info;
          const hoje = new Date();
          const dataLimite = new Date();
          dataLimite.setMonth(hoje.getMonth() + 1);
          if (start < dataLimite) return false; // Não permitir antes de daqui a 1 mês

          const diff = end.getTime() - start.getTime();
          const duracaoMinimaHoras = 1;
          const milissegundosPorHora = 3600000;

          if (diff < duracaoMinimaHoras * milissegundosPorHora) {
            return false; // Mínimo 1 hora
          }

          const almocoInicio = new Date(start);
          almocoInicio.setHours(12, 0, 0, 0);
          const almocoFim = new Date(start);
          almocoFim.setHours(13, 0, 0, 0);

          const jantarInicio = new Date(start);
          jantarInicio.setHours(19, 0, 0, 0);
          const jantarFim = new Date(start);
          jantarFim.setHours(20, 0, 0, 0);

          const sobrepoeEventos = formattedEvents.some((ev) => {
            const evStart = new Date(ev.start);
            const evEnd = new Date(ev.end);
            return start < evEnd && end > evStart;
          });

          if (sobrepoeEventos) return false;

          return (
            !(start < almocoFim && end > almocoInicio) &&
            !(start < jantarFim && end > jantarInicio)
          );
        }}
        select={(info) => {
          const calendarApi = info.view.calendar;
          calendarApi.unselect();
          const data = info.startStr.split("T")[0];
          const horaInicio = info.startStr.split("T")[1].substring(0, 5);
          const horaFim = info.endStr.split("T")[1].substring(0, 5);
          onSelect({ data, horaInicio, horaFim });
        }}
      />

      {/* MODAL */}
      {showRemoveModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 z-3">
          <div className="card shadow-lg rounded-4" style={{ width: 360 }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold">Remover Disponibilidade</h6>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowRemoveModal(false)}
              />
            </div>
            <div className="card-body">
              <p className="mb-2 text-muted">
                Tens a certeza que queres remover esta disponibilidade?
              </p>
            </div>
            <div className="card-footer d-flex justify-content-end gap-2">
              <button
                className="btn btn-light border"
                onClick={() => setShowRemoveModal(false)}
              >
                Voltar
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
