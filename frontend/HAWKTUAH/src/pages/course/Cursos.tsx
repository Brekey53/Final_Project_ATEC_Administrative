import React, { useEffect, useState } from "react";
import { getCursos, type Curso } from "../../services/cursos/CursosService";
import { Link } from "react-router-dom";
import "../../css/cursos.css";
import verDetalhes from "../../img/verDetalhes.png"

export default function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchCursos() {
      try {
        const data = await getCursos();
        setCursos(data);
      } catch (error) {
        console.error("Erro ao carregar cursos", error);
        setCursos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCursos();
  }, []);

  const cursosFiltrados = cursos.filter((c) => {
    const termo = searchTerm.toLowerCase();

    return (
      c.nome.toLowerCase().includes(termo) || String(c.idCurso).includes(termo)
    );
  });

  const totalPages = Math.ceil(cursosFiltrados.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const cursosPaginados = cursosFiltrados.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Cursos</h2>
          <p className="text-muted mb-0">Consulta de Cursos Disponíveis</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar curso por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-cursos tabela-cursos-header">
            <div>Curso</div>
            <div>Id Área</div>
            <div>Área</div>
            <div> Ações</div>
          </div>
          {cursosPaginados.map((c) => (
            <Link
              key={c.idCurso}
              to={`/cursos/${c.idCurso}`}
              className="text-decoration-none text-reset "
            >
              <div className="px-4 py-3 border-bottom tabela-cursos curso-row">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold">
                    {c.nome.charAt(0)}
                  </div>
                  <span className="fw-medium">{c.nome}</span>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted">
                  <span>{c.idArea}</span>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted">
                  <span>{c.nomeArea}</span>
                </div>

                <div className="fw-medium">
                  <img className="img-ver-detalhes" src={verDetalhes} alt="Ver detalhes" title="Ver Detalhes do Curso" />
                </div>
              </div>
            </Link>
          ))}

          {!loading && cursosFiltrados.length === 0 && (
            <div className="text-center py-4 text-muted">
              Nenhum curso encontrado
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
        {cursosFiltrados.length} curso(s) encontrado(s)
      </p>
    </div>
  );
}
