import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import "../../css/layoutTabelas.css";
import type { MinhaTurma } from "../../services/turmas/TurmasService";
import { getMinhaTurma } from "../../services/turmas/TurmasService";

type Tab = "colegas" | "modulos" | "professores";

const ITEMS_PER_PAGE = 10;

export default function MinhaTurma() {
  const [turma, setTurma] = useState<MinhaTurma | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("colegas");

  const [pageColegas, setPageColegas] = useState(1);
  const [pageModulos, setPageModulos] = useState(1);
  const [pageProfessores, setPageProfessores] = useState(1);

  useEffect(() => {
    async function fetchTurma() {
      try {
        const data = await getMinhaTurma();
        setTurma(data);
      } catch {
        toast.error("Erro ao carregar a tua turma", { id: "erro-minha-turma" });
      } finally {
        setLoading(false);
      }
    }
    fetchTurma();
  }, []);

  useEffect(() => {
    setPageColegas(1);
    setPageModulos(1);
    setPageProfessores(1);
  }, [activeTab]);

  function paginate<T>(items: T[] | null, page: number) {
    if (!Array.isArray(items)) return [];
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }

  if (loading) return <p className="text-center mt-5">A carregar…</p>;

  if (!turma) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div
          className="card shadow-sm border-0 rounded-4 p-5 text-center"
          style={{ maxWidth: 420 }}
        >
          <h5 className="fw-bold mb-2">Ainda não tens uma turma atribuída</h5>
          <p className="text-muted mb-0">
            Quando fores inscrito numa turma, toda a informação vai aparecer
            aqui.
          </p>
        </div>
      </div>
    );
  }

  const colegasPaginados = paginate(turma.colegas, pageColegas);
  const modulosPaginados = paginate(turma.modulos, pageModulos);
  const professoresPaginados = paginate(turma.professores, pageProfessores);

  const totalColegasPages = Math.ceil(turma.colegas.length / ITEMS_PER_PAGE);
  const totalModulosPages = Math.ceil(turma.modulos.length / ITEMS_PER_PAGE);
  const totalProfessoresPages = Math.ceil(
    turma.professores.length / ITEMS_PER_PAGE,
  );

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold mb-1">{turma.nomeTurma}</h2>
          <p className="text-muted mb-0">{turma.nomeCurso}</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge bg-light text-dark">
            Início: {turma.dataInicio}
          </span>
          <span className="badge bg-light text-dark">Fim: {turma.dataFim}</span>
          <span className="badge bg-success">{turma.estado}</span>
        </div>
      </div>

      {/* TABS */}
      <ul className="nav nav-tabs mb-4">
        {["colegas", "modulos", "professores"].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab as Tab)}
            >
              {tab === "colegas"
                ? "Colegas"
                : tab === "modulos"
                  ? "Módulos"
                  : "Professores"}
            </button>
          </li>
        ))}
      </ul>

      {/* COLEGAS */}
      {activeTab === "colegas" && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-0">
            <div className="px-4 py-3 border-bottom text-muted fw-semibold d-grid tabela-colegas">
              <div />
              <div>Nome</div>
              <div>Email</div>
            </div>

            {colegasPaginados.map((c) => (
              <div
                key={c.id}
                className="px-4 py-3 border-bottom d-grid align-items-center tabela-colegas"
              >
                <div className="d-flex justify-content-center">
                  <div className="avatar-circle bg-light border fw-semibold">
                    {c.nome.charAt(0)}
                  </div>
                </div>
                <div className="fw-medium">{c.nome}</div>
                <div className="text-muted">{c.email}</div>
              </div>
            ))}
            {totalColegasPages > 1 && (
              <div className="d-flex justify-content-center gap-3 py-3">
                {" "}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={pageColegas === 1}
                  onClick={() => setPageColegas((p) => p - 1)}
                >
                  {" "}
                  Anterior{" "}
                </button>{" "}
                <span className="text-muted small">
                  {" "}
                  Página {pageColegas} de {totalColegasPages}{" "}
                </span>{" "}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={pageColegas === totalColegasPages}
                  onClick={() => setPageColegas((p) => p + 1)}
                >
                  {" "}
                  Seguinte{" "}
                </button>{" "}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MÓDULOS */}
      {activeTab === "modulos" && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-0">
            <div className="px-4 py-3 border-bottom text-muted fw-semibold d-grid tabela-modulos-avaliacoes">
              <div />
              <div>Módulo</div>
              <div>Horas</div>
              <div>Professor</div>
              <div className="text-end">Nota</div>
            </div>

            {modulosPaginados.map((m) => {
              const aprovado = m.avaliacoes?.[0]?.nota >= 10;

              return (
                <div
                  key={m.idModulo}
                  className="px-4 py-3 border-bottom d-grid align-items-center tabela-modulos-avaliacoes"
                >
                  <div className="d-flex justify-content-center">
                    <div className="avatar-circle bg-light border fw-semibold">
                      {m.nome.charAt(0)}
                    </div>
                  </div>
                  <div className="fw-medium">{m.nome}</div>
                  <div className="text-muted">{m.horasTotais}h</div>
                  <div className="text-muted">
                    {m.professores.map((p) => p.nome).join(", ")}
                  </div>
                  <div className="text-end">
                    {m.avaliacoes?.length ? (
                      <span
                        className={`badge ${aprovado ? "bg-success" : "bg-danger"}`}
                      >
                        {m.avaliacoes[0].nota}
                      </span>
                    ) : (
                      <span className="badge bg-secondary">—</span>
                    )}
                  </div>
                </div>
              );
            })}
            {totalModulosPages > 1 && (
              <div className="d-flex justify-content-center gap-3 py-3">
                {" "}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={pageModulos === 1}
                  onClick={() => setPageModulos((p) => p - 1)}
                >
                  {" "}
                  Anterior{" "}
                </button>{" "}
                <span className="text-muted small">
                  {" "}
                  Página {pageModulos} de {totalModulosPages}{" "}
                </span>{" "}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={pageModulos === totalModulosPages}
                  onClick={() => setPageModulos((p) => p + 1)}
                >
                  {" "}
                  Seguinte{" "}
                </button>{" "}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFESSORES */}
      {activeTab === "professores" && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-0">
            <div className="px-4 py-3 border-bottom text-muted fw-semibold d-grid tabela-professores">
              <div />
              <div>Nome</div>
              <div>Email</div>
            </div>

            {professoresPaginados.map((p, i) => (
              <div
                key={i}
                className="px-4 py-3 border-bottom d-grid align-items-center tabela-professores"
              >
                <div className="d-flex justify-content-center">
                  <div className="avatar-circle bg-light border fw-semibold">
                    {p.nome.charAt(0)}
                  </div>
                </div>
                <div className="fw-medium">{p.nome}</div>
                <div className="text-muted">{p.email}</div>
              </div>
            ))}
            {totalProfessoresPages > 1 && (
              <div className="d-flex justify-content-center gap-3 py-3">
                {" "}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={pageProfessores === 1}
                  onClick={() => setPageProfessores((p) => p - 1)}
                >
                  {" "}
                  Anterior{" "}
                </button>{" "}
                <span className="text-muted small">
                  {" "}
                  Página {pageProfessores} de {totalProfessoresPages}{" "}
                </span>{" "}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={pageProfessores === totalProfessoresPages}
                  onClick={() => setPageProfessores((p) => p + 1)}
                >
                  {" "}
                  Seguinte{" "}
                </button>{" "}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
