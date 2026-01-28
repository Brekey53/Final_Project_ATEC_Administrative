import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getModulosFromCurso } from "../../services/cursos/CursosService";
import type { Curso } from "../../services/cursos/CursosService";

export default function CursoDetalhe() {
  const { idCurso } = useParams<{ idCurso: string }>();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCursoDetalhe() {
      try {
        if (!idCurso) return;
        const data = await getModulosFromCurso(Number(idCurso));
        setCurso(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchCursoDetalhe();
  }, [idCurso]);

  if (loading) return <p className="text-center mt-5">A carregar...</p>;
  if (!curso) return <p className="text-center mt-5">Curso não encontrado</p>;

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-primary mb-1">{curso.nome}</h2>
          <small className="text-muted">
            Total de módulos: <strong>{curso.modulos.length}</strong>
          </small>
        </div>

        <button
          className="btn btn-light border"
          onClick={() => navigate(-1)}
        >
          Voltar
        </button>
      </div>

      <div className="row g-4">
        {/* Coluna lateral */}
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm border-0 rounded-4 bg-light h-100">
            <div className="fs-1 text-primary mb-2 text-center">📚</div>
            <h5 className="text-center mb-2">Configuração Técnica</h5>
            <p className="text-muted small text-center">
              Informação geral do curso
            </p>
            <hr />
            <p className="small mb-1">
              <strong>ID Área:</strong> {curso.idArea}
            </p>
          </div>
        </div>

        {/* Módulos */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <h5 className="text-primary mb-4">Módulos</h5>

            <div className="row g-3">
              {curso.modulos.map((modulo) => (
                <div
                  key={modulo.idModulo}
                  className="col-12 col-md-6 col-xl-4"
                >
                  <div className="card h-100 shadow-sm border-0 rounded-4">
                    <div className="card-body">
                      <h6 className="fw-semibold mb-2">
                        {modulo.nome}
                      </h6>

                      <div className="small text-muted">
                        <div>
                          <strong>Créditos:</strong> {modulo.creditos}
                        </div>
                        <div>
                          <strong>Horas:</strong> {modulo.horasTotais}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
