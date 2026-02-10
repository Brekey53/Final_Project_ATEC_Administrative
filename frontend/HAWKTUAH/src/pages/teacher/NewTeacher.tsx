import { Link } from "react-router-dom";
import {
  getFormadores,
  deleteFormador,
  downloadFicheiroPDF,
  type Formador,
} from "../../services/formador/FormadorService";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { normalizarTexto } from "../../utils/stringUtils";
import { Pencil, Trash, Download, Search } from "lucide-react";
import { Tooltip } from 'bootstrap';
import "../../css/formadores.css"

export default function NewTeacher() {
  const [formadores, setFormadores] = useState<Formador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formadorSelecionado, setFormadorSelecionado] =
    useState<Formador | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchFormadores() {
      try {
        const data = await getFormadores();
        setFormadores(data);
      } catch {
        toast.error("Erro ao carregar formadores");
      } finally {
        setLoading(false);
      }
    }

    fetchFormadores();
  }, []);

  const filteredFormadores = formadores.filter((f) => {
    const term = normalizarTexto(searchTerm);
    return (
      normalizarTexto(f.nome).includes(term) ||
      normalizarTexto(f.nif).includes(term)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredFormadores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const formadoresPaginados = filteredFormadores.slice(startIndex, endIndex);

  useEffect(() => {
    // 1. Procurar os elementos
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    
    // 2. Inicializar
    const tooltipList = Array.from(tooltipTriggerList).map(
      (el) => new Tooltip(el)
    );
  
    // 3. Limpeza
    return () => {
      tooltipList.forEach((t) => t.dispose());
    };
  }, [formadoresPaginados, loading]); // Re-executa quando a lista carrega

  async function handleDeleteFormador() {
    if (!formadorSelecionado) return;

    try {
      await deleteFormador(formadorSelecionado.idFormador.toString());

      setFormadores((prev) =>
        prev.filter((f) => f.idFormador !== formadorSelecionado.idFormador),
      );

      setShowDeleteModal(false);
      setFormadorSelecionado(null);
      toast.success("Formador eliminado com sucesso");
    } catch (err: any) {
      const errorData = err.response?.data;
      toast.error(errorData?.message || "Erro ao eliminar formador");
    }
  }

  if (loading) return <p className="p-5 text-center">A carregar…</p>;

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Formadores</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar e consultar formadores
          </p>
        </div>

        <Link to="/adicionar-formadores">
          <div className="btn btn-success px-4 py-2 rounded-pill">
            + Novo Formador
          </div>
        </Link>
      </div>

      {/* PESQUISA */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            {/* INPUT PESQUISA */}
            <div className="col-md-12">
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-white border-0">
                  <Search size={20} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none"
                  placeholder="Pesquisar por nome, email ou NIF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-formadores">
            <div>Formador</div>
            <div>Email</div>
            <div>Qualificações</div>
            <div>NIF</div>
            <div className="text-end">Ações</div>
          </div>

          {formadoresPaginados.length > 0 ? (
            formadoresPaginados.map((f) => (
              <div
                key={f.idFormador}
                className="px-4 py-3 border-bottom tabela-formadores align-items-center"
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold border">
                    {f.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-medium text-truncate">{f.nome}</span>
                </div>

                <div className="text-muted">{f.email || "-"}</div>
                <div className="text-muted">{f.qualificacoes || "-"}</div>
                <div className="text-muted">{f.nif || "-"}</div>

                <div className="d-flex justify-content-end gap-3 align-items-center">
                  <span
                    className="action-icon text-success cursor-pointer"
                    title="Descarregar informações Formador"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    onClick={(e => downloadFicheiroPDF(Number(f.idFormador), f.nome))}
                  >
                    <Download />
                  </span>
                  <Link
                    to={`edit-formador/${f.idFormador}`}
                    className="action-icon"
                    title="Editar informações Formador"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                  >
                    <Pencil size={18} />
                  </Link>

                  <span
                    className="action-icon text-danger cursor-pointer"
                    title="Eliminar Formador"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    onClick={() => {
                      setFormadorSelecionado(f);
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
              Nenhum formador encontrado
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
        {filteredFormadores.length} formador(es) encontrado(s)
      </p>

      {/* MODAL DELETE */}
      {showDeleteModal && formadorSelecionado && (
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
                  Tem a certeza que pretende eliminar o formador{" "}
                  <strong>{formadorSelecionado.nome}</strong>?
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
                  onClick={handleDeleteFormador}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
