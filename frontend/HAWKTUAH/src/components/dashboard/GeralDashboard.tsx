import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../auth/AuthService";
import { getCursos } from "../../services/cursos/CursosService";
import type { Curso } from "../../services/cursos/CursosService";
import { getTurmasGeralDashboard } from "../../services/turmas/TurmasService";
import type { Turma } from "../../services/turmas/TurmasService";
import { checkEmailGetName } from "../../services/users/UserService";

export default function GeralDashboard() {
  const user = authService.decodeToken();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameUser, setNameUser] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const [resCursos, resTurmas, resNome] = await Promise.all([
          getCursos(),
          getTurmasGeralDashboard(),
          checkEmailGetName(user.email),
        ]);

        setCursos(resCursos);
        setTurmas(resTurmas);
        setNameUser(resNome.nome);
      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (!user) return null;

  return (
    <div className="container my-5">
      {/* HEADER */}
      <div className="mb-5">
        <h2 className="fw-bold">
          Bem-vindo(a), <span className="text-primary">{nameUser}</span>
        </h2>
        <p className="text-muted mb-0">
          Explora os cursos disponíveis e consulta as próximas turmas.
        </p>
      </div>

      <div className="alert alert-info mb-4">
        Ainda não estás inscrito em nenhuma turma. De momento, tens de aguardar
        pela abertura de novas turmas.
      </div>

      <div className="row g-4">
        {/* CURSOS */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Cursos disponíveis</h5>

              {loading ? (
                <div className="text-muted">A carregar cursos…</div>
              ) : cursos.length === 0 ? (
                <div className="text-muted">
                  Não existem cursos disponíveis.
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {cursos.map((c) => (
                    <Link
                      key={c.idCurso}
                      to={`/cursos/${c.idCurso}`}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                    >
                      <span>{c.nome}</span>
                      <span className="text-muted small">Ver detalhes →</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TURMAS */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Próximas turmas a começar</h5>

              {loading ? (
                <div className="text-muted">A carregar turmas…</div>
              ) : turmas.length === 0 ? (
                <div className="text-muted">
                  Não existem turmas disponíveis.
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {turmas.map((t) => (
                    <li
                      key={t.idTurma}
                      className="list-group-item d-flex justify-content-between align-items-start py-3"
                    >
                      <div>
                        <div className="fw-semibold">{t.nomeTurma}</div>
                        <small className="text-muted">
                          {t.dataInicio} → {t.dataFim}
                        </small>
                      </div>

                      <span className="badge bg-success rounded-pill">
                        Soon
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
