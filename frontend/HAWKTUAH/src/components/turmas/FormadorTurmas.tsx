import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/manageUsers.css";
import "../../css/turmas.css";
import editar from "../../img/edit.png";
import {
  getTurmasFormador,
  type TurmaFormadorDTO,
} from "../../services/turmas/TurmasService";
import { normalizarTexto } from "../../utils/stringUtils";

export default function FormadorTurmas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");

  const [turmas, setTurmas] = useState<TurmaFormadorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchTurmas() {
      try {
        const data = await getTurmasFormador();
        setTurmas(data);
      } catch {
        setError("Erro ao carregar turmas");
      } finally {
        setLoading(false);
      }
    }

    fetchTurmas();
  }, []);

  const turmasFiltradas = turmas.filter((t) => {
    const matchTexto = `${normalizarTexto(t.nomeTurma)} ${normalizarTexto(t.nomeCurso)} ${normalizarTexto(t.nomeModulo)}`
      .includes(normalizarTexto(searchTerm));

    const matchEstado =
      estadoFiltro === "Todos" || t.estado === estadoFiltro;

    return matchTexto && matchEstado;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, estadoFiltro]);

  const totalPages = Math.ceil(turmasFiltradas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const turmasPaginadas = turmasFiltradas.slice(startIndex, endIndex);

  if (loading) return <p>A carregar…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Atribuir Avaliações</h2>
          <p className="text-muted mb-0">
            Atribuir e alterar avaliações aos formandos
          </p>
        </div>
      </div>

      {/* PESQUISA + FILTRO */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Pesquisar por turma, curso ou módulo…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select form-select-lg"
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
              >
                <option value="Todos">Todos os estados</option>
                <option value="Para começar">Para começar</option>
                <option value="A decorrer">A decorrer</option>
                <option value="Terminado">Terminado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-turmas">
            <div>Turma</div>
            <div>Curso</div>
            <div>Módulo</div>
            <div>Horas</div>
            <div>Estado</div>
            <div className="text-end">Ações</div>
          </div>

          {turmasPaginadas.length > 0 ? (
            turmasPaginadas.map((t) => (
              <div
                key={`${t.idTurma}-${t.idModulo}`}
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
                <div className="text-muted">{t.nomeCurso}</div>

                {/* Módulo */}
                <div className="text-muted">{t.nomeModulo}</div>

                {/* Horas */}
                <div className="text-muted">
                  {t.horasDadas}h / {t.horasTotaisModulo}h
                </div>

                {/* Estado */}
                <div>
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
                <div className="d-flex justify-content-end">
                  <Link
                    to={`/avaliar/${t.idTurma}/${t.idModulo}`}
                    className="btn rounded-pill px-1"
                  >
                    <img
                      src={editar}
                      alt="avaliar"
                      title="Avaliar módulo"
                      className="img-edit-apagar"
                    />
                  </Link>
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
        {turmasFiltradas.length} módulo(s) encontrado(s)
      </p>
    </div>
  );
}
