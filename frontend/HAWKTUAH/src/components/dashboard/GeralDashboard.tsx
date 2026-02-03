import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../auth/AuthService";
import { getCursos } from "../../services/cursos/CursosService";
import type { Curso } from "../../services/cursos/CursosService";
import { getTurmas } from "../../services/turmas/TurmasService";
import type { Turma } from "../../services/turmas/TurmasService";
import { checkEmailGetName } from "../../services/users/UserService";

export default function GeralDashboard() {
  const user = authService.decodeToken();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameUser, setNameUser] = useState("");

  useEffect(() => {
    async function fetchCursos() {
      if (!user) return null;

      try {
        const [resData, resNome] = await Promise.all([
          getCursos(),
          checkEmailGetName(user.email),
        ]);
        setNameUser(resNome.nome);

        //const data = await getCursos();
        setCursos(resData);
      } catch (error) {
        console.error("Erro ao carregar cursos", error);
        setCursos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCursos();
  }, []);

  useEffect(() => {
    async function fetchTurmas() {
      try {
        const data = await getTurmas();
        setTurmas(data);
      } catch (error) {
        console.error("Erro ao carregar turmas", error);
        setTurmas([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTurmas();
  }, []);

  if (!user) return null;

  return (
    <div className="container my-5">
      {/* Welcome */}
      <div className="mb-4">
        <h3 className="mb-1">
          Bem-vindo(a), <strong>{nameUser}</strong>
        </h3>
        <small className="text-muted">
          Explora os cursos e vê as próximas turmas disponíveis
        </small>
      </div>

      {/* Cursos disponíveis */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">Cursos disponíveis</h5>

          {loading ? (
            <div className="text-muted">A carregar cursos...</div>
          ) : cursos.length === 0 ? (
            <div className="text-muted">Não existem cursos disponíveis.</div>
          ) : (
            <ul className="list-group">
              {cursos.map((c) => (
                <Link to={`/cursos/${c.idCurso}`}>
                  <li key={c.idCurso} className="list-group-item">
                    {c.nome}
                  </li>
                </Link>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Próximas turmas */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Próximas turmas a começar</h5>

          {loading ? (
            <div className="text-muted">A carregar turmas...</div>
          ) : turmas.length === 0 ? (
            <div className="text-muted">Não existem turmas disponíveis.</div>
          ) : (
            <ul className="list-group">
              {turmas.map((t) => (
                <li key={t.idTurma} className="list-group-item">
                  {t.nomeTurma} - {t.dataInicio} a {t.dataFim}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
