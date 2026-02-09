import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useEffect, useState, useMemo } from "react";
import {
  getHorariosTotal,
  updateHorario,
  getHorariosById,
  postHorario,
  autoGenerateSchedule,
  type Horario,
} from "../../services/shedules/HorariosService";
import {
  getTurmasFormadorHorario,
  getTurmas,
} from "../../services/turmas/TurmasService";
import { getSalasDisponiveis } from "../../services/rooms/SalasService";
import { getFormadores } from "../../services/formador/FormadorService";
import "../../css/newSchedule.css";
import { Search, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { normalizarTexto } from "../../utils/stringUtils";
import toast from "react-hot-toast";
import FormadorDisponibilidadePreview from "../../components/FormadorDisponibilidadePreview";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function NewSchedule() {
  // --- Estados gerais ---
  const [dataSelecionada, setDataSelecionada] = useState<Value>(new Date());
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGenerator, setLoadingGenerator] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [autoGenData, setAutoGenData] = useState({
    idTurma: "",
    dataInicio: "",
  });

  // --- Estados para filtro e paginação
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // --- Estados dos modal ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);

  // --- Estado do Novo Horario ---
  const [newHorario, setNewHorario] = useState({
    idTurma: "",
    idFormador: "",
    idSala: "",
    idModulo: "", // Controla o select do módulo
    idCursoModulo: "", // ID Técnico para a BD
    data: "",
    horaInicio: "",
    horaFim: "",
  });

  // --- Estados das listas ---
  const [turmasRaw, setTurmasRaw] = useState<any[]>([]);
  const [formadores, setFormadores] = useState<any[]>([]);
  const [salasDisponiveis, setSalasDisponiveis] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);

  // --- HELPER ---
  const formatarData = (data: any) => {
    if (!(data instanceof Date)) return "";
    return data.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // --- CARREGAMENTO INICIAL ---
  const fetchHorarios = async () => {
    setLoading(true);
    try {
      const data = await getHorariosTotal();
      setHorarios(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorarios();
    const loadFormadores = async () => {
      try {
        const res = await getFormadores();
        setFormadores(res);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar formadores.");
      }
    };
    loadFormadores();
  }, []);

  // Resetar paginação quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, dataSelecionada]);

  // --- LÓGICA DE FILTRAGEM (USEMEMO) ---
  // Prepara os dados para os dois selects separados

  // Lista de Turmas Únicas (Remove duplicados se a turma tiver vários módulos)
  const turmasUnicas = useMemo(() => {
    const map = new Map();
    turmasRaw.forEach((t) => {
      if (!map.has(t.idTurma)) {
        map.set(t.idTurma, { idTurma: t.idTurma, nomeTurma: t.nomeTurma });
      }
    });
    return Array.from(map.values());
  }, [turmasRaw]);

  // Lista de Módulos (Apenas da turma selecionada)
  const modulosDaTurma = useMemo(() => {
    if (!newHorario.idTurma) return [];
    return turmasRaw.filter((t) => t.idTurma.toString() === newHorario.idTurma);
  }, [turmasRaw, newHorario.idTurma]);

  // --- HANDLERS (O que acontece quando se muda os selects) ---

  const handleFormadorChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const idFormador = e.target.value;

    setNewHorario({
      ...newHorario,
      idFormador: idFormador,
      idTurma: "", // Resetar Turma
      idModulo: "", // Resetar Módulo
      idCursoModulo: "", // Resetar ID Técnico
    });
    setTurmasRaw([]);

    if (!idFormador) return;

    try {
      const res = await getTurmasFormadorHorario(Number(idFormador));
      setTurmasRaw(res);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar turmas.");
    }
  };

  const handleTurmaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewHorario({
      ...newHorario,
      idTurma: e.target.value,
      idModulo: "", // Resetar módulo ao trocar turma
      idCursoModulo: "",
    });
  };

  const handleTurmaAutoGenerateChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const idTurma = e.target.value;
    const turmaSelecionada = turmas.find(
      (t) => t.idTurma.toString() === idTurma,
    );

    setAutoGenData({
      idTurma: idTurma,
      dataInicio: turmaSelecionada?.dataInicio
        ? turmaSelecionada.dataInicio.split("T")[0]
        : "",
    });
  };

  const handleModuloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idModuloSelecionado = e.target.value;

    // Encontrar o objeto específico na lista original para obter o idCursoModulo
    const objEncontrado = turmasRaw.find(
      (t) =>
        t.idTurma.toString() === newHorario.idTurma &&
        t.idModulo.toString() === idModuloSelecionado,
    );

    if (objEncontrado) {
      setNewHorario({
        ...newHorario,
        idModulo: idModuloSelecionado,
        idCursoModulo: objEncontrado.idCursoModulo
          ? objEncontrado.idCursoModulo.toString()
          : "",
      });
    }
  };

  // --- SALAS E VALIDAÇÃO ---

  const fetchSalasDisponiveis = async () => {
    const { data, horaInicio, horaFim, idCursoModulo } = newHorario;
    if (!data || !horaInicio || !horaFim) {
      setSalasDisponiveis([]);
      return;
    }
    try {
      const dados = await getSalasDisponiveis(
        data,
        horaInicio,
        horaFim,
        idCursoModulo,
      );
      setSalasDisponiveis(dados);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSalasDisponiveis();
  }, [
    newHorario.data,
    newHorario.horaInicio,
    newHorario.horaFim,
    newHorario.idCursoModulo,
  ]);

  const verificarConflitos = () => {
    const { data, horaInicio, horaFim, idFormador, idTurma } = newHorario;
    if (!data || !horaInicio || !horaFim)
      return { formadorOcupado: false, turmaOcupada: false };

    const getMinutos = (h: string) => {
      const [horas, minutos] = h.split(":").map(Number);
      return horas * 60 + minutos;
    };
    const inicioNovo = getMinutos(horaInicio);
    const fimNovo = getMinutos(horaFim);

    if (inicioNovo >= fimNovo)
      return { formadorOcupado: false, turmaOcupada: false, erroHoras: true };

    const conflito = horarios.find((h) => {
      const dataH = new Date(h.data).toISOString().split("T")[0];
      if (dataH !== data) return false;

      const inicioExistente = getMinutos(h.horaInicio);
      const fimExistente = getMinutos(h.horaFim);
      const sobreposicao =
        inicioNovo < fimExistente && fimNovo > inicioExistente;

      if (!sobreposicao) return false;

      const conflitoFormador =
        idFormador && h.idFormador === Number(idFormador);
      const conflitoTurma = idTurma && h.idTurma === Number(idTurma);

      return conflitoFormador || conflitoTurma;
    });

    if (conflito) {
      return {
        formadorOcupado:
          idFormador && conflito.idFormador === Number(idFormador),
        turmaOcupada: idTurma && conflito.idTurma === Number(idTurma),
        erroHoras: false,
      };
    }
    return { formadorOcupado: false, turmaOcupada: false, erroHoras: false };
  };

  const conflitos = verificarConflitos();

  // --- CRUD ---

  const handleOpenModal = (horario: Horario) => {
    setSelectedHorario({ ...horario });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedHorario(null);
  };

  const handleOpenCreateModal = () => {
    if (dataSelecionada instanceof Date) {
      const offset = dataSelecionada.getTimezoneOffset();
      const dataLocal = new Date(
        dataSelecionada.getTime() - offset * 60 * 1000,
      );
      const dataISO = dataLocal.toISOString().split("T")[0];

      setNewHorario({
        idTurma: "",
        idFormador: "",
        idSala: "",
        idModulo: "",
        idCursoModulo: "",
        data: dataISO,
        horaInicio: "",
        horaFim: "",
      });
      setShowCreateModal(true);
    }
  };

  const handleAutoGenerateModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setAutoGenData({ idTurma: "", dataInicio: "" }); // Reset inicial
    setShowAutoGenerateModal(true);

    try {
      const res = await getTurmas();
      setTurmas(res);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar turmas.");
    }
  };

  const handleAutoGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!autoGenData.idTurma) {
      toast.error("Selecione uma turma válida.");
      return;
    }

    setShowAutoGenerateModal(false);
    setLoadingGenerator(true);

    try {
      await autoGenerateSchedule(Number(autoGenData.idTurma));

      // Mesmo que a API responda em 100ms, o spinner fica mais tempo
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Horário gerado com sucesso!");
      await fetchHorarios();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar horário.");
    } finally {
      setLoadingGenerator(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHorario) return;

    try {
      const resHorarioId = await getHorariosById(selectedHorario.idHorario);
      const data = new FormData();
      data.append("IdHorario", selectedHorario.idHorario.toString());
      data.append("Data", selectedHorario.data);
      data.append("HoraInicio", selectedHorario.horaInicio);
      data.append("HoraFim", selectedHorario.horaFim);
      data.append("IdFormador", resHorarioId.idFormador?.toString() ?? "");
      data.append("IdSala", resHorarioId.idSala?.toString() ?? "");
      data.append(
        "IdCursoModulo",
        resHorarioId.idCursoModulo?.toString() ?? "",
      );

      await updateHorario(selectedHorario.idHorario.toString(), data);
      toast.success("Atualizado com sucesso!");
      await fetchHorarios();
      handleCloseModal();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao atualizar.";
      toast.error(msg);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHorario.idCursoModulo) {
      toast.error("Selecione um módulo válido.");
      return;
    }

    const data = new FormData();
    data.append("IdTurma", newHorario.idTurma);
    data.append("IdFormador", newHorario.idFormador);
    data.append("IdSala", newHorario.idSala);
    data.append("IdCursoModulo", newHorario.idCursoModulo);
    data.append("Data", newHorario.data);
    data.append("HoraInicio", newHorario.horaInicio);
    data.append("HoraFim", newHorario.horaFim);

    try {
      await postHorario(data);
      toast.success("Horário criado!");
      await fetchHorarios();
      setShowCreateModal(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao criar horário.";
      toast.error(msg);
    }
  };

  // --- Filtros e paginação ---
  const correspondePesquisa = (h: Horario, termo: string) => {
    const t = normalizarTexto(termo);
    return (
      normalizarTexto(h.nomeTurma).includes(t) ||
      normalizarTexto(h.nomeModulo).includes(t) ||
      normalizarTexto(h.nomeFormador).includes(t) ||
      normalizarTexto(h.nomeSala).includes(t)
    );
  };

  // Determina se o filtro de intervalo está ativo
  const isRangeActive = startDate !== "" && endDate !== "";

  // Filtra os horários
  const horariosFiltrados = horarios.filter((h) => {
    // Filtro de Texto
    if (!correspondePesquisa(h, searchTerm)) return false;

    const dataHorario = new Date(h.data).toISOString().split("T")[0];

    // Modo Intervalo
    if (isRangeActive) {
      return dataHorario >= startDate && dataHorario <= endDate;
    }

    // Modo Data Única (Calendário)
    if (dataSelecionada instanceof Date) {
      // Ajuste para evitar problemas de fuso horário na comparação simples
      const dataSelStr = new Date(
        dataSelecionada.getTime() - dataSelecionada.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split("T")[0];
      return dataHorario === dataSelStr;
    }

    return false;
  });

  // Ordenar por data e hora
  horariosFiltrados.sort((a, b) => {
    const dateA = new Date(`${a.data}T${a.horaInicio}`);
    const dateB = new Date(`${b.data}T${b.horaInicio}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Lógica de Paginação
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentHorarios = horariosFiltrados.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(horariosFiltrados.length / ITEMS_PER_PAGE);

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    // Se o modo de intervalo estiver ativo, não mostrar bolinhas e desativar visualmente
    if (isRangeActive) return null;

    if (view === "month") {
      const dataStr = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split("T")[0];
      const tem = horarios.some(
        (h) =>
          new Date(h.data).toISOString().split("T")[0] === dataStr &&
          correspondePesquisa(h, searchTerm),
      );
      if (tem)
        return (
          <div className="dot-container">
            <div className="schedule-dot"></div>
          </div>
        );
    }
    return null;
  };

  // Limpar filtros de intervalo
  const clearRangeFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Horários</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar e consultar horários.
          </p>
        </div>

        <div className="d-flex gap-2">
          <div
            className="btn btn-success px-4 py-2 rounded-pill shadow-sm"
            onClick={handleAutoGenerateModal}
            style={{ cursor: "pointer" }}
          >
            Criar Horário automatico para turma
          </div>

          <div
            className="btn btn-success px-4 py-2 rounded-pill shadow-sm"
            onClick={handleOpenCreateModal}
            style={{ cursor: "pointer" }}
          >
            + Novo Horário
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS E PESQUISA */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body col-md-12">
          <div className="row g-2 align-items-center">
            {/* Pesquisa Texto */}
            <div className="col-md">
              <div className="input-group input-group-custom">
                <span className="input-group-text bg-white border-0">
                  <Search size={20} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none"
                  placeholder="Pesquisar turma, formador ou sala..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filtro de Intervalo de Datas */}
            <div className="col-md-auto">
              <div className="d-flex gap-2 align-items-center flex-wrap justify-content-md-end">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small fw-bold">De:</span>
                  <input
                    type="date"
                    className="form-control shadow-none"
                    style={{ maxWidth: "160px" }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small fw-bold">Até:</span>
                  <input
                    type="date"
                    className="form-control shadow-none"
                    style={{ maxWidth: "160px" }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>

                {isRangeActive && (
                  <button
                    className="btn btn-outline-danger d-flex align-items-center gap-1 rounded-pill px-3"
                    onClick={clearRangeFilter}
                    title="Limpar filtros de data"
                  >
                    <XCircle size={16} /> Limpar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CALENDÁRIO E LISTA */}
      <div className="row g-4">
        <div className="col-lg-4">
          <div
            className={`card shadow-sm border-0 rounded-4 p-3 bg-white ${isRangeActive ? "opacity-50" : ""}`}
          >
            <h5 className="text-center fw-bold mb-3">
              {isRangeActive ? "Calendário Bloqueado" : "Calendário"}
            </h5>
            <div style={{ pointerEvents: isRangeActive ? "none" : "auto" }}>
              <Calendar
                onChange={setDataSelecionada}
                value={dataSelecionada}
                locale="pt-PT"
                className="w-100 border-0"
                tileContent={getTileContent}
                // Bloqueia visualmente se o filtro de intervalo estiver ativo
                tileDisabled={() => isRangeActive}
              />
            </div>
            {isRangeActive && (
              <div className="text-center mt-2">
                <small className="text-danger fw-bold">
                  Modo de intervalo ativo.
                </small>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 p-4 text-center h-100">
            <h6 className="text-center mb-4">
              {isRangeActive ? (
                <span>
                  Horários de <strong>{startDate}</strong> a{" "}
                  <strong>{endDate}</strong>
                </span>
              ) : (
                <span>
                  Horários para <strong>{formatarData(dataSelecionada)}</strong>
                </span>
              )}
            </h6>

            <div
              className="py-2 d-flex flex-column"
              style={{ minHeight: "400px" }}
            >
              {loading ? (
                <div className="d-flex justify-content-center align-items-center flex-grow-1">
                  <div
                    className="spinner-border text-success"
                    role="status"
                  ></div>
                </div>
              ) : currentHorarios.length > 0 ? (
                <>
                  <div className="text-start flex-grow-1">
                    {currentHorarios.map((h) => (
                      <div
                        key={h.idHorario}
                        className="card border-0 bg-light rounded-4 mb-3 shadow-sm schedule-card-map"
                      >
                        <div className="card-body d-flex align-items-center p-3">
                          <div
                            className="text-center pe-4 border-end"
                            style={{ minWidth: "110px" }}
                          >
                            {/* Se for intervalo, mostra a data também */}
                            {isRangeActive && (
                              <div className="text-muted small fw-bold mb-1">
                                {new Date(h.data).toLocaleDateString("pt-PT", {
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                              </div>
                            )}
                            <h4
                              className="fw-bold mb-0"
                              style={{ color: "#065f5a" }}
                            >
                              {h.horaInicio}
                            </h4>
                            <small className="text-muted">
                              até {h.horaFim}
                            </small>
                          </div>
                          <div className="ps-4 flex-grow-1">
                            <h5 className="fw-bold mb-1">{h.nomeTurma}</h5>
                            <p className="text-muted small mb-1">
                              {h.nomeModulo}
                            </p>
                            <small className="text-secondary">
                              <i className="bi bi-person me-1"></i>
                              {h.nomeFormador} |
                              <i className="bi bi-geo-alt ms-2 me-1"></i>
                              {h.nomeSala}
                            </small>
                          </div>
                          <button
                            className="btn btn-success px-4 py-2 rounded-pill shadow-sm"
                            onClick={() => handleOpenModal(h)}
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PAGINAÇÃO */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-3 mt-4 pt-3 border-top">
                      <button
                        className="btn btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        style={{ width: "40px", height: "40px" }}
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <span className="fw-semibold text-muted">
                        Página {currentPage} de {totalPages}
                      </span>

                      <button
                        className="btn btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        style={{ width: "40px", height: "40px" }}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                  <p className="text-muted mt-3">
                    Sem horários encontrados para este filtro.
                  </p>
                  <div
                    className="btn btn-outline-success px-4 py-2 rounded-pill shadow-sm"
                    onClick={handleOpenCreateModal}
                    style={{ cursor: "pointer" }}
                  >
                    + Novo Horário
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL EDITAR (UPDATE) --- */}
      {showEditModal && selectedHorario && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h4 className="fw-bold text-primary">Editar Aula</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Curso</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedHorario.nomeCurso}
                        disabled
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Módulo</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedHorario.nomeModulo}
                        disabled
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Formador</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedHorario.nomeFormador}
                        disabled
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Sala</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedHorario.nomeSala}
                        disabled
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Início</label>
                      <input
                        type="time"
                        className="form-control"
                        value={selectedHorario.horaInicio}
                        onChange={(e) =>
                          setSelectedHorario({
                            ...selectedHorario,
                            horaInicio: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Fim</label>
                      <input
                        type="time"
                        className="form-control"
                        value={selectedHorario.horaFim}
                        onChange={(e) =>
                          setSelectedHorario({
                            ...selectedHorario,
                            horaFim: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CRIAR (CREATE) --- */}
      {showCreateModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h4 className="fw-bold text-primary">Novo Horário</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* DATA */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Data</label>
                      <input
                        type="date"
                        className="form-control shadow-none"
                        value={newHorario.data}
                        onChange={(e) =>
                          setNewHorario({ ...newHorario, data: e.target.value })
                        }
                        required
                      />
                    </div>

                    {/* FORMADOR */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Formador</label>
                      <select
                        className={`form-select shadow-none ${conflitos.formadorOcupado ? "is-invalid" : ""}`}
                        value={newHorario.idFormador}
                        onChange={handleFormadorChange}
                        required
                      >
                        <option value="">Selecionar Formador...</option>
                        {formadores.map((f: any) => (
                          <option key={f.idFormador} value={f.idFormador}>
                            {f.nome}
                          </option>
                        ))}
                      </select>
                      {conflitos.formadorOcupado && (
                        <div className="invalid-feedback fw-bold">
                          Formador ocupado neste horário!
                        </div>
                      )}
                    </div>

                    {/* TURMA */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Turma</label>
                      <select
                        className={`form-select shadow-none ${conflitos.turmaOcupada ? "is-invalid" : ""}`}
                        value={newHorario.idTurma}
                        onChange={handleTurmaChange}
                        disabled={!newHorario.idFormador}
                        required
                      >
                        <option value="">
                          {!newHorario.idFormador
                            ? "Escolha Formador"
                            : "Selecionar Turma..."}
                        </option>
                        {turmasUnicas.map((t: any) => (
                          <option key={t.idTurma} value={t.idTurma}>
                            {t.nomeTurma}
                          </option>
                        ))}
                      </select>
                      {conflitos.turmaOcupada && (
                        <div className="invalid-feedback fw-bold">
                          Turma ocupada neste horário!
                        </div>
                      )}
                    </div>

                    {/* MÓDULO */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Módulo</label>
                      <select
                        className="form-select shadow-none"
                        value={newHorario.idModulo}
                        onChange={handleModuloChange}
                        disabled={!newHorario.idTurma}
                        required
                      >
                        <option value="">
                          {!newHorario.idTurma
                            ? "Escolha Turma"
                            : "Selecionar Módulo..."}
                        </option>
                        {modulosDaTurma.map((m: any) => (
                          <option key={m.idModulo} value={m.idModulo}>
                            {m.nomeModulo} ({m.estado})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* HORAS */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Início</label>
                      <input
                        type="time"
                        className="form-control shadow-none"
                        value={newHorario.horaInicio}
                        onChange={(e) =>
                          setNewHorario({
                            ...newHorario,
                            horaInicio: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Fim</label>
                      <input
                        type="time"
                        className="form-control shadow-none"
                        value={newHorario.horaFim}
                        onChange={(e) =>
                          setNewHorario({
                            ...newHorario,
                            horaFim: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    {/* SALA */}
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">
                        Sala Disponível
                      </label>
                      <select
                        className="form-select shadow-none"
                        value={newHorario.idSala}
                        onChange={(e) =>
                          setNewHorario({
                            ...newHorario,
                            idSala: e.target.value,
                          })
                        }
                        disabled={
                          !newHorario.horaInicio ||
                          !newHorario.horaFim ||
                          !newHorario.data
                        }
                        required
                      >
                        <option value="">
                          {!newHorario.horaInicio
                            ? "Defina horário"
                            : salasDisponiveis.length === 0
                              ? "Nenhuma sala disponível..."
                              : "Selecionar Sala..."}
                        </option>
                        {salasDisponiveis.map((sala: any) => (
                          <option key={sala.idSala} value={sala.idSala}>
                            {sala.nomeSala} ({sala.tipo} - Cap:{" "}
                            {sala.capacidade})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-12 mt-4">
                    <h6 className="fw-bold text-success mb-2">
                      Disponibilidade na semana
                    </h6>
                    {newHorario.idFormador && newHorario.data ? (
                      <FormadorDisponibilidadePreview
                        data={newHorario.data}
                        idFormador={newHorario.idFormador}
                      />
                    ) : (
                      <div className="text-muted small mt-4">
                        Selecione um formador e uma data para ver
                        disponibilidade
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 text-white"
                    disabled={
                      conflitos.formadorOcupado ||
                      conflitos.turmaOcupada ||
                      conflitos.erroHoras
                    }
                  >
                    Criar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- Loading Page ---*/}
      {loadingGenerator && (
        <div
          className="modal fade show d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2000, // Garante que fica acima de qualquer outro modal
          }}
        >
          <div className="text-center bg-white p-5 rounded-4 shadow-lg">
            <div
              className="spinner-border text-success mb-3"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            ></div>
            <h5 className="fw-bold">A Gerar Horário Inteligente...</h5>
            <p className="text-muted mb-0">
              Isto pode demorar alguns segundos.
            </p>
          </div>
        </div>
      )}

      {/* --- Modal Gerador Automatico --- */}
      {showAutoGenerateModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h4 className="fw-bold text-primary">
                  Gerar Horário Para Turma
                </h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAutoGenerateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAutoGenerate}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* TURMA */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Turma</label>
                      <select
                        className={`form-select shadow-none`}
                        value={autoGenData.idTurma}
                        onChange={handleTurmaAutoGenerateChange}
                        required
                      >
                        <option value="">{"Selecionar Turma..."}</option>
                        {turmas.map((t: any) => (
                          <option key={t.idTurma} value={t.idTurma}>
                            {t.nomeTurma}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DATA */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Data de início de curso
                      </label>
                      <input
                        type="date"
                        className="form-control shadow-none"
                        value={autoGenData.dataInicio}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowAutoGenerateModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 text-white"
                    disabled={loadingGenerator}
                  >
                    {loadingGenerator ? "A gerar..." : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
