import { useState, useEffect } from "react";
import { data, Link } from "react-router-dom";
import {
  getUtilizadores,
  deleteUtilizador,
  type UtilizadorListItem,
} from "../../services/users/UserService";
import "../../css/users.css";
import { toast } from "react-hot-toast";
import { normalizarTexto } from "../../utils/stringUtils";
import { Pencil, Search, Trash } from "lucide-react";
import { Tooltip } from "bootstrap";

export default function ManageUsers() {
  const [utilizadores, setUtilizadores] = useState<UtilizadorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [utilizadorSelecionado, setUtilizadorSelecionado] =
    useState<UtilizadorListItem | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");

  useEffect(() => {
    async function fetchUtilizadores() {
      try {
        const data = await getUtilizadores();
        setUtilizadores(data);
      } catch (err) {
        toast.error("Erro ao carregar utilizadores", {
          id: "erro-utilizadores",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUtilizadores();
  }, []);

  const filteredUtilizadores = utilizadores.filter((u) => {
    const term = normalizarTexto(searchTerm);
    const tipo = u.tipoUtilizador.toLowerCase();

    const matchTexto =
      normalizarTexto(u.nome).includes(term) ||
      normalizarTexto(u.email).includes(term) ||
      normalizarTexto(tipo).includes(term) ||
      normalizarTexto(u.telefone ?? "").includes(term);

    const matchTipo =
      tipoFiltro === "todos" ||
      (tipoFiltro === "administrativo" &&
        (tipo === "administrativo" || tipo === "admin")) ||
      tipo === tipoFiltro;

    const matchEstado =
      estadoFiltro === "todos" ||
      (estadoFiltro === "ativo" && u.ativo) ||
      (estadoFiltro === "inativo" && !u.ativo);

    return matchTexto && matchTipo && matchEstado;
  });

  async function handleDeleteUtilizador() {
    if (!utilizadorSelecionado) return;

    try {
      await deleteUtilizador(utilizadorSelecionado.idUtilizador);

      setUtilizadores((prev) =>
        prev.filter(
          (u) => u.idUtilizador !== utilizadorSelecionado.idUtilizador,
        ),
      );

      setShowDeleteModal(false);
      setUtilizadorSelecionado(null);
      toast.success("Utilizador eliminado com sucesso");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao eliminar utilizador");
    }
  }

  const totalPages = Math.ceil(filteredUtilizadores.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const utilizadoresPaginados = filteredUtilizadores.slice(
    startIndex,
    endIndex,
  );

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
  }, [utilizadoresPaginados, loading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, tipoFiltro, estadoFiltro]);

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Utilizadores</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar e consultar utilizadores
          </p>
        </div>
        <Link
          to="adicionar-utilizador"
          className="btn btn-success px-4 py-2 rounded-pill"
        >
          + Novo Utilizador
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
        <div className="row g-2 align-items-center p-2">
          {" "}
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
          {/* Select Tipo Utilizador  */}
          <div className="col-md-3">
            <select
              className="form-select border-1 bg-white rounded-3 shadow-none py-2"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
            >
              <option value="todos">Todos os Tipos de Utilizador</option>
              <option value="administrativo">Administrativo</option>
              <option value="formador">Formador</option>
              <option value="formando">Formando</option>
              <option value="geral">Geral</option>
            </select>
          </div>
          {/* Select para ordenar por status*/}
          <div className="col-md-3">
            <select
              className="form-select border-1 bg-white rounded-3 shadow-none py-2"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="todos">Todos os Estados</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-utilizadores">
            <div>Utilizador</div>
            <div>Email</div>
            <div>Telefone</div>
            <div>Tipo Utilizador</div>
            <div>Status</div>
            <div className="text-end">Ações</div>
          </div>

          {/* utilizadores com filtro */}
          {!loading && filteredUtilizadores.length > 0 ? (
            utilizadoresPaginados.map((u) => (
              <div
                key={u.idUtilizador}
                className="px-4 py-3 border-bottom tabela-utilizadores"
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold border">
                    {u.nome.charAt(0)}
                  </div>
                  <span className="fw-medium">{u.nome}</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-muted">
                  <span>{u.email}</span>
                </div>
                <div className="text-muted">{u.telefone || "-"}</div>{" "}
                <div className="text-muted">{u.tipoUtilizador || "-"}</div>{" "}
                <div className="text-muted">
                  {u.ativo ? "Ativo" : "Inativo"}
                </div>
                <div className="d-flex justify-content-end gap-3 align-items-center">
                  <Link
                    to={`edit-utilizador/${u.idUtilizador}`}
                    className="action-icon"
                    title="Editar informações Utilizador"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                  >
                    <Pencil size={18} />
                  </Link>

                  <span
                    className="action-icon text-danger cursor-pointer"
                    title="Eliminar Utilizador"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    onClick={() => {
                      setUtilizadorSelecionado(u);
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
              Nenhum utilizador encontrado
            </div>
          )}

          {/* Modal Delete */}

          {showDeleteModal && utilizadorSelecionado && (
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
                      Tem a certeza que pretende eliminar o utilizador{" "}
                      <strong>
                        {utilizadorSelecionado?.nome} -{" "}
                        {utilizadorSelecionado?.email}{" "}
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
                      onClick={handleDeleteUtilizador}
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
      {totalPages > 1 && (
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
      )}
      <p className="text-muted small text-center mt-5">
        {filteredUtilizadores.length} utilizador(es) encontrado(s)
      </p>
    </div>
  );
}
