import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getModulosFromCurso } from "../../services/cursos/CursosService";
import type { Curso } from "../../services/cursos/CursosService";
import { useNavigate } from "react-router-dom";

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

  if (loading) return <p>A carregar...</p>;

  if (!curso) return <p>Curso não encontrado</p>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">{curso.nome}</h2>
        <button className="btn btn-light border" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>

      <form className="row">
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm text-center border-0 rounded-4 bg-light h-100">
            <div className="display-1 text-primary mb-3">📚</div>
            <h5>Configuração Técnica</h5>
            <p className="text-muted small">teste texte teste</p>
            <hr />
            <div className="text-start">
              <p className="mb-1 small">
                <strong>ID Área:{curso.idArea} </strong>
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <h5 className="text-primary mb-4">Detalhes do Curso</h5>

            <div className="row g-4">
              {curso?.modulos.map((modulo) => (
                <div key={modulo.idModulo} className="col-12">
                  <div className="card h-100 shadow-sm border-0 rounded-4">
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-3">{modulo.nome}</h5>

                      <ul className="list-unstyled mb-0">
                        <li>
                          <strong>Créditos:</strong> {modulo.creditos}
                        </li>
                        <li>
                          <strong>Horas totais:</strong> {modulo.horasTotais}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4"></div>
          </div>
        </div>
      </form>
    </div>
  );
}
