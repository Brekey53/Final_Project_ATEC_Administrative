import { useEffect } from "react";
import { useState } from "react";
import CreateAvailabilitySchedule from "../../components/CreateAvailabilitySchedule";
import {
  type AvailabilityEvent,
  deleteEventosCalendario,
  getEventosCalendario,
  postEventosCalendario,
  type ScheduleEvent,
  postDisponibilidadeInput,
  type ScheduleInputEvent,
} from "../../services/calendar/CreateAvailabilityScheduleService";
import toast from "react-hot-toast";

type Tabs = "Schedule" | "Dados";

export default function AddNewAvailability() {
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<
    AvailabilityEvent[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tabs>("Schedule");

  const [scheduleInput, setScheduleInput] = useState<ScheduleInputEvent>({
    dataInicio: "",
    dataFim: "",
    horaInicio: "",
    horaFim: "",
  });

  const isMobile = window.innerWidth < 768;

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

  {
  /* Tab "Dados": formulário manual em vez de calendário. Evita chamadas à API até o utilizador submeter. */
  }

  const handleAddDisponibilidade = async (e: React.FormEvent) => {
    e.preventDefault();

    const { dataInicio, dataFim, horaInicio, horaFim } = scheduleInput;
    const dataValidaMarcacoes = new Date();
    dataValidaMarcacoes.setMonth(dataValidaMarcacoes.getMonth() + 1);

    const dataInicioDate = new Date(dataInicio);

    // só dá para marcar para daqui a um mes
    if (dataInicioDate < dataValidaMarcacoes) {
      toast.error(
        "A disponibilidade só pode ser marcada com pelo menos 1 mês de antecedência.",
        { id: "DataMinima" },
      );
      return;
    }

    //  Data fim superior à inicio
    if (dataFim < dataInicio) {
      toast.error("A data de fim tem de ser posterior à data de início.", {
        id: "DataFimSuperiorInicio",
      });
      return;
    }

    // Horas válidas "cheias"
    if (!isHoraValida(horaInicio) || !isHoraValida(horaFim)) {
      toast.error(
        "Só são permitidas horas cheias (:00) ou meias horas (:30).",
        { id: "horasNaoCheias" },
      );
      return;
    }

    try {
      await postDisponibilidadeInput(scheduleInput);
      toast.success("Horário adicionado com sucesso!", { id: "successHorarioAdicionadoC" });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao adicionar horário disponível",
        { id: "ErroGeralHorario" },
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setScheduleInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apenas aceita horas cheias (:00) ou meias horas (:30)
  const isHoraValida = (hora: string): boolean => {
    const [, minutos] = hora.split(":");
    return minutos === "00" || minutos === "30";
  };

  const isFimDeSemana = (data: string): boolean => {
    const date = new Date(data);
    const diaSemana = date.getDay();

    return diaSemana === 0 || diaSemana === 6;
  };

  useEffect(() => {
    if (isMobile) {
      setActiveTab("Dados");
    }
  }, []);

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="mb-3 mb-md-0 text-center text-md-start">
        <h2 className="fw-bold mb-1">Adicionar Disponibilidade</h2>
        <p className="text-muted mb-0">
          Inserir, alterar, eliminar ou consultar disponibilidade.
        </p>
      </div>

      {/* TABS */}
      {!isMobile && (
        <ul className="nav nav-tabs my-4 flex-column flex-md-row">
          <li className="nav-item">
            <button
              className={`nav-link w-100 text-center ${activeTab === "Schedule" ? "active" : ""}`}
              onClick={() => setActiveTab("Schedule")}
              type="button"
            >
              Vista Horário
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link w-100 text-center ${activeTab === "Dados" ? "active" : ""}`}
              onClick={() => setActiveTab("Dados")}
              type="button"
            >
              Vista nAUM SEI A PALAVRA CERTA ANDRÉ
            </button>
          </li>
        </ul>
      )}
      {activeTab == "Schedule" && !isMobile && (
        <div className="mt-3 mt-md-5">
          <CreateAvailabilitySchedule
            events={horariosDisponiveis}
            onSelect={handleAdicionarHorarios}
            onDelete={handleDeleteHorario}
          />
        </div>
      )}
      {activeTab === "Dados" && (
        <>
          <div className="my-5">
            {/* Período */}
            <form onSubmit={handleAddDisponibilidade}>
              <div className="d-flex justify-content-end justify-content-md-end">
                <button className="btn btn-success w-100 w-md-auto pt-2 py-md-1">
                  + Adicionar Disponibilidade
                </button>
              </div>
              <div className="row g-3 mt-4">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Válido de</label>
                  <input
                    type="date"
                    name="dataInicio"
                    className="form-control"
                    value={scheduleInput.dataInicio}
                    onChange={handleChange}
                    max={scheduleInput.dataFim || undefined}
                    onBlur={() => {
                      if (scheduleInput.dataInicio && isFimDeSemana(scheduleInput.dataInicio)) {
                        toast.error(
                          "Não é possível selecionar fins de semana.", { id: "erroSelecionarFDS" });
                      }
                    }}
                    required
                  />
                </div>

                <div className="col-md-4 mb-3 ">
                  <label className="form-label">Até</label>
                  <input
                    type="date"
                    name="dataFim"
                    className="form-control"
                    value={scheduleInput.dataFim}
                    onChange={handleChange}
                    min={scheduleInput.dataInicio || undefined}
                    onBlur={() => {
                      if (scheduleInput.dataFim && isFimDeSemana(scheduleInput.dataFim)) {
                        toast.error(
                          "Não é possível selecionar fins de semana.", { id: "ErroSelecionarFDS" });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Horário */}
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Hora início</label>
                  <input
                    type="time"
                    name="horaInicio"
                    className="form-control"
                    value={scheduleInput.horaInicio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Hora fim</label>
                  <input
                    type="time"
                    name="horaFim"
                    className="form-control"
                    value={scheduleInput.horaFim}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
