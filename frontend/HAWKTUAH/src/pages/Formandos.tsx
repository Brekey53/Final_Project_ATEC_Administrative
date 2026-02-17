import { useEffect, useState } from "react";
import "../css/newStudent.css";
import { Search } from "lucide-react";
import { normalizarTexto } from "../utils/stringUtils";
import {
  getFormandos,
  type Formando,
} from "../services/students/FormandoService";

export default function Formandos() {
  const [formandos, setFormandos] = useState<Formando[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchFormandos() {
      const data = await getFormandos();
      setFormandos(data);
      setLoading(false);
    }
    fetchFormandos();
  }, []);

  const filteredFormandos = formandos.filter((f) => {
    const termo = normalizarTexto(searchTerm);
    return (
      normalizarTexto(f.nome).includes(termo) ||
      normalizarTexto(f.nif).includes(termo)
    );
  });

  const totalPages = Math.ceil(filteredFormandos.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const formandosPaginados = filteredFormandos.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Formandos</h2>
          <p className="text-muted mb-0">
            Consulta de Formandos Atualmente Inscritos
          </p>
        </div>
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
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-formandos">
            <div>Formando</div>
            <div>Email</div>
            <div>Telefone</div>
          </div>
          {!loading && formandosPaginados.length > 0
            ? formandosPaginados.map((f) => (
                <div
                  key={f.idFormando}
                  className="px-4 py-3 border-bottom tabela-formandos"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar-circle rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold border">
                      {f.nome.charAt(0)}
                    </div>
                    <span className="fw-medium">{f.nome}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <span>{f.email || "-"}</span>
                  </div>
                  <div className="text-muted">{f.telefone || "-"}</div>{" "}
                </div>
              ))
            : !loading && (
                <div className="p-5 text-center text-muted">
                  Nenhum formando encontrado para "{searchTerm}"
                </div>
              )}
        </div>
      </div>
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 pt-4">
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
      <p className="text-muted small text-center mt-3">
        {filteredFormandos.length} formando(s) encontrado(s)
      </p>
    </div>
  );
}
