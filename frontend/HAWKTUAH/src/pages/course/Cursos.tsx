import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom"

import { getCursos, type Curso } from "../../services/cursos/CursosService";

export default function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="container mt-4 mb-5">
      <div className="text-center mb-5">
        <h2 className="mb-3  fw-bold">Cursos</h2>
      </div>

      <div className="row">
        <div className="col">
          <div className="card h-100 shadow border-0 rounded-4 mb-5">
            <div className="card-body d-flex flex-column text-start">
              <h5 className="card-title fw-bold text-center">
                {" "}
                Cursos disponiveis
              </h5>

              {cursos.length === 0 ? (
                <div className="text-center mt-5 text-muted">
                  <h3>Nenhum curso encontrado</h3>
                </div>
              ) : (
                <div className="row g-4 container">
                  {cursos.map((c) => (
                    <Link to= {`/cursos/${c.idCurso}`}>
                      <div
                        className="col-md-3 w-100 rounded-4 shadow-sm p-2"
                        key={c.idCurso}
                      >
                        <strong>{c.nome}</strong>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
