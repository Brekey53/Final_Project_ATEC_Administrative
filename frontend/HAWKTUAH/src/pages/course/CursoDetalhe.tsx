import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getModulosFromCurso } from "../../services/cursos/CursosService";
import type { Curso } from "../../services/cursos/CursosService";
import toast from "react-hot-toast";

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
      } catch (err) {
        toast.error("Erro ao carregar curso.", { id: "erro-curso" });
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

    {/* HEADER / DETALHES DO CURSO */}
    <div className="card p-4 shadow-sm border-0 rounded-4 mb-4">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h2 className="text-primary mb-1">{curso.nome}</h2>
          <p className="text-muted mb-1">
            Total de módulos: <strong>{curso.modulos.length}</strong>
          </p>
          <p className="small mb-0">
            <strong>ID Área:</strong> {curso.idArea}
          </p>
        </div>

        <button
          className="btn btn-light border"
          onClick={() => navigate(-1)}
        >
          Voltar
        </button>
      </div>
    </div>

    {/* MÓDULOS */}
    <div className="card p-4 shadow-sm border-0 rounded-4">
      <h5 className="text-primary mb-4">Módulos</h5>

      {curso.modulos.length === 0 ? (
        <p className="text-muted">Este curso ainda não tem módulos.</p>
      ) : (
        <div className="row g-3">
          {curso.modulos.map((modulo) => (
            <div
              key={modulo.idModulo}
              className="col-12 col-md-6 col-lg-4 col-xl-3"
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
      )}
    </div>

  </div>
);

}
