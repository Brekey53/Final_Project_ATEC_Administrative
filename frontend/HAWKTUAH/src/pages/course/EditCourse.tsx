import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getCursoById,
  getAllModulos,
  updateCurso,
  type Curso,
  type Modulo,
} from "../../services/cursos/CursosService";

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState<Curso>({
    idCurso: 0,
    nome: "",
    idArea: 0,
    modulos: [],
  });

  const [modulosDisponiveis, setModulosDisponiveis] = useState<Modulo[]>([]);
  const [moduloSelecionado, setModuloSelecionado] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) return;

    Promise.all([getCursoById(id), getAllModulos()])
      .then(([cursoRes, modulosRes]) => {
        setCurso(cursoRes);
        setModulosDisponiveis(modulosRes);
      })
      .catch(() => {
        toast.error("Erro ao carregar dados do curso.",
          {id: "error-modulos"}
        );
        navigate("/gerir-cursos");
      })
      .finally(() => setFetching(false));
  }, [id, navigate]);

  const handleAddModulo = () => {
    if (!moduloSelecionado) return;

    const modulo = modulosDisponiveis.find(
      (m) => m.idModulo === moduloSelecionado,
    );

    if (!modulo) return;

    if (curso.modulos.some((m) => m.idModulo === modulo.idModulo)) {
      toast.error("Este módulo já está associado.",
        {id: "error-modulos-associado"}
      );
      return;
    }

    setCurso((prev) => ({
      ...prev,
      modulos: [
        ...prev.modulos,
        {
          ...modulo,
          prioridade: 3, // prioridade default
        },
      ],
    }));

    setModuloSelecionado("");
  };

  const handleRemoveModulo = (idModulo: number) => {
    setCurso((prev) => ({
      ...prev,
      modulos: prev.modulos.filter((m) => m.idModulo !== idModulo),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!curso.nome.trim()) {
      toast.error("O nome do curso é obrigatório.");
      return;
    }

    const payload = {
      nome: curso.nome,
      idArea: curso.idArea,
      modulos: curso.modulos.map((m) => ({
        idModulo: m.idModulo,
        prioridade: m.prioridade,
      })),
    };

    setLoading(true);

    try {
      await updateCurso(id, payload);
      toast.success("Curso atualizado com sucesso!");
      navigate("/gerir-cursos");
    } catch {
      toast.error("Erro ao atualizar curso.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container mt-5 text-center">A carregar dados...</div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <h2>
          Editar Curso: <span className="text-primary">{curso.nome}</span>
        </h2>
        <button className="btn btn-light border" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="row align-items-start">
        {/* COLUNA ESQUERDA  */}
        <div className="col-lg-4 d-none d-lg-block">
          <div className="card p-4 shadow-sm text-center border-0 rounded-4 bg-light h-100">
            <div className="display-1 mb-3">📚</div>
            <h5>Configuração Técnica</h5>
            <p className="text-muted small">
              Associe módulos existentes ao curso.
            </p>

            <hr />
    
            <p className="small mb-1">
              <strong>ID Curso:</strong> {curso.idCurso}
            </p>
            <p className="small mb-0">
              <strong>ID Área:</strong> {curso.idArea}
            </p>
          </div>
        </div>

        {/* COLUNA DIREITA */}

        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <h5 className="text-primary mb-4">Detalhes do Curso</h5>

            {/* NOME */}
            <div className="mb-4">
              <label className="form-label fw-bold">Nome do Curso</label>
              <input
                type="text"
                className="form-control form-control-lg"
                value={curso.nome}
                onChange={(e) => setCurso({ ...curso, nome: e.target.value })}
                required
              />
            </div>

            <hr />

            {/* MÓDULOS ASSOCIADOS */}
            <h6 className="fw-bold mb-3">Módulos do Curso</h6>

            {curso.modulos.length === 0 && (
              <p className="text-muted small">Nenhum módulo associado.</p>
            )}

            <ul className="list-group mb-3">
              {curso.modulos.map((m) => (
                <li
                  key={m.idModulo}
                  className="list-group-item d-flex align-items-center justify-content-between gap-3"
                >
                  {/* Nome do módulo */}
                  <div className="flex-grow-1 fw-semibold">{m.nome}</div>

                  {/* Select Prioridade */}
                  <div style={{ minWidth: "170px" }}>
                    <select
                      className="form-select form-select-sm"
                      value={m.prioridade}
                      onChange={(e) =>
                        setCurso((prev) => ({
                          ...prev,
                          modulos: prev.modulos.map((mod) =>
                            mod.idModulo === m.idModulo
                              ? { ...mod, prioridade: Number(e.target.value) }
                              : mod,
                          ),
                        }))
                      }
                    >
                      <option value={1}>Prioridade 1</option>
                      <option value={2}>Prioridade 2</option>
                      <option value={3}>Prioridade 3</option>
                      <option value={4}>Prioridade 4</option>
                      <option value={5}>Prioridade 5</option>
                    </select>
                  </div>

                  {/* Botão Remover */}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveModulo(m.idModulo)}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>

            {/* ADD MÓDULO */}
            <div className="d-flex gap-2 mb-4">
              <select
                className="form-select"
                value={moduloSelecionado}
                onChange={(e) => setModuloSelecionado(Number(e.target.value))}
              >
                <option value="">Adicionar módulo existente</option>
                {modulosDisponiveis.map((m) => (
                  <option key={m.idModulo} value={m.idModulo}>
                    {m.nome}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleAddModulo}
              >
                Adicionar
              </button>
            </div>

            {/* AÇÕES */}
            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light px-4"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5"
                disabled={loading}
              >
                {loading ? "A guardar..." : "Guardar Alterações"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
