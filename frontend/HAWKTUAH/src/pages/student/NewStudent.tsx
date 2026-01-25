import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getFormandos,
  deleteFormando,
  type Formando,
} from "../../services/students/formandoService";
import "../../css/newStudent.css";
import { toast } from "react-hot-toast";

export default function NewStudent() {
  const [formandos, setFormandos] = useState<Formando[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formandoSelecionado, setFormandoSelecionado] =
    useState<Formando | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFormandos() {
      try {
        const data = await getFormandos();
        setFormandos(data);
      } catch {
        toast.error("Erro ao carregar formandos");
      } finally {
        setLoading(false);
      }
    }
    fetchFormandos();
  }, []);

  const formandosFiltrados = formandos.filter(
    (f) =>
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.nif && f.nif.includes(searchTerm)),
  );

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

      {/* Barra de Pesquisa */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg rounded-3"
            placeholder="Pesquisar por nome ou NIF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-alunos">
            <div>Formando</div>
            <div>Email</div>
            <div>Turma</div> {/* Alterado de Telefone para Turma */}
            <div className="text-end">Ações</div>
          </div>

          {loading ? (
            <div className="text-center py-5">A carregar...</div>
          ) : formandosFiltrados.length > 0 ? (
            formandosFiltrados.map((f) => (
              <div
                key={f.idFormando}
                className="px-4 py-3 border-bottom tabela-alunos align-items-center"
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="avatar-circle rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold border"
                    style={{ width: "40px", height: "40px" }}
                  >
                    {f.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-medium">{f.nome}</span>
                </div>
                <div className="text-muted text-truncate">{f.email || "-"}</div>
                <div>
                  <span
                    className={`badge badge-turma-fixa ${
                      f.turma === "Sem Turma"
                        ? "bg-light text-muted border"
                        : "bg-info-subtle text-info-emphasis border border-info"
                    }`}
                  >
                    {f.turma || "Sem Turma"}
                  </span>
                </div>
                <div className="d-flex justify-content-end gap-3">
                  <Link
                    to={`edit-formando/${f.idFormando}`}
                    className="btn btn-sm btn-outline-primary rounded-pill px-3"
                  >
                    Editar
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    onClick={() => {
                      setFormandoSelecionado(f);
                      setShowDeleteModal(true);
                    }}
                  >
                    Apagar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5 text-muted">
              Nenhum formando encontrado para "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      {/* Modal de Eliminação */}
      {showDeleteModal && formandoSelecionado && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Confirmar eliminação</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>
              <div className="modal-body py-4">
                <p>
                  Tem a certeza que pretende eliminar o formando{" "}
                  <strong>{formandoSelecionado.nome}</strong>?
                </p>
                <p className="text-muted mb-0 small">
                  Esta ação removerá o perfil e as inscrições associadas.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  className="btn btn-light rounded-pill px-4"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger rounded-pill px-4"
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
  );
}
