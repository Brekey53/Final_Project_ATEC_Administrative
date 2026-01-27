import { Link } from "react-router-dom";
import {
  getFormadores,
  type Formador,
} from "../services/formador/FormadorService";
import { useEffect, useState } from "react";

export default function Formadores() {
  const [formadores, setFormadores] = useState<Formador[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchFormadores() {
      const data = await getFormadores();
      setFormadores(data);
      setLoading(false);
    }

    fetchFormadores();
  }, []);

  const filteredFormadores = formadores.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      f.nome.toLowerCase().includes(term) || f.nif.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredFormadores.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const formadoresPaginados = filteredFormadores.slice(startIndex, endIndex);

  // Quando pesquisa muda → voltar à página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Formadores</h2>
          <p className="text-muted mb-0">Consultar formadores</p>
        </div>
      </div>

      {/* PESQUISA */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar Formadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LISTA */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-formadores">
            <div>Formador</div>
            <div>Email</div>
            <div>Qualificações</div>
            <div>NIF</div>
          </div>

          {!loading && formadoresPaginados.length > 0
            ? formadoresPaginados.map((f) => (
                <div
                  key={f.idFormador}
                  className="px-4 py-3 border-bottom tabela-formadores"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar-circle rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold border">
                      {f.nome.charAt(0).toUpperCase()}
                    </div>
                    <span className="fw-medium text-truncate">{f.nome}</span>
                  </div>

                  <div className="text-muted">{f.email || "-"}</div>
                  <div className="text-muted">{f.qualificacoes || "-"}</div>
                  <div className="text-muted">{f.nif || "-"}</div>
                </div>
              ))
            : !loading && (
                <div className="p-5 text-center text-muted">
                  Nenhum formador encontrado para "{searchTerm}"
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
      <p className="text-muted small text-center mt-5">
        {filteredFormadores.length} formador(es) encontrado(s)
      </p>
    </div>
  );
}
