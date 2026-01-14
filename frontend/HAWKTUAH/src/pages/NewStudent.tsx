import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFormandos, type Formando } from "../services/formandoService";

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

        <Link
          to="/adicionar-formando"
          className="btn btn-success px-4 py-2 rounded-pill"
        >
          + Novo Formando
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

      {!loading &&
        (formandos.length > 0 ? (
          <div className="list-group list-group-flush">
            {formandos.map((f) => (
              <div
                key={f.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-semibold">{f.nome}</div>
                  <small className="text-muted">{f.email}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-5">
            <h5>Nenhum formando encontrado</h5>
          </div>
        ))}
    </div>
  );
}
