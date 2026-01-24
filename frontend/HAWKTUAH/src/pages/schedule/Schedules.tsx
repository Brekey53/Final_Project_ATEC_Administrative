import React, { useEffect, useState } from "react";
import { getHorariosFormando } from "../../services/calendar/CalendarService";
import CalendarSchedule from "../../components/CalendarSchedule";

export default function Schedules() {
  const [events, setEvents] = useState<[]>([]);

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

  return (
    <CalendarSchedule events={events} />
  );
}
