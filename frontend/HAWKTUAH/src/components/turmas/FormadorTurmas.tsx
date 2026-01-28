import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/manageUsers.css";
import { toast } from "react-hot-toast";
import editar from "../../img/edit.png";
import "../../css/turmas.css";
import {
  getTurmasFormador,
  type TurmaFormadorDTO,
} from "../../services/turmas/TurmasService";

export default function FormadorTurmas() {
  const [searchTerm, setSearchTerm] = useState("");
  //   const [loading, setLoading] = useState(true);
  //   const [showDeleteModal, setShowDeleteModal] = useState(false);

  //   const [currentPage, setCurrentPage] = useState(1);
  // hooks/useTurmasFormador.ts

  const [turmas, setTurmas] = useState<TurmaFormadorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const data = await getTurmasFormador();
        setTurmas(data);
      } catch (err) {
        setError("Erro ao carregar turmas");
      } finally {
        setLoading(false);
      }
    };

    fetchTurmas();
  }, []);

  if (loading) return <p>A carregar…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Atribuir Avaliações</h2>
          <p className="text-muted mb-0">
            Atribuir e alterar avaliações a formandos.
          </p>
        </div>
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
            <div>Módulo</div>
            <div>Horas Dadas</div>
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
              <div className="text-muted">{t.idCurso || "-"}</div>

              {/* COL 3 — Data início */}
              <div className="text-muted">{t.nomeModulo || "-"}</div>

              {/* COL 4 — Data fim */}
              <div className="text-muted">{t.dataFim || "-"}</div>

              {/* COL 5 — Estado */}
              {/* TODO: ESTE ESTÁ MAL */}
              <div className="text-muted">{t.dataFim || "-"}</div>

              {/* COL 6 — Ações */}
              <div className="d-flex justify-content-end gap-2">
                <Link
                  to={`/avaliar/${t.idTurma}/${t.idModulo}`}
                  className="btn rounded-pill px-1"
                >
                  <img
                    src={editar}
                    alt="editar"
                    title="Editar"
                    className="img-edit-apagar"
                  />
                </Link>
              </div>
            </div>
          ))}
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
