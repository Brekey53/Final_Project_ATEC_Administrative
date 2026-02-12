import { Link } from "react-router-dom";
import {
  getSalas,
  deleteSala,
  getTipoSalas,
  type TipoSala,
  type Salas,
} from "../../services/rooms/SalasService";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import "../../css/salas.css";
import { normalizarTexto } from "../../utils/stringUtils";
import { Pencil, Search, Trash } from "lucide-react";
import { Tooltip } from "bootstrap";

export default function NewRoom() {
  const [salas, setSalas] = useState<Salas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [salaSelecionado, setSalaSelecionada] = useState<Salas | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tiposSala, setTiposSala] = useState<TipoSala[]>([]);
  const [tipoSalaFilter, setTipoSalaFilter] = useState<number | "">("");

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchSalas() {
      const data = await getSalas();
      setSalas(data);
      setLoading(false);
    }
    async function loadTiposSala() {
      const data = await getTipoSalas();
      setTiposSala(data);
    }

    loadTiposSala();
    fetchSalas();
  }, []);

  const filteredSalas = salas.filter((s) => {
    const term = normalizarTexto(searchTerm);

    const matchSearch =
      normalizarTexto(s.idSala.toString()).includes(term) ||
      normalizarTexto(s.descricao).includes(term);

    const matchTipoSala =
      tipoSalaFilter === "" || s.idTipoSala === tipoSalaFilter;

    return matchSearch && matchTipoSala;
  });

  const totalPages = Math.ceil(filteredSalas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const salasPaginadas = filteredSalas.slice(startIndex, endIndex);

  /* Para o bootstrap dos icons editar e apagar */
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
  }, [salasPaginadas, loading]);

  async function handleDeleteSala() {
    if (!salaSelecionado) return;

    try {
      await deleteSala(salaSelecionado.idSala);

      setSalas((prev) =>
        prev.filter((s) => s.idSala !== salaSelecionado.idSala),
      );

      setShowDeleteModal(false);
      setSalaSelecionada(null);
      toast.success("Sala eliminada com sucesso", {id: "successDelSala"});
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.message) {
        toast.error(errorData.message || "Erro ao eliminar sala", {id: "erroDelSala"});
      }
    }
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, salas.length]);

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Salas</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar e consultar salas
          </p>
        </div>
        <Link to="/adicionar-salas">
          <div className="btn btn-success px-4 py-2 rounded-pill">
            + Nova Sala
          </div>
        </Link>
      </div>

      {/* PESQUISA */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-body">
              <div className="row g-3 align-items-center">
                {/* INPUT PESQUISA */}
                <div className="col-md-8">
                  <div className="input-group input-group-custom px-2">
                    <span className="input-group-text bg-white border-0">
                      <Search size={20} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 shadow-none"
                      placeholder="Pesquisar Salas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* SELECT FILTRO */}
                <div className="col-md-4">
                  <div className="input-group input-group-custom px-2">
                    <select
                      className="form-select border-0 shadow-none bg-white"
                      value={tipoSalaFilter}
                      onChange={(e) =>
                        setTipoSalaFilter(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    >
                      <option value="">Filtrar Tipo Sala</option>

                      {tiposSala.map((tipo) => (
                        <option key={tipo.idTipoSala} value={tipo.idTipoSala}>
                          {tipo.nome}
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
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-salas">
            <div>Sala</div>
            <div>Tipo Sala</div>
            <div>N. Sala</div>
            <div>N. Max Alunos</div>
            <div className="text-end">Ações</div>
          </div>

          {/* Map de salas filtradas */}
          {filteredSalas.length > 0 ? (
            salasPaginadas.map((s) => (
              <div
                key={s.idSala}
                className="px-4 py-3 border-bottom tabela-salas"
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold border">
                    {s.idSala}
                  </div>
                  <span className="fw-medium text-truncate">{s.descricao}</span>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted">
                  <span>{s.tipoSala || "-"}</span>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted">
                  <span>{s.idSala || "-"}</span>
                </div>

                <div className="hide-mobile text-muted">
                  {s.numMaxAlunos || "-"}
                </div>

                <div className="d-flex justify-content-end gap-3 align-items-center">
                  <Link
                    to={`edit-sala/${s.idSala}`}
                    title="Editar informações Sala"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    className="action-icon"
                  >
                    <Pencil size={18} />
                  </Link>

                  <span
                    className="action-icon text-danger cursor-pointer"
                    title="Eliminar Sala"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    onClick={() => {
                      setSalaSelecionada(s);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash size={18} />
                  </span>
                </div>
              </div>
            ))
          ) : (
            // Mensagem caso não existam resultados
            <div className="p-5 text-center text-muted">
              Nenhum módulo encontrado para "{searchTerm}"
            </div>
          )}

          {/* Modal Delete */}

          {showDeleteModal && salaSelecionado && (
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
                      Tem a certeza que pretende eliminar o sala{" "}
                      <strong>
                        {salaSelecionado?.idSala} -{" "}
                        {salaSelecionado?.descricao}{" "}
                      </strong>{" "}
                      da plataforma?
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
                      onClick={handleDeleteSala}
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
        {filteredSalas.length} sala(s) encontrada(s)
      </p>
    </div>
  );
}
