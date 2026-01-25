import { Link } from "react-router-dom";
import {
  getFormadores,
  deleteFormador,
  type Formador,
} from "../../services/formador/FormadorService";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function NewTeacher() {
  const [formadores, setFormadores] = useState<Formador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formadorSelecionado, setFormadorSelecionado] =
    useState<Formador | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchFormadores() {
      const data = await getFormadores();
      setFormadores(data);
      setLoading(false);
    }

    fetchFormadores();
  }, []);

  const filteredFormadores = formadores.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      f.nome.toLowerCase().includes(term) || f.nif.toLowerCase().includes(term)
    );
  });

  async function handleDeleteFormador() {
    if (!formadorSelecionado) return;

    try {
      await deleteFormador(formadorSelecionado.idFormador.toString());

      setFormadores((prev) =>
        prev.filter((f) => f.idFormador !== formadorSelecionado.idFormador),
      );

      setShowDeleteModal(false);
      setFormadorSelecionado(null);
      toast.success("Formador eliminado com sucesso");
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.message) {
        toast.error(errorData.message || "Erro ao eliminar formador");
      }
    }
  }

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Formadores</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar e consultar formadores
          </p>
        </div>
        <Link to="/adicionar-formadores">
          <div className="btn btn-success px-4 py-2 rounded-pill">
            + Novo Formador
          </div>
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar Formadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-formadores">
            {/* TODO: Criar css e alterar tabela-alunos ?? */}
            <div>Formador</div>
            <div>Email</div>
            <div>Qualificações</div>
            <div>Nif</div>
            <div className="text-end">Ações</div>
          </div>

          {/* Map de formandores filtrados */}
          {filteredFormadores.length > 0 ? (
            filteredFormadores.map((f) => (
              <div
                key={f.idFormador}
                className="px-4 py-3 border-bottom tabela-formadores"
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold border">
                    {f.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-medium text-truncate">{f.nome}</span>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted">
                  <span>{f.email || "-"}</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-muted">
                  <span>{f.qualificacoes || "-"}</span>
                </div>

                <div className="text-muted">{f.nif || "-"}</div>

                <div className="d-flex justify-content-end gap-2">
                  <Link
                    to={`edit-formador/${f.idFormador}`}
                    className="btn btn-sm btn-outline-primary rounded-pill px-3"
                  >
                    Editar
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    onClick={() => {
                      setFormadorSelecionado(f);
                      setShowDeleteModal(true);
                    }}
                  >
                    Apagar
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Mensagem caso não existam resultados
            <div className="p-5 text-center text-muted">
              Nenhum formador encontrado para "{searchTerm}"
            </div>
          )}

          {showDeleteModal && formadorSelecionado && (
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
                      Tem a certeza que pretende eliminar o formador{" "}
                      <strong>{formadorSelecionado.nome} </strong> da
                      plataforma?
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
                      onClick={handleDeleteFormador}
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
