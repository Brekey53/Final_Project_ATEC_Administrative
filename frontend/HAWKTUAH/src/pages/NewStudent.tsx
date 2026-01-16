import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFormandos, type Formando } from "../services/formandoService";
import "../css/newStudent.css";

export default function NewStudent() {
  const [formandos, setFormandos] = useState<Formando[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFormandos() {
      const data = await getFormandos();
      setFormandos(data);
      setLoading(false);
    }

    fetchFormandos();
  }, []);

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Formandos</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar e consultar formandos
          </p>
        </div>
        <Link to="/adicionar-formandos">
        <div className="btn btn-success px-4 py-2 rounded-pill">
          + Novo Formando
        </div>
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar formandos..."
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-alunos">
            <div>Formando</div>
            <div>Email</div>
            <div>Telefone</div>
            <div className="text-end">Ações</div>
          </div>
          {formandos.map((f) => (
            <div key={f.id} className="px-4 py-3 border-bottom tabela-alunos">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold">
                  {f.nome.charAt(0)}
                </div>
                <span className="fw-medium">{f.nome}</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted">
                <span>{f.email || "-"}</span>
              </div>
              <div className="text-muted">{f.phone || "-"}</div>{" "}
              <div className="d-flex justify-content-end gap-3">
                <Link to={`/formandos/editar/${f.id}`}>Editar</Link>
                <button className="btn btn-link text-danger p-0">Apagar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
