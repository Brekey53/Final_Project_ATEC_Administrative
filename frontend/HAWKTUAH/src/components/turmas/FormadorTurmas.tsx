import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/turmas.css";
import {
  getTurmasFormador,
  type TurmaFormadorDTO,
} from "../../services/turmas/TurmasService";
import { normalizarTexto } from "../../utils/stringUtils";
import { Pencil, Search } from "lucide-react";

export default function FormadorTurmas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState("desc");

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

  const turmasFiltradas = turmas
    .filter((t) => {
      const termo = normalizarTexto(searchTerm);
      const matchPesquisa =
        normalizarTexto(t.nomeTurma).includes(termo) ||
        normalizarTexto(String(t.idTurma)).includes(termo);

      const matchArea =
        estadoFiltro === "Todos" ||
        estadoFiltro === "" ||
        String(t.estado) === estadoFiltro;

      return matchPesquisa && matchArea;
    })
    .sort((a, b) => {

      // Ordenar por nome caso vazio
      if (ordenacao === ""){
        const nomeA = a.nomeModulo ? normalizarTexto(a.nomeModulo) : "";
        const nomeB = b.nomeModulo ? normalizarTexto(b.nomeModulo) : "";
        return nomeA.localeCompare(nomeB);
      }

      let valorA = Number(a.horasDadas) || 0;
      let valorB = Number(b.horasDadas) || 0;

      valorA = (Number(a.horasTotaisModulo)*100)/Number(a.horasDadas);
      valorB = (Number(b.horasTotaisModulo)*100)/Number(b.horasDadas);


      // Ordenar por horas
      if (ordenacao === "asc") {
        return valorA - valorB;
      } else {
        return valorB - valorA;
      }
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
          {/* Select Estado da Turma */}
          <div className="col-md-3">
            <select
              className="form-select border-1 bg-white rounded-3 shadow-none py-2 input-group"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="Todos">Todas</option>
              <option value="Para começar">Para começar</option>
              <option value="A decorrer">A decorrer</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>
          {/* Select para ordenar por data*/}
          <div className="col-md-3">
            <select
              className="form-select border-1 bg-white rounded-3 shadow-none py-2 input-group"
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
            >
              <option value="">Ordenar por horas...</option>
              <option value="desc">Mais horas</option>
              <option value="asc">Menos horas</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-formador-turmas">
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
                className="px-4 py-3 border-bottom tabela-formador-turmas align-items-center"
              >
                {/* Turma */}
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold border">
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
                    <Pencil size={18} />
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
