import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUtilizadores, type Utilizador } from "../../services/ListUsers";
import "../../css/manageUsers.css"

export default function ManageUsers() {
  const [utilizadores, setUtilizadores] = useState<Utilizador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUtilizadores() {
      const data = await getUtilizadores();
      setUtilizadores(data);
      setLoading(false);
    }

    fetchUtilizadores();
  }, []);

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Utilizadores</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar e consultar utilizadores
          </p>
        </div>
        <Link to="adicionar-utilizadores">
          <div className="btn btn-success px-4 py-2 rounded-pill">
            + Novo Utilizador
          </div>
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar Utilizadores..."
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-utilizadores">
            <div>Utilizador</div>
            <div>Email</div>
            <div>Telefone</div>
            <div>Tipo Utilizador</div>
            <div className="text-end">Ações</div>
          </div>
          {utilizadores.map((u) => (
            <div key={u.idUtilizador} className="px-4 py-3 border-bottom tabela-utilizadores">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold">
                  {u.nome.charAt(0)}
                </div>
                <span className="fw-medium">{u.nome}</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted">
                <span>{"-"}</span>
              </div>
              <div className="text-muted">{u.phone||"-"}</div>{" "}
              <div className="text-muted">{u.phone||"-"}</div>{" "}
              <div className="d-flex justify-content-end gap-3">
                <Link to="edit-formando">Editar</Link>
                <button className="btn btn-link text-danger p-0">Apagar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
