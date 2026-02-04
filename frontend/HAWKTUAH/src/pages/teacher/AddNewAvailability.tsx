import { useEffect } from "react";
import { useState } from "react";
import CreateAvailabilitySchedule from "../../components/CreateAvailabilitySchedule";
import {
  type AvailabilityEvent,
  deleteEventosCalendario,
  getEventosCalendario,
  postEventosCalendario,
  type ScheduleEvent,
} from "../../services/calendar/CreateAvailabilityScheduleService";
import toast from "react-hot-toast";

export default function AddNewAvailability() {
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<
    AvailabilityEvent[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHorariosDisponiveis = async () => {
      try {
        const eventos = await getEventosCalendario();
        setHorariosDisponiveis(eventos);
        setLoading(false);
      } catch (error: any) {
        toast.error(error.message || "Erro ao buscar horários disponíveis: ", {
          id: "fetchError",
        });
        setLoading(false);
      }
    };
    fetchHorariosDisponiveis();
  }, [horariosDisponiveis.length, setHorariosDisponiveis]);

  const handleAdicionarHorarios = async (event: ScheduleEvent) => {
    try {
      const novoHorario = await postEventosCalendario(event);
      setHorariosDisponiveis((prev) => [...prev, novoHorario]);
      toast.success("Horário adicionado com sucesso!", { id: "addSuccess" });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao adicionar horário disponível",
        { id: "addError" },
      );
    }
  };

  const handleDeleteHorario = async (id: number) => {
    try {
      await deleteEventosCalendario(id);
      setHorariosDisponiveis((prev) =>
        prev.filter((horario) => horario.id !== id),
      );
      toast.success("Horário removido com sucesso!", { id: "deleteSuccess" });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao remover horário disponível",
        { id: "deleteError" },
      );
    }
  };

  return (
    <>
      <div className="container-fluid container-lg py-4 py-lg-5">
        <div>
          <h2 className="fw-bold mb-1">Adicionar Disponibilidade</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar ou consultar disponibilidade colocadas
          </p>
          </div>
        <div className="my-4">
          <CreateAvailabilitySchedule
            events={horariosDisponiveis}
            onSelect={handleAdicionarHorarios}
            onDelete={handleDeleteHorario}
          />
        </div>
      </div>
    </>
  );
}
