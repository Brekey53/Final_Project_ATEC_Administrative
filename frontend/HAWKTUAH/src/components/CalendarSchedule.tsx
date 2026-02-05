import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import ptLocale from "@fullcalendar/core/locales/pt";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarSchedule({ events }: { events: any[] }) {
  const isMobile = window.innerWidth < 768;

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
      locale={ptLocale}
      events={events}
      allDaySlot={false}
      slotMinTime="08:00:00"
      slotMaxTime="23:00:00"
      height="auto"
      nowIndicator
      headerToolbar={
        isMobile
          ? {
              left: "prev,next",
              center: "title",
              right: "",
            }
          : {
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }
      }
    />
  );
}
