import { Link } from "react-router-dom";
import {
  getModulos,
  deleteModulo,
  type Modulos,
} from "../../services/modules/ModuleService";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { normalizarTexto } from "../../utils/stringUtils";
import { Pencil, Search, Trash } from "lucide-react";
import { Tooltip } from "bootstrap";

import "../../css/modulos.css"

export default function NewModule() {
  const [modulos, setModulos] = useState<Modulos[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduloSelecionado, setModuloSelecionado] = useState<Modulos | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchModulos() {
      const data = await getModulos();
      setModulos(data);
      setLoading(false);
    }

    fetchModulos();
  }, []);

  const filteredModulos = modulos.filter((m) => {
    const term = normalizarTexto(searchTerm);
    return (
      normalizarTexto(m.nome).includes(term) ||
      normalizarTexto(m.codigoIdentificacao).includes(term)
    );
  });

  const totalPages = Math.ceil(filteredModulos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const modulosPaginados = filteredModulos.slice(startIndex, endIndex);

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
  }, [modulosPaginados, loading]); // Re-executa quando a lista carrega

  async function handleDeleteModulos() {
    if (!moduloSelecionado) return;

    try {
      await deleteModulo(moduloSelecionado.idModulo.toString());

      setModulos((prev) =>
        prev.filter((f) => f.idModulo !== moduloSelecionado.idModulo),
      );

      setShowDeleteModal(false);
      setModuloSelecionado(null);
      toast.success("Modulo eliminado com sucesso");
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.message) {
        toast.error(errorData.message || "Erro ao eliminar modulo");
      }
    }
  }

  // Quando pesquisa muda → voltar à página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Módulos</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar e consultar módulos
          </p>
        </div>
        <Link to="/adicionar-modulos">
          <div className="btn btn-success px-4 py-2 rounded-pill">
            + Novo Módulo
          </div>
        </Link>
      </div>

      {/* PESQUISA */}
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

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-modulos">
            {" "}
            {/* TODO: Criar css e alterar tabela-alunos ?? */}
            <div>Nome</div>
            <div>Modulo</div>
            <div className="hide-mobile">Horas</div>
            <div className="hide-mobile">Créditos</div>
            <div className="text-end hide-mobile">Ações</div>
          </div>

          {/* Map de modulos filtrados */}
          {filteredModulos.length > 0 ? (
            modulosPaginados.map((m) => (
              <div
                key={m.idModulo}
                className="px-4 py-3 border-bottom tabela-modulos"
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold border">
                    {m.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-medium text-truncate text-wrap">
                    {m.nome}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted">
                  <span>{m.codigoIdentificacao || "-"}</span>
                </div>

                <div className="text-muted">
                  {m.horasTotais || "-"}
                </div>
                <div className="text-muted">
                  {m.creditos || "-"}
                </div>

                <div className="d-flex justify-content-end gap-3 align-items-center">
                  <Link
                    to={`edit-modulo/${m.idModulo}`}
                    title="Editar informações Modulo"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    className="action-icon hide-mobile"
                  >
                    <Pencil size={18} />
                  </Link>

                  <span
                    className="action-icon text-danger cursor-pointer hide-mobile"
                    title="Eliminar Modulo"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    onClick={() => {
                      setModuloSelecionado(m);
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

          {showDeleteModal && moduloSelecionado && (
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
                      Tem a certeza que pretende eliminar o modulo{" "}
                      <strong>
                        {moduloSelecionado.codigoIdentificacao} -{" "}
                        {moduloSelecionado.nome}{" "}
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
                      onClick={handleDeleteModulos}
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
        {filteredModulos.length} módulo(s) encontrado(s)
      </p>
    </div>
  );
}
