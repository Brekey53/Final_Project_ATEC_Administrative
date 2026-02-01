import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCursos,
  deleteCurso,
  type Curso,
} from "../../services/cursos/CursosService";
import "../../css/cursos.css";
import toast from "react-hot-toast";
import editar from "../../img/edit.png"
import apagar from "../../img/delete.png"
import { normalizarTexto } from "../../utils/stringUtils";

export default function NewCourse() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState<Curso | null>(null);
  const [search, setSearch] = useState("");
  const [areaFiltro, setAreaFiltro] = useState("todas");

  useEffect(() => {
    async function fetchCursos() {
      try {
        const data = await getCursos();
        setCursos(data);
      } catch (error) {
        console.error("Erro ao carregar cursos", error);
        setCursos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCursos();
  }, []);

  async function handleDeleteCurso() {
    if (!cursoSelecionado) return;

    try {
      await deleteCurso(cursoSelecionado.idCurso);

      setCursos((prev) =>
        prev.filter((c) => c.idCurso !== cursoSelecionado.idCurso),
      );

      setCursoSelecionado(null);
      setShowDeleteModal(false);

      toast.success("Curso eliminado com sucesso");
    } catch {
      toast.error("Erro ao eliminar curso");
    }
  }

  const cursosFiltrados = loading
    ? []
    : cursos.filter((c) => {
        const termo = normalizarTexto(search);

        const matchPesquisa =
          normalizarTexto(c.nome).includes(termo) ||
          normalizarTexto(String(c.idCurso)).includes(termo);

        const matchArea =
          areaFiltro === "todas" || String(c.idArea) === areaFiltro;

        return matchPesquisa && matchArea;
      });

  return (
    <div className="container-fluid container-lg py-4 py-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Cursos</h2>
          <p className="text-muted mb-0">Consulta de Cursos Disponíveis</p>
        </div>
        <Link to="/adicionar-cursos">
          <div className="btn btn-success px-4 py-2 rounded-pill">
            + Novo Curso
          </div>
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            {/* PESQUISA */}
            <div className="col-12 col-md-8">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Pesquisar curso por nome ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* FILTRO ÁREA */}
            <div className="col-12 col-md-4">
              <select
                className="form-select form-select-lg"
                value={areaFiltro}
                onChange={(e) => setAreaFiltro(e.target.value)}
              >
                <option value="todas">Todas as áreas</option>
                <option value="1">Informática</option>
                <option value="2">Mecânica</option>
                <option value="3">Eletrónica</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="px-4 py-3 border-bottom text-muted fw-semibold tabela-alunos">
            <div>Curso</div>
            <div>Id Área</div>
            <div className="text-end">Ações</div>
          </div>
          {!loading && cursosFiltrados.length === 0 && (
            <div className="text-center py-4 text-muted">
              Nenhum curso encontrado com os filtros atuais.
            </div>
          )}
          {cursosFiltrados.map((c) => (
            <div
              key={c.idCurso}
              className="px-4 py-3 border-bottom tabela-alunos"
            >
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle p-2 bg-light d-flex align-items-center justify-content-center fw-semibold">
                  {c.nome.charAt(0)}
                </div>
                <span className="fw-medium">{c.nome}</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted">
                <span>{c.idArea}</span>
              </div>
              <div className="d-flex justify-content-end gap-3">
                <Link to={`/gerir-cursos/edit-curso/${c.idCurso}`}>
                <img src={editar} alt="editar" title="Editar" className="img-edit-apagar"></img>
                </Link>
                <button
                  className="btn btn-link text-danger p-0"
                  onClick={() => {
                    setCursoSelecionado(c);
                    setShowDeleteModal(true);
                  }}
                >
                  <img src={apagar} alt="apagar" title="Apagar" className="img-edit-apagar"></img>
                </button>
              </div>
            </div>
          ))}
          {showDeleteModal && cursoSelecionado && (
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
                      Tem a certeza que pretende eliminar o curso{" "}
                      <strong>{cursoSelecionado?.nome}</strong>?
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
                      onClick={handleDeleteCurso}
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
