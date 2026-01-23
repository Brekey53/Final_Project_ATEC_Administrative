import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFormandos, type Formando } from "../../services/students/formandoService";
import "../../css/newStudent.css";
import { deleteFormando } from "../../services/DeleteStudentService";
import { toast } from "react-hot-toast";

export default function NewStudent() {
  const [formandos, setFormandos] = useState<Formando[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formandoSelecionado, setFormandoSelecionado] =
    useState<Formando | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setError] = useState("");

  useEffect(() => {
    async function fetchFormandos() {
      const data = await getFormandos();
      setFormandos(data);
      setLoading(false);
    }

    fetchFormandos();
  }, []);

  async function handleDeleteFormando() {
    if (!formandoSelecionado) return;

    try {
      await deleteFormando(formandoSelecionado.idFormando);

      setFormandos((prev) =>
        prev.filter((f) => f.idFormando !== formandoSelecionado.idFormando),
      );

      setShowDeleteModal(false);
      setFormandoSelecionado(null);
      toast.success("Formando eliminado com sucesso");
    } catch {
      toast.error("Erro ao eliminar formando");
    }
  }

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
            <div
              key={f.idFormando}
              className="px-4 py-3 border-bottom tabela-alunos"
            >
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
                <Link to={`edit-formando/${f.idFormando}`}>Editar</Link>
                <button
                  className="btn btn-link text-danger p-0"
                  onClick={() => {
                    setFormandoSelecionado(f);
                    setShowDeleteModal(true);
                  }}
                >
                  Apagar
                </button>
              </div>
            </div>
          ))}
          {showDeleteModal && formandoSelecionado && (
            <div
              className="modal fade show d-block"
              tabIndex={-1}
              onClick={() => setShowDeleteModal(false)}
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content rounded-4 shadow">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirmar eliminação</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDeleteModal(false)}
                    />
                  </div>

                  <div className="modal-body">
                    <p>
                      Tem a certeza que pretende eliminar o formando{" "}
                      <strong>{formandoSelecionado.nome}</strong> da plataforma?
                    </p>
                    <p className="text-muted mb-0">
                      Esta ação não pode ser revertida.
                    </p>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-light"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancelar
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={handleDeleteFormando}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
