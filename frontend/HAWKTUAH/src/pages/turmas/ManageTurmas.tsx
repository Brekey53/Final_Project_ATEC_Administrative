import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/manageUsers.css";
import { toast } from "react-hot-toast";
import editar from "../../img/edit.png";
import apagar from "../../img/delete.png";
import "../../css/turmas.css";
import { getTurmas, type Turma } from "../../services/turmas/TurmasService";

export default function ManageTurmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  //   const [loading, setLoading] = useState(true);
  //   const [showDeleteModal, setShowDeleteModal] = useState(false);

  //   const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchTurmas() {
      const data = await getTurmas();
      if (!data) return null;

      setTurmas(data);
    }
    fetchTurmas();
  });

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
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

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar Turmas (nome, curso)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-turmas">
            <div>Nome Turma</div>
            <div>Curso</div>
            <div>Data Início</div>
            <div>Data Fim</div>
            <div>Estado</div>
            <div className="text-end">Ações</div>
          </div>

          {/* LINHAS */}
          {turmas.map((t) => (
            <div
              key={t.idTurma}
              className="px-4 py-3 border-bottom tabela-turmas"
            >
              {/* COL 1 — Nome */}
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold">
                  {t.nomeTurma.charAt(0)}
                </div>
                <span className="fw-medium">{t.nomeTurma}</span>
              </div>

              {/* COL 2 — Curso */}
              {/* TODO: ESTE ESTÁ MAL */}
              <div className="text-muted">{t.nomeTurma || "-"}</div> 

              {/* COL 3 — Data início */}
              <div className="text-muted">{t.dataInicio || "-"}</div>

              {/* COL 4 — Data fim */}
              <div className="text-muted">{t.dataFim || "-"}</div>

              {/* COL 5 — Estado */}
              {/* TODO: ESTE ESTÁ MAL */}
              <div className="text-muted">{t.dataFim || "-"}</div>

              {/* COL 6 — Ações */}
              <div className="d-flex justify-content-end gap-2">
                <Link
                  to={`edit-turma/${t.idTurma}`}
                  className="btn rounded-pill px-1"
                >
                  <img
                    src={editar}
                    alt="editar"
                    title="Editar"
                    className="img-edit-apagar"
                  />
                </Link>

                <button className="btn rounded-pill px-1">
                  <img
                    src={apagar}
                    alt="apagar"
                    title="Apagar"
                    className="img-edit-apagar"
                  />
                </button>
              </div>
            </div>
          ))}

          {/* Modal Delete

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
          )} */}
        </div>
      </div>
      {/* {totalPages > 1 && (
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
      <p className="text-muted small text-center mt-1">
        {filteredUtilizadores.length} utilizador(es) encontrado(s)
      </p> */}
    </div>
  );
}
