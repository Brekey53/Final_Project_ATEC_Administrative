import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../auth/AuthService";
import { getCursos } from "../../services/cursos/CursosService";
import type { Curso } from "../../services/cursos/CursosService";
import { getTurmasGeralDashboard } from "../../services/turmas/TurmasService";
import type { Turma } from "../../services/turmas/TurmasService";
import { checkEmailGetName } from "../../services/users/UserService";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GeralDashboard() {
  const user = authService.decodeToken();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameUser, setNameUser] = useState("");
  const [currentPageCursos, setCurrentPageCursos] = useState(1);
  const [currentPageTurmas, setCurrentPageTurmas] = useState(1);

  const ITEMS_PER_PAGE = 10;
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
        toast.error("Erro ao carregar dados.", { id: "erro-geral-dashboard" });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalPagesCursos = Math.ceil(cursos.length / ITEMS_PER_PAGE);
  const inicioCursos = (currentPageCursos - 1) * ITEMS_PER_PAGE;
  const fimCursos = inicioCursos + ITEMS_PER_PAGE;
  const cursosPaginados = cursos.slice(inicioCursos, fimCursos);

  const totalPagesTurmas = Math.ceil(turmas.length / ITEMS_PER_PAGE);
  const inicioTurmas = (currentPageCursos - 1) * ITEMS_PER_PAGE;
  const fimTurmas = inicioTurmas + ITEMS_PER_PAGE;
  const turmasPaginadas = turmas.slice(inicioTurmas, fimTurmas);

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
                  {cursosPaginados.map((c) => (
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
              {totalPagesCursos > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-3 pt-3">
                  <button
                    className="btn btn-outline-secondary"
                    disabled={currentPageCursos === 1}
                    onClick={() => setCurrentPageCursos((p) => p - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="text-muted small">
                    Página {currentPageCursos} de {totalPagesCursos}
                  </span>

                  <button
                    className="btn btn-outline-secondary"
                    disabled={currentPageCursos === totalPagesCursos}
                    onClick={() => setCurrentPageCursos((p) => p + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
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
                  Não existem turmas para começar.
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {turmasPaginadas.map((t) => (
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
                        Em breve
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {totalPagesTurmas > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-3 pt-3">
                  <button
                    className="btn btn-outline-secondary"
                    disabled={currentPageTurmas === 1}
                    onClick={() => setCurrentPageTurmas((p) => p - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="text-muted small">
                    Página {currentPageTurmas} de {totalPagesTurmas}
                  </span>

                  <button
                    className="btn btn-outline-secondary"
                    disabled={currentPageTurmas === totalPagesTurmas}
                    onClick={() => setCurrentPageTurmas((p) => p + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
