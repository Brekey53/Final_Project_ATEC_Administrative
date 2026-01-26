import React, { useEffect, useState } from "react";
import { getCursos, type Curso } from "../../services/cursos/CursosService";
import "../../css/cursos.css";

export default function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [cursoSelecionado, setCursoSelecionado] = useState();

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

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Cursos</h2>
          <p className="text-muted mb-0">
            Consulta de Cursos Disponíveis
          </p>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar cursos..."
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-alunos">
            <div>Curso</div>
            <div>Área</div>
            <div> Ver detalhes????</div>
          </div>
          {cursos.map((c) => (
            <div
              key={c.idCurso}
              className="px-4 py-3 border-bottom tabela-alunos"
            >
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold">
                  {c.nome.charAt(0)}
                </div>
                <span className="fw-medium">{c.nome}</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted">
                <span>{c.idArea}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
