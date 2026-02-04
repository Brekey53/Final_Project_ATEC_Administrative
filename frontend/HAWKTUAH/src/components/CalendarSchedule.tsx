import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import ptLocale from "@fullcalendar/core/locales/pt";

export default function CalendarSchedule({ events }: { events: any[] }) {
  return (
    <FullCalendar
      plugins={[timeGridPlugin]}
      initialView="timeGridWeek"
      locale={ptLocale}
      events={events}
      allDaySlot={false}
      slotMinTime="08:00:00"
      slotMaxTime="23:00:00"
      height="auto"
      nowIndicator
    />
  );
}
