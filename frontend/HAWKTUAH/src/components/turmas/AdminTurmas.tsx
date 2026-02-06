import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/layoutTabelas.css";
import { toast } from "react-hot-toast";
import { getTurmas, deleteTurma, type Turma } from "../../services/turmas/TurmasService";
import { normalizarTexto } from "../../utils/stringUtils";
import { Pencil, Search, Trash } from "lucide-react";
import { Tooltip } from "bootstrap";

export default function AdminTurmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [areaFiltro, setAreaFiltro] = useState("todas");
  const [ordenacao, setOrdenacao] = useState("desc");

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchTurmas() {
      try {
        const data = await getTurmas();
        if (!data) return;
        setTurmas(data);
      } catch (err: any) {
        toast.error(err || "Erro ao carregar turmas.");
      }
    }

    fetchTurmas();
  }, []);

   async function handleDeleteTurma() {
      if (!turmaSelecionada) return;
  
      try {
        await deleteTurma(turmaSelecionada.idTurma);
  
        setTurmas((prev) =>
          prev.filter((c) => c.idTurma !== turmaSelecionada.idTurma),
        );
  
        setTurmaSelecionada(null);
        setShowDeleteModal(false);
  
        toast.success("Turma eliminada com sucesso");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Erro ao eliminar Turma");
      }
    }

  const turmasFiltradas = turmas
    .filter((t) => {
      const termo = normalizarTexto(searchTerm);
      const matchPesquisa =
        normalizarTexto(t.nomeTurma).includes(termo) ||
        normalizarTexto(String(t.idTurma)).includes(termo);

      const matchArea =
        areaFiltro === "todas" ||
        areaFiltro === "" ||
        String(t.estado) === areaFiltro;

      return matchPesquisa && matchArea;
    })
    .sort((a, b) => {
      const dataA = a.dataInicio ? new Date(a.dataInicio).getTime() : 0;
      const dataB = b.dataInicio ? new Date(b.dataInicio).getTime() : 0;

      if (ordenacao === "asc") {
        return dataA - dataB;
      } else {
        return dataB - dataA;
      }
    });

  const totalPages = Math.ceil(turmasFiltradas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const turmasPaginadas = turmasFiltradas.slice(startIndex, endIndex);

  useEffect(() => {
    // Procurar os elementos
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]',
    );

    // Inicializar
    const tooltipList = Array.from(tooltipTriggerList).map(
      (el) => new Tooltip(el),
    );

    // Limpeza
    return () => {
      tooltipList.forEach((t) => t.dispose());
    };
  }, [turmasPaginadas]); // Re-executa quando a lista carrega

  /* sempre que pesquisa muda → volta à página 1 */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Turmas</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar e consultar turmas.
          </p>
        </div>
        <Link to="adicionar-turma">
          <div className="btn btn-success px-4 py-2 rounded-pill">
            + Nova Turma
          </div>
        </Link>
      </div>

      {/* PESQUISA */}
      <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
        <div className="row g-2 align-items-center p-2">
          {/* Pesquisa Input*/}
          <div className="col-md-6">
            <div className="input-group bg-white rounded-3 border px-2">
              <span className="input-group-text bg-white border-0">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-0 bg-white shadow-none py-2"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* Select Estado da Turma */}
          <div className="col-md-3">
            <select
              className="form-select border-1 bg-white rounded-3 shadow-none py-2 input-group"
              value={areaFiltro}
              onChange={(e) => setAreaFiltro(e.target.value)}
            >
              <option value="">Filtrar por estado</option>
              <option value="Para começar">Para começar</option>
              <option value="A decorrer">A decorrer</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>
          {/* Select para ordenar por data*/}
          <div className="col-md-3">
            <select
              className="form-select border-1 bg-white rounded-3 shadow-none py-2 input-group"
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
            >
              <option value="desc">Mais recentes primeiro</option>
              <option value="asc">Mais antigas primeiro</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-turmas-admin">
            <div>Turma</div>
            <div>Curso</div>
            <div>Data Início</div>
            <div>Data Fim</div>
            <div>Estado</div>
            <div className="text-end">Ações</div>
          </div>

          {turmasPaginadas.length > 0 ? (
            turmasPaginadas.map((t) => (
              <div
                key={t.idTurma}
                className="px-4 py-4 border-bottom tabela-turmas-admin align-items-center"
              >
                {/* Turma */}
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle bg-light border fw-semibold">
                    {t.nomeTurma.charAt(0)}
                  </div>
                  <span className="fw-medium">{t.nomeTurma}</span>
                </div>

                {/* Curso */}
                <div className="text-muted">{t.nomeCurso || "-"}</div>

                {/* Datas */}
                <div className="text-muted">{t.dataInicio || "-"}</div>
                <div className="text-muted">{t.dataFim || "-"}</div>

                {/* Estado */}
                <div className="text-muted">
                  <span
                    className={`badge ${
                      t.estado === "Para começar"
                        ? "bg-secondary"
                        : t.estado === "A decorrer"
                          ? "bg-primary"
                          : "bg-success"
                    }`}
                  >
                    {t.estado}
                  </span>
                </div>

                {/* Ações */}
                <div className="d-flex justify-content-end gap-3 align-items-center">
                  <Link
                    to={`edit-turma/${t.idTurma}`}
                    className="action-icon"
                    title="Editar informações Turma"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                  >
                    <Pencil size={18} />
                  </Link>

                  <span
                    className="action-icon text-danger cursor-pointer"
                    title="Eliminar Turma"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    onClick={() => {
                      //TODO: Implementar dleete turmas 
                      setTurmaSelecionada(t);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash size={18} />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-5 text-center text-muted">
              Nenhuma turma encontrada
            </div>
          )}
          {showDeleteModal && turmaSelecionada && (
            <div
              className="modal fade show d-block"
              tabIndex={-1}
              onClick={() => setShowDeleteModal(false)}
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content rounded-4 shadow">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirmar eliminação</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDeleteModal(false)}
                    />
                  </div>

                  <div className="modal-body">
                    <p>
                      Tem a certeza que pretende eliminar o turma{" "}
                      <strong>{turmaSelecionada?.nomeTurma}</strong>?
                    </p>
                    <p className="text-muted mb-0">
                      Esta ação não pode ser revertida.
                    </p>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-light"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancelar
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={handleDeleteTurma}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PAGINAÇÃO */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 py-3">
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
      )}

      <p className="text-muted small text-center mt-4">
        {turmasFiltradas.length} turma(s) encontrada(s)
      </p>
    </div>
  );
}
