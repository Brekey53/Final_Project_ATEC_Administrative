import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getTurma,
  updateTurma,
  type Turma,
  getCursos,
} from "../../services/turmas/TurmasService";
import type { Curso } from "../../services/cursos/CursosService";
import {
  getFormadoresDaTurma,
  type AlocacaoTurmaModulo,
} from "../../services/turmaAlocacoes/TurmaAlocacoes";
import {
  getModulosDisponiveis,
  getFormadoresPorTipoMateria,
  type ModuloDisponivel,
  type FormadorDisponivel,
  alocarFormador,
  removerFormador,
} from "../../services/turmaAlocacoes/TurmaAlocacoes";
import { Trash, Lock } from "lucide-react";
import { Tooltip } from "bootstrap";
import "../../css/layoutTabelas.css";

export default function EditTurma() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Turma>({
    idTurma: 0,
    idCurso: 0,
    nomeTurma: "",
    dataInicio: "",
    dataFim: "",
    nomeCurso: "",
    estado: "A decorrer",
    idMetodologia: 0,
  });

  type Tabs = "dados" | "formadores";

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<Tabs>("dados");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formadoresTurma, setFormadoresTurma] = useState<AlocacaoTurmaModulo[]>(
    [],
  );

  const [loadingFormadores, setLoadingFormadores] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modulosDisponiveis, setModulosDisponiveis] = useState<any[]>([]);
  const [formadoresDisponiveis, setFormadoresDisponiveis] = useState<
    FormadorDisponivel[]
  >([]);
  const [selectedModulo, setSelectedModulo] = useState<ModuloDisponivel | null>(
    null,
  );
  const [selectedFormador, setSelectedFormador] = useState<number | null>(null);

  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const [alocacaoParaRemover, setAlocacaoParaRemover] = useState<{
    idFormador: number;
    idModulo: number;
    nomeFormador: string;
    nomeModulo: string;
  } | null>(null);

  const openModal = async () => {
    if (!id) return;
    try {
      const data = await getModulosDisponiveis(id);
      setModulosDisponiveis(data);
      setShowModal(true);
    } catch {
      toast.error("Erro ao carregar módulos disponíveis.", { id: "erroCarregarModulosDisponiveissa" });
    }
  };

  const onModuloChange = async (idModulo: number) => {
    const modulo = modulosDisponiveis.find((m) => m.idModulo === idModulo);

    if (!modulo) return;

    setSelectedModulo(modulo);
    const formadores = await getFormadoresPorTipoMateria(modulo.idTipoMateria);
    setFormadoresDisponiveis(formadores);
  };

  useEffect(() => {
    // 1. Procurar os elementos
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]',
    );

    // 2. Inicializar
    const tooltipList = Array.from(tooltipTriggerList).map(
      (el) => new Tooltip(el),
    );

    // 3. Limpeza
    return () => {
      tooltipList.forEach((t) => t.dispose());
    };
  }, [formadoresTurma]); // Re-executa quando a lista carrega

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [turmaData, cursosRes] = await Promise.all([
          getTurma(id),
          getCursos(),
        ]);

        setFormData({
          ...turmaData,
          dataInicio: turmaData.dataInicio
            ? turmaData.dataInicio.split("T")[0]
            : "",
          dataFim: turmaData.dataFim ? turmaData.dataFim.split("T")[0] : "",
        });

        setCursos(cursosRes);
      } catch {
        toast.error("Erro ao carregar dados da turma.", { id: "erroCarregarDadosTurmaas" });
        navigate("/turmas");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    if (activeTab !== "formadores" || !id) return;

    const fetchFormadores = async () => {
      try {
        setLoadingFormadores(true);
        const data = await getFormadoresDaTurma(id);
        setFormadoresTurma(data);
      } catch {
        toast.error("Erro ao carregar formadores da turma.", { id: "erroLifTeacherTurma" });
      } finally {
        setLoadingFormadores(false);
      }
    };

    fetchFormadores();
  }, [activeTab, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "idCurso" ? Number(value) : value,
      nomeCurso: cursos.find((c) => c.idCurso === Number(value))?.nome || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);

    try {
      await updateTurma(id, formData);
      toast.success("Turma atualizada com sucesso!", { id: "successTurmaUpdate" });
      navigate("/turmas");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar turma.", { id: "errorUpdateTurma" });
    } finally {
      setLoading(false);
    }
  };

  const handleAlocar = async () => {
    if (!id || !selectedModulo || !selectedFormador) return;

    try {
      await alocarFormador({
        idTurma: Number(id),
        idModulo: selectedModulo.idModulo,
        idFormador: selectedFormador,
      });

      toast.success("Formador alocado com sucesso!", { id: "successTeacherPut" });

      setShowModal(false);
      setSelectedModulo(null);
      setSelectedFormador(null);
      setFormadoresDisponiveis([]);

      const data = await getFormadoresDaTurma(id);
      setFormadoresTurma(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao alocar formador.");
    }
  };

  const confirmarRemocao = async () => {
    if (!id || !alocacaoParaRemover) return;

    try {
      await removerFormador(
        Number(id),
        alocacaoParaRemover.idFormador,
        alocacaoParaRemover.idModulo,
      );

      toast.success("Formador removido com sucesso.", { id: "successTeacherNoPut" });

      const data = await getFormadoresDaTurma(id);
      setFormadoresTurma(data);
    } catch (err: any) {
      const mensagem =
        err.response?.data?.message || "Não foi possível remover o formador.";
      toast.error(mensagem, { id: "errorTeacherNoPutTurma" });
    } finally {
      setShowRemoveModal(false);
      setAlocacaoParaRemover(null);
    }
  };

  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(formadoresTurma.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const formadoresPaginados = formadoresTurma.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [formadoresTurma]);

  if (fetching) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">A carregar dados da turma...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-4 text-primary">Editar Turmas</h2>
          <p className="text-muted small mb-0">
            ID Interno: #{formData.idTurma}
          </p>
        </div>
        <button
          className="btn btn-light border rounded-pill px-4"
          onClick={() => navigate("/turmas")}
        >
          Voltar
        </button>
      </div>

      <ul className="nav nav-tabs mb-4 flex-nowrap">
        <li className="nav-item flex-shrink-0">
          <button
            className={`nav-link ${activeTab === "dados" ? "active" : ""}`}
            onClick={() => setActiveTab("dados")}
            type="button"
          >
            Dados da Turma
          </button>
        </li>
        <li className="nav-item flex-shrink-0">
          <button
            className={`nav-link ${activeTab === "formadores" ? "active" : ""}`}
            onClick={() => setActiveTab("formadores")}
            type="button"
          >
            Formadores
          </button>
        </li>
      </ul>

      {activeTab === "dados" && (
        <form onSubmit={handleSubmit} className="row g-4">
          <div className="col-lg-4 d-none d-lg-block text-center">
            <div className="card p-4 shadow-sm border-0 rounded-4 bg-light text-center h-100">
              <div className="display-1 mb-3">👥</div>
              <h5 className="fw-bold">{formData.nomeTurma || "Sem Nome"}</h5>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card p-4 shadow-sm border-0 rounded-4">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Nome da Turma
                  </label>
                  <input
                    type="text"
                    name="nomeTurma"
                    className="form-control form-control-lg"
                    value={formData.nomeTurma}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Curso Associado
                  </label>
                  <select
                    name="idCurso"
                    className="form-select form-select-lg"
                    value={formData.idCurso}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione um curso...</option>
                    {cursos.map((c) => (
                      <option key={c.idCurso} value={c.idCurso}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    name="dataInicio"
                    className="form-control"
                    value={formData.dataInicio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Data de Fim</label>
                  <input
                    type="date"
                    name="dataFim"
                    className="form-control"
                    value={formData.dataFim}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary px-5 rounded-pill"
                  disabled={loading}
                >
                  {loading ? "A guardar..." : "Guardar Alterações"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {activeTab === "formadores" && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center px-4 py-3">
            <h5 className="mb-0 text-primary fw-semibold">
              Formadores da Turma
            </h5>

            <button
              className="btn btn-primary btn-sm rounded-pill px-3"
              onClick={openModal}
            >
              + Alocar Formador
            </button>
          </div>

          <div className="card-body p-0">
            {/* Header */}
            <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-turma-alocacoes tabela-turma-alocacoes-header small text-uppercase">
              <div>Módulo</div>
              <div>Formador</div>
              <div>Estado</div>
              <div>Ações</div>
            </div>

            {/* Conteúdo */}
            {!loadingFormadores && formadoresPaginados.length > 0 ? (
              formadoresPaginados.map((a) => (
                <div
                  key={`${a.idFormador}-${a.idModulo}`}
                  className="px-4 py-3 border-bottom tabela-turma-alocacoes"
                >
                  {/* Módulo */}
                  <div data-label="Módulo" className="fw-semibold">
                    {a.nomeModulo}
                  </div>

                  {/* Formador */}
                  <div data-label="Formador" className="text-muted">
                    {a.nomeFormador}
                  </div>

                  {/* Estado */}
                  <div data-label="Estado">
                    {a.horasDadas === 0 ? (
                      <span className="badge bg-info-subtle text-info fw-medium">
                        Por iniciar
                      </span>
                    ) : (
                      <span className="badge bg-success-subtle text-success fw-medium">
                        Já iniciado
                      </span>
                    )}
                  </div>

                  {/* Ação */}
                  <div data-label="Ações">
                    {a.horasDadas === 0 ? (
                      <span
                        className="action-icon text-danger cursor-pointer"
                        title="Eliminar Formador"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        onClick={() => {
                          setAlocacaoParaRemover({
                            idFormador: a.idFormador,
                            idModulo: a.idModulo,
                            nomeFormador: a.nomeFormador,
                            nomeModulo: a.nomeModulo,
                          });
                          setShowRemoveModal(true);
                        }}
                      >
                        <Trash size={18} />
                      </span>
                    ) : (
                      <span
                        className="action-icon text-warning cursor-not-allowed"
                        title="Formador já deu horas neste módulo"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                      >
                        <Lock size={18} />
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : !loadingFormadores ? (
              <div className="p-5 text-center text-muted">
                Ainda não existem formadores alocados a esta turma.
              </div>
            ) : null}
          </div>
        </div>
      )}

      {showRemoveModal && alocacaoParaRemover && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 z-3">
          <div className="card shadow-lg rounded-4" style={{ width: 360 }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold">Remover Formador</h6>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowRemoveModal(false)}
              />
            </div>

            <div className="card-body">
              <p className="mb-2 text-muted">
                Tens a certeza que queres remover:
                <span className="fw-semibold">
                  {" "}
                  {alocacaoParaRemover.nomeFormador}
                </span>
              </p>

              <div className="text-muted small">
                Módulo: {alocacaoParaRemover.nomeModulo}
              </div>
            </div>

            <div className="card-footer d-flex justify-content-end gap-2">
              <button
                className="btn btn-light"
                onClick={() => setShowRemoveModal(false)}
              >
                Voltar
              </button>

              <button className="btn btn-danger" onClick={confirmarRemocao}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 z-3">
          <div className="card shadow-lg rounded-4 w-50">
            {/* Header */}
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Alocar Formador</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
              />
            </div>

            <div className="card-body">
              {/* Módulo */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Módulo</label>
                <select
                  className="form-select"
                  value={selectedModulo?.idModulo ?? ""}
                  onChange={(e) => onModuloChange(Number(e.target.value))}
                >
                  <option value="">Selecionar módulo…</option>
                  {modulosDisponiveis.map((m) => (
                    <option key={m.idModulo} value={m.idModulo}>
                      {m.nomeModulo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Matéria */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Tipo de Matéria
                </label>
                <input
                  className="form-control"
                  value={selectedModulo?.tipoMateria || ""}
                  disabled
                />
              </div>

              {/* Formador */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Formador</label>
                <select
                  className="form-select"
                  value={selectedFormador ?? ""}
                  onChange={(e) => setSelectedFormador(Number(e.target.value))}
                  disabled={formadoresDisponiveis.length === 0}
                >
                  <option value="">Selecionar formador…</option>
                  {formadoresDisponiveis.map((f) => (
                    <option key={f.idFormador} value={f.idFormador}>
                      {f.nomeFormador}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="card-footer d-flex justify-content-end gap-2">
              <button
                className="btn btn-light"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                disabled={!selectedModulo || !selectedFormador}
                onClick={handleAlocar}
              >
                Alocar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PAGINAÇÃO */}
      {totalPages > 1 && activeTab === "formadores" && (
        <div>
          <div className="d-flex justify-content-center align-items-center gap-2 py-4">
            <button
              className="btn btn-outline-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Anterior
            </button>

            <span className="text-muted">
              Página {currentPage} de {totalPages}
            </span>

            <button
              className="btn btn-outline-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Seguinte
            </button>
          </div>

          <div className="d-flex justify-content-center align-items-center gap-2">
            <p className="text-muted small text-center mt-1">
              {formadoresTurma.length} alocação(ões) encontrada(s)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
