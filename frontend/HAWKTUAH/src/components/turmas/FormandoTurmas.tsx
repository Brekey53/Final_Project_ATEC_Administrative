// import { useEffect, useState } from "react";
// import { toast } from "react-hot-toast";
// import "../../css/turmas.css";
// import type { MinhaTurma } from "../../services/turmas/TurmasService";
// import { getMinhaTurma } from "../../services/turmas/TurmasService";

export default function MinhaTurma() {
//   const [turma, setTurma] = useState<MinhaTurma | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchTurma() {
//       try {
//         const data = await getMinhaTurma();
//         setTurma(data);
//       } catch {
//         toast.error("Erro ao carregar a tua turma");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchTurma();
//   }, []);

//   if (loading) return <p className="text-center mt-5">A carregar…</p>;
//   if (!turma) return <p className="text-center mt-5">Sem turma atribuída</p>;

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">A minha turma</h2>
        <p className="text-muted mb-0">
          {/* {turma.nomeTurma} · {turma.nomeCurso} */}
        </p>
      </div>

      {/* INFO TURMA */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body d-flex flex-wrap gap-4">
          <div>
            <strong>Data início:</strong>
            {/* <div className="text-muted">{turma.dataInicio}</div> */}
          </div>
          <div>
            <strong>Data fim:</strong>
            {/* <div className="text-muted">{turma.dataFim}</div> */}
          </div>
          <div>
            <strong>Estado:</strong>
            <div>
              {/* <span className="badge bg-primary">{turma.estado}</span> */}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">

        {/* COLEGAS */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body">
              <h5 className="mb-3">Colegas da turma</h5>

              {/* {turma.colegas.length === 0 ? (
                <p className="text-muted">Sem colegas registados</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {turma.colegas.map((c) => (
                    <li key={c.id} className="list-group-item px-0">
                      <div className="fw-medium">{c.nome}</div>
                      <div className="text-muted small">{c.email}</div>
                    </li>
                  ))}
                </ul>
              )} */}
            </div>
          </div>
        </div>

        {/* CURSO / MÓDULOS / PROFESSOR */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body">
              <h5 className="mb-3">Curso & Módulos</h5>

              <ul className="list-group list-group-flush mb-4">
                {/* {turma.modulos.map((m) => (
                  <li key={m.idModulo} className="list-group-item px-0">
                    <div className="fw-medium">{m.nome}</div>
                    <div className="text-muted small">
                      {m.horasTotais} horas
                    </div>
                  </li>
                ))} */}
              </ul>

              <h6 className="mt-3">Professor(es)</h6>
              {/* {turma.professores.map((p, i) => (
                <div key={i} className="text-muted small">
                  {p.nome} · {p.email}
                </div>
              ))} */}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
