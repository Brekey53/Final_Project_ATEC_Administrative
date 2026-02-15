import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { isDataFimValida } from "../../utils/dataUtils";
import {
  postNewTurma,
  type Turma,
  type CreateTurmaDTO,
  getCursos,
  getMetodologias,
} from "../../services/turmas/TurmasService";
import type { Curso } from "../../services/cursos/CursosService";

export default function AddNewTurma() {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [metedologia, setMetedologia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState<Turma>({
    idTurma: 0,
    idCurso: 0,
    nomeTurma: "",
    dataInicio: "",
    dataFim: "",
    nomeCurso: "",
    estado: "A decorrer", // Valor ficticio pois é trarado no backend
    idMetodologia: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cursosRes, metedologiaRes] = await Promise.all([
          getCursos(),
          getMetodologias(),
        ]);

        setCursos(cursosRes);
        setMetedologia(metedologiaRes);
      } catch (err) {
        toast.error("Erro ao carregar dados da turma.", { id: "errLiftTurma" });
        navigate("/turmas");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Preencher nomeCurso para o backend (não editável pelo utilizador)
    if (name == "idCurso") {
      const cursoId = Number(value);
      const cursoSelecionado = cursos.find((c) => c.idCurso === cursoId);

      setFormData((prev) => ({
        ...prev,
        idCurso: cursoId,
        nomeCurso: cursoSelecionado?.nome || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.idCurso || !formData.nomeTurma) {
      toast.error("Preencha todos os campos obrigatórios.", { id: "erroFillTudo" });
      return;
    }

    if (formData.dataInicio && formData.dataFim && !isDataFimValida(formData.dataInicio, formData.dataFim)) {
      toast.error("A data de fim deve ser igual ou posterior à data de início.", {
        id: "erroDataFim",
      });
      return;
    }

    setLoading(true);

    const data: CreateTurmaDTO = {
      nomeTurma: formData.nomeTurma,
      idCurso: formData.idCurso,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim,
      nomeCurso: formData.nomeCurso,
      idMetodologia: formData.idMetodologia,
    } 

    try {
      await postNewTurma(data);
      toast.success("Turma criada com sucesso!", { id: "successTurmaCriada" });
      navigate("/turmas");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar turma.", { id: "erroInspCriarTurma" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
  }

  return (
    <div className="container mt-5">
      <Toaster />

      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-4 text-primary">Adicionar Nova Turma</h2>

          <p className="text-muted small mb-0">
            ID Interno: #{formData.idTurma}
          </p>
        </div>
        <button
          className="btn btn-light border rounded-pill px-4"
          onClick={() => navigate("/turmas")}
        >
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="row g-4">
        {/* Coluna Esquerda: Resumo */}
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm border-0 rounded-4 bg-light text-center h-100">
            <div className="display-1 mb-3">👥</div>
            <h5 className="fw-bold">{formData.nomeTurma || "Sem Nome"}</h5>
            <p className="text-muted small">
              Configure os períodos letivos e a associação ao curso
              correspondente.
            </p>
            <hr />
            <div className="bg-white p-3 rounded-3 text-start">
              <div className="mb-2">
                <label className="text-muted x-small d-block text-uppercase">
                  Início
                </label>
                <span className="fw-bold">{formData.dataInicio || "---"}</span>
              </div>
              <div>
                <label className="text-muted x-small d-block text-uppercase">
                  Término
                </label>
                <span className="fw-bold">{formData.dataFim || "---"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Formulário */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <h5 className="text-primary mb-4 border-bottom pb-2">
              Informações da Turma
            </h5>

            <div className="row">
              {/* Nome da Turma */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Nome da Turma</label>
                <input
                  type="text"
                  name="nomeTurma"
                  className="form-control form-control-lg"
                  value={formData.nomeTurma}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Seleção de Curso */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Curso Associado
                </label>
                <select
                  name="idCurso"
                  className="form-select form-select-lg"
                  value={formData.idCurso}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um curso...</option>
                  {cursos.map((c) => (
                    <option key={c.idCurso} value={c.idCurso}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Datas */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Data de Início</label>
                <input
                  type="date"
                  name="dataInicio"
                  className="form-control"
                  value={formData.dataInicio}
                  onChange={handleChange}
                  max={formData.dataFim || undefined}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Data de Fim</label>
                <input
                  type="date"
                  name="dataFim"
                  className="form-control"
                  value={formData.dataFim}
                  onChange={handleChange}
                  min={formData.dataInicio || undefined}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">
                  Metodologia turma
                </label>
                <select
                  name="idMetodologia"
                  className="form-control form-select-sg"
                  value={formData.idMetodologia}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione uma metodologia...</option>
                  {metedologia.map((m) => (
                    <option key={m.idMetodologia} value={m.idMetodologia}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ações */}
            <div className="d-flex justify-content-end gap-2 mt-5">
              <button
                type="button"
                className="btn btn-light px-4 rounded-pill"
                onClick={() => navigate("/turmas")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary px-5 rounded-pill shadow-sm"
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
