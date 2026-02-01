import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useEffect, useState, useMemo } from "react";
import {
  getHorariosTotal,
  updateHorario,
  getHorariosById,
  postHorario,
  type Horario,
} from "../../services/shedules/HorariosService";
import { getTurmasFormadorHorario } from "../../services/turmas/TurmasService";
import { getSalasDisponiveis } from "../../services/rooms/SalasService";
import { getFormadores } from "../../services/formador/FormadorService";
import "../../css/newSchedule.css";
import { Search } from "lucide-react";
import { normalizarTexto } from "../../utils/stringUtils";
import toast, { Toaster } from "react-hot-toast";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function NewSchedule() {
  // --- ESTADOS GERAIS ---
  const [dataSelecionada, setDataSelecionada] = useState<Value>(new Date());
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- ESTADOS DOS MODAIS ---
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);

  // --- ESTADO DO NOVO HORÁRIO ---
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

  // --- ESTADOS DAS LISTAS ---
  const [turmasRaw, setTurmasRaw] = useState<any[]>([]); // Lista crua da API
  const [formadores, setFormadores] = useState<any[]>([]);
  const [salasDisponiveis, setSalasDisponiveis] = useState<any[]>([]);

  // --- HELPER ---
  const formatarData = (data: any) => {
    if (!(data instanceof Date)) return "";
    return data.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // --- 1. CARREGAMENTO INICIAL ---
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

  // --- 2. LÓGICA DE FILTRAGEM (USEMEMO) ---
  // AQUI ESTÁ A MAGIA: Prepara os dados para os dois selects separados

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

  // --- 3. HANDLERS (O que acontece quando mudas os selects) ---

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
      idModulo: "", // Importante: Resetar módulo ao trocar turma
      idCursoModulo: "",
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

  // --- 4. SALAS E VALIDAÇÃO ---

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
      // Nota: Verifica se a tua entidade Horario tem idTurma acessível
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

  // --- 5. CRUD ---

  const handleOpenModal = (horario: Horario) => {
    setSelectedHorario({ ...horario });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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

  // --- FILTROS ---
  const correspondePesquisa = (h: Horario, termo: string) => {
    const t = normalizarTexto(termo);
    return (
      normalizarTexto(h.nomeTurma).includes(t) ||
      normalizarTexto(h.nomeModulo).includes(t) ||
      normalizarTexto(h.nomeFormador).includes(t) ||
      normalizarTexto(h.nomeSala).includes(t)
    );
  };

  const horariosFiltrados = horarios.filter((h) => {
    if (!(dataSelecionada instanceof Date)) return false;
    return (
      new Date(h.data).toDateString() === dataSelecionada.toDateString() &&
      correspondePesquisa(h, searchTerm)
    );
  });

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const tem = horarios.some(
        (h) =>
          new Date(h.data).toDateString() === date.toDateString() &&
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

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <Toaster />

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Horários</h2>
          <p className="text-muted mb-0">Inserir, alterar, eliminar e consultar horários.</p>
        </div>
        <div
          className="btn btn-success px-4 py-2 rounded-pill shadow-sm"
          onClick={handleOpenCreateModal}
          style={{ cursor: "pointer" }}
        >
          + Novo Horário
        </div>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <div className="input-group input-group-custom">
            <span className="input-group-text bg-white border-0">
              <Search size={20} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control form-control-lg border-0 shadow-none"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* CALENDÁRIO E LISTA */}
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 p-3 bg-white">
            <h5 className="text-center fw-bold mb-3">Calendário</h5>
            <Calendar
              onChange={setDataSelecionada}
              value={dataSelecionada}
              locale="pt-PT"
              className="w-100 border-0"
              tileContent={getTileContent}
            />
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 p-5 text-center">
            <h6 className="text-center mb-4">
              Horários para <strong>{formatarData(dataSelecionada)}</strong>
            </h6>
            <div className="py-2">
              {loading ? (
                <div
                  className="spinner-border text-success"
                  role="status"
                ></div>
              ) : horariosFiltrados.length > 0 ? (
                <div className="text-start">
                  {horariosFiltrados.map((h) => (
                    <div
                      key={h.idHorario}
                      className="card border-0 bg-light rounded-4 mb-3 shadow-sm schedule-card-map"
                    >
                      <div className="card-body d-flex align-items-center p-3">
                        <div
                          className="text-center pe-4 border-end"
                          style={{ minWidth: "100px" }}
                        >
                          <h4
                            className="fw-bold mb-0"
                            style={{ color: "#065f5a" }}
                          >
                            {h.horaInicio}
                          </h4>
                          <small className="text-muted">até {h.horaFim}</small>
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
              ) : (
                <div>
                  <p className="text-muted mt-3">Sem horários para este dia.</p>
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
      {showModal && selectedHorario && (
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
                <h4 className="fw-bold text-success">Novo Horário</h4>
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
                          ⚠️ Formador ocupado neste horário!
                        </div>
                      )}
                    </div>

                    {/* TURMA (Usa turmasUnicas) */}
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
                          ⚠️ Turma ocupada neste horário!
                        </div>
                      )}
                    </div>

                    {/* MÓDULO (Usa modulosDaTurma) */}
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
                    className="btn btn-success rounded-pill px-4 text-white"
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
    </div>
  );
}
