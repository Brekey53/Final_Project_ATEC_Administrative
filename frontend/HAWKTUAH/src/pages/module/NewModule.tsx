import React from 'react'
import { Link } from 'react-router-dom';
import { getModulos, deleteModulo, type Modulos } from "../../services/modules/ModuleService";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";


export default function NewModule() {

  const [modulos, setModulos] = useState<Modulos[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduloSelecionado, setModuloSelecionado] =
    useState<Modulos | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchModulos() {
      const data = await getModulos();
      setModulos(data);
      setLoading(false);
    }

    fetchModulos();
  }, []);

  const filteredModulos = modulos.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.nome.toLowerCase().includes(term) ||
      m.codigoIdentificacao.toLowerCase().includes(term)
    );
  });

  async function handleDeleteModulos() {
    if (!moduloSelecionado) return;

    try {
      await deleteModulo(moduloSelecionado.idModulo.toString());

      setModulos((prev) =>
        prev.filter((f) => f.idModulo !== moduloSelecionado.idModulo),
      );

      setShowDeleteModal(false);
      setModuloSelecionado(null);
      toast.success("Modulo eliminado com sucesso");
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.message) {
        toast.error(errorData.message || "Erro ao eliminar modulo");
      }
    }
  }


  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestão de Modulos</h2>
          <p className="text-muted mb-0">
            Inserir, alterar, eliminar e consultar modulos
          </p>
        </div>
        <Link to="/adicionar-modulos">
          <div className="btn btn-success px-4 py-2 rounded-pill">
            + Novo Modulo
          </div>
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar Modulos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-modulos"> {/* TODO: Criar css e alterar tabela-alunos ?? */}
            <div>Nome</div>
            <div>Modulo</div>
            <div className='hide-mobile'>Horas</div>
            <div className='hide-mobile'>Créditos</div>
            <div className="text-end">Ações</div>
          </div>
            
            {/* Map de modulos filtrados */}
            {filteredModulos.length > 0 ? (
            filteredModulos.map((m) => (
              <div key={m.idModulo} className="px-4 py-3 border-bottom tabela-modulos">
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-circle rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold border">
                    {m.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-medium text-truncate">{m.nome}</span>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted">
                  <span>{m.codigoIdentificacao || "-"}</span>
                </div>

                <div className="hide-mobile text-muted">{m.horasTotais || "-"}</div>
                <div className="hide-mobile text-muted">{m.creditos || "-"}</div>

                <div className="d-flex justify-content-end gap-2">
                  <Link to={`edit-modulo/${m.idModulo}`} className='btn btn-sm btn-outline-primary rounded-pill px-3'>Editar</Link>
                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    onClick={() => {
                      setModuloSelecionado(m);
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
              Nenhum módulo encontrado para "{searchTerm}"
            </div>
          )}

          {showDeleteModal && moduloSelecionado && (
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
                      Tem a certeza que pretende eliminar o modulo{" "}
                      <strong>{moduloSelecionado.codigoIdentificacao} - {moduloSelecionado.nome} </strong> da plataforma?
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
                      onClick={handleDeleteModulos}
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
