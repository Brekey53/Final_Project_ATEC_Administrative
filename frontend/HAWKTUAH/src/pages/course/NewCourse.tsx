import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCursos,
  deleteCurso,
  type Curso,
  getAreaCursos,
  type AreaCurso,
} from "../../services/cursos/CursosService";
import "../../css/cursos.css";
import toast from "react-hot-toast";
import { normalizarTexto } from "../../utils/stringUtils";
import { Pencil, Search, Trash } from "lucide-react";
import { Tooltip } from "bootstrap";

export default function NewCourse() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState<Curso | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [areaCursos, setAreaCursos] = useState<AreaCurso[]>([]);
  const [areaCursosFilter, setAreaCursosFilter] = useState("");

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function loadAll() {
      try {
        const [cursosData, areasData] = await Promise.all([
          getCursos(),
          getAreaCursos(),
        ]);

        setCursos(cursosData);
        setAreaCursos(areasData);
      } catch (err) {
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  async function handleDeleteCurso() {
    if (!cursoSelecionado) return;

    try {
      await deleteCurso(cursoSelecionado.idCurso);

      setCursos((prev) =>
        prev.filter((c) => c.idCurso !== cursoSelecionado.idCurso),
      );

      setCursoSelecionado(null);
      setShowDeleteModal(false);

      toast.success("Curso eliminado com sucesso");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao eliminar curso");
    }
  }

  const cursosFiltrados = loading
    ? []
    : cursos.filter((c) => {
        const termo = normalizarTexto(searchTerm);

        const matchPesquisa =
          normalizarTexto(c.nome).includes(termo) ||
          normalizarTexto(String(c.idCurso)).includes(termo);

        const matchArea =
          areaCursosFilter === "" || String(c.idArea) === areaCursosFilter;

        return matchPesquisa && matchArea;
      });

  const totalPages = Math.ceil(cursosFiltrados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const cursosPaginados = cursosFiltrados.slice(startIndex, endIndex);

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]',
    );

    const tooltipList = Array.from(tooltipTriggerList).map(
      (el) => new Tooltip(el),
    );
    return () => {
      tooltipList.forEach((t) => t.dispose());
    };
  }, [cursosPaginados, loading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, areaCursosFilter]);

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Cursos</h2>
          <p className="text-muted mb-0">Consulta de Cursos Disponíveis</p>
        </div>
        <Link to="/adicionar-cursos">
          <div className="btn btn-success px-4 py-2 rounded-pill">
            + Novo Curso
          </div>
        </Link>
      </div>

      {/* PESQUISA*/}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
            <div className="card-body">
              <div className="row g-3 align-items-center">
                {/* INPUT PESQUISA */}
                <div className="col-md-8">
                  <div className="input-group input-group-custom px-2">
                    <span className="input-group-text bg-white border-0 py-2">
                      <Search size={20} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 shadow-none"
                      placeholder="Pesquisar curso por nome ou código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* FILTRO ÁREA */}
                <div className="col-md-4">
                  <div className="input-group input-group-custom px-2">
                    <select
                      className="form-select border-0 shadow-none bg-white"
                      value={areaCursosFilter}
                      onChange={(e) => setAreaCursosFilter(e.target.value)}
                    >
                      <option value="">Filtrar Área</option>
                      {areaCursos.map((area) => (
                        <option key={area.idArea} value={String(area.idArea)}>
                          {area.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-cursos-admin">
            <div>Curso</div>
            <div>Id Área</div>
            <div className="text-end">Ações</div>
          </div>
          {!loading && cursosFiltrados.length === 0 && (
            <div className="text-center py-4 text-muted">
              Nenhum curso encontrado com os filtros atuais.
            </div>
          )}
          {cursosPaginados.map((c) => (
            <div
              key={c.idCurso}
              className="px-4 py-3 border-bottom tabela-cursos-admin"
            >
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-circle bg-light border fw-semibold">
                  {c.nome.charAt(0)}
                </div>
                <span className="fw-medium">{c.nome}</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted">
                <span>{c.idArea}</span>
              </div>
              <div className="d-flex justify-content-end gap-3 align-items-center">
                <Link
                  to={`edit-curso/${c.idCurso}`}
                  className="action-icon"
                  title="Editar informações Curso"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                >
                  <Pencil size={18} />
                </Link>

                <span
                  className="action-icon text-danger cursor-pointer"
                  title="Eliminar Curso"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  onClick={() => {
                    setCursoSelecionado(c);
                    setShowDeleteModal(true);
                  }}
                >
                  <Trash size={18} />
                </span>
              </div>
            </div>
          ))}
          {showDeleteModal && cursoSelecionado && (
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
                      Tem a certeza que pretende eliminar o curso{" "}
                      <strong>{cursoSelecionado?.nome}</strong>?
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
                      onClick={handleDeleteCurso}
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
        <div className="d-flex justify-content-center align-items-center gap-3 py-4">
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

      <p className="text-muted small text-center mt-2">
        {cursosFiltrados.length} curso(s) encontrado(s)
      </p>
    </div>
  );
}
