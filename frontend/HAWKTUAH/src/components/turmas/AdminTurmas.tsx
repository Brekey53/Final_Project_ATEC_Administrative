import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/manageUsers.css";
import "../../css/turmas.css";
import { toast } from "react-hot-toast";
import editar from "../../img/edit.png";
import apagar from "../../img/delete.png";
import { getTurmas, type Turma } from "../../services/turmas/TurmasService";
import { normalizarTexto } from "../../utils/stringUtils";

export default function AdminTurmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  const turmasFiltradas = turmas.filter((t) =>
    `${normalizarTexto(t.nomeTurma)} ${normalizarTexto(t.nomeCurso)}`
      .includes(normalizarTexto(searchTerm)),
  );

  const totalPages = Math.ceil(turmasFiltradas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const turmasPaginadas = turmasFiltradas.slice(startIndex, endIndex);

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
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar turmas (nome, curso)…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABELA */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-turmas">
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
                className="px-4 py-3 border-bottom tabela-turmas align-items-center"
              >
                {/* Turma */}
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold">
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
                <div className="d-flex justify-content-end ">
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
            ))
          ) : (
            <div className="p-5 text-center text-muted">
              Nenhuma turma encontrada
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
        {turmasFiltradas.length} turma(s) encontrada(s)
      </p>
    </div>
  );
}
