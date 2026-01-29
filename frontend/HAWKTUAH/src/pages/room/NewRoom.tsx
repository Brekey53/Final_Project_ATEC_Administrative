import React from "react";
import { Link } from "react-router-dom";
import {
  getSalas,
  deleteSala,
  type Salas,
} from "../../services/rooms/SalasService";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import "../../css/addNewStudent.css";
import { Pencil, Trash } from "lucide-react";

export default function NewRoom() {
  const [salas, setSalas] = useState<Salas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [salaSelecionado, setSalaSelecionada] = useState<Salas | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchSalas() {
      const data = await getSalas();
      setSalas(data);
      setLoading(false);
    }

    fetchSalas();
  }, []);

  const filteredSalas = salas.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.idSala.toLocaleString().includes(term) ||
      s.descricao.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredSalas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const salasPaginadas = filteredSalas.slice(startIndex, endIndex);

  async function handleDeleteSala() {
    if (!salaSelecionado) return;

    try {
      await deleteSala(salaSelecionado.idSala);

      setSalas((prev) =>
        prev.filter((s) => s.idSala !== salaSelecionado.idSala),
      );

      setShowDeleteModal(false);
      setSalaSelecionada(null);
      toast.success("Sala eliminada com sucesso");
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.message) {
        toast.error(errorData.message || "Erro ao eliminar sala");
      }
    }
  }

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

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar Salas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-salas">
            {/* TODO: Criar css e alterar tabela-alunos ?? */}
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
                    className="action-icon"
                  >
                    <Pencil size={18} />
                  </Link>

                  <span
                    className="action-icon text-danger cursor-pointer"
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
      </div>
    </div>
  );
}
